import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      default: 'all',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    courseType: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free',
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    isIndependent: {
      type: Boolean,
      default: false,
    },
    currency: {
      type: String,
      default: 'MAD',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    pdfs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PDF',
      },
    ],
    quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
      },
    ],
    exams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
      },
    ],
    liveSessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LiveSession',
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    popularity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

courseSchema.index({ title: 'text', description: 'text', subject: 'text', tags: 'text' });
courseSchema.index({ subject: 1 });
courseSchema.index({ title: 1 });
courseSchema.index({ rating: -1 });

courseSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (this.courseType === 'paid') {
    this.isFree = false;
    if (!this.price || this.price <= 0) {
      return next(new Error('Paid courses must have a price greater than 0'));
    }
  } else {
    this.courseType = 'free';
    this.isFree = true;
    this.price = 0;
  }

  next();
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
