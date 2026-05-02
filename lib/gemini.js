function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryDelayMs(message) {
  const m = String(message).match(/retry in ([\d.]+)\s*s/i);
  if (!m) return 0;
  const sec = parseFloat(m[1]);
  if (!Number.isFinite(sec) || sec < 0) return 0;
  return Math.min(Math.ceil(sec * 1000) + 250, 120_000);
}

function isQuotaOrRateLimit(status, message) {
  const m = String(message).toLowerCase();
  return (
    status === 429 ||
    m.includes("quota") ||
    m.includes("resource_exhausted") ||
    m.includes("rate limit") ||
    m.includes("too many requests")
  );
}

function uniqueModels(list) {
  const out = [];
  const seen = new Set();
  for (const raw of list) {
    const m = String(raw || "").trim();
    if (!m || seen.has(m)) continue;
    seen.add(m);
    out.push(m);
  }
  return out;
}

/**
 * Calls Gemini generateContent. Uses GEMINI_MODEL (default gemini-2.5-flash-lite),
 * then optional GEMINI_FALLBACK_MODELS (comma-separated), then built-in fallbacks
 * when the API returns quota / rate-limit errors for a given model.
 *
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {{
 *   temperature?: number,
 *   maxOutputTokens?: number,
 *   responseMimeType?: string,
 *   responseSchema?: object,
 * }} [options]
 */
async function callGemini(systemPrompt, userMessage, options = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const primary = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";
  const fromEnv = (process.env.GEMINI_FALLBACK_MODELS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const builtIn = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash",
  ];
  const models = uniqueModels([primary, ...fromEnv, ...builtIn]);

  const temperature =
    typeof options.temperature === "number" ? options.temperature : 0.7;
  const maxOutputTokens =
    typeof options.maxOutputTokens === "number"
      ? options.maxOutputTokens
      : 4000;

  const generationConfig = {
    temperature,
    maxOutputTokens,
    ...(options.responseMimeType && {
      responseMimeType: options.responseMimeType,
    }),
    ...(options.responseSchema && { responseSchema: options.responseSchema }),
  };

  const body = JSON.stringify({
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig,
  });

  let lastMessage = "Gemini request failed";

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        },
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts;
        if (!candidate || !parts?.length) {
          throw new Error("Invalid response from Gemini API (no candidates)");
        }
        const text = parts.map((p) => p.text || "").join("");
        if (!text && candidate.finishReason) {
          throw new Error(
            `Gemini returned no text (finishReason: ${candidate.finishReason})`,
          );
        }
        if (!text) {
          throw new Error("Invalid response from Gemini API (empty content)");
        }
        return text;
      }

      const errorData = await response.json().catch(() => ({}));
      lastMessage =
        errorData.error?.message ||
        `Gemini API error: ${response.status} (${model})`;

      const retryMs = parseRetryDelayMs(lastMessage);
      const retryable = isQuotaOrRateLimit(response.status, lastMessage);

      if (retryable && attempt === 0 && retryMs > 0) {
        await sleep(retryMs);
        continue;
      }

      if (retryable) {
        break;
      }

      throw new Error(lastMessage);
    }
  }

  throw new Error(
    `${lastMessage}\n\nAll configured Gemini models were unavailable (quota or rate limits). ` +
      `Set GEMINI_MODEL to a model your project still has quota for, or enable billing: ` +
      `https://ai.google.dev/gemini-api/docs/rate-limits`,
  );
}

module.exports = { callGemini };
