import mongoose from 'mongoose';

const courseCommentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseComment',
      default: null,
    },
    isTeacherReply: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

courseCommentSchema.index({ course: 1, parentComment: 1, createdAt: -1 });
courseCommentSchema.index({ teacher: 1, createdAt: -1 });

const CourseComment = mongoose.model('CourseComment', courseCommentSchema);
export default CourseComment;
