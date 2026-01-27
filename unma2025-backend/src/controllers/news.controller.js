import NewsUpdate from '../models/NewsUpdate.js';

// Get all news/updates (public - only published)
const getNewsUpdates = async (req, res) => {
    try {
        const { category, limit } = req.query;

        const filter = {};
        if (category) filter.category = category;

        // Only published for public requests
        if (!req.user) {
            filter.isPublished = true;
        }

        let query = NewsUpdate.find(filter).sort({ publishDate: -1, order: 1 });

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const news = await query;

        res.json({
            success: true,
            data: news,
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching news',
            error: error.message,
        });
    }
};

// Get all news for admin (including unpublished)
const getAllNewsAdmin = async (req, res) => {
    try {
        const news = await NewsUpdate.find().sort({ publishDate: -1, order: 1 });

        res.json({
            success: true,
            data: news,
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching news',
            error: error.message,
        });
    }
};

// Get single news item
const getNewsUpdate = async (req, res) => {
    try {
        const news = await NewsUpdate.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News item not found',
            });
        }

        res.json({
            success: true,
            data: news,
        });
    } catch (error) {
        console.error('Error fetching news item:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching news item',
            error: error.message,
        });
    }
};

// Create news item (admin only)
const createNewsUpdate = async (req, res) => {
    try {
        const { title, content, category, link, publishDate, isPublished, order } = req.body;

        const news = new NewsUpdate({
            title,
            content,
            category,
            link,
            publishDate: publishDate || new Date(),
            isPublished: isPublished || false,
            order: order || 0,
        });

        await news.save();

        res.status(201).json({
            success: true,
            message: 'News item created successfully',
            data: news,
        });
    } catch (error) {
        console.error('Error creating news item:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating news item',
            error: error.message,
        });
    }
};

// Update news item (admin only)
const updateNewsUpdate = async (req, res) => {
    try {
        const news = await NewsUpdate.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News item not found',
            });
        }

        res.json({
            success: true,
            message: 'News item updated successfully',
            data: news,
        });
    } catch (error) {
        console.error('Error updating news item:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating news item',
            error: error.message,
        });
    }
};

// Delete news item (admin only)
const deleteNewsUpdate = async (req, res) => {
    try {
        const news = await NewsUpdate.findByIdAndDelete(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News item not found',
            });
        }

        res.json({
            success: true,
            message: 'News item deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting news item:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting news item',
            error: error.message,
        });
    }
};

// Toggle publish status
const togglePublish = async (req, res) => {
    try {
        const news = await NewsUpdate.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News item not found',
            });
        }

        news.isPublished = !news.isPublished;
        await news.save();

        res.json({
            success: true,
            message: `News item ${news.isPublished ? 'published' : 'unpublished'} successfully`,
            data: news,
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
    getNewsUpdates,
    getAllNewsAdmin,
    getNewsUpdate,
    createNewsUpdate,
    updateNewsUpdate,
    deleteNewsUpdate,
    togglePublish,
};
