import {
  groqChatCompletion,
  GROQ_CHAT_MODEL,
  getGroqConfigStatus,
} from '../services/groqService.js';

export const DEFAULT_CHAT_MODEL = GROQ_CHAT_MODEL;

export const getAIProvider = () =>
  getGroqConfigStatus().configured ? 'groq' : null;

export const isAIEnabled = async () => Boolean(getAIProvider());

export const chatCompletion = groqChatCompletion;
