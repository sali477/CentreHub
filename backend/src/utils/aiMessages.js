/** Short user-facing error copy — only shown when a request actually fails */

export const FRIENDLY_RATE_LIMIT_REPLY =
  "I'm getting a lot of requests right now. Please wait a moment and try again.";

export const FRIENDLY_GENERIC_ERROR_REPLY =
  'Something went wrong while I was thinking. Please try sending your message again.';

export const FRIENDLY_UNAVAILABLE_REPLY =
  "I couldn't generate a response right now. Please try again in a moment.";

export const FRIENDLY_NOT_CONFIGURED_REPLY =
  'CentreHub AI is not configured yet. Add **GROQ_API_KEY** to `backend/.env` (get a free key at [Groq Console](https://console.groq.com/keys)), then restart the API with `npm run dev`.';

export const FRIENDLY_QUOTA_REPLY =
  "I'm temporarily unable to respond — the AI service quota was reached. Please try again in a minute.";

export const getFriendlyAIErrorReply = (error) => {
  const code = error?.statusCode || error?.status;
  if (code === 429) return FRIENDLY_RATE_LIMIT_REPLY;
  return FRIENDLY_GENERIC_ERROR_REPLY;
};
