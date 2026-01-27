import Activity from '../models/Activity.js';

// Get all activities (public - only published)
const getActivities = async (req, res) => {
    try {
        const { category, status, limit } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;

        // Only published for public requests
        if (!req.user) {
            filter.isPublished = true;
        }

        let query = Activity.find(filter).sort({ order: 1, createdAt: -1 });

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const activities = await query;

        res.json({
            success: true,
            data: activities,
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activities',
            error: error.message,
        });
    }
};

// Get all activities for admin (including unpublished)
const getAllActivitiesAdmin = async (req, res) => {
    try {
        const activities = await Activity.find().sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            data: activities,
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activities',
            error: error.message,
        });
    }
};

// Get single activity
const getActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'Activity not found',
            });
        }

        res.json({
            success: true,
            data: activity,
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activity',
            error: error.message,
        });
    }
};

// Create activity (admin only)
const createActivity = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            date,
            location,
            participants,
            status,
            registrationLink,
            galleryLink,
            isPublished,
            order,
        } = req.body;

        const activity = new Activity({
            title,
            description,
            category,
            date,
            location,
            participants: participants || [],
            status: status || 'upcoming',
            registrationLink,
            galleryLink,
            isPublished: isPublished || false,
            order: order || 0,
        });

        await activity.save();

        res.status(201).json({
            success: true,
            message: 'Activity created successfully',
            data: activity,
        });
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating activity',
            error: error.message,
        });
    }
};

// Update activity (admin only)
const updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'Activity not found',
            });
        }

        res.json({
            success: true,
            message: 'Activity updated successfully',
            data: activity,
        });
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating activity',
            error: error.message,
        });
    }
};

// Delete activity (admin only)
const deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'Activity not found',
            });
        }

        res.json({
            success: true,
            message: 'Activity deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting activity',
            error: error.message,
        });
    }
};

// Toggle publish status
const togglePublish = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: 'Activity not found',
            });
        }

        activity.isPublished = !activity.isPublished;
        await activity.save();

        res.json({
            success: true,
            message: `Activity ${activity.isPublished ? 'published' : 'unpublished'} successfully`,
            data: activity,
        });
    } catch (error) {
        console.error('Error toggling publish status:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling publish status',
            error: error.message,
        });
    }
};

export {
    getActivities,
    getAllActivitiesAdmin,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    togglePublish,
};
