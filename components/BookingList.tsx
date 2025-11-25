import React from 'react';
import type { Booking } from '../types';

interface BookingListProps {
  bookings: Booking[];
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}

export const BookingList: React.FC<BookingListProps> = ({ bookings, onReschedule, onCancel }) => {
  if (bookings.length === 0) {
    return <p className="text-text-primary/80 text-center p-4">No bookings found.</p>;
  }
  
  const now = new Date();
  now.setHours(0,0,0,0);

  return (
    <div className="overflow-x-auto rounded shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-background-dark">
          <tr>
            <th className="p-3 text-sm font-semibold text-text-primary/80">Client</th>
            <th className="p-3 text-sm font-semibold text-text-primary/80">Trainer</th>
            <th className="p-3 text-sm font-semibold text-text-primary/80">Date & Time</th>
            <th className="p-3 text-sm font-semibold text-text-primary/80">Status</th>
            <th className="p-3 text-sm font-semibold text-text-primary/80 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.bookingId} className={`border-b border-border-dark last:border-0 ${booking.date < now ? 'opacity-60' : ''}`}>
              <td className="p-3 text-text-primary font-medium">{booking.clientName}</td>
              <td className="p-3 text-text-primary/80">{booking.trainer.name}</td>
              <td className="p-3 text-text-primary/80">
                  <div>{booking.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  <div className="text-xs">{new Date(`1970-01-01T${booking.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
              </td>
              <td className="p-3">
                {booking.date < now ? 
                  <span className="inline-block text-xs font-medium bg-border-dark text-text-primary/80 px-2.5 py-1 rounded-full">Past</span> : 
                  <span className="inline-block text-xs font-medium bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full">Upcoming</span>
                }
              </td>
              <td className="p-3 text-right">
                <div className="flex justify-end items-center gap-2">
                    {booking.date >= now && (
                        <>
                            <button
                              onClick={() => onReschedule(booking)}
                              className="text-brand-primary hover:underline text-sm font-semibold focus-ring"
                              type="button"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => onCancel(booking)}
                              className="text-red-500 hover:underline text-sm font-semibold focus-ring"
                              type="button"
                            >
                              Cancel
                            </button>
                        </>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};