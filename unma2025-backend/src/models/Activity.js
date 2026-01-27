import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: ['alumni-meets', 'student-welfare', 'health', 'career', 'knowledge', 'social', 'other'],
            default: 'other',
        },
        date: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        participants: [{
            type: String,
            trim: true,
        }],
        status: {
            type: String,
            enum: ['upcoming', 'ongoing', 'completed'],
            default: 'upcoming',
        },
        registrationLink: {
            type: String,
            trim: true,
            default: null,
        },
        galleryLink: {
            type: String,
            trim: true,
            default: null,
        },
        image: {
            type: String,
            trim: true,
            default: null,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
activitySchema.index({ isPublished: 1, status: 1, order: 1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
