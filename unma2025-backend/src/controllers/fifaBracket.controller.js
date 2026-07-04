import FifaCampaign from "../models/FifaCampaign.js";
import FifaParticipant from "../models/FifaParticipant.js";
import {
  FifaBracketContest,
  FifaBracketMatch,
  FifaBracketEntry,
} from "../models/FifaBracket.js";
import { AppError } from "../middleware/error.js";
import { resolveParticipant } from "../utils/fifaAuth.js";
import {
  BRACKET_SLOTS,
  ROUND_ORDER,
  validatePredictions,
} from "../utils/bracketTree.js";
import {
  advanceWinnerToParent,
  advanceStageWinners,
  gradeRound,
  awardBracketPoints,
  getLastRoundSurvived,
  predictionsToObject,
  buildR16Fixtures,
} from "../utils/bracketGrading.js";

async function resolveActiveCampaign() {
  return FifaCampaign.resolveActiveCampaign();
}

async function resolveActiveContest() {
  return (
    (await FifaBracketContest.findOne({ status: "active", isPublished: true }).sort({
      createdAt: -1,
    })) ||
    (await FifaBracketContest.findOne({ isPublished: true }).sort({ createdAt: -1 }))
  );
}

async function resolveContestById(id) {
  const contest = await FifaBracketContest.findById(id);
  if (!contest) throw new AppError("Contest not found", 404);
  return contest;
}

async function seedMatchesForContest(contestId) {
  const docs = BRACKET_SLOTS.map((slot) => ({
    contest: contestId,
    stage: slot.stage,
    bracketKey: slot.bracketKey,
    side: slot.side,
    parentMatchKey: slot.parentMatchKey,
    feedsSlot: slot.feedsSlot,
    order: slot.order,
    teamA: "",
    teamB: "",
    winner: null,
  }));

  await FifaBracketMatch.insertMany(docs);
}

function isEntryOpen(contest) {
  if (contest.status !== "active") return false;
  if (!contest.isPublished) return false;
  return Date.now() < new Date(contest.entryClosesAt).getTime();
}

function formatMatch(m) {
  return {
    _id: m._id,
    stage: m.stage,
    bracketKey: m.bracketKey,
    side: m.side,
    teamA: m.teamA || null,
    teamB: m.teamB || null,
    winner: m.winner || null,
    order: m.order,
    parentMatchKey: m.parentMatchKey,
    feedsSlot: m.feedsSlot,
  };
}

function formatContest(contest, matches, extra = {}) {
  return {
    _id: contest._id,
    name: contest.name,
    description: contest.description,
    status: contest.status,
    entryClosesAt: contest.entryClosesAt,
    publishedRound: contest.publishedRound,
    isPublished: contest.isPublished,
    entryOpen: isEntryOpen(contest),
    r16Ready: matches
      .filter((m) => m.stage === "r16")
      .every((m) => m.teamA && m.teamB),
    matches: matches.map(formatMatch),
    ...extra,
  };
}

function formatEntry(entry, participant, contest) {
  return {
    _id: entry._id,
    name: participant?.name || "",
    jnvSchool: participant?.jnvSchool || "",
    email: participant?.email || "",
    status: entry.status,
    knockedOutRound: entry.knockedOutRound,
    lastRoundSurvived: getLastRoundSurvived(entry, contest?.publishedRound),
    bracketPoints: entry.bracketPoints ?? 0,
    submittedAt: entry.submittedAt,
  };
}

export const getActiveContest = async (req, res, next) => {
  try {
    const contest = await resolveActiveContest();
    if (!contest) {
      return res.status(200).json({
        status: "success",
        message: "Contest retrieved",
        data: { contest: null },
      });
    }

    const matches = await FifaBracketMatch.find({ contest: contest._id }).sort({
      stage: 1,
      order: 1,
    });

    res.status(200).json({
      status: "success",
      message: "Contest retrieved",
      data: { contest: formatContest(contest, matches) },
    });
  } catch (error) {
    next(error);
  }
};

export const checkEntry = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    const contest = await resolveActiveContest();

    if (!campaign || !contest) {
      return res.status(200).json({
        status: "success",
        message: "Check complete",
        data: {
          entered: false,
          contestActive: false,
          registered: false,
        },
      });
    }

    const participant = await resolveParticipant(campaign, req.body.email, req.body.code);

    if (!participant) {
      return res.status(200).json({
        status: "success",
        message: "Check complete",
        data: {
          entered: false,
          contestActive: true,
          registered: false,
          entryOpen: isEntryOpen(contest),
        },
      });
    }

    const existing = await FifaBracketEntry.findOne({
      contest: contest._id,
      participant: participant._id,
    });

    res.status(200).json({
      status: "success",
      message: "Check complete",
      data: {
        entered: !!existing,
        contestActive: true,
        registered: true,
        verified: participant.verified,
        entryOpen: isEntryOpen(contest),
        participant: {
          name: participant.name,
          jnvSchool: participant.jnvSchool,
          email: participant.email,
        },
        entry: existing
          ? formatEntry(existing, participant, contest)
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitEntry = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) return next(new AppError("No active FIFA campaign", 404));

    const contest = await resolveActiveContest();
    if (!contest) return next(new AppError("No active Road to the Final contest", 404));
    if (!isEntryOpen(contest)) return next(new AppError("Entry period has closed", 403));

    const { email, code, predictions } = req.body;
    const participant = await resolveParticipant(campaign, email, code);

    if (!participant) {
      return next(new AppError("Invalid email or FIFA code. Join the contest first.", 401));
    }
    if (!participant.verified) {
      return next(new AppError("Please verify your FIFA code before entering Road to the Final", 403));
    }

    const existing = await FifaBracketEntry.findOne({
      contest: contest._id,
      participant: participant._id,
    });
    if (existing) {
      return next(new AppError("You have already submitted your Road to the Final picks", 409));
    }

    const matches = await FifaBracketMatch.find({ contest: contest._id });
    const r16Ready = matches
      .filter((m) => m.stage === "r16")
      .every((m) => m.teamA && m.teamB);
    if (!r16Ready) return next(new AppError("R16 matchups are not ready yet", 400));

    const r16Fixtures = buildR16Fixtures(matches);
    const validationErrors = validatePredictions(predictions, r16Fixtures);
    if (validationErrors.length) {
      return next(new AppError(validationErrors[0], 400));
    }

    const entry = await FifaBracketEntry.create({
      contest: contest._id,
      campaign: campaign._id,
      participant: participant._id,
      predictions,
      status: "active",
      bracketPoints: 0,
      submittedAt: new Date(),
    });

    res.status(201).json({
      status: "success",
      message: "Road to the Final entry submitted successfully",
      data: {
        entry: formatEntry(entry, participant, contest),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBoard = async (req, res, next) => {
  try {
    const contest = await resolveActiveContest();
    if (!contest) {
      return res.status(200).json({
        status: "success",
        message: "Board retrieved",
        data: { contest: null, entries: [], summary: null },
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const skip = (page - 1) * limit;

    const filter = { contest: contest._id };
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    const schoolFilter = req.query.jnvSchool?.trim();
    if (schoolFilter) {
      const schoolParticipants = await FifaParticipant.find({
        campaign: contest.campaign,
        jnvSchool: schoolFilter,
      }).select("_id");
      filter.participant = { $in: schoolParticipants.map((p) => p._id) };
    }

    const [entries, total, summaryAgg] = await Promise.all([
      FifaBracketEntry.find(filter)
        .populate("participant", "name jnvSchool email")
        .sort({ status: 1, submittedAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FifaBracketEntry.countDocuments(filter),
      FifaBracketEntry.aggregate([
        { $match: { contest: contest._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const summary = { active: 0, knocked_out: 0, champion: 0, total: 0 };
    for (const row of summaryAgg) {
      summary[row._id] = row.count;
      summary.total += row.count;
    }

    let formatted = entries.map((e) =>
      formatEntry(e, e.participant, contest)
    );

    res.status(200).json({
      status: "success",
      message: "Board retrieved",
      data: {
        contest: {
          _id: contest._id,
          name: contest.name,
          publishedRound: contest.publishedRound,
          status: contest.status,
        },
        entries: formatted,
        summary,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEntry = async (req, res, next) => {
  try {
    const contest = await resolveActiveContest();
    if (!contest) return next(new AppError("No active contest", 404));

    const entry = await FifaBracketEntry.findOne({
      _id: req.params.id,
      contest: contest._id,
    })
      .populate("participant", "name jnvSchool email")
      .lean();

    if (!entry) return next(new AppError("Entry not found", 404));

    const matches = await FifaBracketMatch.find({ contest: contest._id }).sort({
      stage: 1,
      order: 1,
    });

    res.status(200).json({
      status: "success",
      message: "Entry retrieved",
      data: {
        entry: {
          ...formatEntry(entry, entry.participant, contest),
          predictions: predictionsToObject(entry.predictions),
        },
        matches: matches.map(formatMatch),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetContest = async (req, res, next) => {
  try {
    const contest =
      (await FifaBracketContest.findOne({ status: "active" }).sort({ createdAt: -1 })) ||
      (await FifaBracketContest.findOne().sort({ createdAt: -1 }));

    if (!contest) {
      return res.status(200).json({
        status: "success",
        message: "Contest retrieved",
        data: { contest: null },
      });
    }

    const matches = await FifaBracketMatch.find({ contest: contest._id }).sort({
      stage: 1,
      order: 1,
    });

    const entryCount = await FifaBracketEntry.countDocuments({ contest: contest._id });

    res.status(200).json({
      status: "success",
      message: "Contest retrieved",
      data: { contest: formatContest(contest, matches, { entryCount }) },
    });
  } catch (error) {
    next(error);
  }
};

export const createContest = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) return next(new AppError("No active FIFA campaign", 400));

    const existing = await FifaBracketContest.findOne({ status: "active" });
    if (existing) {
      return next(new AppError("An active Road to the Final contest already exists. Complete it first.", 400));
    }

    const contest = await FifaBracketContest.create({
      ...req.body,
      campaign: campaign._id,
      createdBy: req.admin._id,
    });

    await seedMatchesForContest(contest._id);

    const matches = await FifaBracketMatch.find({ contest: contest._id });

    res.status(201).json({
      status: "success",
      message: "Road to the Final contest created",
      data: { contest: formatContest(contest, matches) },
    });
  } catch (error) {
    next(error);
  }
};

export const updateContest = async (req, res, next) => {
  try {
    const contest = await resolveContestById(req.params.id);

    Object.assign(contest, req.body);
    await contest.save();

    const matches = await FifaBracketMatch.find({ contest: contest._id });

    res.status(200).json({
      status: "success",
      message: "Contest updated",
      data: { contest: formatContest(contest, matches) },
    });
  } catch (error) {
    next(error);
  }
};

export const setupR16 = async (req, res, next) => {
  try {
    const contest = await resolveContestById(req.body.contestId);

    if (contest.publishedRound) {
      return next(new AppError("Cannot change R16 after results have been published", 400));
    }

    for (const m of req.body.matches) {
      if (m.teamA === m.teamB) {
        return next(new AppError(`Teams must be different for ${m.bracketKey}`, 400));
      }

      const match = await FifaBracketMatch.findOne({
        contest: contest._id,
        bracketKey: m.bracketKey,
      });

      if (!match) return next(new AppError(`Match ${m.bracketKey} not found`, 404));

      match.teamA = m.teamA.trim();
      match.teamB = m.teamB.trim();
      match.winner = null;
      await match.save();
    }

    const laterMatches = await FifaBracketMatch.find({
      contest: contest._id,
      stage: { $in: ["qf", "sf", "final"] },
    });
    for (const m of laterMatches) {
      m.teamA = "";
      m.teamB = "";
      m.winner = null;
      await m.save();
    }

    const matches = await FifaBracketMatch.find({ contest: contest._id });

    res.status(200).json({
      status: "success",
      message: "R16 matchups saved",
      data: { contest: formatContest(contest, matches) },
    });
  } catch (error) {
    next(error);
  }
};

export const enterMatchResult = async (req, res, next) => {
  try {
    const match = await FifaBracketMatch.findById(req.params.id);
    if (!match) return next(new AppError("Match not found", 404));

    const contest = await resolveContestById(match.contest);
    const { winner } = req.body;

    const teamA = match.teamA?.trim();
    const teamB = match.teamB?.trim();

    if (!teamA || !teamB) {
      return next(new AppError("Both teams must be set before entering a result", 400));
    }

    if (winner !== teamA && winner !== teamB) {
      return next(new AppError("Winner must be one of the two teams in this match", 400));
    }

    match.winner = winner.trim();
    await match.save();

    await advanceWinnerToParent(match);

    const matches = await FifaBracketMatch.find({ contest: contest._id });

    res.status(200).json({
      status: "success",
      message: "Result saved",
      data: { contest: formatContest(contest, matches) },
    });
  } catch (error) {
    next(error);
  }
};

export const publishRound = async (req, res, next) => {
  try {
    const { contestId, stage } = req.body;
    const contest = await resolveContestById(contestId);

    const stageIdx = ROUND_ORDER.indexOf(stage);
    if (stageIdx === -1) return next(new AppError("Invalid stage", 400));

    const expectedPrev = stageIdx > 0 ? ROUND_ORDER[stageIdx - 1] : null;
    if (expectedPrev && contest.publishedRound !== expectedPrev) {
      return next(new AppError(`Must publish ${expectedPrev} before publishing ${stage}`, 400));
    }
    if (stageIdx === 0 && contest.publishedRound) {
      return next(new AppError("R16 has already been published", 400));
    }

    const stageMatches = await FifaBracketMatch.find({ contest: contestId, stage });
    const incomplete = stageMatches.filter((m) => !m.winner);
    if (incomplete.length) {
      return next(
        new AppError(`${incomplete.length} match(es) in ${stage} still need results`, 400)
      );
    }

    await advanceStageWinners(contestId, stage);

    const gradeResult = await gradeRound(contestId, stage);

    let pointsResult = null;
    if (stage === "final") {
      pointsResult = await awardBracketPoints(contestId);
    }

    contest.publishedRound = stage;
    if (stage === "final") {
      contest.status = "completed";
    }
    await contest.save();

    const matches = await FifaBracketMatch.find({ contest: contestId });

    res.status(200).json({
      status: "success",
      message: `${stage.toUpperCase()} results published`,
      data: {
        contest: formatContest(contest, matches),
        gradeResult,
        pointsResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const adminListEntries = async (req, res, next) => {
  try {
    const contest = await resolveActiveContest();
    if (!contest) {
      return res.status(200).json({
        status: "success",
        message: "Entries retrieved",
        data: { entries: [] },
      });
    }

    const entries = await FifaBracketEntry.find({ contest: contest._id })
      .populate("participant", "name jnvSchool email")
      .sort({ submittedAt: -1 })
      .lean();

    const formatted = entries.map((e) => ({
      ...formatEntry(e, e.participant, contest),
      predictions: predictionsToObject(e.predictions),
    }));

    res.status(200).json({
      status: "success",
      message: "Entries retrieved",
      data: { entries: formatted },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEntry = async (req, res, next) => {
  try {
    const entry = await FifaBracketEntry.findByIdAndDelete(req.params.id);
    if (!entry) return next(new AppError("Entry not found", 404));

    res.status(200).json({
      status: "success",
      message: "Entry deleted",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
