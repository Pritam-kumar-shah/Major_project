import express from 'express';
import * as categoryController from '../controller/category.controller.js';
import isAuth from '../middleware/isAuth.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

router.get('/', categoryController.getAllCategories);

router.post('/', isAuth, isAdmin, categoryController.createCategory);

export default router;