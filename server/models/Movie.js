import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster URL is required']
    },
    backdropUrl: {
      type: String,
      default: ''
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    genres: [
      {
        type: String,
        trim: true
      }
    ],
    languages: [
      {
        type: String,
        trim: true
      }
    ],
    durationMinutes: {
      type: Number,
      required: [true, 'Movie duration in minutes is required'],
      min: 1
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required']
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'R', 'PG-13'],
      default: 'UA'
    },
    director: {
      type: String,
      trim: true
    },
    cast: [
      {
        type: String,
        trim: true
      }
    ],
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.5
    },
    ratingSource: {
      type: String,
      default: 'CineReserve Critic Score'
    },
    status: {
      type: String,
      enum: ['now_showing', 'upcoming', 'archived'],
      default: 'now_showing',
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for search
movieSchema.index({ title: 'text', description: 'text', director: 'text', cast: 'text' });
movieSchema.index({ genres: 1 });
movieSchema.index({ languages: 1 });
movieSchema.index({ status: 1, releaseDate: -1 });

export const Movie = mongoose.model('Movie', movieSchema);
