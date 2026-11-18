import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/auth';
import apiClient from '../api/apiClient';
import { toast } from 'react-toastify';
import { 
  FaEdit, FaPlus, FaCheckCircle, FaRegCircle, FaArrowRight, 
  FaCalendarAlt, FaCity, FaMoneyBillWave, FaUserFriends, FaTrash 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState({ checklist: [] });
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch profile & plan
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/profile');
      if (!data?.profile) {
        navigate('/create-profile');
        return;
      }
      setProfile(data.profile);
      setPlan(data.plan || { checklist: [] });
    } catch (err) {
      if (err.response?.status === 404) navigate('/create-profile');
      else if (err.response?.status === 401) {
        toast.error("Please login first.");
        navigate('/login');
      } else toast.error("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Countdown timer
  useEffect(() => {
    if (!profile?.weddingDate) return;
    const interval = setInterval(() => {
      const weddingDay = new Date(profile.weddingDate).getTime();
      const now = new Date().getTime();
      const distance = weddingDay - now;
      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [profile?.weddingDate]);

  // Toggle checklist task
  const handleChecklistToggle = async (taskId) => {
    const originalPlan = { ...plan };
    setPlan(prev => ({
      ...prev,
      checklist: prev.checklist.map(task => task._id === taskId ? { ...task, completed: !task.completed } : task)
    }));
    try {
      await apiClient.patch(`/api/dashboard/checklist/${taskId}`);
    } catch {
      toast.error("Failed to update task.");
      setPlan(originalPlan);
    }
  };

  // Add new task
  const handleAddTask = async (e) => {
    if (e) e.preventDefault(); // prevent form submit
    if (!newTask.trim()) return;
    try {
      const { data } = await apiClient.post('/api/dashboard/checklist', { text: newTask });
      setPlan(prev => ({ ...prev, checklist: data.checklist }));
      setNewTask('');
    } catch {
      toast.error("Failed to add task.");
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    const originalPlan = { ...plan };
    setPlan(prev => ({ ...prev, checklist: prev.checklist.filter(t => t._id !== taskId) }));
    try {
      await apiClient.delete(`/api/dashboard/checklist/${taskId}`);
    } catch {
      toast.error("Failed to delete task.");
      setPlan(originalPlan);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-semibold text-lg">Loading your dashboard...</div>;

  // Derived values
  const checklist = plan?.checklist || [];
  const budget = plan?.budgetDetails || { total: 0, spent: 0 };
  const totalBudget = budget.total || 0;
  const spentBudget = budget.spent || 0;
  const budgetPercentage = totalBudget > 0 ? Math.min((spentBudget / totalBudget) * 100, 100) : 0;
  const completedTasks = checklist.filter(t => t.completed).length;
  const totalTasks = checklist.length;
  const planningProgress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
  const nextTask = checklist.find(t => !t.completed);

  return (
    <div className="min-h-screen bg-gray-100 p-4 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Hello, {user?.name || 'Guest'}!</h1>
          <p className="text-gray-500">Here's your wedding planning at a glance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* What's Next */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-1">What's Next?</h2>
              <p className="opacity-80 mb-4">{nextTask ? `Focus on completing your next big task.` : `You've completed all your tasks!`}</p>
              {nextTask && (
                <div className="bg-white/20 p-4 rounded-lg flex items-center justify-between">
                  <span className="font-semibold">{nextTask.text}</span>
                  <FaArrowRight/>
                </div>
              )}
              <div className="mt-4">
                <div className="flex justify-between text-sm opacity-90 mb-1">
                  <span>Planning Progress</span>
                  <span className="font-bold">{Math.round(planningProgress)}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: `${planningProgress}%` }}></div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4">Your Checklist</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                {checklist.map(item => (
                  <div key={item._id} className="flex items-center gap-3 justify-between group p-2 rounded-md hover:bg-gray-100">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleChecklistToggle(item._id)}>
                      {item.completed ? <FaCheckCircle className="text-green-500 flex-shrink-0"/> : <FaRegCircle className="text-gray-400 group-hover:text-pink-500 flex-shrink-0"/>}
                      <span className={`${item.completed ? 'line-through text-gray-500' : 'text-gray-800'} transition-colors`}>{item.text}</span>
                    </div>
                    <FaTrash onClick={() => handleDeleteTask(item._id)} className="text-red-500 cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"/>
                  </div>
                ))}
              </div>
              <form className="flex gap-2 border-t pt-4" onSubmit={handleAddTask}>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-grow p-2 bg-gray-100 rounded-md border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button type="submit" className="p-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"><FaPlus /></button>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Countdown */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <h2 className="text-lg font-bold text-gray-700 mb-2">Wedding Countdown</h2>
              <div className="flex justify-center space-x-2">
                <div><span className="text-3xl font-bold text-gray-800">{String(countdown.days).padStart(2,'0')}</span><p className="text-xs text-gray-500">D</p></div>
                <span className="text-3xl font-bold text-gray-300">:</span>
                <div><span className="text-3xl font-bold text-gray-800">{String(countdown.hours).padStart(2,'0')}</span><p className="text-xs text-gray-500">H</p></div>
                <span className="text-3xl font-bold text-gray-300">:</span>
                <div><span className="text-3xl font-bold text-gray-800">{String(countdown.minutes).padStart(2,'0')}</span><p className="text-xs text-gray-500">M</p></div>
                <span className="text-3xl font-bold text-gray-300">:</span>
                <div><span className="text-3xl font-bold text-pink-500 animate-pulse">{String(countdown.seconds).padStart(2,'0')}</span><p className="text-xs text-gray-500">S</p></div>
              </div>
            </div>

            {/* Wedding Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-700">Wedding Details</h2>
                <button onClick={() => navigate('/create-profile')} className="text-sm font-semibold text-pink-500 hover:underline"><FaEdit /></button>
              </div>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-3"><FaCalendarAlt className="text-gray-400 w-4 text-center" /><span>{profile?.weddingDate ? new Date(profile.weddingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}</span></div>
                <div className="flex items-center gap-3"><FaCity className="text-gray-400 w-4 text-center" /><span>{profile?.location || 'Not set'}</span></div>
                <div className="flex items-center gap-3"><FaUserFriends className="text-gray-400 w-4 text-center" /><span>{profile?.guestCount ?? 0} Guests</span></div>
                <div className="flex items-center gap-3"><FaMoneyBillWave className="text-gray-400 w-4 text-center" /><span>₹{totalBudget.toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            {/* Budget Overview */}
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Budget Overview</h2>
            
              {/* Compact Budget Stats */}
              <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-3">
                <div className="flex flex-col items-start">
                  <span className="text-gray-400 text-xs">Total</span>
                  <span className="text-gray-800 font-semibold">
                    ₹{totalBudget.toLocaleString('en-IN')}
                  </span>
                </div>
            
                <div className="flex flex-col items-center">
                  <span className="text-gray-400 text-xs">Spent</span>
                  <span className="text-pink-500 font-semibold">
                    ₹{spentBudget.toLocaleString('en-IN')}
                  </span>
                </div>
            
                <div className="flex flex-col items-end">
                  <span className="text-gray-400 text-xs">Remaining</span>
                  <span className="text-green-500 font-semibold">
                    ₹{Math.max(totalBudget - spentBudget, 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            
              {/* Curved Gradient Progress Bar */}
              <div className="relative w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-700 ${
                    budgetPercentage < 70
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : budgetPercentage < 90
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                      : 'bg-gradient-to-r from-red-500 to-pink-600'
                  }`}
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
            
              {/* Percentage below bar */}
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{Math.round(budgetPercentage)}% used</span>
                <span>{Math.round(100 - budgetPercentage)}% left</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
