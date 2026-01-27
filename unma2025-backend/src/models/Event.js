import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        year: {
            type: String,
            required: [true, 'Year is required'],
            trim: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        date: {
            type: String,
            trim: true,
        },
        fullDate: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        attendees: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['upcoming', 'completed'],
            default: 'upcoming',
        },
        category: {
            type: String,
            enum: ['Foundation', 'Coordination', 'Summit', 'Outreach', 'Anniversary', 'Initiative'],
            default: 'Foundation',
        },
        link: {
            type: String,
            trim: true,
            default: null,
        },
        highlights: [{
            type: String,
            trim: true,
        }],
        isMilestone: {
            type: Boolean,
            default: false,
        },
        isNext: {
            type: Boolean,
            default: false,
        },
        order: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
eventSchema.index({ isPublished: 1, year: -1, order: 1 });
eventSchema.index({ year: -1, order: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
