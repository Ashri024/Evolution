const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinaryConfig');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'fitness-evolution', // Set the folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg'], // Specify the allowed formats
    },
});

const parser = multer({ storage: storage });

module.exports = parser;