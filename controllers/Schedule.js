const ScheduleSchema = require('../models/Schedule');
const User = require('../models/User');
const dayjs = require('dayjs');
    const createSchedule = async (req, res) => {
      const { date, startTime, endTime, scheduleLink, scheduleSubject, scheduleDescription, userId, trainerId,affectedArea } = req.body;
      try {
        if (!req.user) {
          return res.status(400).json({ message: 'Token is invalid or expired' });
        }
        if (!userId || !trainerId) {
          return res.status(404).json({ message: 'Please provide userID and trainerID' });
        }
        // Checking if the userId and trainerId are valid
        const user = await User.findById(userId);
        const trainer = await User.findById(trainerId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        if (!trainer) {
          return res.status(404).json({ message: 'Trainer not found' });
        }
    
        let newSchedule;
        let inputDate = dayjs(date);
        let currentDate = dayjs();
        let ifDateCorrect = inputDate.isSame(currentDate, 'day') || inputDate.isAfter(currentDate, 'day');
        let ifStartTimeCorrect = new Date(startTime) >= new Date();
        let ifEndTimeCorrect = new Date(endTime) > new Date(startTime);
        if (!ifStartTimeCorrect || !ifEndTimeCorrect || !ifDateCorrect) {
          return res.status(400).json({ message: 'Start time should be greater than current time and end time should be greater than start time' });
        }
    
        if (req.user.role === 'admin') {
          newSchedule = new ScheduleSchema({
            date,
            startTime,
            endTime,
            scheduleLink,
            scheduleSubject,
            scheduleDescription,
            userId,
            trainerId,
            affectedArea,
          });
        } else {
          newSchedule = new ScheduleSchema({
            date,
            startTime,
            endTime,
            scheduleSubject,
            scheduleDescription,
            userId,
            trainerId,
            affectedArea,
            status: 'waitingToApproved'
          });
        }
    
        const savedSchedule = await newSchedule.save();
    
        if (req.user.role === 'admin') {
          await savedSchedule.populate([
            {path: 'userId',select: 'fullName gender age'},
            {path: 'trainerId',select: 'profileImage'}
          ])
        } else {
          await savedSchedule.populate('trainerId', 'fullName profileImage')
        }
    
        res.status(201).json(savedSchedule);
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    };
const getSchedules = async (req, res) => {
    try {
        let schedules;
        if (req.user.role === 'admin') {
            schedules = await ScheduleSchema.find({ trainerId: req.user._id }).populate('userId', 'fullName gender age').populate('trainerId', 'profileImage');
            return res.status(200).json(schedules);
        } else {
            schedules = await ScheduleSchema.find({ userId: req.user._id }).populate('trainerId', 'fullName profileImage');
        }
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
const getSingleSchedule = async (req, res) => {
  const { scheduleId } = req.params;
  try {
    const schedule = await ScheduleSchema.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    if (req.user.role === 'admin') {
      await schedule.populate([
        { path: 'userId', select: 'fullName gender age' },
        { path: 'trainerId', select: 'profileImage' }
      ]);
    } else {
      await schedule.populate([
        { path: 'trainerId', select: 'fullName profileImage' }
      ]);
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const getUpcomingSchedules = async (req, res) => {
  try {
    let schedules;

    if (req.user.role === 'admin') {
      schedules = await ScheduleSchema.find({ trainerId: req.user._id, status: 'pending' }).populate([
        { path: 'userId', select: 'fullName gender age' },
        { path: 'trainerId', select: 'profileImage' }
      ]);
    } else {
      schedules = await ScheduleSchema.find({ userId: req.user._id, status: 'pending' }).populate([
        { path: 'trainerId', select: 'fullName profileImage' }
      ]);
    }

    let upcomingSchedules = schedules.filter(schedule => {
      return new Date(schedule.startTime) >= new Date();
    });
    res.status(200).json(upcomingSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

const getCompletedSchedules = async (req, res) => {
  try {
    let schedules;

    if (req.user.role === 'admin') {
      schedules = await ScheduleSchema.find({ trainerId: req.user._id, status: 'completed' }).populate([
        { path: 'userId', select: 'fullName gender age' },
        { path: 'trainerId', select: 'profileImage' }
      ]);
    } else {
      schedules = await ScheduleSchema.find({ userId: req.user._id, status: 'completed' }).populate([
        { path: 'trainerId', select: 'fullName profileImage' }
      ]);
    }

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const getPendingSchedules = async (req, res) => {
  try {
    let schedules;

    if (req.user.role === 'admin') {
      schedules = await ScheduleSchema.find({ trainerId: req.user._id, status: 'pending' }).populate([
        { path: 'userId', select: 'fullName gender age' },
        { path: 'trainerId', select: 'profileImage' }
      ]);
    } else {
      schedules = await ScheduleSchema.find({ userId: req.user._id, status: 'pending' }).populate([
        { path: 'trainerId', select: 'fullName profileImage' }
      ]);
    }
    let pendingSchedules = schedules.filter(schedule => {
      return new Date(schedule.endTime) <= new Date();
    });
    res.status(200).json(pendingSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const getRequestedSchedules = async (req, res) => {
  try {
    let schedules;

    if (req.user.role === 'admin') {
      schedules = await ScheduleSchema.find({ trainerId: req.user._id, status: 'waitingToApproved' }).populate([
        { path: 'userId', select: 'fullName gender age' },
        { path: 'trainerId', select: 'profileImage' }
      ]);
    } else {
      res.status(401).json({ message: 'You are not authorized to this route' });
    }

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const changeStatus = async (req, res) => {
  const { scheduleId } = req.params;
  const { status } = req.body;

  try {
    if (req.user.role !== 'admin') {
      return res.status(401).json({ message: 'You are not authorized to this route' });
    }
    const schedule = await ScheduleSchema.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    schedule.status = status;
    await schedule.save();
    await schedule.populate([
      { path: 'userId', select: 'fullName gender age' },
      { path: 'trainerId', select: 'profileImage' }
    ]);

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}
const rescheduleSchedules = async (req, res) => {
  const { scheduleId } = req.params;
  const { date, startTime, endTime, scheduleLink, scheduleSubject, scheduleDescription, status,affectedArea } = req.body;

  try {
    if (req.user.role !== 'admin') {
      return res.status(401).json({ message: 'You are not authorized to this route' });
    }

    let obj = {};
    if (date) obj.date = date;
    if (startTime) obj.startTime = startTime;
    if (endTime) obj.endTime = endTime;
    if (scheduleLink) obj.scheduleLink = scheduleLink;
    if (scheduleSubject) obj.scheduleSubject = scheduleSubject;
    if (affectedArea) obj.affectedArea = affectedArea;
    if (scheduleDescription) obj.scheduleDescription = scheduleDescription;
    if (status) {
      obj.status = status;
    } else {
      obj.status = 'pending';
    }

    const schedule = await ScheduleSchema.findByIdAndUpdate(scheduleId, obj, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'userId', select: 'fullName gender age' },
      { path: 'trainerId', select: 'profileImage' }
    ]);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}
const upcomingTrainer = async (req, res) => {
  const trainerId = req.user._id;
  const {userId} = req.query;

  try {
    // check if the user is a trainer
    const trainer = await User.findById(trainerId);
    if(!trainer){
      return res.status(404).json({ message: 'Trainer not found' });
    }
    if(req.user.role === 'user'){
      return res.status(401).json({ message: 'You are not authorized to this route' });
    }

    const schedules = await ScheduleSchema.find({ trainerId, userId, status: 'pending' }).populate([
      { path: 'userId', select: 'fullName gender age' },
      { path: 'trainerId', select: 'profileImage' }
    ]) 

    res.status(200).json(schedules);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const requestedTrainer = async (req, res) => {
  const trainerId = req.user._id;
  const {userId} = req.query;

  try {
    const trainer = await User.findById(trainerId);
    if(!trainer){
      return res.status(404).json({ message: 'Trainer not found' });
    }
    if(req.user.role === 'user'){
      return res.status(401).json({ message: 'You are not authorized to this route' });
    }

    const schedules = await ScheduleSchema.find({ trainerId, userId, status: 'waitingToApproved' }).populate([
      { path: 'userId', select: 'fullName gender age' },
      { path: 'trainerId', select: 'profileImage' }
    ]) 

    res.status(200).json(schedules);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const completedTrainer = async (req, res) => {
  const trainerId = req.user._id;
  const {userId} = req.query;

  try {
    const trainer = await User.findById(trainerId);
    if(!trainer){
      return res.status(404).json({ message: 'Trainer not found' });
    }
    if(req.user.role === 'user'){
      return res.status(401).json({ message: 'You are not authorized to this route' });
    }

    const schedules = await ScheduleSchema.find({ trainerId, userId, status: 'completed' }).populate([
      { path: 'userId', select: 'fullName gender age' },
      { path: 'trainerId', select: 'profileImage' }
    ]) 

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

// FOR DEV PURPOSE ONLY
const getAllSchedules = async (req, res) => {
  try {
    const schedules = await ScheduleSchema.find();
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const deleteAllSchedules = async (req, res) => {
  try {
    await ScheduleSchema.deleteMany();
    res.status(200).json({ message: 'All schedules deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

module.exports= {createSchedule, getSchedules,getAllSchedules,deleteAllSchedules,getUpcomingSchedules,getCompletedSchedules,getPendingSchedules,getRequestedSchedules,changeStatus,rescheduleSchedules,getSingleSchedule,upcomingTrainer,requestedTrainer,completedTrainer};