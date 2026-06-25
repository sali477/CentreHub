import crypto from 'crypto';

export const generateTeacherCode = () =>
  `TCH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

export const normalizeTeacherCode = (code) =>
  String(code || '').trim().toUpperCase();
