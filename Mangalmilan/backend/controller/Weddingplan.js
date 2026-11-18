import Profile from '../models/UserProfile.js';
import WeddingPlan from '../models/WeddingPlan.js';


export const getDashboardData = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const plan = await WeddingPlan.findOne({ user: req.user.id });

    if (!profile || !plan) {
      return res.status(404).json({ message: 'Profile or Plan not found. Please create your profile first.' });
    }

    res.json({ profile, plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const addChecklistTask = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: 'Task text is required' });
    }

    const plan = await WeddingPlan.findOne({ user: req.user.id });
    if (!plan) {
      return res.status(404).json({ message: 'Wedding plan not found' });
    }

    plan.checklist.push({ text, completed: false });
    await plan.save();

    res.status(201).json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export const toggleChecklistTask = async (req, res) => {
  try {
    const plan = await WeddingPlan.findOne({ user: req.user.id });
    if (!plan) {
      return res.status(404).json({ message: 'Wedding plan not found' });
    }

    const task = plan.checklist.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = !task.completed;
    await plan.save();
    
    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteTask = async (req, res) => {
   try {
    const { taskId } = req.params;
    const plan = await WeddingPlan.findOne({ user: req.user.id });
    if (!plan) return res.status(404).json({ message: "Wedding plan not found" });

    const task = plan.checklist.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    plan.checklist.pull(taskId);
    await plan.save();
    res.json({ message: "Task deleted successfully", checklist: plan.checklist });
  } catch (err) {
    console.error("deleteChecklistTask error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};