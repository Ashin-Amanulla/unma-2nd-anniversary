import crypto from "crypto";
import FifaCampaign from "../models/FifaCampaign.js";
import FifaSlot from "../models/FifaSlot.js";
import FifaMatch from "../models/FifaMatch.js";
import FifaParticipant from "../models/FifaParticipant.js";
import FifaPrediction from "../models/FifaPrediction.js";
import FifaChatMessage from "../models/FifaChatMessage.js";
import { AppError } from "../middleware/error.js";
import { sendFifaCodeEmail } from "../templates/email/fifaCode.js";
import { gradeAnswer } from "../utils/fifaGrading.js";
import { validateWinnerAnswer } from "../utils/fifaStages.js";
import { logger } from "../utils/logger.js";

async function resolveActiveCampaign() {
  return FifaCampaign.resolveActiveCampaign();
}

function isSlotLocked(slot) {
  return Date.now() >= new Date(slot.closesAt).getTime();
}

function generateFifaCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(4);
  let code = "FIFA-";
  for (const b of bytes) code += chars[b % chars.length];
  return code;
}

function normalizeFifaCode(code) {
  if (!code) return code;
  const upper = String(code).toUpperCase().trim();
  const suffix = upper.startsWith("FIFA-")
    ? upper.slice(5)
    : upper.replace(/^FIFA-?/, "");
  return `FIFA-${suffix}`;
}

async function resolveParticipant(campaign, email, code) {
  const p = await FifaParticipant.findOne({
    campaign: campaign._id,
    email: email.toLowerCase(),
    code: normalizeFifaCode(code),
  });
  return p || null;
}

function sanitizeQuestions(questions) {
  return (questions || []).map(({ _id, text, type, points, options }) => ({
    _id,
    text,
    type,
    points,
    options: options?.length ? options : undefined,
  }));
}

function buildMatchView(matches, predictionsByMatch) {
  return matches.map((m) => {
    const pred = predictionsByMatch.get(String(m._id));
    const answersByQid = new Map(
      (pred?.answers || []).map((a) => [String(a.questionId), a])
    );
    return {
      _id: m._id,
      teamA: m.teamA,
      teamB: m.teamB,
      kickoffAt: m.kickoffAt,
      stage: m.stage,
      order: m.order,
      questions: sanitizeQuestions(m.questions).map((q) => {
        const ans = answersByQid.get(String(q._id));
        return {
          ...q,
          answer: ans?.value ?? null,
          pointsAwarded: ans?.pointsAwarded ?? null,
          graded: ans?.graded ?? false,
          needsReview: ans ? !ans.graded && !ans.gradedManually : false,
        };
      }),
      totalPoints: pred?.totalPoints ?? null,
      scored: pred?.scored ?? false,
    };
  });
}

function buildLeaderboard(participants, predictionsByParticipant) {
  const rows = [];

  for (const p of participants) {
    const preds = predictionsByParticipant.get(String(p._id)) || [];
    let points = p.startingPoints ?? 0;
    let exactHits = 0;
    let correctCount = 0;
    let currentStreak = 0;
    let longestStreak = 0;

    const sorted = [...preds].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    for (const pred of sorted) {
      const earned = pred.totalPoints;
      points += earned;
      if (earned > 0) {
        correctCount++;
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
        for (const a of pred.answers) {
          if (a.graded && a.pointsAwarded > 0) exactHits++;
        }
      } else {
        currentStreak = 0;
      }
    }

    rows.push({
      participantId: p._id,
      name: p.name,
      jnvSchool: p.jnvSchool,
      points,
      exactHits,
      correctCount,
      hotStreak: currentStreak >= 3,
      longestStreak,
      joinedAt: p.createdAt,
    });
  }

  rows.sort(
    (a, b) =>
      b.points - a.points ||
      b.exactHits - a.exactHits ||
      b.correctCount - a.correctCount ||
      new Date(a.joinedAt) - new Date(b.joinedAt)
  );

  const leaderboard = rows.map((r, i) => ({ rank: i + 1, ...r }));

  const bySchool = new Map();
  for (const r of leaderboard) {
    if (!bySchool.has(r.jnvSchool)) {
      bySchool.set(r.jnvSchool, { jnvSchool: r.jnvSchool, points: 0, members: 0 });
    }
    const school = bySchool.get(r.jnvSchool);
    school.points += r.points;
    school.members++;
  }
  const schools = [...bySchool.values()].sort((a, b) => b.points - a.points);

  return { leaderboard, schools };
}

export const getActiveCampaign = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) {
      return res.status(200).json({
        status: "success",
        message: "Campaign retrieved",
        data: { campaign: null, slots: [] },
      });
    }

    const slots = await FifaSlot.find({
      campaign: campaign._id,
      status: "published",
    }).sort({ order: 1, createdAt: 1 });

    const slotIds = slots.map((s) => s._id);
    const matches = await FifaMatch.find({ slot: { $in: slotIds } }).sort({
      order: 1,
      kickoffAt: 1,
    });

    const matchesBySlot = new Map();
    for (const m of matches) {
      const key = String(m.slot);
      if (!matchesBySlot.has(key)) matchesBySlot.set(key, []);
      matchesBySlot.get(key).push({
        _id: m._id,
        teamA: m.teamA,
        teamB: m.teamB,
        kickoffAt: m.kickoffAt,
        stage: m.stage,
        order: m.order,
        questions: sanitizeQuestions(m.questions),
      });
    }

    const slotsWithMatches = slots.map((s) => ({
      _id: s._id,
      title: s.title,
      slotDate: s.slotDate,
      closesAt: s.closesAt,
      order: s.order,
      locked: isSlotLocked(s),
      matches: matchesBySlot.get(String(s._id)) || [],
    }));

    res.status(200).json({
      status: "success",
      message: "Campaign retrieved",
      data: {
        campaign: {
          _id: campaign._id,
          name: campaign.name,
          description: campaign.description,
          status: campaign.status,
        },
        slots: slotsWithMatches,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) {
      return res.status(200).json({
        status: "success",
        message: "Leaderboard retrieved",
        data: { leaderboard: [], schools: [], slots: [] },
      });
    }

    const participants = await FifaParticipant.find({
      campaign: campaign._id,
      verified: true,
    }).sort({ createdAt: 1 });

    const slots = await FifaSlot.find({
      campaign: campaign._id,
      status: "published",
    }).sort({ order: 1, createdAt: 1 });

    const predictions = await FifaPrediction.find({ campaign: campaign._id });

    const predsByParticipant = new Map();
    for (const pred of predictions) {
      const key = String(pred.participant);
      if (!predsByParticipant.has(key)) predsByParticipant.set(key, []);
      predsByParticipant.get(key).push(pred);
    }

    const { leaderboard, schools } = buildLeaderboard(participants, predsByParticipant);
    const slotSummary = slots.map((s) => ({ _id: s._id, title: s.title, order: s.order }));

    const slotPointsByParticipant = new Map();
    for (const pred of predictions) {
      const pid = String(pred.participant);
      const sid = String(pred.slot);
      if (!slotPointsByParticipant.has(pid)) slotPointsByParticipant.set(pid, new Map());
      const existing = slotPointsByParticipant.get(pid).get(sid) ?? 0;
      slotPointsByParticipant.get(pid).set(sid, existing + pred.totalPoints);
    }

    const leaderboardWithSlots = leaderboard.map((r) => ({
      ...r,
      slotPoints: slotSummary.map((s) => ({
        slotId: s._id,
        points: slotPointsByParticipant.get(String(r.participantId))?.get(String(s._id)) ?? null,
      })),
    }));

    res.status(200).json({
      status: "success",
      message: "Leaderboard retrieved",
      data: { leaderboard: leaderboardWithSlots, schools, slots: slotSummary },
    });
  } catch (error) {
    next(error);
  }
};

export const joinContest = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) return next(new AppError("No active campaign", 400));

    const { name, jnvSchool, email } = req.body;
    const normalEmail = email.toLowerCase().trim();

    const existing = await FifaParticipant.findOne({
      campaign: campaign._id,
      email: normalEmail,
    });

    if (existing) {
      return res.status(200).json({
        status: "success",
        message: "Already registered",
        data: { alreadyRegistered: true, name: existing.name },
      });
    }

    const code = generateFifaCode();
    const participant = await FifaParticipant.create({
      campaign: campaign._id,
      name: name.trim(),
      jnvSchool: jnvSchool.trim(),
      email: normalEmail,
      code,
      verified: false,
    });

    try {
      await sendFifaCodeEmail({
        name: participant.name,
        email: participant.email,
        code,
      });
    } catch (err) {
      logger.error(`[FIFA] code email failed: ${err.message}`);
    }

    res.status(201).json({
      status: "success",
      message: "Check your email for your FIFA code",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const resendCode = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) return next(new AppError("No active campaign", 400));

    const { email } = req.body;
    const normalEmail = email.toLowerCase().trim();
    const participant = await FifaParticipant.findOne({
      campaign: campaign._id,
      email: normalEmail,
    });
    if (!participant) return next(new AppError("Email not registered", 404));

    await sendFifaCodeEmail({
      name: participant.name,
      email: participant.email,
      code: participant.code,
    });

    res.status(200).json({
      status: "success",
      message: "FIFA code re-sent to your email",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCode = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) return next(new AppError("No active campaign", 400));

    const { email, code } = req.body;
    const participant = await resolveParticipant(campaign, email, code);
    if (!participant) return next(new AppError("Invalid email or code", 401));

    if (!participant.verified) {
      participant.verified = true;
      await participant.save();
    }

    res.status(200).json({
      status: "success",
      message: "Verified",
      data: {
        participant: {
          _id: participant._id,
          name: participant.name,
          jnvSchool: participant.jnvSchool,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMySchool = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) return next(new AppError("No active campaign", 400));

    const { email, code, jnvSchool } = req.body;
    const participant = await resolveParticipant(campaign, email, code);
    if (!participant) return next(new AppError("Invalid email or code", 401));

    participant.jnvSchool = String(jnvSchool).trim();
    await participant.save();

    res.status(200).json({
      status: "success",
      message: "JNV school updated",
      data: {
        participant: {
          _id: participant._id,
          name: participant.name,
          jnvSchool: participant.jnvSchool,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPredictions = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) return next(new AppError("No active campaign", 400));

    const { email, code } = req.body;
    const participant = await resolveParticipant(campaign, email, code);
    if (!participant) return next(new AppError("Invalid email or code", 401));

    const slots = await FifaSlot.find({
      campaign: campaign._id,
      status: { $in: ["published", "closed"] },
    }).sort({ order: 1 });

    const slotIds = slots.map((s) => s._id);
    const matches = await FifaMatch.find({ slot: { $in: slotIds } }).sort({
      order: 1,
      kickoffAt: 1,
    });
    const predictions = await FifaPrediction.find({
      campaign: campaign._id,
      participant: participant._id,
    });

    const predsByMatch = new Map(predictions.map((p) => [String(p.match), p]));

    const slotsWithMatches = slots.map((s) => {
      const slotMatches = matches.filter((m) => String(m.slot) === String(s._id));
      return {
        _id: s._id,
        title: s.title,
        slotDate: s.slotDate,
        closesAt: s.closesAt,
        locked: isSlotLocked(s),
        matches: buildMatchView(slotMatches, predsByMatch),
      };
    });

    res.status(200).json({
      status: "success",
      message: "Predictions retrieved",
      data: {
        participant: {
          _id: participant._id,
          name: participant.name,
          jnvSchool: participant.jnvSchool,
        },
        slots: slotsWithMatches,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSlotPredictions = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) return next(new AppError("No active campaign", 400));

    const slot = await FifaSlot.findOne({
      _id: req.params.slotId,
      campaign: campaign._id,
    });
    if (!slot) return next(new AppError("Slot not found", 404));

    const matches = await FifaMatch.find({ slot: slot._id }).sort({
      order: 1,
      kickoffAt: 1,
    });
    const matchIds = matches.map((m) => m._id);
    const slotLocked = isSlotLocked(slot);

    const predictions = await FifaPrediction.find({ match: { $in: matchIds } }).populate(
      "participant",
      "name jnvSchool"
    );

    const byMatch = new Map();
    for (const pred of predictions) {
      const key = String(pred.match);
      if (!byMatch.has(key)) byMatch.set(key, []);
      byMatch.get(key).push({
        name: pred.participant?.name || "Unknown",
        jnvSchool: pred.participant?.jnvSchool || "?",
        answers: pred.answers.map((a) => ({
          questionId: String(a.questionId),
          value: a.value,
          pointsAwarded: a.pointsAwarded,
          graded: a.graded,
        })),
        totalPoints: pred.totalPoints,
      });
    }

    const matchData = matches.map((m) => ({
      _id: m._id,
      teamA: m.teamA,
      teamB: m.teamB,
      kickoffAt: m.kickoffAt,
      questions: sanitizeQuestions(m.questions),
      predictionCount: byMatch.get(String(m._id))?.length || 0,
      predictions: byMatch.get(String(m._id)) || [],
    }));

    res.status(200).json({
      status: "success",
      message: "Slot predictions retrieved",
      data: { slotLocked, matches: matchData },
    });
  } catch (error) {
    next(error);
  }
};

export const submitPrediction = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) return next(new AppError("No active campaign", 400));

    const { email, code, matchId, answers } = req.body;
    const participant = await resolveParticipant(campaign, email, code);
    if (!participant) return next(new AppError("Invalid email or code", 401));

    const match = await FifaMatch.findOne({
      _id: matchId,
      campaign: campaign._id,
    }).populate("slot");
    if (!match) return next(new AppError("Match not found", 404));

    const slot = match.slot;
    if (isSlotLocked(slot)) {
      return next(new AppError("This slot is closed for predictions", 400));
    }

    const qMap = new Map(match.questions.map((q) => [String(q._id), q]));
    for (const a of answers || []) {
      const q = qMap.get(String(a.questionId));
      if (!q || q.type !== "winner") continue;
      const err = validateWinnerAnswer(match.stage, a.value);
      if (err) return next(new AppError(err, 400));
    }

    const validAnswers = (answers || [])
      .filter((a) => qMap.has(String(a.questionId)))
      .map((a) => ({
        questionId: a.questionId,
        value: a.value ?? null,
        pointsAwarded: 0,
        graded: false,
        gradedManually: false,
      }));

    const prediction = await FifaPrediction.findOneAndUpdate(
      { match: match._id, participant: participant._id },
      {
        campaign: campaign._id,
        slot: slot._id,
        match: match._id,
        participant: participant._id,
        answers: validAnswers,
        totalPoints: 0,
        scored: false,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      status: "success",
      message: "Prediction saved",
      data: { prediction },
    });
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const campaign = await FifaCampaign.create({
      ...req.body,
      createdBy: req.admin._id,
    });
    res.status(201).json({
      status: "success",
      message: "Campaign created",
      data: { campaign },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await FifaCampaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!campaign) return next(new AppError("Campaign not found", 404));
    res.status(200).json({
      status: "success",
      message: "Campaign updated",
      data: { campaign },
    });
  } catch (error) {
    next(error);
  }
};

export const createSlot = async (req, res, next) => {
  try {
    const slot = await FifaSlot.create(req.body);
    res.status(201).json({
      status: "success",
      message: "Slot created",
      data: { slot },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSlot = async (req, res, next) => {
  try {
    const slot = await FifaSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!slot) return next(new AppError("Slot not found", 404));
    res.status(200).json({
      status: "success",
      message: "Slot updated",
      data: { slot },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSlot = async (req, res, next) => {
  try {
    const slot = await FifaSlot.findByIdAndDelete(req.params.id);
    if (!slot) return next(new AppError("Slot not found", 404));
    const matches = await FifaMatch.find({ slot: slot._id });
    const matchIds = matches.map((m) => m._id);
    await FifaMatch.deleteMany({ slot: slot._id });
    if (matchIds.length) {
      await FifaPrediction.deleteMany({ match: { $in: matchIds } });
    }
    res.status(200).json({
      status: "success",
      message: "Slot deleted",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const listSlots = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    const slots = campaign
      ? await FifaSlot.find({ campaign: campaign._id }).sort({ order: 1, createdAt: 1 })
      : [];
    res.status(200).json({
      status: "success",
      message: "Slots retrieved",
      data: { slots },
    });
  } catch (error) {
    next(error);
  }
};

export const createMatch = async (req, res, next) => {
  try {
    const match = await FifaMatch.create(req.body);
    res.status(201).json({
      status: "success",
      message: "Match created",
      data: { match },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMatch = async (req, res, next) => {
  try {
    const match = await FifaMatch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!match) return next(new AppError("Match not found", 404));
    res.status(200).json({
      status: "success",
      message: "Match updated",
      data: { match },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMatch = async (req, res, next) => {
  try {
    const match = await FifaMatch.findByIdAndDelete(req.params.id);
    if (!match) return next(new AppError("Match not found", 404));
    await FifaPrediction.deleteMany({ match: match._id });
    res.status(200).json({
      status: "success",
      message: "Match deleted",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminMatches = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) {
      return res.status(200).json({
        status: "success",
        message: "No active campaign",
        data: { matches: [] },
      });
    }

    const filter = { campaign: campaign._id };
    if (req.query.slotId) filter.slot = req.query.slotId;

    const matches = await FifaMatch.find(filter)
      .populate("slot", "title closesAt status")
      .sort({ order: 1, kickoffAt: 1 });

    res.status(200).json({
      status: "success",
      message: "Matches retrieved",
      data: { matches },
    });
  } catch (error) {
    next(error);
  }
};

export const enterMatchResult = async (req, res, next) => {
  try {
    const match = await FifaMatch.findById(req.params.id);
    if (!match) return next(new AppError("Match not found", 404));

    const updates = req.body.questions || [];
    for (const u of updates) {
      const q = match.questions.id(u.questionId);
      if (!q) continue;
      if (q.type === "winner") {
        const err = validateWinnerAnswer(match.stage, u.correctAnswer);
        if (err) return next(new AppError(err, 400));
      }
      q.correctAnswer = u.correctAnswer;
      q.resultEntered = true;
    }
    await match.save();

    const predictions = await FifaPrediction.find({ match: match._id });
    let needsReviewCount = 0;
    const questionMap = new Map(match.questions.map((q) => [String(q._id), q]));

    await Promise.all(
      predictions.map(async (pred) => {
        let total = 0;
        let allGraded = true;

        for (const ans of pred.answers) {
          if (ans.gradedManually) {
            total += ans.pointsAwarded;
            continue;
          }
          const q = questionMap.get(String(ans.questionId));
          if (!q || !q.resultEntered) {
            allGraded = false;
            continue;
          }

          const result = gradeAnswer(q, ans.value);
          ans.pointsAwarded = result.pointsAwarded;
          ans.graded = result.graded;
          if (!result.graded) allGraded = false;
          if (result.needsReview) needsReviewCount++;
          total += result.pointsAwarded;
        }

        pred.totalPoints = total;
        pred.scored = allGraded;
        return pred.save();
      })
    );

    res.status(200).json({
      status: "success",
      message: "Results entered and predictions graded",
      data: { match, scoredCount: predictions.length, needsReviewCount },
    });
  } catch (error) {
    next(error);
  }
};

export const regradeMatch = async (req, res, next) => {
  try {
    const match = await FifaMatch.findById(req.params.id);
    if (!match) return next(new AppError("Match not found", 404));

    const questionMap = new Map(match.questions.map((q) => [String(q._id), q]));
    const predictions = await FifaPrediction.find({ match: match._id });
    let needsReviewCount = 0;

    await Promise.all(
      predictions.map(async (pred) => {
        let total = 0;
        let allGraded = true;
        for (const ans of pred.answers) {
          if (ans.gradedManually) {
            total += ans.pointsAwarded;
            continue;
          }
          const q = questionMap.get(String(ans.questionId));
          if (!q || !q.resultEntered) {
            allGraded = false;
            continue;
          }
          const result = gradeAnswer(q, ans.value);
          ans.pointsAwarded = result.pointsAwarded;
          ans.graded = result.graded;
          if (!result.graded) allGraded = false;
          if (result.needsReview) needsReviewCount++;
          total += result.pointsAwarded;
        }
        pred.totalPoints = total;
        pred.scored = allGraded;
        return pred.save();
      })
    );

    res.status(200).json({
      status: "success",
      message: "Match re-graded",
      data: { scoredCount: predictions.length, needsReviewCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getSlotGrading = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) return next(new AppError("No active campaign", 400));

    const slot = await FifaSlot.findOne({
      _id: req.params.slotId,
      campaign: campaign._id,
    });
    if (!slot) return next(new AppError("Slot not found", 404));

    const matches = await FifaMatch.find({ slot: slot._id }).sort({
      order: 1,
      kickoffAt: 1,
    });

    const matchIds = matches.map((m) => m._id);
    const predictions = await FifaPrediction.find({ match: { $in: matchIds } }).populate(
      "participant",
      "name jnvSchool email"
    );

    const predsByMatch = new Map();
    for (const pred of predictions) {
      const key = String(pred.match);
      if (!predsByMatch.has(key)) predsByMatch.set(key, []);
      predsByMatch.get(key).push({
        predictionId: pred._id,
        participant: {
          name: pred.participant?.name,
          jnvSchool: pred.participant?.jnvSchool,
        },
        totalPoints: pred.totalPoints,
        scored: pred.scored,
        answers: pred.answers.map((a) => ({
          answerId: a._id,
          questionId: String(a.questionId),
          value: a.value,
          pointsAwarded: a.pointsAwarded,
          graded: a.graded,
          gradedManually: a.gradedManually,
        })),
      });
    }

    const matchData = matches.map((m) => ({
      _id: m._id,
      teamA: m.teamA,
      teamB: m.teamB,
      kickoffAt: m.kickoffAt,
      questions: m.questions.map((q) => ({
        _id: q._id,
        text: q.text,
        type: q.type,
        points: q.points,
        options: q.options,
        correctAnswer: q.correctAnswer,
        resultEntered: q.resultEntered,
      })),
      predictions: predsByMatch.get(String(m._id)) || [],
    }));

    res.status(200).json({
      status: "success",
      message: "Slot grading retrieved",
      data: {
        slot: { _id: slot._id, title: slot.title, closesAt: slot.closesAt },
        matches: matchData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGradingQueue = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) {
      return res.status(200).json({
        status: "success",
        message: "No active campaign",
        data: { items: [] },
      });
    }

    const predictions = await FifaPrediction.find({
      campaign: campaign._id,
    }).populate("participant", "name jnvSchool");

    const matchIds = [...new Set(predictions.map((p) => String(p.match)))];
    const matches = await FifaMatch.find({ _id: { $in: matchIds } });
    const matchMap = new Map(matches.map((m) => [String(m._id), m]));

    const items = [];
    for (const pred of predictions) {
      const match = matchMap.get(String(pred.match));
      if (!match) continue;
      const qMap = new Map(match.questions.map((q) => [String(q._id), q]));
      for (const ans of pred.answers) {
        if (ans.graded || ans.gradedManually) continue;
        const q = qMap.get(String(ans.questionId));
        if (!q || !q.resultEntered) continue;
        if (q.type !== "text") continue;
        items.push({
          predictionId: pred._id,
          answerId: ans._id,
          participantName: pred.participant?.name,
          participantSchool: pred.participant?.jnvSchool,
          matchLabel: `${match.teamA} vs ${match.teamB}`,
          questionText: q.text,
          questionType: q.type,
          submittedValue: ans.value,
          correctAnswer: q.correctAnswer,
          suggestedPoints: q.points,
        });
      }
    }

    res.status(200).json({
      status: "success",
      message: "Grading queue retrieved",
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};

export const gradeAnswerManually = async (req, res, next) => {
  try {
    const { predictionId, answerId } = req.params;
    const { award } = req.body;

    const pred = await FifaPrediction.findById(predictionId);
    if (!pred) return next(new AppError("Prediction not found", 404));

    const match = await FifaMatch.findById(pred.match);
    const ans = pred.answers.id(answerId);
    if (!ans) return next(new AppError("Answer not found", 404));

    const q = match?.questions?.id(String(ans.questionId));
    ans.pointsAwarded = award ? (q?.points ?? 0) : 0;
    ans.graded = true;
    ans.gradedManually = true;

    pred.totalPoints = pred.answers.reduce((s, a) => s + (a.pointsAwarded || 0), 0);
    pred.scored = pred.answers.every((a) => a.graded || a.gradedManually);
    await pred.save();

    res.status(200).json({
      status: "success",
      message: "Answer graded",
      data: { prediction: pred },
    });
  } catch (error) {
    next(error);
  }
};

export const listParticipants = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) {
      return res.status(200).json({
        status: "success",
        message: "Participants retrieved",
        data: { participants: [] },
      });
    }

    const participants = await FifaParticipant.find({ campaign: campaign._id })
      .sort({ createdAt: -1 })
      .lean();

    const earnedAgg = await FifaPrediction.aggregate([
      { $match: { campaign: campaign._id } },
      { $group: { _id: "$participant", earnedPoints: { $sum: "$totalPoints" } } },
    ]);
    const earnedMap = new Map(
      earnedAgg.map((row) => [String(row._id), row.earnedPoints])
    );

    const enriched = participants.map((p) => {
      const earnedPoints = earnedMap.get(String(p._id)) ?? 0;
      const startingPoints = p.startingPoints ?? 0;
      return {
        ...p,
        startingPoints,
        earnedPoints,
        totalPoints: startingPoints + earnedPoints,
      };
    });

    res.status(200).json({
      status: "success",
      message: "Participants retrieved",
      data: { participants: enriched },
    });
  } catch (error) {
    next(error);
  }
};

export const updateParticipantPoints = async (req, res, next) => {
  try {
    const participant = await FifaParticipant.findById(req.params.id);
    if (!participant) return next(new AppError("Participant not found", 404));

    const { startingPoints } = req.body;
    participant.startingPoints = startingPoints;
    await participant.save();

    logger.info(
      `[FIFA] Starting points updated for ${participant.email}: ${startingPoints}`
    );

    res.status(200).json({
      status: "success",
      message: "Starting points updated",
      data: { participant },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteParticipant = async (req, res, next) => {
  try {
    const participant = await FifaParticipant.findByIdAndDelete(req.params.id);
    if (!participant) return next(new AppError("Participant not found", 404));
    await FifaPrediction.deleteMany({ participant: participant._id });
    res.status(200).json({
      status: "success",
      message: "Participant removed",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/* ===================== Group chat ===================== */

const CHAT_MAX_FETCH = 100;
const CHAT_RATE_WINDOW_MS = 60 * 1000;
const CHAT_RATE_MAX_PER_WINDOW = 5;
const CHAT_MIN_GAP_MS = 3 * 1000;

export const getChatMessages = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) {
      return res
        .status(200)
        .json({ status: "success", message: "No active campaign", data: { messages: [] } });
    }

    // Fetch the most recent messages, then return ascending (oldest first).
    const recent = await FifaChatMessage.find({
      campaign: campaign._id,
      deleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(CHAT_MAX_FETCH)
      .select("senderName jnvSchool text createdAt")
      .lean();

    res.status(200).json({
      status: "success",
      message: "Chat messages",
      data: { messages: recent.reverse() },
    });
  } catch (error) {
    next(error);
  }
};

export const postChatMessage = async (req, res, next) => {
  try {
    const campaign = await resolveActiveCampaign();
    if (!campaign) return next(new AppError("No active campaign", 400));

    const { email, code, text } = req.body;
    const participant = await resolveParticipant(campaign, email, code);
    if (!participant) return next(new AppError("Invalid email or code", 401));

    // Basic anti-spam: cap messages per minute and enforce a minimum gap.
    const since = new Date(Date.now() - CHAT_RATE_WINDOW_MS);
    const recentCount = await FifaChatMessage.countDocuments({
      participant: participant._id,
      createdAt: { $gte: since },
    });
    if (recentCount >= CHAT_RATE_MAX_PER_WINDOW) {
      return next(
        new AppError("You're sending messages too fast. Please wait a moment.", 429)
      );
    }

    const last = await FifaChatMessage.findOne({ participant: participant._id })
      .sort({ createdAt: -1 })
      .select("createdAt")
      .lean();
    if (last && Date.now() - new Date(last.createdAt).getTime() < CHAT_MIN_GAP_MS) {
      return next(new AppError("Slow down a little before sending again.", 429));
    }

    const message = await FifaChatMessage.create({
      campaign: campaign._id,
      participant: participant._id,
      senderName: participant.name,
      jnvSchool: participant.jnvSchool,
      text,
    });

    res.status(201).json({
      status: "success",
      message: "Message sent",
      data: {
        message: {
          _id: message._id,
          senderName: message.senderName,
          jnvSchool: message.jnvSchool,
          text: message.text,
          createdAt: message.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChatMessage = async (req, res, next) => {
  try {
    const message = await FifaChatMessage.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!message) return next(new AppError("Message not found", 404));
    res.status(200).json({
      status: "success",
      message: "Message removed",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
