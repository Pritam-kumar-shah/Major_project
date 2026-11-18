import React from 'react';

const MakeupArtistDetailsForm = ({ details, handleChange }) => (
  <div className="space-y-4 pt-4 border-t border-gray-200 mt-4 animate-fade-in">
    <h4 className="font-semibold text-gray-600">Pricing Details</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input 
        type="number" 
        name="startingPackagePrice" 
        value={details.startingPackagePrice || ''} 
        onChange={handleChange} 
        placeholder="Starting Bridal Package (₹)" 
        className="p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"
      />
      <input 
        type="number" 
        name="pricePerSession" 
        value={details.pricePerSession || ''} 
        onChange={handleChange} 
        placeholder="Price per Session (e.g., Sangeet)" 
        className="p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"
      />
    </div>
    <div className="flex items-center gap-3 pt-2">
        <input 
            type="checkbox"
            id="travelsToVenue"
            name="travelsToVenue"
            checked={!!details.travelsToVenue} // Use !! to convert value to boolean
            onChange={handleChange}
            className="h-5 w-5 rounded text-pink-500 focus:ring-pink-500"
        />
        <label htmlFor="travelsToVenue" className="font-medium text-gray-700">
            Available to travel to the venue?
        </label>
    </div>
  </div>
);

export default MakeupArtistDetailsForm;
