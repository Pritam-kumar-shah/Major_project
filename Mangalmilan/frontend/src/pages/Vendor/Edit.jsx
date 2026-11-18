import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../api/apiClient';
import { FaSave, FaCamera } from 'react-icons/fa';
import imageCompression from "browser-image-compression";

// Category-specific forms
import VenueDetailsForm from '../../components/forms/VenueDetailsForm';
import PhotographerDetailsForm from '../../components/forms/PhotographerDetailsForm';
import CatererDetailsForm from '../../components/forms/CatererDetailsForm';
import DJMusicDetailsForm from '../../components/forms/DJMusicDetailsForm';
import MakeupArtistDetailsForm from '../../components/forms/MakeupArtistDetailsForm';

function VendorProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing] = useState(true); // Always edit mode

  const [formData, setFormData] = useState({
    businessName: '',
    profileImage: '',
    category: '',
    about: '',
    location: { address: '', city: '', state: '', pincode: '' },
    contactPhone: '',
    details: {},
  });

  const [services, setServices] = useState([{ name: '', price: '' }]);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.get('/api/categories');
        if (isMounted) setCategories(data || []);
      } catch {
        toast.error('Categories could not be loaded.');
      }
    };

    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get('/api/vendor/profile/me/profile');
        if (data && isMounted) {
          setFormData({
            businessName: data.businessName || '',
            category: data.category?._id || '',
            profileImage: data.profileImage || '',
            about: data.about || '',
            location: data.location || { address: '', city: '', state: '', pincode: '' },
            contactPhone: data.contactPhone || '',
            details: data.details || {},
          });
          setSelectedCategoryName(data.category?.name || '');
          setServices(data.services || [{ name: '', price: '' }]);
          if (data.profileImage) setImagePreview(data.profileImage);
        }
      } catch (err) {
        toast.error('Your profile could not be fetched.');
      }
    };

    const loadData = async () => {
      await fetchCategories();
      await fetchProfile();
      if (isMounted) setLoading(false);
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Handlers
  const handleCommonChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleLocationChange = (e) => setFormData(prev => ({ ...prev, location: { ...prev.location, [e.target.name]: e.target.value } }));
  const handleDetailsChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, details: { ...prev.details, [name]: type === 'number' ? Number(value) || 0 : value } }));
  };
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const categoryObject = categories.find(c => c._id === categoryId);
    setFormData(prev => ({ ...prev, category: categoryId, details: {} }));
    setSelectedCategoryName(categoryObject?.name || '');
  };
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const options = { maxSizeMB: 10, maxWidthOrHeight: 2000, useWebWorker: true };
    try {
      const compressedFile = await imageCompression(file, options);
      setProfileImageFile(compressedFile);
      setImagePreview(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error(err);
      toast.error("Image compression failed. Please try a smaller file.");
    }
  };

  // Services Handlers
  const addService = () => setServices(prev => [...prev, { name: '', price: '' }]);
  const removeService = (index) => setServices(prev => prev.filter((_, i) => i !== index));
  const handleServiceChange = (index, field, value) => {
    setServices(prev => {
      const newServices = [...prev];
      newServices[index][field] = value;
      return newServices;
    });
  };

  // Save
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.warn('Please select a service category.');
    if (!formData.businessName.trim()) return toast.error('Please enter a business name.');
    if (!formData.location.address || !formData.location.city || !formData.location.state || !formData.location.pincode)
      return toast.error('Please fill out all location details.');
    if (!/^\d{10}$/.test(formData.contactPhone)) return toast.error('Please enter a valid 10-digit mobile number.');

    setSaving(true);
    try {
      const dataToSubmit = new FormData();
      dataToSubmit.append('businessName', formData.businessName);
      dataToSubmit.append('category', formData.category);
      dataToSubmit.append('about', formData.about);
      dataToSubmit.append('contactPhone', formData.contactPhone);
      dataToSubmit.append('details', JSON.stringify(formData.details));
      dataToSubmit.append('location', JSON.stringify(formData.location));
      dataToSubmit.append('services', JSON.stringify(services));
      if (profileImageFile) dataToSubmit.append('profileImage', profileImageFile);

      await apiClient.put('/api/vendor/profile/update', dataToSubmit);

      toast.success('Profile updated successfully!');
      navigate('/vendor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="pt-24 text-center text-lg font-semibold">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4 pt-24">
      <form onSubmit={handleSave} className="w-full max-w-4xl space-y-6">

        {/* Business Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-700">Business Information</h3>
          <input type="text" name="businessName" value={formData.businessName} onChange={handleCommonChange} placeholder="Business Name" className="p-3 w-full rounded-lg bg-gray-100" required />
          <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleCommonChange} placeholder="Contact Phone" className="p-3 w-full rounded-lg bg-gray-100" required />
        </div>

        {/* Category & Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-700">Service Details</h3>
          <select value={formData.category} onChange={handleCategoryChange} className="p-3 w-full rounded-lg bg-gray-100" required>
            <option value="">-- Select a Category --</option>
            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>

          {selectedCategoryName === 'Venue' && <VenueDetailsForm details={formData.details} handleChange={handleDetailsChange} />}
          {selectedCategoryName === 'Photographer' && <PhotographerDetailsForm details={formData.details} handleChange={handleDetailsChange} />}
          {selectedCategoryName === 'Caterer' && <CatererDetailsForm details={formData.details} handleChange={handleDetailsChange} />}
          {selectedCategoryName === 'DJ and Music' && <DJMusicDetailsForm details={formData.details} handleChange={handleDetailsChange} />}
          {selectedCategoryName === 'Makeup Artist' && <MakeupArtistDetailsForm details={formData.details} handleChange={handleDetailsChange} />}
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-700">Services & Pricing</h3>
          {services.map((service, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input type="text" value={service.name} onChange={(e) => handleServiceChange(index, 'name', e.target.value)} placeholder="Service Name" className="p-2 rounded-lg bg-gray-100 flex-1" required />
              <input type="number" value={service.price} onChange={(e) => handleServiceChange(index, 'price', e.target.value)} placeholder="Price" className="p-2 rounded-lg bg-gray-100 w-32" required />
              {services.length > 1 && <button type="button" onClick={() => removeService(index)} className="text-red-500 font-bold">X</button>}
            </div>
          ))}
          <button type="button" onClick={addService} className="text-blue-500 font-semibold mt-2">+ Add Service</button>
        </div>

        {/* About & Location */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-700">About & Location</h3>
          <textarea name="about" value={formData.about} onChange={handleCommonChange} placeholder="Tell us about your business..." rows={4} className="w-full p-3 rounded-lg bg-gray-100"/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="address" value={formData.location.address} onChange={handleLocationChange} placeholder="Address" className="p-3 rounded-lg bg-gray-100 md:col-span-2" required />
            <input type="text" name="city" value={formData.location.city} onChange={handleLocationChange} placeholder="City" className="p-3 rounded-lg bg-gray-100" required />
            <input type="text" name="state" value={formData.location.state} onChange={handleLocationChange} placeholder="State" className="p-3 rounded-lg bg-gray-100" required />
            <input type="text" name="pincode" value={formData.location.pincode} onChange={handleLocationChange} placeholder="Pincode" className="p-3 rounded-lg bg-gray-100" required />
          </div>
        </div>

        {/* Profile Image */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Business Photo / Logo</h3>
          <div className="flex justify-center">
            <div className="relative w-48 h-32 flex-shrink-0">
              <img src={imagePreview || 'https://via.placeholder.com/200x150'} alt="Business" className="w-48 h-32 rounded-lg object-cover border-4 border-white shadow-md"/>
              <label htmlFor="profileImage" className="absolute -bottom-2 -right-2 bg-pink-500 text-white p-2 rounded-full cursor-pointer hover:bg-pink-600">
                <FaCamera />
                <input type="file" id="profileImage" name="profileImage" accept="image/*" onChange={handleImageChange} className="hidden"/>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 disabled:bg-gray-400">
            <FaSave /> {saving ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VendorProfileForm;
