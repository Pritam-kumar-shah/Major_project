import React from 'react';

const DJMusicDetailsForm = ({ details, handleChange }) => (
  <div className="space-y-4 pt-4 border-t border-gray-200 mt-4 animate-fade-in">
    <h4 className="font-semibold text-gray-600">Pricing Details</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input 
        type="number" 
        name="pricePerEvent" 
        value={details.pricePerEvent || ''} 
        onChange={handleChange} 
        placeholder="Price per Event (e.g., Sangeet)" 
        className="p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"
      />
      <input 
        type="number" 
        name="startingPackagePrice" 
        value={details.startingPackagePrice || ''} 
        onChange={handleChange} 
        placeholder="Starting Wedding Package (₹)" 
        className="p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"
      />
    </div>
  </div>
);

export default DJMusicDetailsForm;