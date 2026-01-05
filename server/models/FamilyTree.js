import mongoose from 'mongoose';

const familyTreeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'My Family Tree',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for guest/local storage trees
    },
    theme: {
      type: String,
      default: 'classic',
    },
    people: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
      },
    ],
    relationships: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Relationship',
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user queries
familyTreeSchema.index({ userId: 1 });

export default mongoose.model('FamilyTree', familyTreeSchema);

