const ScheduleSchema = require('../models/Schedule');
const User = require('../models/User');
    const createSchedule=async (req, res) => {
        const { date, startTime,endTime, scheduleLink, scheduleSubject,scheduleDescription,userId,trainerId} = req.body;
      
        try {
          if (!userId || !trainerId) {
            return res.status(404).json({ message: 'Please provide userID and trainerID' });
          }
          //checking if the userId and trainerId are valid

          const user = await User.findById(userId);
          const trainer = await User.findById(trainerId);
          if(!user){
            return res.status(404).json({ message: 'User not found' });
          }
          if(!trainer){
            return res.status(404).json({ message: 'Trainer not found' });
          }

          let newSchedule;
          if(user.role === 'admin'){
          newSchedule = new ScheduleSchema({
            date,
            startTime,
            endTime,
            scheduleLink,
            scheduleSubject,
            scheduleDescription,
            userId,
            trainerId
          });
        }else{
          newSchedule = new ScheduleSchema({
            date,
            startTime,
            endTime,
            scheduleSubject,
            scheduleDescription,
            userId,
            trainerId,
            status: 'waitingToApproved'
          });
        }
          await newSchedule.save();
          res.status(201).json(newSchedule);
        } catch (error) {
          res.status(500).json({ message: 'Server error', error });
        }
    }

  const getSchedules= async (req, res) => {
      try {
        let schedules;
        if(req.user.role === 'admin'){
          schedules = await ScheduleSchema.find({ trainerId: req.user._id});
          return res.status(200).json(schedules);
        }else{
          schedules = await ScheduleSchema.find({ userId: req.user._id});
      }
        res.status(200).json(schedules);
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }
    }

const getSingleSchedule = async (req, res) => {
  const { scheduleId } = req.params;
  try{
    const schedule = await ScheduleSchema.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    if(req.user.role === 'admin'){
      await schedule.populate('userId','fullName gender age')
    }else{
      await schedule.populate('trainerId','fullName');
    }
    res.status(200).json(schedule);
  }catch(error){
    res.status(500).json({ message: 'Server error', error });
  }
}

const getUpcomingSchedules = async (req, res) => {
  try {
    let schedules;

    if(req.user.role === 'admin'){
     schedules = await ScheduleSchema.find({ trainerId: req.user._id, status: 'pending' });
    }else{
      schedules = await ScheduleSchema.find({ userId: req.user._id, status: 'pending' });
    }

    let upcomingSchedules = schedules.filter(schedule => {
      return new Date(schedule.date) >= new Date();
    });

    res.status(200).json(upcomingSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const getCompletedSchedules = async (req, res) => {
  try {
    let schedules;

    if(req.user.role === 'admin'){
      schedules = await ScheduleSchema.find({ trainerId: req.user._id, status: 'completed' });
    }else{
      schedules = await ScheduleSchema.find({ userId: req.user._id, status: 'completed' });
    }

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const getPendingSchedules = async (req, res) => {
  try {
    let schedules;

    if(req.user.role === 'admin'){
      schedules = await ScheduleSchema.find({ trainerId: req.user._id, status: 'pending' });
    }else{
      schedules = await ScheduleSchema.find({ userId: req.user._id, status: 'pending' });
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

    if(req.user.role === 'admin'){
      schedules = await ScheduleSchema.find({ trainerId: req.user._id, status: 'waitingToApproved' });
    }
    else{
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
    if(req.user.role !== 'admin'){
      return res.status(401).json({ message: 'You are not authorized to this route' });
    }
    const schedule = await ScheduleSchema.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    schedule.status = status;
    await schedule.save();
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const rescheduleSchedules = async (req, res) => {
  const { scheduleId } = req.params;
  const { date, startTime, endTime,scheduleLink,scheduleSubject,scheduleDescription } = req.body;

  try {
    if(req.user.role !== 'admin'){
      return res.status(401).json({ message: 'You are not authorized to this route' });
    }

    let obj={};
    if(date) obj.date = date;
    if(startTime) obj.startTime = startTime;
    if(endTime) obj.endTime = endTime;
    if(scheduleLink) obj.scheduleLink = scheduleLink;
    if(scheduleSubject) obj.scheduleSubject = scheduleSubject;
    if(scheduleDescription) obj.scheduleDescription = scheduleDescription;

    const schedule = await ScheduleSchema.findByIdAndUpdate(scheduleId, obj, {
      new: true,
      runValidators: true
    });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.status(200).json(schedule);
  }
  catch (error) {
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

module.exports= {createSchedule, getSchedules,getAllSchedules,deleteAllSchedules,getUpcomingSchedules,getCompletedSchedules,getPendingSchedules,getRequestedSchedules,changeStatus,rescheduleSchedules,getSingleSchedule}