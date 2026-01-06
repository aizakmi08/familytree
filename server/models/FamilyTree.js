import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  photoUrl: {
    type: String,
  },
  birthYear: {
    type: Number,
  },
  deathYear: {
    type: Number,
  },
}, {
  _id: true,
  timestamps: true,
});

const relationshipSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    enum: ['parent', 'child', 'spouse', 'sibling'],
    required: true,
  },
});

const generationSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
  },
  theme: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const familyTreeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    default: 'My Family Tree',
    trim: true,
  },
  theme: {
    type: String,
    default: 'classic',
  },
  members: [memberSchema],
  relationships: [relationshipSchema],
  generations: [generationSchema],
}, {
  timestamps: true,
});

// Get member by id helper
familyTreeSchema.methods.getMember = function(memberId) {
  return this.members.id(memberId);
};

// Add member helper
familyTreeSchema.methods.addMember = function(memberData) {
  this.members.push(memberData);
  return this.members[this.members.length - 1];
};

// Add relationship helper
familyTreeSchema.methods.addRelationship = function(fromId, toId, type) {
  this.relationships.push({ from: fromId, to: toId, type });
  return this.relationships[this.relationships.length - 1];
};

export default mongoose.model('FamilyTree', familyTreeSchema);

