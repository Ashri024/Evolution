const express = require('express');
const router = express.Router();
const parser = require('../config/multerConfig');

router.post('/uploadProfile', parser.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const imageUrl = req.file.path;
    res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl: imageUrl,
    });
});

module.exports = router;