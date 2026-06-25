import Teacher from '../models/Teacher.js';
import { generateTeacherCode, normalizeTeacherCode } from './generateCode.js';

export const assignTeacherCode = async (teacher) => {
  if (!teacher.center) {
    if (teacher.teacherCode) {
      teacher.teacherCode = undefined;
      await teacher.save({ validateBeforeSave: false });
    }
    return teacher;
  }

  if (teacher.teacherCode) return teacher;

  let code;
  let exists = true;

  while (exists) {
    code = generateTeacherCode();
    exists = await Teacher.exists({ teacherCode: code });
  }

  teacher.teacherCode = code;
  await teacher.save({ validateBeforeSave: false });
  return teacher;
};

export const findTeacherByCode = async (code) => {
  const teacherCode = normalizeTeacherCode(code);
  if (!teacherCode) return null;

  return Teacher.findOne({ teacherCode, isActive: true })
    .populate('user', 'name avatar email')
    .populate('center', 'name logo isVerified');
};
