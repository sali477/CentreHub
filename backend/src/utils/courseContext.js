import Course from '../models/Course.js';

export const buildCourseContext = async (courseId) => {
  const course = await Course.findById(courseId)
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .populate('videos', 'title description duration order isPreview')
    .populate('pdfs', 'title description pages order')
    .populate('quizzes', 'title description timeLimit passingScore')
    .populate('exams', 'title description duration passingScore')
    .lean();

  if (!course) return null;

  const videoList = (course.videos || [])
    .map((v, i) => `${i + 1}. ${v.title}${v.description ? ` — ${v.description}` : ''} (Google Drive lesson)`)
    .join('\n');

  const pdfList = (course.pdfs || [])
    .map((p, i) => `${i + 1}. ${p.title}${p.description ? ` — ${p.description}` : ''}`)
    .join('\n');

  const quizList = (course.quizzes || [])
    .map((q, i) => `${i + 1}. ${q.title}`)
    .join('\n');

  return {
    course,
    text: `
Course: ${course.title}
Subject: ${course.subject}
Level: ${course.level}
Description: ${course.description}
Instructor: ${course.teacher?.user?.name || 'Unknown'}

Video lessons (${course.videos?.length || 0}):
${videoList || 'None'}

PDF lessons (${course.pdfs?.length || 0}):
${pdfList || 'None'}

Quizzes (${course.quizzes?.length || 0}):
${quizList || 'None'}
`.trim(),
  };
};
