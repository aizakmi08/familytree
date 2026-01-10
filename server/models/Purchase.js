import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  imageId: {
    type: String,
    required: true,
  },
  cleanUrl: {
    type: String,
    required: true,
  },
  previewUrl: {
    type: String,
  },
  stripeSessionId: {
    type: String,
    index: true,
  },
  stripePaymentIntentId: {
    type: String,
  },
  amount: {
    type: Number,
    default: 299, // cents
  },
  currency: {
    type: String,
    default: 'usd',
  },
  // Optional: link to user account if they have one
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
}, {
  timestamps: true,
});

// Index for finding purchases by email
purchaseSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model('Purchase', purchaseSchema);
