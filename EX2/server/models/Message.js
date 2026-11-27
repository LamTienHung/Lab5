import mongoose from 'mongoose';

// Ex 2.2 — Schema Normalization
// Legacy: các field tự do, không validate → Mới: field có cấu trúc + validate + timestamps
export const ROOM_ID_PATTERN = /^[a-z0-9-]{1,40}$/;

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: [true, 'roomId là bắt buộc'],
      trim: true,
      lowercase: true,
      match: [ROOM_ID_PATTERN, 'roomId chỉ gồm a-z, 0-9, dấu gạch ngang (tối đa 40 ký tự)'],
    },
    senderUid: {
      type: String,
      required: [true, 'senderUid là bắt buộc'],
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    senderPhoto: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: { values: ['user', 'agent', 'system'], message: 'role không hợp lệ: {VALUE}' },
      default: 'user',
    },
    text: {
      type: String,
      required: [true, 'Nội dung tin nhắn không được trống'],
      trim: true,
      minlength: [1, 'Nội dung tin nhắn không được trống'],
      maxlength: [1000, 'Tin nhắn tối đa 1000 ký tự'],
    },
  },
  { timestamps: true }
);

// Lấy lịch sử theo phòng, mới nhất trước
messageSchema.index({ roomId: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);