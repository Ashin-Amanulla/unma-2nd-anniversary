import Joi from "joi";
import { ALL_BRACKET_KEYS } from "../utils/bracketTree.js";

const objectId = Joi.string().hex().length(24);

const stageSchema = Joi.string().valid("r16", "qf", "sf", "final");

const predictionsSchema = Joi.object(
  ALL_BRACKET_KEYS.reduce((acc, key) => {
    acc[key] = Joi.string().min(1).required();
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
});

export const contestSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().max(2000).allow("", null),
  status: Joi.string().valid("upcoming", "active", "completed"),
  entryClosesAt: Joi.date().required(),
  isPublished: Joi.boolean(),
});

export const updateContestSchema = contestSchema.fork(["name", "entryClosesAt"], (s) => s.optional());

const r16MatchSchema = Joi.object({
  bracketKey: Joi.string()
    .valid("r16-l1", "r16-l2", "r16-l3", "r16-l4", "r16-r1", "r16-r2", "r16-r3", "r16-r4")
    .required(),
  teamA: Joi.string().min(1).max(100).required(),
  teamB: Joi.string().min(1).max(100).required(),
});

export const r16SetupSchema = Joi.object({
  contestId: objectId.required(),
  matches: Joi.array().items(r16MatchSchema).length(8).required(),
});

export const matchResultSchema = Joi.object({
  winner: Joi.string().min(1).max(100).required(),
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
