import asyncHandler from 'express-async-handler';
import AIConversation from '../models/AIConversation.js';
import Course from '../models/Course.js';

// @desc    List user's AI conversations
// @route   GET /api/ai/conversations
export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await AIConversation.find({ user: req.user._id })
    .select('title courseId courseTitle updatedAt createdAt')
    .sort({ updatedAt: -1 })
    .limit(80);

  res.json({ success: true, conversations });
});

// @desc    Create a new AI conversation
// @route   POST /api/ai/conversations
export const createConversation = asyncHandler(async (req, res) => {
  const { courseId, title } = req.body;
  let courseTitle = null;

  if (courseId) {
    const course = await Course.findById(courseId).select('title');
    if (course) courseTitle = course.title;
  }

  const conversation = await AIConversation.create({
    user: req.user._id,
    title: title?.trim() || 'New chat',
    courseId: courseId || undefined,
    courseTitle: courseTitle || undefined,
    messages: [],
  });

  res.status(201).json({ success: true, conversation });
});

// @desc    Get one conversation with messages
// @route   GET /api/ai/conversations/:id
export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await AIConversation.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  res.json({ success: true, conversation });
});

// @desc    Delete a conversation
// @route   DELETE /api/ai/conversations/:id
export const deleteConversation = asyncHandler(async (req, res) => {
  const result = await AIConversation.deleteOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (result.deletedCount === 0) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  res.json({ success: true });
});
