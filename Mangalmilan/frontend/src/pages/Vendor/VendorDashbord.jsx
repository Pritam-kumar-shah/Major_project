import React, { useState, useEffect, useCallback, useContext } from 'react';
import { toast } from 'react-toastify'; 
import { AuthContext } from "../../context/auth.jsx"; 
import { FaSpinner, FaArrowUp, FaArrowDown, FaCalendarCheck, FaStar, FaEnvelope, FaEye, FaFilter, FaTimes, FaSearch, FaChartLine } from 'react-icons/fa';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import dayjs from "dayjs"; 
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import apiClient from "../../api/apiClient"; // ✅ apiClient imported

dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

// --- Backend API (REMOVED HARDCODED URL) ---

// --- Helper Functions ---
const calculateTrend = (current, previous) => {
  if (previous === 0) {
    // अगर पिछली अवधि शून्य है, तो ट्रेंड को Infinity या 0 मानें
    // अगर current > 0 है तो 100% वृद्धि दिखाएँ, वरना 0%
    const percent = current > 0 ? 100 : 0;
    return { percent: parseFloat(percent.toFixed(1)), isUp: current >= 0 }; 
  }
  const percent = ((current - previous) / previous) * 100;
  return { percent: parseFloat(percent.toFixed(1)), isUp: percent >= 0 };
};

// --- Stat Card Component (Improved Tailwind UI) ---
const StatCard = ({ title, count, icon: Icon, colorClass, currentCount, previousCount }) => {
  const { percent, isUp } = calculateTrend(currentCount, previousCount);
  const trendColor = isUp ? 'text-green-600' : 'text-red-600';
  const trendBg = isUp ? 'bg-green-100/50' : 'bg-red-100/50';
  const TrendIcon = isUp ? FaArrowUp : FaArrowDown;
  const borderClass = colorClass.replace('text-', 'border-');

  return (
    <div className={`p-6 bg-white rounded-xl shadow-lg transition duration-300 hover:shadow-2xl border-l-4 ${borderClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">
            {count?.toLocaleString() || 0}
          </p>
        </div>
        <div className={`p-3 rounded-full ${colorClass} ${trendBg}`}>
            <Icon className="w-6 h-6"/>
        </div>
      </div>
      <p className={`mt-4 flex items-center gap-1.5 text-sm font-semibold ${trendColor}`}>
        <TrendIcon className="w-3 h-3"/>
        {Math.abs(percent)}% {isUp ? 'Increased' : 'Decreased'}
        <span className="text-gray-500 ml-1 font-normal">(vs. Previous Period)</span>
      </p>
    </div>
  );
};

// --- Main Vendor Dashboard Component ---
const VendorDashboard = () => {
  const { user, vendorProfile, loading: authLoading, isAuthenticated } = useContext(AuthContext); 
  
  const [stats, setStats] = useState({ bookings: 0, reviews: 0, enquiries: 0, views: 0 });
  const [previousStats, setPreviousStats] = useState({ bookings: 0, reviews: 0, enquiries: 0, views: 0 });
  const [graphData, setGraphData] = useState([]);
  const [filter, setFilter] = useState('monthly');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const vendorId = vendorProfile?._id; 

  // Function to format X-Axis labels based on current filter
  const xAxisFormatter = (dateStr) => {
    // FIX: Parse the date using both possible formats from backend aggregation
    if (filter === 'yearly') {
        return dayjs(dateStr, 'YYYY-MM').format('MMM YY'); 
    }
    return dayjs(dateStr).format('MMM D'); 
  };

  // Fetch data function
  const fetchData = useCallback(async (currentFilter, start, end) => {
    if (authLoading || !vendorId) {
      if (!authLoading && !vendorId) setError("Authorization Failed. Vendor Profile not loaded.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        filter: currentFilter,
        startDate: start || '',
        endDate: end || ''
      };

      // ✅ FIXED: Using the correct relative API path for Nginx proxy
      const response = await apiClient.get('/api/vendor/dashboard/analytics', { params });

      const data = response.data; 
      
      setStats(data.stats);
      setPreviousStats(data.previousStats || {});
      
      // ✅ FIX: Graph data should show only the range requested (Frontend logic is fine if backend works)
      setGraphData(data.graphData);

    } catch (err) {
      console.error("Dashboard Fetch Error:", err.response?.data?.message || err.message);
      const errMsg = err.response?.data?.message || err.message;
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError(`Access Denied. Please login again.`);
        toast.error(`Session Expired. Please login again.`);
      } else {
        setError(`Data loading failed: ${errMsg}`);
        toast.error(`Data loading failed: ${errMsg}`);
      }
    } finally {
      setLoading(false);
    }
  }, [vendorId, authLoading]);

  // Initial Data Load and Effect Dependencies
  useEffect(() => {
    if (!authLoading && vendorId) {
        // Initial load uses default dates (last 30 days)
        fetchData('monthly');
    }
  }, [fetchData, authLoading, vendorId]);

  // Filter Handling (Applies selected dates immediately)
  const handleFilterChange = (newFilter) => {
    const today = dayjs().format('YYYY-MM-DD');
    let newStart = newFilter === 'yearly' 
      ? dayjs().subtract(12, 'months').format('YYYY-MM-DD')
      : dayjs().subtract(30, 'days').format('YYYY-MM-DD');

    setFilter(newFilter);
    setStartDate(newStart);
    setEndDate(today);
    // ✅ This sends the exact dates to the backend to start and end the graph
    fetchData(newFilter, newStart, today); 
  };

  const handleDateFilter = () => {
    if (!startDate || !endDate) return toast.error("Please select both start and end dates.");
    setFilter('dateRange');
    // ✅ This sends the exact range requested
    fetchData('dateRange', startDate, endDate);
  };

  const graphTitle =
    filter === 'yearly'
      ? 'Monthly Trend (Last 12 Months)'
      : filter === 'monthly'
      ? 'Daily Trend (Last 30 Days)'
      : `Trend from ${startDate} to ${endDate}`;

  // --- Render Conditions ---
  if (authLoading || loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-purple-600 text-xl bg-gray-100">
        <FaSpinner className="animate-spin mr-3 w-6 h-6" /> Loading Dashboard Data...
      </div>
    );
  }
  
  if (!isAuthenticated || user?.role !== 'vendor' || !vendorId) {
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-red-50 p-6">
            <div className="text-center p-10 bg-white rounded-xl shadow-2xl border-t-4 border-red-500">
                <h2 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h2>
                <p className="mt-3 text-gray-600">You must be a verified vendor with a loaded profile to view this dashboard.</p>
                <button 
                   onClick={() => console.log('Redirecting to login or profile creation...')}
                   className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >Login / Create Profile</button>
            </div>
        </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="w-full bg-gray-100 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
            <FaChartLine className="text-purple-600"/> {vendorProfile.businessName || 'Your Business'} Analytics
        </h1>

        {error && <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 border border-red-300">{error} <FaTimes className="inline ml-2 cursor-pointer" onClick={() => setError(null)} /></div>}

        {/* --- Filter Section --- */}
        <div className="p-6 bg-white shadow-xl rounded-xl border-t-4 border-blue-500 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FaFilter className="text-blue-500"/> Filter Data</h2>
            
            <div className="flex gap-3 mb-5">
                <button 
                  onClick={() => handleFilterChange('monthly')} 
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition ${filter === 'monthly' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                >30 Days</button>
                <button 
                  onClick={() => handleFilterChange('yearly')} 
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition ${filter === 'yearly' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
                >12 Months</button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-end border-t pt-4">
                <div className="w-full sm:w-auto">
                    <label className="text-xs text-gray-600 block mb-1">Start Date</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <label className="text-xs text-gray-600 block mb-1">End Date</label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button 
                    onClick={handleDateFilter} 
                    disabled={loading || !startDate || !endDate}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition shadow-md hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto"
                >
                    <FaSearch className="w-4 h-4"/> Filter Range
                </button>
            </div>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
                title="Bookings" 
                count={stats.bookings} 
                icon={FaCalendarCheck} 
                colorClass="text-blue-600" 
                currentCount={stats.bookings} 
                previousCount={previousStats.bookings} 
            />
            <StatCard 
                title="Reviews" 
                count={stats.reviews} 
                icon={FaStar} 
                colorClass="text-yellow-600" 
                currentCount={stats.reviews} 
                previousCount={previousStats.reviews} 
            />
            <StatCard 
                title="Enquiries" 
                count={stats.enquiries} 
                icon={FaEnvelope} 
                colorClass="text-green-600" 
                currentCount={stats.enquiries} 
                previousCount={previousStats.enquiries} 
            />
            <StatCard 
                title="Profile Views" 
                count={stats.views} 
                icon={FaEye} 
                colorClass="text-red-600" 
                currentCount={stats.views} 
                previousCount={previousStats.views} 
            />
        </div>

        {/* --- Graph Section --- */}
        <div className="p-6 bg-white shadow-xl rounded-xl border-t-4 border-purple-600">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{graphTitle}</h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData} margin={{ top: 15, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                            dataKey="date" 
                            stroke="#6b7280" 
                            tickFormatter={xAxisFormatter} 
                        />
                        <YAxis stroke="#6b7280" allowDecimals={false} />
                        <Tooltip 
                            // ✅ FIX: This robust logic handles both date formats correctly
                            labelFormatter={(label) => {
                                // Tries to parse as YYYY-MM-DD (daily) or YYYY-MM (monthly)
                                const date = dayjs(label, ['YYYY-MM-DD', 'YYYY-MM']);
                                if (filter === 'yearly') {
                                    return date.format('MMMM YYYY');
                                }
                                return date.format('MMM D, YYYY'); 
                            }}
                            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '15px' }}/>
                        <Line type="monotone" dataKey="bookings" stroke="#2563eb" name="Bookings" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="reviews" stroke="#f59e0b" name="Reviews" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="views" stroke="#ef4444" name="Profile Views" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="enquiries" stroke="#10b981" name="Enquiries" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;