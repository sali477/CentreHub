import asyncHandler from 'express-async-handler';
import Center from '../models/Center.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import AIConversation from '../models/AIConversation.js';
import { buildCourseContext } from '../utils/courseContext.js';
import { getGroqConfigStatus } from '../services/groqService.js';
import {
  isAIEnabled,
  chatCompletion,
  DEFAULT_CHAT_MODEL,
  getAIProvider,
} from '../utils/aiHelpers.js';
import { buildGeneralSystemPrompt } from '../utils/aiPrompts.js';
import {
  FRIENDLY_RATE_LIMIT_REPLY,
  FRIENDLY_NOT_CONFIGURED_REPLY,
  FRIENDLY_QUOTA_REPLY,
  getFriendlyAIErrorReply,
} from '../utils/aiMessages.js';
import { searchCenters } from '../services/searchService.js';
import { isNearMeQuery } from '../utils/searchHelpers.js';

const ACTION_USER_MESSAGES = {
  summarize: 'Please summarize my current course and highlight the main topics I should focus on.',
  explain: 'Explain the key concepts of my current course in simple terms with examples.',
  'study-plan': 'Create a practical weekly study plan for my current course with daily tasks.',
  quiz: 'Give me 5 practice questions with answers based on my current course content.',
};

const runGeneralChat = async ({ message, history = [], courseId, user }) => {
  let courseContextText = '';
  let courseTitle = '';

  if (courseId) {
    const ctx = await buildCourseContext(courseId);
    if (ctx) {
      courseContextText = ctx.text;
      courseTitle = ctx.course?.title || '';
    }
  }

  const systemPrompt = buildGeneralSystemPrompt({
    courseContext: courseContextText || undefined,
    courseTitle: courseTitle || undefined,
    userName: user?.name,
  });

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...history
      .slice(-20)
      .filter((m) => m?.content && (m.role === 'user' || m.role === 'assistant'))
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content),
      })),
    { role: 'user', content: message },
  ];

  if (!(await isAIEnabled())) {
    return {
      success: false,
      reply: FRIENDLY_NOT_CONFIGURED_REPLY,
      courseTitle: courseTitle || null,
      notConfigured: true,
    };
  }

  try {
    const reply = await chatCompletion(apiMessages);
    return {
      success: true,
      reply,
      model: DEFAULT_CHAT_MODEL,
      provider: getAIProvider(),
      courseTitle: courseTitle || null,
    };
  } catch (error) {
    return {
      success: false,
      reply:
        error.statusCode === 429
          ? FRIENDLY_QUOTA_REPLY
          : getFriendlyAIErrorReply(error),
      courseTitle: courseTitle || null,
    };
  }
};

const deriveConversationTitle = (text) => {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'New chat';
  return cleaned.length > 56 ? `${cleaned.slice(0, 56)}…` : cleaned;
};

// @desc    General-purpose AI chat (ChatGPT-style, persists when logged in)
// @route   POST /api/ai/chat
export const generalChat = asyncHandler(async (req, res) => {
  const { message, history = [], courseId, conversationId, action } = req.body;

  if (!message?.trim() && !action) {
    res.status(400);
    throw new Error('Message is required');
  }

  let resolvedMessage = message?.trim() || '';
  if (action && ACTION_USER_MESSAGES[action]) {
    resolvedMessage = ACTION_USER_MESSAGES[action];
  }

  let conversation = null;
  let dbHistory = [];
  let effectiveCourseId = courseId || undefined;

  if (req.user) {
    if (conversationId) {
      conversation = await AIConversation.findOne({
        _id: conversationId,
        user: req.user._id,
      });
      if (!conversation) {
        res.status(404);
        throw new Error('Conversation not found');
      }
      dbHistory = conversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      if (!effectiveCourseId && conversation.courseId) {
        effectiveCourseId = String(conversation.courseId);
      }
    } else {
      let courseTitle = null;
      if (effectiveCourseId) {
        const course = await Course.findById(effectiveCourseId).select('title');
        courseTitle = course?.title || null;
      }
      conversation = await AIConversation.create({
        user: req.user._id,
        title: 'New chat',
        courseId: effectiveCourseId || undefined,
        courseTitle: courseTitle || undefined,
        messages: [],
      });
    }
  }

  const historySource = conversation ? dbHistory : history;

  const result = await runGeneralChat({
    message: resolvedMessage,
    history: historySource,
    courseId: effectiveCourseId,
    user: req.user,
  });

  if (conversation && result.reply && result.success) {
    conversation.messages.push(
      { role: 'user', content: resolvedMessage },
      { role: 'assistant', content: result.reply }
    );
    if (conversation.title === 'New chat') {
      conversation.title = deriveConversationTitle(resolvedMessage);
    }
    await conversation.save();
  }

  res.json({
    ...result,
    conversationId: conversation?._id?.toString() || null,
  });
});

// @desc    AI service status
// @route   GET /api/ai/status
export const getAIStatus = asyncHandler(async (_req, res) => {
  const provider = getAIProvider();
  const groqStatus = getGroqConfigStatus();

  res.json({
    success: true,
    configured: Boolean(provider),
    provider,
    model: provider ? DEFAULT_CHAT_MODEL : null,
    setupMessage: provider ? null : groqStatus.message,
  });
});

// @desc    Smart search with AI
// @route   POST /api/ai/smart-search
export const smartSearch = asyncHandler(async (req, res) => {
  const { query, lat, lng, radius = 50 } = req.body;

  let parsed = { subject: null, location: null, preferences: [], keywords: [] };
  let aiReply = null;

  if (await isAIEnabled()) {
    aiReply = await chatCompletion(
      [
        {
          role: 'system',
          content: `Extract search parameters from user queries. Return JSON only:
{ "subject": string|null, "location": string|null, "preferences": string[], "keywords": string[] }`,
        },
        { role: 'user', content: query },
      ],
      { responseFormat: { type: 'json_object' } }
    );

    if (aiReply) {
      try {
        parsed = JSON.parse(aiReply);
      } catch {
        parsed.keywords = query.split(/\s+/).filter(Boolean);
      }
    }
  }

  if (!parsed.keywords?.length) {
    parsed.keywords = query.split(/\s+/).filter(Boolean);
  }

  const searchTerms = [
    parsed.subject,
    parsed.location,
    ...(parsed.preferences || []),
    ...(parsed.keywords || []),
    query,
  ]
    .filter(Boolean)
    .join(' ');

  const useGeo = Boolean(lat && lng) || isNearMeQuery(query);

  const result = await searchCenters({
    search: searchTerms,
    lat,
    lng,
    radius,
    limit: 20,
    subject: parsed.subject || undefined,
    useGeo,
  });

  res.json({
    success: true,
    interpretation: parsed,
    data: result.data,
    meta: { locationUsed: useGeo, radiusKm: parseFloat(radius) || 50 },
    aiEnabled: !!aiReply,
  });
});

// @desc    Get recommendations
// @route   GET /api/ai/recommendations
export const getRecommendations = asyncHandler(async (req, res) => {
  const user = req.user;

  const enrolledSubjects = await Course.find({
    _id: { $in: user.enrolledCourses || [] },
  }).distinct('subject');

  const [recommendedCourses, recommendedCenters] = await Promise.all([
    Course.find({
      isPublished: true,
      _id: { $nin: user.enrolledCourses || [] },
      subject: {
        $in: enrolledSubjects.length ? enrolledSubjects : ['Programming', 'Mathematics', 'Languages'],
      },
    })
      .sort('-rating -popularity')
      .limit(6)
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name avatar' } }),

    Center.find({ isActive: true, isVerified: true })
      .sort('-rating -popularity')
      .limit(6),
  ]);

  res.json({
    success: true,
    data: { courses: recommendedCourses, centers: recommendedCenters },
  });
});

// @desc    AI assistant (alias for /chat, supports course quick actions)
// @route   POST /api/ai/assistant
export const courseAssistant = asyncHandler(async (req, res) => {
  const { message, courseId, history = [], action = 'chat' } = req.body;

  const userMessage =
    message?.trim() ||
    (action !== 'chat' ? ACTION_USER_MESSAGES[action] : '') ||
    'Hello';

  const result = await runGeneralChat({
    message: userMessage,
    history,
    courseId,
    user: req.user,
  });

  res.json({ ...result, action });
});

// @desc    Generate quiz with AI
// @route   POST /api/ai/generate-quiz
export const generateQuiz = asyncHandler(async (req, res) => {
  const { topic, numQuestions = 5, courseId, difficulty = 'medium' } = req.body;

  let topicText = topic;
  if (courseId && !topic) {
    const ctx = await buildCourseContext(courseId);
    topicText = ctx?.course?.title || 'course content';
    if (ctx?.text) {
      topicText = `${ctx.course.title}: ${ctx.text.slice(0, 2000)}`;
    }
  }

  const aiReply = await chatCompletion(
    [
      {
        role: 'system',
        content: `Generate a quiz with ${numQuestions} multiple choice questions at ${difficulty} difficulty.
Return JSON: { "title": string, "questions": [{ "question": string, "options": string[4], "correctAnswer": number (0-3), "explanation": string }] }`,
      },
      { role: 'user', content: `Create quiz about: ${topicText}` },
    ],
    { responseFormat: { type: 'json_object' } }
  );

  if (!aiReply) {
    res.status(503);
    throw new Error('AI quiz generation requires GROQ_API_KEY in backend/.env');
  }

  const quizData = JSON.parse(aiReply);

  if (courseId) {
    const quiz = await Quiz.create({
      title: quizData.title,
      course: courseId,
      questions: quizData.questions,
      isAIGenerated: true,
      createdBy: req.user._id,
    });

    await Course.findByIdAndUpdate(courseId, { $push: { quizzes: quiz._id } });

    res.status(201).json({ success: true, data: quiz, aiEnabled: true });
  } else {
    res.json({ success: true, data: quizData, aiEnabled: true });
  }
});

// @desc    AI study planner
// @route   POST /api/ai/study-planner
export const studyPlanner = asyncHandler(async (req, res) => {
  const { courses, hoursPerDay, deadline, goals, courseId } = req.body;

  let plannerInput = `Courses: ${JSON.stringify(courses)}. Hours/day: ${hoursPerDay}. Deadline: ${deadline}. Goals: ${goals}`;

  if (courseId) {
    const ctx = await buildCourseContext(courseId);
    if (ctx) {
      plannerInput = `Single course study plan.\n${ctx.text}\nHours/day: ${hoursPerDay}. Deadline: ${deadline}. Goals: ${goals}`;
    }
  }

  const aiReply = await chatCompletion(
    [
      {
        role: 'system',
        content: `Create a detailed study plan. Return JSON:
{ "plan": [{ "day": number, "date": string, "tasks": [{ "course": string, "activity": string, "duration": number }] }], "tips": string[] }`,
      },
      { role: 'user', content: plannerInput },
    ],
    { responseFormat: { type: 'json_object' } }
  );

  if (!aiReply) {
    res.status(503);
    throw new Error('Study planner requires GROQ_API_KEY in backend/.env');
  }

  const plan = JSON.parse(aiReply);
  res.json({ success: true, data: plan, aiEnabled: true });
});

// @desc    AI chatbot (alias for /chat)
// @route   POST /api/ai/chatbot
export const chatbot = asyncHandler(async (req, res) => {
  const { message, history = [], courseId } = req.body;

  if (!message?.trim()) {
    res.status(400);
    throw new Error('Message is required');
  }

  const result = await runGeneralChat({
    message: message.trim(),
    history,
    courseId,
    user: req.user,
  });

  res.json(result);
});

// @desc    Summarize course or content
// @route   POST /api/ai/summarize
export const summarizeContent = asyncHandler(async (req, res) => {
  const { content, type = 'pdf', courseId } = req.body;

  let textToSummarize = content;

  if (courseId) {
    const ctx = await buildCourseContext(courseId);
    if (ctx) {
      textToSummarize = ctx.text;
    }
  }

  if (!textToSummarize?.trim()) {
    res.status(400);
    throw new Error('No content to summarize');
  }

  try {
    const summary = await chatCompletion([
      {
        role: 'system',
        content: `Summarize this ${type} content for a student. Include key points, definitions, and study tips. Use clear headings.`,
      },
      { role: 'user', content: textToSummarize.slice(0, 12000) },
    ]);

    res.json({ success: true, summary });
  } catch (error) {
    res.json({
      success: false,
      summary:
        error.statusCode === 429
          ? FRIENDLY_RATE_LIMIT_REPLY
          : getFriendlyAIErrorReply(error),
    });
  }
});
