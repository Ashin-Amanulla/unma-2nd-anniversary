import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        content: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: ['news', 'announcement', 'activity', 'initiative'],
            default: 'news',
        },
        date: {
            type: Date,
            default: Date.now,
        },
        link: {
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
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
updateSchema.index({ isPublished: 1, date: -1 });

const Update = mongoose.model('Update', updateSchema);

export default Update;
