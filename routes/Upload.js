const express = require('express');
const router = express.Router();
const parser = require('../config/multerConfig');

router.post('/uploadProfile', parser.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const imageUrl = req.file.path;
    res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl: imageUrl,
    });
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.log(err.message);
    res.status(500).json({ message: 'Server error', error: err.toString() });
});

module.exports = router;