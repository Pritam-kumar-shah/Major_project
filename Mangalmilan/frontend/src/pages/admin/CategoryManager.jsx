import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../api/apiClient'; // Make sure this path is correct

function CategoryManager() {
  // State for the form to create a new category
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [applicableFields, setApplicableFields] = useState('');

  // State to store and display the list of existing categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch all existing categories
  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get('/api/categories');
      setCategories(data || []);
    } catch (error) {
      toast.error('Could not fetch categories.');
    }
  };

  // Fetch categories when the component loads
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name || !slug || !applicableFields) {
      return toast.warn('Please fill all fields.');
    }
    setLoading(true);
    try {
      // Convert comma-separated string to an array
      const fieldsArray = applicableFields.split(',').map(field => field.trim());

      const payload = {
        name,
        slug,
        applicableFields: fieldsArray,
      };

      // The token will be sent automatically by your apiClient interceptor
      await apiClient.post('/api/categories', payload);

      toast.success(`Category "${name}" created successfully!`);
      
      // Clear the form
      setName('');
      setSlug('');
      setApplicableFields('');
      
      // Refresh the list of categories
      fetchCategories();

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 pt-24 max-w-4xl">
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Categories</h1>
        
        {/* --- Create Category Form --- */}
        <form onSubmit={handleCreateCategory} className="space-y-4 mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700">Create New Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Category Name (e.g., Venue)" 
              className="p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"
            />
            <input 
              type="text" 
              value={slug} 
              onChange={(e) => setSlug(e.target.value)} 
              placeholder="Slug (e.g., venue)" 
              className="p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <input 
              type="text" 
              value={applicableFields} 
              onChange={(e) => setApplicableFields(e.target.value)} 
              placeholder="Applicable Fields (comma separated, e.g., perPlate, capacity)" 
              className="w-full p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 disabled:bg-gray-400">
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </form>

        {/* --- Existing Categories List --- */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Existing Categories</h2>
          <div className="space-y-2">
            {categories.length > 0 ? categories.map(cat => (
              <div key={cat._id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                <span className="font-medium text-gray-800">{cat.name}</span>
                <span className="text-sm text-gray-500">Fields: {cat.applicableFields.join(', ')}</span>
              </div>
            )) : <p>No categories found.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CategoryManager;