import asyncHandler from 'express-async-handler';
import {
  groqChatCompletion,
  GROQ_CHAT_MODEL,
  getGroqConfigStatus,
} from '../services/groqService.js';

// @desc    Send a message to Groq and return the reply
// @route   POST /chat
export const groqChat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    res.status(400);
    throw new Error('Message is required');
  }

  if (!getGroqConfigStatus().configured) {
    res.status(503);
    throw new Error('GROQ_API_KEY is not set in backend/.env');
  }

  const reply = await groqChatCompletion(
    [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant. Answer clearly using Markdown and code blocks when useful.',
      },
      { role: 'user', content: message.trim() },
    ],
    { maxTokens: 2048 }
  );

  res.json({
    success: true,
    reply,
    model: GROQ_CHAT_MODEL,
  });
});
