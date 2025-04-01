const express = require('express');
const { addEvent, getAllEvents, deleteEvent, editEvent, upload } = require('../controller/eventController');
const router = express.Router();

// Routes
router.get('/getAllEvents', getAllEvents);
router.post('/addEvents', upload.single('eventImg'), addEvent); // Add multer middleware
router.delete('/deleteEvent/:id', deleteEvent);
router.put('/editEvent/:id', upload.single('eventImg'), editEvent); // Add multer middleware

module.exports = router;