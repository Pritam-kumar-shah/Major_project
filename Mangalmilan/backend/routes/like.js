
import express from 'express';
import { toggleMediaLike } from '../controller/likeController.js'; 
import isAuth from '../middleware/isAuth.js'; 

const router = express.Router();

router.patch('/media/:mediaId/toggle', isAuth, toggleMediaLike);

export default router;