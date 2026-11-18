import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../api/apiClient';
import { FaCalendarAlt, FaCity, FaUsers, FaMoneyBillWave, FaPen, FaSave } from 'react-icons/fa';


function CreateProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    weddingDate: '',
    location: '',
    guestCount: '',
    budget: '',
    details: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get('/api/profile');
        const profile = data.profile || data; // handle controller response { profile, plan }
        setFormData({
          weddingDate: profile.weddingDate ? new Date(profile.weddingDate).toISOString().split('T')[0] : '',
          location: profile.location || '',
          guestCount: profile.guestCount || '',
          budget: profile.budgetDetails.total || '',
          details: profile.details || '',
        });
      } catch (error) {
        if (error.response?.status === 404) {
          toast.info("Welcome! Please tell us about your wedding plans.");
        } else {
          toast.error("Failed to fetch your profile.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        budget: Number(formData.budget) || 0,
        guestCount: Number(formData.guestCount) || 0,
      };

      await apiClient.post('/api/profile', payload);
      toast.success("Your wedding details have been saved!");
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="pt-24 text-center">Loading your details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4 pt-24">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Your Wedding Details</h2>
          <p className="text-gray-500 mt-2">This will help vendors understand your needs.</p>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500"/>
            </div>
            <div className="relative">
              <FaCity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Wedding City" className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500"/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" name="guestCount" value={formData.guestCount} onChange={handleChange} placeholder="No. of Guests" className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500"/>
            </div>
            <div className="relative">
              <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="Estimated Budget" className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500"/>
            </div>
          </div>

          <div className="relative">
            <FaPen className="absolute left-4 top-5 -translate-y-1/2 text-gray-400" />
            <textarea name="details" value={formData.details} onChange={handleChange} placeholder="Tell us more about your event" rows="4" className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500"/>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 disabled:bg-gray-400">
              <FaSave /> {loading ? 'Saving...' : 'Save Wedding Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProfile;
