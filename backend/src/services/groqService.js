import Groq from 'groq-sdk';

const PLACEHOLDER_KEYS = new Set([
  '',
  'your_groq_api_key',
  'your-groq-api-key',
  'gsk_your_groq_api_key',
]);

export const GROQ_CHAT_MODEL =
  process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';

let groqClient = null;

const normalizeApiKey = () => {
  const raw = process.env.GROQ_API_KEY?.trim() || '';
  return raw.replace(/^["']|["']$/g, '');
};

export const getGroqConfigStatus = () => {
  const key = normalizeApiKey();

  if (!key || PLACEHOLDER_KEYS.has(key.toLowerCase())) {
    return {
      configured: false,
      reason: 'missing',
      message:
        'GROQ_API_KEY is empty. Add your key to backend/.env and restart the API.',
    };
  }

  if (!key.startsWith('gsk_')) {
    return {
      configured: true,
      reason: 'ok',
      message: 'Groq API key is configured.',
      keyFormatWarning:
        'GROQ_API_KEY should start with gsk_ (from https://console.groq.com/keys).',
    };
  }

  return {
    configured: true,
    reason: 'ok',
    message: 'Groq API key is configured.',
  };
};

export const getGroqClient = () => {
  if (!getGroqConfigStatus().configured) return null;

  if (!groqClient) {
    groqClient = new Groq({ apiKey: normalizeApiKey() });
  }

  return groqClient;
};

const mapGroqError = (error) => {
  if (error?.statusCode) return error;

  const message = error?.message || 'Groq request failed';
  const err = new Error(message);
  const status = error?.status || error?.statusCode;

  if (status === 429 || /quota|rate limit/i.test(message)) {
    err.statusCode = 429;
  } else if (status === 401 || /invalid api key|authentication/i.test(message)) {
    err.statusCode = 503;
    err.message = 'Invalid Groq API key. Check GROQ_API_KEY in backend/.env.';
  } else {
    err.statusCode = 503;
  }

  return err;
};

const toOpenAIMessages = (messages) =>
  messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
    content: String(m.content),
  }));

/**
 * Groq chat completion — used by CentreHub AI (chat, quiz, study planner, etc.)
 */
export const groqChatCompletion = async (messages, options = {}) => {
  const groq = getGroqClient();
  if (!groq) {
    const err = new Error(
      'Groq is not configured. Set GROQ_API_KEY in backend/.env.'
    );
    err.statusCode = 503;
    throw err;
  }

  const jsonMode = options.jsonMode || options.responseFormat?.type === 'json_object';

  try {
    const completion = await groq.chat.completions.create({
      model: options.model || GROQ_CHAT_MODEL,
      messages: toOpenAIMessages(messages),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      const err = new Error('Empty response from Groq');
      err.statusCode = 503;
      throw err;
    }

    return content;
  } catch (error) {
    throw mapGroqError(error);
  }
};
