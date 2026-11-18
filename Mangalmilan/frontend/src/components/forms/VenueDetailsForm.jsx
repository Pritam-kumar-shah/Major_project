import React from 'react';

const VenueDetailsForm = ({ details, handleChange }) => (
  <div className="space-y-4 pt-4 border-t border-gray-200 mt-4 animate-fade-in">
    <h4 className="font-semibold text-gray-600">Pricing per Plate</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input type="number" name="perPlateVeg" value={details.perPlateVeg || ''} onChange={handleChange} placeholder="Veg Price / Plate" className="p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"/>
      <input type="number" name="perPlateNonVeg" value={details.perPlateNonVeg || ''} onChange={handleChange} placeholder="Non-Veg Price / Plate" className="p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-pink-500"/>
    </div>
    <h4 className="font-semibold text-gray-600">Venue Details</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <input type="number" name="rentalPrice" value={details.rentalPrice || ''} onChange={handleChange} placeholder="Rental Price / Day" className="p-3 rounded-lg bg-gray-100"/>
       <input type="number" name="capacity" value={details.capacity || ''} onChange={handleChange} placeholder="Guest Capacity" className="p-3 rounded-lg bg-gray-100"/>
       <input type="number" name="roomCount" value={details.roomCount || ''} onChange={handleChange} placeholder="Rooms Available" className="p-3 rounded-lg bg-gray-100"/>
    </div>
  </div>
);
export default VenueDetailsForm;