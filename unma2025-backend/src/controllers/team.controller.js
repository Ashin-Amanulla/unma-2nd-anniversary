import TeamMember from '../models/TeamMember.js';

// Get all team members (public)
const getTeamMembers = async (req, res) => {
    try {
        const { category, active } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (active !== undefined) filter.isActive = active === 'true';

        // Default to active only for public requests
        if (!req.user) {
            filter.isActive = true;
        }

        const members = await TeamMember.find(filter)
            .sort({ category: 1, order: 1, createdAt: 1 });

        res.json({
            success: true,
            data: members,
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching team members',
            error: error.message,
        });
    }
};

// Get single team member
const getTeamMember = async (req, res) => {
    try {
        const member = await TeamMember.findById(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Team member not found',
            });
        }

        res.json({
            success: true,
            data: member,
        });
    } catch (error) {
        console.error('Error fetching team member:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching team member',
            error: error.message,
        });
    }
};

// Create team member (admin only)
const createTeamMember = async (req, res) => {
    try {
        const {
            name,
            role,
            roleDisplayName,
            associationName,
            district,
            category,
            photo,
            phone,
            email,
            order,
            isActive,
        } = req.body;

        const member = new TeamMember({
            name,
            role,
            roleDisplayName: roleDisplayName || getRoleDisplayName(role),
            associationName,
            district,
            category,
            photo,
            phone,
            email,
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true,
        });

        await member.save();

        res.status(201).json({
            success: true,
            message: 'Team member created successfully',
            data: member,
        });
    } catch (error) {
        console.error('Error creating team member:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating team member',
            error: error.message,
        });
    }
};

// Update team member (admin only)
const updateTeamMember = async (req, res) => {
    try {
        const member = await TeamMember.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Team member not found',
            });
        }

        res.json({
            success: true,
            message: 'Team member updated successfully',
            data: member,
        });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating team member',
            error: error.message,
        });
    }
};

// Delete team member (admin only)
const deleteTeamMember = async (req, res) => {
    try {
        const member = await TeamMember.findByIdAndDelete(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Team member not found',
            });
        }

        res.json({
            success: true,
            message: 'Team member deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting team member',
            error: error.message,
        });
    }
};

// Helper function to get display name for role
const getRoleDisplayName = (role) => {
    const roleMap = {
        president: 'President',
        secretary: 'Secretary',
        treasurer: 'Treasurer',
        joint_secretary: 'Joint Secretary',
        executive_member: 'Executive Member',
        member: 'Member',
    };
    return roleMap[role] || 'Member';
};

export {
    getTeamMembers,
    getTeamMember,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
};
