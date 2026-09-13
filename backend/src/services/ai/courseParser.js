require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const {
  extractedCourseSchema,
} = require("./courseSchema");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const COURSE_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
    },
    description: {
      type: "string",
    },
    category: {
      type: "string",
    },
    level: {
      type: "string",
    },
    language: {
      type: "string",
    },
    modules: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
          },
          sourcePage: {
            type: ["integer", "null"],
            minimum: 1,
          },
          description: {
            type: "string",
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: [
                    "TEXT",
                    "VIDEO",
                    "AUDIO",
                    "IMAGE",
                    "RESOURCE",
                    "PRACTICE",
                    "CHECKPOINT",
                  ],
                },
                title: {
                  type: "string",
                },
                content: {
                  type: "string",
                },
                url: {
                  type: "string",
                },
                resourceUrl: {
                  type: "string",
                },
                media: {
                  type: ["object", "null"],
                  properties: {
                    url: { type: "string" },
                    publicId: { type: "string" },
                    resourceType: {
                      type: "string",
                      enum: ["image", "video", "raw", ""],
                    },
                    fileName: { type: "string" },
                    mimeType: { type: "string" },
                    size: { type: "number" },
                  },
                  required: [
                    "url",
                    "publicId",
                    "resourceType",
                    "fileName",
                    "mimeType",
                    "size",
                  ],
                },
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: {
                        type: "array",
                        items: { type: "string" },
                      },
                      correctAnswer: {
                        type: "integer",
                        minimum: 0,
                        maximum: 3,
                      },
                      explanation: { type: "string" },
                    },
                    required: [
                      "question",
                      "options",
                      "correctAnswer",
                      "explanation",
                    ],
                  },
                },
              },
              required: [
                "type",
                "title",
                "content",
                "url",
                "resourceUrl",
                "media",
                "questions",
              ],
            },
          },
        },
        required: ["title", "description", "items"],
      },
    },
  },
  required: [
    "title",
    "description",
    "category",
    "level",
    "language",
    "modules",
  ],
};


const GEMINI_MAX_ATTEMPTS = 4;
const GEMINI_BASE_DELAY_MS = 1200;
const GEMINI_MAX_DELAY_MS = 10000;

function isRetryableGeminiError(error) {
  const status = Number(
    error?.status ||
    error?.statusCode ||
    error?.response?.status ||
    0
  );

  const message = String(
    error?.message ||
    error?.error?.message ||
    ""
  ).toUpperCase();

  return (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("SERVICE UNAVAILABLE")
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(generateRequest) {
  let lastError;

  for (
    let attempt = 1;
    attempt <= GEMINI_MAX_ATTEMPTS;
    attempt += 1
  ) {
    try {
      return await generateRequest();
    } catch (error) {
      lastError = error;

      if (
        !isRetryableGeminiError(error) ||
        attempt >= GEMINI_MAX_ATTEMPTS
      ) {
        throw error;
      }

      const exponentialDelay = Math.min(
        GEMINI_BASE_DELAY_MS * (2 ** (attempt - 1)),
        GEMINI_MAX_DELAY_MS
      );

      const jitter = Math.floor(
        Math.random() * Math.min(500, exponentialDelay * 0.25)
      );

      const delay = exponentialDelay + jitter;

      console.warn(
        `Gemini temporary failure (${error?.status || error?.statusCode || "unknown"}). ` +
        `Retrying attempt ${attempt + 1}/${GEMINI_MAX_ATTEMPTS} in ${delay}ms.`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}
function ensureConfigured() {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("GEMINI_API_KEY is not configured.");
    error.statusCode = 500;
    throw error;
  }
}

async function parseCourseDocument({ fileBytes, mimeType, fileName }) {
  ensureConfigured();

  if (!Buffer.isBuffer(fileBytes)) {
    throw new Error("Document data must be a Buffer.");
  }

  if (!mimeType) {
    throw new Error("Document MIME type is required.");
  }

  const uploadedFile = await ai.files.upload({
    file: new Blob([fileBytes], { type: mimeType }),
    config: {
      displayName: fileName || "course-document",
      mimeType,
    },
  });

  try {
    const response = await generateWithRetry(() => ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are the JobWay course-content extraction engine.

Convert the supplied educational document into a structured course.

Rules:
- Preserve factual content from the source.
- Do not invent topics, facts, questions, answers, URLs, or metadata.
- Organize material into logical modules.
- Use TEXT for ordinary explanatory material.
- Use RESOURCE only when the source explicitly contains a resource/link.
- Use PRACTICE for explicitly identified practice material.
- Use CHECKPOINT only when the source contains assessment questions.
- Do not manufacture a checkpoint merely because the document contains educational content.
- Keep the original meaning and terminology.
- The supplied document may contain embedded diagrams, charts, screenshots, illustrations, or other meaningful images.
- When an embedded visual is meaningful to the educational content, create an IMAGE item for it.
- For every module, set sourcePage to the first PDF page where that module's content begins.
- For every IMAGE item, set sourcePage to the PDF page containing that visual.
- Use null for sourcePage when the source page cannot be determined.
- Do not invent images or image URLs.
- Do not put placeholder URLs in IMAGE items.
- The application will attach the actual extracted image files after this response.
- Return only the requested JSON structure.
              `.trim(),
            },
            {
              fileData: {
                fileUri: uploadedFile.uri,
                mimeType: uploadedFile.mimeType || mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: COURSE_RESPONSE_SCHEMA,
      },
    }));

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      const error = new Error("Gemini returned invalid JSON.");
      error.statusCode = 502;
      throw error;
    }

    const validated = extractedCourseSchema.safeParse(parsed);

    if (!validated.success) {
      const error = new Error(
        `Generated course JSON failed validation: ${validated.error.message}`
      );
      error.statusCode = 502;
      throw error;
    }

    return validated.data;
  } finally {
    if (uploadedFile?.name) {
      try {
        await ai.files.delete({
          name: uploadedFile.name,
        });
      } catch (cleanupError) {
        console.warn(
          "Gemini temporary file cleanup failed:",
          cleanupError.message
        );
      }
    }
  }
}

module.exports = {
  parseCourseDocument,
};


