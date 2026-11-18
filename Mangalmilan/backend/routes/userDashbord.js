import express from 'express'
import isAuth from '../middleware/isAuth.js';
import { getDashboardData, addChecklistTask, toggleChecklistTask,deleteTask } from '../controller/Weddingplan.js';

const router = express.Router();
router.get('/', isAuth, getDashboardData); 
router.post('/checklist', isAuth, addChecklistTask); 
router.patch('/checklist/:taskId', isAuth, toggleChecklistTask); 
router.delete("/checklist/:taskId", isAuth, deleteTask); 

export default router;
