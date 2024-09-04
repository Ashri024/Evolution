const express = require('express');
const { createSchedule, getSchedules,deleteAllSchedules,getAllSchedules, getPendingSchedules, getUpcomingSchedules, getCompletedSchedules, getRequestedSchedules, getSingleSchedule, rescheduleSchedules, changeStatus, upcomingTrainer, requestedTrainer, completedTrainer, getMyRequestedSchedules, deleteSchedule } = require('../controllers/Schedule');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
// Append /v0/api/schedule before all routes

// Route to create a new schedule
router.post('/create', authMiddleware,createSchedule);

// Route to get all schedules for a user(both user and trainer)
router.get('/mySchedules',authMiddleware, getSchedules);

//Router to get a single schedule detail(output will depend on the role of the user)
router.get('/singleSchedule/:scheduleId',authMiddleware, getSingleSchedule);

//Router to reschedule a schedule from trainer(trainer only)
router.put('/reschedule/:scheduleId',authMiddleware, rescheduleSchedules);

//Router to update the status of a schedule (by trainer or admin)
router.put('/changeStatus/:scheduleId', authMiddleware,changeStatus);

// Route to get all pending schedules for a user (for admin or trainer only)
router.get('/myPending',authMiddleware, getPendingSchedules);

//Route to get all Upcoming schedules for a user(both user and trainer)
router.get('/myUpcoming',authMiddleware, getUpcomingSchedules);

//Route to get all completed schedules for a user(both user and trainer)
router.get('/myCompleted',authMiddleware, getCompletedSchedules);

// Route to delete a schedule by a trainer
router.delete('/deleteSchedule/:scheduleId', deleteSchedule);

// Route to get all requested schedules for a user (for user only)
router.get('/myRequested',authMiddleware, getMyRequestedSchedules);

// Route to get all upcoming between a trainer and an admin
router.get('/upcomingTrainer',authMiddleware, upcomingTrainer);

// Route to get all requested between a trainer and an admin
router.get('/requestedTrainer',authMiddleware, requestedTrainer);

// Route to get all completed between a trainer and an admin
router.get('/completedTrainer',authMiddleware, completedTrainer);

// Route to get all requested schedule from a trainer(for admin only)
router.get('/requestedSchedules',authMiddleware, getRequestedSchedules);

// FOR DEV PURPOSE ONLY
router.get('/allSchedules', getAllSchedules);
router.delete('/allSchedules', deleteAllSchedules);

module.exports = router;