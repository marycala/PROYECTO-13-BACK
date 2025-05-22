const express = require('express');
const { uploadMiddleware, uploadImage } = require('../../controllers/imageController');


const ImageRouter = express.Router();

ImageRouter.post('/upload', uploadMiddleware, uploadImage);

module.exports = ImageRouter;
