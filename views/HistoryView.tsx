import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import * as api from '../services/bookingService';
import type { Booking } from '../types';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useNotification } from '../contexts/NotificationContext';

const BookingCard: React.FC<{ booking: Booking; isUpcoming: boolean; onCancel: (booking: Booking) => void; }> = ({ booking, isUpcoming, onCancel }) => {
    return (
        <Card className="bg-background-dark">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                    <img src={booking.trainer.imageUrl} alt={booking.trainer.name} className="w-24 h-24 rounded-full border-4 border-border-dark"/>
                </div>
                <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-start">
                        <div>
                           <p className="text-xl font-bold text-text-primary">{booking.trainer.name}</p>
                           <p className="font-semibold text-brand-primary">{booking.trainer.specialty}</p>
                        </div>
                        {isUpcoming && (
                            <button
                                type="button"
                                onClick={() => onCancel(booking)}
                                className="text-sm font-semibold text-red-500 hover:underline focus-ring"
                                aria-label={`Cancel booking ${booking.bookingId}`}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                    <div className="text-text-primary/80 text-sm pt-2">
                        <p><strong>Date:</strong> {booking.date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Time:</strong> {new Date(`1970-01-01T${booking.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                        <p><strong>Booking ID:</strong> {booking.bookingId}</p>
                        {isUpcoming && booking.cancellationPolicy && (
                             <p className="mt-2 text-xs italic border-l-2 border-border-dark pl-2"><strong>Policy:</strong> {booking.cancellationPolicy}</p>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

const EmptyState: React.FC<{ message: string, subMessage: string }> = ({ message, subMessage }) => (
    <Card className="bg-background-dark text-center py-10">
    <p className="text-text-primary/80 font-semibold">{message}</p>
    <p className="text-text-primary/80 text-sm mt-1">{subMessage}</p>
    </Card>
);


export const HistoryView: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
    const { addNotification } = useNotification();
    
    const loadBookings = useCallback(() => {
        const data = api.getBookings();
        setBookings(data.sort((a,b) => b.date.getTime() - a.date.getTime()));
        if(isLoading) setIsLoading(false);
    }, [isLoading]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const { upcomingBookings, pastBookings } = useMemo(() => {
        if (!bookings) return { upcomingBookings: [], pastBookings: [] };
        
        const now = new Date();
        now.setHours(0,0,0,0);

        const upcoming = bookings.filter(b => b.date >= now);
        const past = bookings.filter(b => b.date < now);
        
        return { upcomingBookings: upcoming.reverse(), pastBookings: past };
    }, [bookings]);

    const handleCancelClick = (booking: Booking) => {
        setBookingToCancel(booking);
    };
    
    const confirmCancellation = () => {
        if (bookingToCancel?.bookingId) {
            api.cancelBooking(bookingToCancel.bookingId);
            addNotification('Your booking has been cancelled.', 'success');
            loadBookings();
        }
        setBookingToCancel(null);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-96"><Spinner size="12" /></div>;
    }

    if (!bookings || bookings.length === 0) {
        return (
             <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Booking History</h1>
                    <p className="text-text-primary/80">Review your upcoming and past appointments.</p>
                </div>
                <EmptyState 
                    message="You haven't booked any appointments yet."
                    subMessage="Click 'Book Appointment' to get started."
                />
            </div>
        )
    }

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Booking History</h1>
                    <p className="text-text-primary/80">Review your upcoming and past appointments.</p>
                </div>
                
                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4 border-b border-border-dark pb-2">Upcoming Appointments</h2>
                        {upcomingBookings.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingBookings.map(b => <BookingCard key={b.bookingId} booking={b} isUpcoming={true} onCancel={handleCancelClick} />)}
                            </div>
                        ) : (
                            <p className="text-text-primary/80">You have no upcoming appointments.</p>
                        )}
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-text-primary mb-4 border-b border-border-dark pb-2">Past Appointments</h2>
                        {pastBookings.length > 0 ? (
                            <div className="space-y-4">
                                {pastBookings.map(b => <BookingCard key={b.bookingId} booking={b} isUpcoming={false} onCancel={() => {}} />)}
                            </div>
                        ) : (
                            <p className="text-text-primary/80">You have no past appointments.</p>
                        )}
                    </section>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!bookingToCancel}
                onClose={() => setBookingToCancel(null)}
                onConfirm={confirmCancellation}
                title="Confirm Cancellation"
                confirmText="Yes, Cancel Appointment"
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            >
                <p>Are you sure you want to cancel your appointment with <strong>{bookingToCancel?.trainer.name}</strong> on {bookingToCancel?.date.toLocaleDateString()}?</p>
                {bookingToCancel?.cancellationPolicy && (
                    <div className="mt-4 p-3 bg-background-dark border border-border-dark rounded-md">
                        <p className="font-semibold text-text-primary/80">Cancellation Policy:</p>
                        <p className="text-sm italic">{bookingToCancel.cancellationPolicy}</p>
                    </div>
                )}
            </ConfirmationModal>
        </>
    );
};