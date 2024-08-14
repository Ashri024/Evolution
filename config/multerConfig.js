const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinaryConfig');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'fitness-evolution', 
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg'], 
    },
});

const parser = multer({ storage: storage });

module.exports = parser;