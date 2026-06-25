import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const GOOGLE_CLIENT_ID_PLACEHOLDERS = new Set([
  '',
  'your_google_client_id',
  'your-google-client-id',
  'your_google_client_id.apps.googleusercontent.com',
]);

const getGoogleClientId = () => (process.env.GOOGLE_CLIENT_ID || '').trim();

export const isGoogleAuthConfigured = () => {
  const id = getGoogleClientId();
  return id.length > 0 && !GOOGLE_CLIENT_ID_PLACEHOLDERS.has(id.toLowerCase());
};

const googleClient = () => new OAuth2Client(getGoogleClientId());

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const verifyGoogleIdToken = async (credential) => {
  if (!isGoogleAuthConfigured()) {
    throw createHttpError(
      'Google Sign-In is not configured on the server. Set GOOGLE_CLIENT_ID in backend/.env',
      503
    );
  }

  if (!credential) {
    throw createHttpError('Google credential is required', 400);
  }

  try {
    const ticket = await googleClient().verifyIdToken({
      idToken: credential,
      audience: getGoogleClientId(),
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw createHttpError('Google account must include a verified email address', 400);
    }

    return payload;
  } catch (error) {
    if (error.statusCode) throw error;
    console.error('[auth] Google ID token verification failed:', error.message);
    throw createHttpError('Invalid or expired Google sign-in. Please try again.', 401);
  }
};

export const registerLocalUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError('User already exists with this email', 400);
  }

  return User.create({
    name,
    email,
    password,
    authProvider: 'local',
    role: null,
  });
};

export const authenticateLocalUser = async ({ email, password }) => {
  if (!email || !password) {
    throw createHttpError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw createHttpError('Invalid credentials', 401);
  }

  if (!user.password) {
    throw createHttpError(
      'This account uses Google sign-in. Please use the Google button.',
      401
    );
  }

  if (!(await user.matchPassword(password))) {
    throw createHttpError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw createHttpError('Account has been deactivated', 403);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return user;
};

export const findOrCreateGoogleUser = async ({ googleId, email, name, picture }) => {
  let user = await User.findOne({ $or: [{ email }, { googleId }] });
  let isNew = false;

  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      avatar: picture || '',
      authProvider: 'google',
      role: null,
      isVerified: true,
    });
    isNew = true;
  } else {
    let updated = false;

    if (!user.googleId) {
      user.googleId = googleId;
      updated = true;
    }

    if (!user.avatar && picture) {
      user.avatar = picture;
      updated = true;
    }

    if (!user.isActive) {
      throw createHttpError('Account has been deactivated', 403);
    }

    user.lastLogin = new Date();
    updated = true;

    if (updated) {
      await user.save({ validateBeforeSave: false });
    }
  }

  return { user, isNew };
};

export const assignUserRole = async (user, role) => {
  const allowedRoles = ['student', 'teacher', 'center_owner'];

  if (!allowedRoles.includes(role)) {
    throw createHttpError('Invalid role. Choose student, teacher, or center_owner.', 400);
  }

  if (user.role) {
    throw createHttpError('Role has already been set for this account', 400);
  }

  user.role = role;
  await user.save();

  return user;
};
