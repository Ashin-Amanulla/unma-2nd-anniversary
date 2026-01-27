import Update from '../models/Update.js';

// Get all updates (public - only published)
const getUpdates = async (req, res) => {
    try {
        const { category, limit } = req.query;

        const filter = {};
        if (category) filter.category = category;

        // Only published for public requests
        if (!req.user) {
            filter.isPublished = true;
        }

        let query = Update.find(filter).sort({ date: -1 });

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const updates = await query;

        res.json({
            success: true,
            data: updates,
        });
    } catch (error) {
        console.error('Error fetching updates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching updates',
            error: error.message,
        });
    }
};

// Get all updates for admin (including unpublished)
const getAllUpdatesAdmin = async (req, res) => {
    try {
        const updates = await Update.find().sort({ date: -1 });

        res.json({
            success: true,
            data: updates,
        });
    } catch (error) {
        console.error('Error fetching updates:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching updates',
            error: error.message,
        });
    }
};

// Get single update item
const getUpdate = async (req, res) => {
    try {
        const update = await Update.findById(req.params.id);

        if (!update) {
            return res.status(404).json({
                success: false,
                message: 'Update not found',
            });
        }

        res.json({
            success: true,
            data: update,
        });
    } catch (error) {
        console.error('Error fetching update:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching update',
            error: error.message,
        });
    }
};

// Create update item (admin only)
const createUpdate = async (req, res) => {
    try {
        const { title, content, category, date, link, image, isPublished } = req.body;

        const update = new Update({
            title,
            content,
            category: category || 'news',
            date: date || new Date(),
            link,
            image,
            isPublished: isPublished || false,
        });

        await update.save();

        res.status(201).json({
            success: true,
            message: 'Update created successfully',
            data: update,
        });
    } catch (error) {
        console.error('Error creating update:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating update',
            error: error.message,
        });
    }
};

// Update item (admin only)
const updateUpdate = async (req, res) => {
    try {
        const update = await Update.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!update) {
            return res.status(404).json({
                success: false,
                message: 'Update not found',
            });
        }

        res.json({
            success: true,
            message: 'Update updated successfully',
            data: update,
        });
    } catch (error) {
        console.error('Error updating update:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating update',
            error: error.message,
        });
    }
};

// Delete update item (admin only)
const deleteUpdate = async (req, res) => {
    try {
        const update = await Update.findByIdAndDelete(req.params.id);

        if (!update) {
            return res.status(404).json({
                success: false,
                message: 'Update not found',
            });
        }

        res.json({
            success: true,
            message: 'Update deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting update:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting update',
            error: error.message,
        });
    }
};

// Toggle publish status
const togglePublish = async (req, res) => {
    try {
        const update = await Update.findById(req.params.id);

        if (!update) {
            return res.status(404).json({
                success: false,
                message: 'Update not found',
            });
        }

        update.isPublished = !update.isPublished;
        await update.save();

        res.json({
            success: true,
            message: `Update ${update.isPublished ? 'published' : 'unpublished'} successfully`,
            data: update,
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
    getUpdates,
    getAllUpdatesAdmin,
    getUpdate,
    createUpdate,
    updateUpdate,
    deleteUpdate,
    togglePublish,
};
