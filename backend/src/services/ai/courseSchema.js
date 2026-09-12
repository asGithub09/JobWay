const { z } = require("zod");

const mediaSchema = z.object({
  url: z.string().default(""),
  publicId: z.string().default(""),
  resourceType: z.enum(["image", "video", "raw", ""]).default(""),
  fileName: z.string().default(""),
  mimeType: z.string().default(""),
  size: z.number().default(0),
});

const checkpointQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().default(""),
});

const courseItemSchema = z.object({
  type: z.enum([
    "TEXT",
    "VIDEO",
    "AUDIO",
    "IMAGE",
    "RESOURCE",
    "PRACTICE",
    "CHECKPOINT",
  ]),
  title: z.string().default(""),
  content: z.string().default(""),
  url: z.string().default(""),
  resourceUrl: z.string().default(""),
  media: mediaSchema.nullable().default(null),
  questions: z.array(checkpointQuestionSchema).default([]),
});

const courseModuleSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  items: z.array(courseItemSchema).default([]),
});

const extractedCourseSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  category: z.string().default(""),
  level: z.string().default(""),
  language: z.string().default("English"),
  modules: z.array(courseModuleSchema).default([]),
});

module.exports = {
  mediaSchema,
  checkpointQuestionSchema,
  courseItemSchema,
  courseModuleSchema,
  extractedCourseSchema,
};
