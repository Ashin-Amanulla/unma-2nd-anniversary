import mongoose from 'mongoose';

const newsUpdateSchema = new mongoose.Schema(
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
            enum: ['announcement', 'initiative', 'update', 'news'],
            default: 'update',
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
        publishDate: {
            type: Date,
            default: Date.now,
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
newsUpdateSchema.index({ isPublished: 1, publishDate: -1 });

const NewsUpdate = mongoose.model('NewsUpdate', newsUpdateSchema);

export default NewsUpdate;
