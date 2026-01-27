import Event from '../models/Event.js';

// Get all events (public - only published)
const getEvents = async (req, res) => {
    try {
        const filter = {};

        // Only published for public requests
        if (!req.user) {
            filter.isPublished = true;
        }

        const events = await Event.find(filter)
            .sort({ year: -1, order: 1, createdAt: -1 });

        res.json({
            success: true,
            data: events,
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message,
        });
    }
};

// Get all events for admin (including unpublished)
const getAllEventsAdmin = async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ year: -1, order: 1, createdAt: -1 });

        res.json({
            success: true,
            data: events,
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message,
        });
    }
};

// Get single event
const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        res.json({
            success: true,
            data: event,
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event',
            error: error.message,
        });
    }
};

// Create event (admin only)
const createEvent = async (req, res) => {
    try {
        const {
            year,
            title,
            date,
            fullDate,
            description,
            location,
            attendees,
            status,
            category,
            link,
            highlights,
            isMilestone,
            isNext,
            order,
            isPublished,
        } = req.body;

        const event = new Event({
            year,
            title,
            date,
            fullDate,
            description,
            location,
            attendees,
            status: status || 'upcoming',
            category: category || 'Foundation',
            link,
            highlights: highlights || [],
            isMilestone: isMilestone || false,
            isNext: isNext || false,
            order: order || 0,
            isPublished: isPublished || false,
        });

        await event.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event,
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message,
        });
    }
};

// Update event (admin only)
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: event,
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message,
        });
    }
};

// Delete event (admin only)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message,
        });
    }
};

// Toggle publish status
const togglePublish = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        event.isPublished = !event.isPublished;
        await event.save();

        res.json({
            success: true,
            message: `Event ${event.isPublished ? 'published' : 'unpublished'} successfully`,
            data: event,
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
    getEvents,
    getAllEventsAdmin,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    togglePublish,
};
