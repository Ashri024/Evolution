const express = require('express');
const { registerUser, loginUser, getUserDetails, updateUser, deleteUser,getAllUsers,deleteAllUsers, getAllUsersUnderTrainer, changePassword, verifyEmail, deleteMyAccount, changeRole } = require('../controllers/User');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
// Append /v0/api/user before all routes

// Route to register a new user
router.post('/register', registerUser);

// Route to login a user
router.post('/login', loginUser);

// Route to get user details
router.get('/me', authMiddleware, getUserDetails);

// Route to update user information
router.put('/me', authMiddleware, updateUser);

// Route to delete user
router.delete('/me', authMiddleware, deleteMyAccount);

// Route to delete user by a admin
router.delete('/deleteUser/:userId', authMiddleware, deleteUser);
// Route to get all users under a trainer
router.get('/allUsersUnderTrainer', authMiddleware, getAllUsersUnderTrainer);

// Route to change role by admin only
router.put('/changeRole/:userId', authMiddleware, changeRole);

// verifying email for changing password
router.get("/verifyEmail", verifyEmail);

// changing password
router.put("/changePassword", changePassword);
// FOR DEV PURPOSE ONLY

// Route to get all user (for testing purpose)
router.get('/allUsers', getAllUsers);

// Route to delete all users (for testing purpose)
router.delete('/allUsers', deleteAllUsers);

module.exports = router;
