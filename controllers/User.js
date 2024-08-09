const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

    const registerUser = async (req, res) => {
        const { email, password, fullName, role,trainerAssigned} = req.body;
      
        try {
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
          }
          let newUser="";
          if(role ==="admin"){
            if(trainerAssigned){
              return res.status(400).json({ message: 'Admin cannot have a trainer assigned' });
            }
            newUser = new User({
              email,
              password,
              fullName,
              role,
            })
          }else {
            if(!trainerAssigned){
              return res.status(400).json({ message: 'Trainer should be assigned to a user' });
            }
            const ifTrainerExist = await User.findOne({ _id: trainerAssigned });

            if (!ifTrainerExist) {
              return res.status(400).json({ message: 'Trainer does not exist' });
            }
            newUser = new User({
              email,
              password,
              fullName,
              role,
              trainerAssigned
            })
          }
          

          await newUser.save();
      
          const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      
          res.status(201).json({ token, user: newUser });
        } catch (error) {
          res.status(500).json({ message: 'Server error', error });
        }
    }
    const loginUser = async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide an email and password' });
      }
      try {
        const user = await User.findOne({
          $or: [{ email: email }]
        });
        if (!user) {
          return res.status(400).json({ message: 'Invalid email or password' });
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid email or password' });
        }
    
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
        res.status(200).json({ token, user });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }
    }

    const getUserDetails = async (req, res) => {
      try {
        const user = await User.findById(req.user._id).select('-password').populate('trainerAssigned', 'fullName');
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }
    }

    const updateUser = async (req, res) => {
        const { fullName, gender, profileImage, age, password, email } = req.body;
        let updateFields = {};
    
        // Add fields to updateFields object only if they are provided and not empty
        if (fullName) updateFields.fullName = fullName;
        if (gender) updateFields.gender = gender;
        if (profileImage) updateFields.profileImage = profileImage;
        if (age) updateFields.age = age;
        if (password) updateFields.password = password;
        if (email) updateFields.email = email;
    
        try {
            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                updateFields,
                { new: true, runValidators: true }
            ).select('-password');
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    const deleteUser = async (req, res) => {
      try {
        await User.findByIdAndDelete(req.user._id);
        res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }
    }
    const getAllUsersUnderTrainer = async (req, res) => {
      try {
        const users = await User.find({ trainerAssigned: req.user._id }).select('-password');
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }
    }
    const verifyEmail = async (req, res) => {
      try {
          const user = await User.findOne({ email: req.query.email });
          if (user) {
              return res.status(200).json({ message: "Email verified" });
          }
          return res.status(404).json({ message: "Email not found" });
      } catch (error) {
          return res.status(500).json({ message: error.message });
      }
  }

  const changePassword =async (req, res) => {
    try {
        const user = await User.findOne({ email:
            req.body.email });
        if (user) {
            user.password = req.body.password;
            await user.save();
            return res.status(200).json({ message: "Password changed successfully" });
        }
        return res.status(404).json({ message: "Email not found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }}
    // For dev purposes
    const getAllUsers = async (req, res) => {
      try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
      }
    };

    const deleteAllUsers = async (req, res) => {
      try {
        await User.deleteMany();
        res.status(200).json({ message: 'All users deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }}
module.exports = { registerUser, loginUser, getUserDetails, updateUser, deleteUser,getAllUsers,deleteAllUsers,getAllUsersUnderTrainer, verifyEmail, changePassword };