const multer = require("multer");
const Event = require("../model/eventModel");

// Multer configuration to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to format events with base64 images
const formatEventsWithBase64 = (events) => {
  return events.map((event) => ({
    ...event.toObject(),
    eventImg: event.eventImg
      ? `data:image/jpeg;base64,${event.eventImg.toString("base64")}`
      : "https://placehold.co/600x400@2x.png"
  }));
};

// Add Event
const addEvent = async (req, res) => {
  try {
    const { eventTitle, eventDescription, applyLink } = req.body;
    const eventImg = req.file?.buffer;

    // Validate required fields
    if (!eventTitle || !eventDescription || !applyLink) {
      return res.status(400).json({
        status: "failure",
        message: "All fields (title, description, apply link) are required.",
      });
    }

    // Create new event
    await Event.create({
      eventImg,
      eventTitle,
      eventDescription,
      applyLink,
    });

    res.status(201).json({
      status: "Success",
      message: "Event added successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: "Failed to add event.",
      error: error.message,
    });
  }
};

// Get All Events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();

    // Format events with base64 images
    const formattedEvents = formatEventsWithBase64(events);

    res.status(200).json({
      status: "Success",
      message: "Fetched the events successfully.",
      events: formattedEvents,
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `Failed to fetch events: ${error.message}`,
    });
  }
};

// Delete Event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the event exists before deleting
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        status: "failure",
        message: "Event not found.",
      });
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({
      status: "Success",
      message: "Event deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: `Failed to delete event: ${error.message}`,
    });
  }
};

// Edit Event
const editEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventTitle, eventDescription, applyLink } = req.body;

    // Validate required fields
    if (!eventTitle || !eventDescription || !applyLink) {
      return res.status(400).json({
        status: "failure",
        message: "All fields (title, description, apply link) are required.",
      });
    }

    // Prepare update object
    const updatedEvent = {
      eventTitle,
      eventDescription,
      applyLink,
    };

    // Check if a new image is uploaded
    if (req.file) {
      updatedEvent.eventImg = req.file.buffer;
    }

    // Update event
    const result = await Event.findByIdAndUpdate(id, updatedEvent, { new: true });
    if (!result) {
      return res.status(404).json({
        status: "failure",
        message: "Event not found.",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Event details edited successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: "Failed to edit event details.",
      error: error.message,
    });
  }
};

module.exports = { addEvent, getAllEvents, deleteEvent, editEvent, upload };