import mongoose from 'mongoose';

const relationshipSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      required: true,
    },
    type: {
      type: String,
      enum: ['parent', 'child', 'spouse', 'sibling'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique relationships
relationshipSchema.index({ from: 1, to: 1, type: 1 }, { unique: true });

export default mongoose.model('Relationship', relationshipSchema);

