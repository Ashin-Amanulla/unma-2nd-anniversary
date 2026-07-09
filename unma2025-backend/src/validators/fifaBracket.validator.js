import Joi from "joi";
import { ALL_BRACKET_KEYS } from "../utils/bracketTree.js";

const objectId = Joi.string().hex().length(24);

const stageSchema = Joi.string().valid("qf", "sf", "final");

const predictionsSchema = Joi.object(
  ALL_BRACKET_KEYS.reduce((acc, key) => {
    acc[key] = Joi.string().min(1).required();
    return acc;
  }, {})
);

const scoreEntrySchema = Joi.object({
  a: Joi.number().integer().min(0).max(20).required(),
  b: Joi.number().integer().min(0).max(20).required(),
});

const scoresSchema = Joi.object(
  ALL_BRACKET_KEYS.reduce((acc, key) => {
    acc[key] = scoreEntrySchema.required();
    return acc;
  }, {})
);

export const checkSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().min(6).max(12).required(),
});

export const enterSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().min(6).max(12).required(),
  predictions: predictionsSchema.required(),
  scores: scoresSchema.required(),
});

export const contestSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().max(2000).allow("", null),
  status: Joi.string().valid("upcoming", "active", "completed"),
  entryClosesAt: Joi.date().required(),
  isPublished: Joi.boolean(),
});

export const updateContestSchema = contestSchema.fork(["name", "entryClosesAt"], (s) => s.optional());

const qfMatchSchema = Joi.object({
  bracketKey: Joi.string()
    .valid("qf-l1", "qf-l2", "qf-r1", "qf-r2")
    .required(),
  teamA: Joi.string().min(1).max(100).required(),
  teamB: Joi.string().min(1).max(100).required(),
});

export const qfSetupSchema = Joi.object({
  contestId: objectId.required(),
  matches: Joi.array().items(qfMatchSchema).length(4).required(),
});

export const matchResultSchema = Joi.object({
  winner: Joi.string().min(1).max(100).required(),
  scoreA: Joi.number().integer().min(0).max(20).optional(),
  scoreB: Joi.number().integer().min(0).max(20).optional(),
});

export const publishRoundSchema = Joi.object({
  contestId: objectId.required(),
  stage: stageSchema.required(),
});

export const validateFifaBracket =
  (schema) =>
  (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    next();
  };
