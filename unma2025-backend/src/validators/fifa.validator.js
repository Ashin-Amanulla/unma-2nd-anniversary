import Joi from "joi";
import { logger } from "../utils/logger.js";

const objectId = Joi.string().hex().length(24);

const jnvSchools = [
  "JNV Alappuzha",
  "JNV Malappuram",
  "JNV Ernakulam",
  "JNV Idukki",
  "JNV Kannur",
  "JNV Kasaragod",
  "JNV Kollam",
  "JNV Kottayam",
  "JNV Kozhikode",
  "JNV Lakshadweep",
  "JNV Mahe",
  "JNV Palakkad",
  "JNV Pathanamthitta",
  "JNV Thiruvananthapuram",
  "JNV Thrissur",
  "JNV Wayanad",
  "JNV Other",
];

export const joinSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
  }),
  jnvSchool: Joi.string()
    .valid(...jnvSchools)
    .required()
    .messages({
      "any.only": "Please select a valid JNV school",
      "string.empty": "JNV school is required",
    }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email",
    "string.empty": "Email is required",
  }),
});

export const resendSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifySchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().min(6).max(12).required(),
});

export const myPredictionsSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().min(6).max(12).required(),
});

export const updateSchoolSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().min(6).max(12).required(),
  jnvSchool: Joi.string()
    .valid(...jnvSchools)
    .required()
    .messages({
      "any.only": "Please select a valid JNV school",
      "string.empty": "JNV school is required",
    }),
});

const answerValueSchema = Joi.alternatives().try(
  Joi.string().allow(""),
  Joi.number(),
  Joi.object({
    a: Joi.number().integer().min(0).required(),
    b: Joi.number().integer().min(0).required(),
  })
);

const answerSchema = Joi.object({
  questionId: objectId.required(),
  value: answerValueSchema.allow(null),
});

export const predictSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().min(6).max(12).required(),
  matchId: objectId.required(),
  answers: Joi.array().items(answerSchema).min(1).required(),
});

export const campaignSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().max(2000).allow("", null),
  status: Joi.string().valid("upcoming", "active", "completed"),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
});

export const updateCampaignSchema = campaignSchema.fork(["name"], (s) => s.optional());

export const slotSchema = Joi.object({
  campaign: objectId.required(),
  title: Joi.string().min(1).max(100).required(),
  slotDate: Joi.date().allow(null),
  closesAt: Joi.date().required(),
  status: Joi.string().valid("draft", "published", "closed"),
  order: Joi.number().integer().min(0),
});

export const updateSlotSchema = slotSchema.fork(
  ["campaign", "title", "closesAt"],
  (s) => s.optional()
);

const questionSchema = Joi.object({
  _id: objectId.optional(),
  text: Joi.string().min(1).max(300).required(),
  type: Joi.string().valid("winner", "score", "choice", "number", "text").required(),
  points: Joi.number().integer().min(0).required(),
  options: Joi.when("type", {
    is: "choice",
    then: Joi.array().items(Joi.string().trim().min(1)).min(2).required(),
    otherwise: Joi.any().strip(),
  }),
});

export const matchSchema = Joi.object({
  campaign: objectId.required(),
  slot: objectId.required(),
  teamA: Joi.string().min(1).max(60).required(),
  teamB: Joi.string().min(1).max(60).required(),
  kickoffAt: Joi.date().allow(null),
  stage: Joi.string().valid("group", "r32", "r16", "qf", "sf", "final"),
  questions: Joi.array().items(questionSchema).min(1).required(),
  order: Joi.number().integer().min(0),
});

export const updateMatchSchema = Joi.object({
  teamA: Joi.string().min(1).max(60),
  teamB: Joi.string().min(1).max(60),
  kickoffAt: Joi.date().allow(null),
  stage: Joi.string().valid("group", "r32", "r16", "qf", "sf", "final"),
  questions: Joi.array().items(questionSchema).min(1),
  order: Joi.number().integer().min(0),
});

const correctAnswerSchema = Joi.alternatives().try(
  Joi.string(),
  Joi.number(),
  Joi.object({
    a: Joi.number().integer().min(0).required(),
    b: Joi.number().integer().min(0).required(),
  })
);

export const enterResultSchema = Joi.object({
  questions: Joi.array()
    .items(
      Joi.object({
        questionId: objectId.required(),
        correctAnswer: correctAnswerSchema.required(),
      })
    )
    .min(1)
    .required(),
});

export const gradeOverrideSchema = Joi.object({
  award: Joi.boolean().required(),
});

export const updateParticipantPointsSchema = Joi.object({
  startingPoints: Joi.number().integer().min(0).required(),
  reason: Joi.string().max(500).allow("").optional(),
});

export const validateFifa =
  (schema) =>
  (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      logger.warn(`FIFA validation failed: ${error.message}`);
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    next();
  };
