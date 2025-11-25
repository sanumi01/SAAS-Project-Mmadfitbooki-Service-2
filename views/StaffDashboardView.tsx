
import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { AppView, type AppViewType } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';
import { UserGroupIcon } from '../components/icons/UserGroupIcon';
import { getBookings } from '../services/bookingService';
import * as staffService from '../services/staffService';
import type { Booking, Trainer } from '../types';
import { Spinner } from '../components/common/Spinner';
import { StaffEditModal } from '../components/StaffEditModal';
import { useNotification } from '../contexts/NotificationContext';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';

interface StaffDashboardViewProps {
    setView: (view: AppViewType) => void;
}

const ActionCard: React.FC<{title: string, description: string, icon: React.ReactNode, onClick: () => void}> = ({ title, description, icon, onClick }) => (
    <button type="button" onClick={onClick} className="cursor-pointer bg-surface-dark border border-border-dark rounded-lg p-6 flex items-center gap-6 hover:border-brand-primary hover:bg-brand-secondary/10 transition-all duration-200 transform hover:scale-[1.02] focus-ring">
        <div className="text-brand-primary bg-brand-primary/20 p-4 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-text-primary">{title}</h3>
            <p className="text-text-primary/80 mt-1">{description}</p>
        </div>
    </button>
);

const UpcomingBookingRow: React.FC<{booking: Booking}> = ({booking}) => (
    <div className="flex items-center justify-between p-3 bg-background-dark rounded-md">
        <div>
            <p className="font-semibold text-text-primary">{booking.clientName}</p>
            <p className="text-sm text-text-primary/80">with {booking.trainer.name}</p>
        </div>
        <div className="text-right">
            <p className="font-mono text-sm text-text-primary">{new Date(`1970-01-01T${booking.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
            <p className="text-xs text-text-primary/80">{booking.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
        </div>
    </div>
);

export const StaffDashboardView: React.FC<StaffDashboardViewProps> = ({ setView }) => {
    const { currentUser } = useAuth();
    const { addNotification } = useNotification();
    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [myProfile, setMyProfile] = useState<Trainer | null>(null);
    
    const loadData = () => {
        // Load bookings
        const allBookings = getBookings();
        const now = new Date();
        const upcoming = allBookings
            .filter(b => new Date(`${b.date.toISOString().split('T')[0]}T${b.time}`) >= now)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
        setUpcomingBookings(upcoming);
        
        // Load staff's own profile
        if(currentUser) {
            const profile = staffService.getTrainers().find(t => t.id === currentUser.id);
            setMyProfile(profile || null);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [currentUser]);
    
    const handleSaveMyProfile = (updatedProfile: Trainer) => {
        staffService.updateTrainer(updatedProfile);
        addNotification('Your profile has been updated!', 'success');
        setIsProfileModalOpen(false);
        // Refresh data after save
        loadData();
    };

    return (
        <>
            <div className="space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome, {currentUser?.name.split(' ')[0] || 'Staff'}!</h1>
                    <p className="text-text-primary/80">Here's a look at what's happening today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ActionCard 
                        title="View Full Schedule"
                        description="See all trainer availability for any day."
                        icon={<CalendarDaysIcon className="w-8 h-8"/>}
                        onClick={() => setView(AppView.SCHEDULE)}
                    />
                     <ActionCard 
                        title="Manage Walk-in Queue"
                        description="Add and manage clients waiting for walk-in sessions."
                        icon={<UserGroupIcon className="w-8 h-8"/>}
                        onClick={() => setView(AppView.QUEUE)}
                    />
                     <ActionCard 
                        title="My Profile"
                        description="Edit your public profile and session rate."
                        icon={<UserCircleIcon className="w-8 h-8"/>}
                        onClick={() => setIsProfileModalOpen(true)}
                    />
                </div>
                
                 <Card>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Upcoming Appointments</h2>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Spinner /></div>
                    ) : upcomingBookings.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {upcomingBookings.map(booking => <UpcomingBookingRow key={booking.bookingId} booking={booking} />)}
                        </div>
                    ) : (
                        <p className="text-text-primary/80 text-center py-4">No upcoming appointments found.</p>
                    )}
                </Card>
            </div>
            
            <StaffEditModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                onSave={handleSaveMyProfile as (data: any) => void}
                trainerToEdit={myProfile}
            />
        </>
    );
};