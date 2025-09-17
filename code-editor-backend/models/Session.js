import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    default: 'Untitled Session'
  },
  code: {
    type: String,
    default: "// Welcome to Echo Editor!\n// Start typing to collaborate in real-time\n\nconsole.log('Hello, collaborative world!');"
  },
  language: {
    type: String,
    default: 'javascript'
  },
  activeUsers: [{
    userId: String,
    username: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// Update lastModified on save
sessionSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

export default mongoose.model('Session', sessionSchema);