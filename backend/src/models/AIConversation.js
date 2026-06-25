import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New chat',
      maxlength: 120,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    courseTitle: {
      type: String,
      trim: true,
    },
    messages: [chatMessageSchema],
  },
  { timestamps: true }
);

aiConversationSchema.index({ user: 1, updatedAt: -1 });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);

export default AIConversation;
