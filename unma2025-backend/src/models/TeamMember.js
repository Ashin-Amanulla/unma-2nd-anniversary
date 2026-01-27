import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        role: {
            type: String,
            enum: ['president', 'secretary', 'treasurer', 'joint_secretary', 'executive_member', 'member'],
            default: 'member',
        },
        roleDisplayName: {
            type: String,
            trim: true,
        },
        associationName: {
            type: String,
            required: [true, 'Association name is required'],
            trim: true,
        },
        district: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            enum: ['office_bearer', 'other_member'],
            default: 'other_member',
        },
        photo: {
            type: String,
            default: null,
        },
        phone: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
teamMemberSchema.index({ category: 1, order: 1, isActive: 1 });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

export default TeamMember;
