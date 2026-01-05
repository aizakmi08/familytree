import mongoose from 'mongoose';

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String, // URL from Cloudinary
      default: null,
    },
    birthDate: {
      type: Date,
      default: null,
    },
    deathDate: {
      type: Date,
      default: null,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Person', personSchema);

