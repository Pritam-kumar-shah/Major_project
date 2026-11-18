import React from 'react';

const CatererDetailsForm = ({ details, handleChange }) => (
  <div className="space-y-4 pt-4 border-t border-gray-200 mt-4 animate-fade-in">
    <h4 className="font-semibold text-gray-600">Pricing per Plate</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <input 
        type="number" 
        name="perPlateVeg" 
        value={details.perPlateVeg || ''} 
        onChange={handleChange} 
        placeholder="Veg Price / Plate (₹)" 
        className="p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"
      />
      <input 
        type="number" 
        name="perPlateNonVeg" 
        value={details.perPlateNonVeg || ''} 
        onChange={handleChange} 
        placeholder="Non-Veg Price / Plate (₹)" 
        className="p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"
      />
      <input 
        type="number" 
        name="minGuests" 
        value={details.minGuests || ''} 
        onChange={handleChange} 
        placeholder="Minimum Guests" 
        className="p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"
      />
    </div>
  </div>
);

export default CatererDetailsForm;