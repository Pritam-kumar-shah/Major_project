import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';

export default function VendorCalendarPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Backend से सिर्फ confirmed bookings fetch करें
                const { data } = await apiClient.get('/api/bookings/vendor'); //
                
                // Calendar के लिए data को सही format में map करें
                const calendarEvents = data
                    .filter(b => b.status === 'CONFIRMED')
                    .map(b => ({
                        // FullCalendar 'id', 'title', और 'date' मांगता है
                        id: b._id,
                        title: `${b.customerInfo.name} - ${b.serviceInfo.name}`,
                        start: b.bookingDateTime, // यह field date और time दोनों रखता है
                        allDay: false, // क्योंकि इसमें specific time है
                        backgroundColor: '#10B981', // Green for confirmed
                        borderColor: '#059669',
                    }));
                
                setEvents(calendarEvents);
            } catch (err) {
                toast.error("Failed to load booking data.");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div className="text-center py-20 pt-24">Loading Calendar...</div>;

    return (
        <div className="container mx-auto p-4 pt-24 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Booking Calendar View 🗓️</h1>
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth" // Default view month ka hoga
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek' // User week/month view badal sakta hai
                    }}
                    events={events} // API से आया हुआ data
                    editable={false} // Events ko drag-and-drop na kar payein
                    height="auto" // Height screen ke hisaab se adjust ho jayegi
                    eventDisplay="block"
                    // Event click par details dikhane ke liye (optional)
                    eventClick={(clickInfo) => {
                        alert(`Booking: ${clickInfo.event.title} on ${clickInfo.event.start.toLocaleTimeString()}`);
                    }}
                />
            </div>
        </div>
    );
}