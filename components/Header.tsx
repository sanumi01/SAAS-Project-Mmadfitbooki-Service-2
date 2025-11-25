import React from 'react';
import { AppView, type AppViewType } from '../constants';
import type { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LogoutIcon } from './icons/LogoutIcon';
import { MMADLogo } from './MMADLogo';

interface HeaderProps {
  currentView: AppViewType;
  setView: (view: AppViewType) => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
      type="button"
      onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus-ring ${
      isActive
        ? 'bg-brand-primary text-white shadow-sm ring-2 ring-offset-2 ring-brand-primary'
        : 'text-text-primary/80 hover:bg-surface-dark hover:text-text-primary'
    }`}
  >
    {label}
  </button>
);


export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const { currentUser, logout } = useAuth();

  const getNavs = (user: User | null) => {
    if (!user) { // Guest users
      return [{ label: "Book Appointment", view: AppView.BOOKING }];
    }

    switch(user.role) {
        case 'ADMIN': 
          return [
            { label: "Management", view: AppView.MANAGEMENT },
            { label: "Schedule Overview", view: AppView.SCHEDULE },
            { label: "Walk-in Queue", view: AppView.QUEUE },
          ];
        case 'STAFF': 
          return [
            { label: "Dashboard", view: AppView.STAFF_DASHBOARD },
            { label: "Schedule", view: AppView.SCHEDULE },
            { label: "Walk-in Queue", view: AppView.QUEUE },
          ];
        case 'CUSTOMER': 
          return [
            { label: "Dashboard", view: AppView.CUSTOMER_DASHBOARD },
            { label: "Book Appointment", view: AppView.BOOKING },
            { label: "Workout Planner", view: AppView.WORKOUT_PLANNER },
            { label: "Booking History", view: AppView.HISTORY },
            { label: "My Account", view: AppView.ACCOUNT },
          ];
        default: 
          return [];
    }
  };
  
  const availableNavs = getNavs(currentUser);

  return (
  <header className="bg-surface-dark/80 backdrop-blur-sm sticky top-0 z-10 w-full border-b border-border-dark shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
              <div className="flex items-center gap-3">
                {/* Larger logo with text for better readability */}
                <MMADLogo size="lg" showText={true} className="select-none" />
                <div className="hidden sm:block">
                  <div className="text-sm text-text-primary/80">Smart Fitness Scheduling</div>
                </div>
              </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center space-x-1 bg-background-dark p-1 rounded-lg">
                {availableNavs.map(nav => (
                    <NavButton key={nav.view} label={nav.label} isActive={currentView === nav.view} onClick={() => setView(nav.view)} />
                ))}
            </div>
            {currentUser ? (
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-text-primary">{currentUser.name}</p>
                        <p className="text-xs text-brand-primary font-semibold">{currentUser.role}</p>
                    </div>
                    <button type="button" onClick={logout} className="p-2 text-text-primary/80 hover:text-text-primary rounded-full hover:bg-surface-dark transition-colors focus-ring" aria-label="Logout">
                        <LogoutIcon className="w-6 h-6" />
                    </button>
                </div>
            ) : (
                <div className="hidden md:flex">
                    <NavButton label="Login" isActive={currentView === AppView.LOGIN} onClick={() => setView(AppView.LOGIN)} />
                </div>
            )}
          </div>
        </div>
        <div className="md:hidden flex items-center justify-between py-2 space-x-1">
             <div className="flex items-center space-x-1 overflow-x-auto">
                 {availableNavs.map(nav => (
                  <NavButton key={nav.view} label={nav.label} isActive={currentView === nav.view} onClick={() => setView(nav.view)} />
                ))}
            </div>
             {!currentUser && (
                 <NavButton label="Login" isActive={currentView === AppView.LOGIN} onClick={() => setView(AppView.LOGIN)} />
             )}
        </div>
      </nav>
    </header>
  );
};