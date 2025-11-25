
import React from 'react';
import { Card } from '../components/common/Card';
import { AppView, type AppViewType } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';
import { HistoryIcon } from '../components/icons/HistoryIcon';

interface CustomerDashboardViewProps {
    setView: (view: AppViewType) => void;
}

const ActionCard: React.FC<{title: string, description: string, icon: React.ReactNode, onClick: () => void}> = ({ title, description, icon, onClick }) => (
    <button type="button" onClick={onClick} className="cursor-pointer bg-surface-dark border border-border-dark rounded-lg p-6 flex items-center gap-6 hover:border-brand-primary hover:bg-brand-secondary/10 transition-all duration-200 transform hover:-translate-y-1 shadow-sm focus-ring">
        <div className="p-3 rounded-full bg-gradient-to-br from-brand-light to-brand-accent inline-flex items-center justify-center shadow-md">
            <div className="text-white">{icon}</div>
        </div>
        <div>
            <h3 className="text-xl font-bold text-text-primary">{title}</h3>
            <p className="text-text-primary/80 mt-1">{description}</p>
        </div>
    </button>
);

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({ setView }) => {
    const { currentUser } = useAuth();

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome, {currentUser?.name.split(' ')[0] || 'Customer'}!</h1>
                <p className="text-text-primary/80">What would you like to do today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ActionCard
                        title="Book a New Appointment"
                        description="Schedule a session with one of our expert trainers."
                        icon={<CalendarDaysIcon className="w-8 h-8"/>}
                        onClick={() => setView(AppView.BOOKING)}
                    />
                    <ActionCard
                        title="View Booking History"
                        description="Review your upcoming and past appointments."
                        icon={<HistoryIcon className="w-8 h-8"/>}
                        onClick={() => setView(AppView.HISTORY)}
                    />
            </div>
            
             <Card>
                <h2 className="text-2xl font-bold text-text-primary mb-4">Quick Links</h2>
                <div className="flex flex-wrap gap-4">
                    <button type="button" onClick={() => setView(AppView.WORKOUT_PLANNER)} className="px-3 py-2 bg-brand-primary text-white rounded-md hover:opacity-90 shadow-sm focus-ring">AI Workout Planner</button>
                    <button type="button" onClick={() => setView(AppView.ACCOUNT)} className="px-3 py-2 border border-brand-primary text-brand-primary rounded-md hover:bg-brand-primary/5 font-semibold focus-ring">My Account</button>
                </div>
            </Card>
        </div>
    );
};