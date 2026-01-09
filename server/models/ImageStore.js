import mongoose from 'mongoose';

const imageStoreSchema = new mongoose.Schema({
  imageId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  cleanUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Auto-delete after 24 hours (TTL index)
  },
});

export default mongoose.model('ImageStore', imageStoreSchema);
