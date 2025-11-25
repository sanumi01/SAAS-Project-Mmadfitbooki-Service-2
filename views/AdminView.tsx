

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AvailabilityManager } from '../components/AvailabilityManager';
import { Card } from '../components/common/Card';
import { TrainerSelector } from '../components/TrainerSelector';
import * as staffService from '../services/staffService';
import * as settingsService from '../services/settingsService';
import * as bookingService from '../services/bookingService';
import * as authService from '../services/authService';
import type { Trainer, AppSettings, Booking, UserRole } from '../types';
import { StaffList } from '../components/StaffList';
import { StaffEditModal } from '../components/StaffEditModal';
import { useNotification } from '../contexts/NotificationContext';
import { SearchIcon } from '../components/icons/SearchIcon';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { BookingList } from '../components/BookingList';
import { BookingEditModal } from '../components/BookingEditModal';
import { CloseIcon } from '../components/icons/CloseIcon';
import { AdminViewTab, AdminViewTabType } from '../constants';
import { DashboardView, type TrialStatus } from './admin/DashboardView';
import { useAuth } from '../contexts/AuthContext';

type StaffFormData = Omit<Trainer, 'id'> & { email?: string; password?: string };

const SettingsTextarea: React.FC<{id: keyof AppSettings, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, rows?: number, hint?: string}> = 
({id, label, value, onChange, rows=3, hint}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-primary/80 mb-1">{label}</label>
        <textarea
            id={id}
            name={id}
            rows={rows}
            value={value}
            onChange={onChange}
            className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition text-sm"
        />
        {hint && <p className="text-xs text-text-primary/80 mt-1">{hint}</p>}
    </div>
);

const AdminTabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={
          
          
          
          
          
          
          
          `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 border-b-2 ${
            isActive
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-text-primary/80 hover:text-text-primary'
        } focus-ring`}
    >
        {label}
    </button>
);


export const ManagementView: React.FC = () => {
  const { currentUser } = useAuth();

  const allTabs = useMemo(() => [
      { key: AdminViewTab.DASHBOARD, label: 'Dashboard', roles: ['ADMIN', 'STAFF'] },
      { key: AdminViewTab.BOOKINGS, label: 'Bookings', roles: ['ADMIN', 'STAFF'] },
      { key: AdminViewTab.STAFF, label: 'Staff', roles: ['ADMIN'] },
      { key: AdminViewTab.SETTINGS, label: 'Settings & Availability', roles: ['ADMIN'] },
  ], []);

  const availableTabs = useMemo(() => {
    return allTabs.filter(tab => tab.roles.includes(currentUser?.role as UserRole));
  }, [currentUser, allTabs]);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<AdminViewTabType>(AdminViewTab.DASHBOARD);
  
  // Set default tab based on role
  useEffect(() => {
    if (currentUser?.role === 'STAFF') {
        setActiveTab(AdminViewTab.BOOKINGS);
    } else {
        setActiveTab(AdminViewTab.DASHBOARD);
    }
  }, [currentUser]);

  // Trial State
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);

  // Staff state
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [staffSearchInput, setStaffSearchInput] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [isStaffConfirmOpen, setIsStaffConfirmOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<Trainer | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState(settingsService.getSettings());
  
  // Availability state
  const [selectedTrainerForAvailability, setSelectedTrainerForAvailability] = useState<Trainer | null>(null);

  // Bookings state
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [bookingSearchInput, setBookingSearchInput] = useState('');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [isBookingEditModalOpen, setIsBookingEditModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  const [isBookingCancelConfirmOpen, setIsBookingCancelConfirmOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const { addNotification } = useNotification();

  const loadData = useCallback(() => {
    const staffData = staffService.getTrainers();
    setTrainers(staffData);
    const bookingData = bookingService.getBookings();
    setAllBookings(bookingData);

    // Load trial data for admin
    if (currentUser?.role === 'ADMIN') {
        const startDate = authService.getTrialStartDate();
        const staffCount = authService.getStaffAndAdminCount();
        if (startDate) {
            const TRIAL_DURATION_DAYS = 28;
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + TRIAL_DURATION_DAYS);
            const diff = endDate.getTime() - new Date().getTime();
            const daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
            setTrialStatus({ daysRemaining, staffCount, maxStaff: 4 });
        }
    }

  }, [currentUser?.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  useEffect(() => {
      const timer = setTimeout(() => setStaffSearchTerm(staffSearchInput), 300);
      return () => clearTimeout(timer);
  }, [staffSearchInput]);
  
  useEffect(() => {
      const timer = setTimeout(() => setBookingSearchTerm(bookingSearchInput), 300);
      return () => clearTimeout(timer);
  }, [bookingSearchInput]);

  useEffect(() => {
    const lowercasedFilter = staffSearchTerm.toLowerCase();
    const filtered = trainers.filter(trainer =>
        trainer.name.toLowerCase().includes(lowercasedFilter) ||
        trainer.specialty.toLowerCase().includes(lowercasedFilter) ||
        trainer.bio.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredTrainers(filtered);
  }, [staffSearchTerm, trainers]);

  useEffect(() => {
    const lowercasedFilter = bookingSearchTerm.toLowerCase();
    const filtered = allBookings.filter(booking =>
        booking.clientName.toLowerCase().includes(lowercasedFilter) ||
        booking.trainer.name.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredBookings(filtered.sort((a, b) => b.date.getTime() - a.date.getTime()));
  }, [bookingSearchTerm, allBookings]);


  const handleAddStaff = () => {
    setEditingTrainer(null);
    setIsStaffModalOpen(true);
  };
  
  const handleEditStaff = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setIsStaffModalOpen(true);
  };

  const handleDeleteStaff = (trainer: Trainer) => {
    setTrainerToDelete(trainer);
    setIsStaffConfirmOpen(true);
  };
  
  const confirmDeleteStaff = () => {
    if (trainerToDelete) {
      // Note: This only deletes the trainer profile, not the user login.
      // A more robust system would handle this link.
      staffService.deleteTrainer(trainerToDelete.id);
      addNotification('Staff member deleted.', 'success');
      loadData();
      if(selectedTrainerForAvailability?.id === trainerToDelete.id) {
        setSelectedTrainerForAvailability(null);
      }
    }
    setIsStaffConfirmOpen(false);
    setTrainerToDelete(null);
  };

  const handleSaveStaff = async (data: StaffFormData | Trainer) => {
    const isEditing = 'id' in data;

    if (isEditing) {
        staffService.updateTrainer(data);
        addNotification(`Staff member updated successfully!`, 'success');
    } else {
        // This is a new staff member
        const { email, password, ...profileData } = data as StaffFormData;
        if (!email || !password) {
            addNotification('Email and password are required for new staff.', 'error');
            return;
        }

        try {
            // 1. Create the user login account
            const newUser = await authService.createUser({ name: profileData.name, email, role: 'STAFF' }, password);
            
            // 2. Create the public trainer profile, linking it with the new user's ID
            staffService.addTrainer(profileData, newUser.id);

            addNotification(`Staff account for ${profileData.name} created!`, 'success');
        } catch (error: any) {
            console.error("Failed to create staff:", error);
            addNotification(error.message, 'error');
            return; // Stop execution if user creation fails
        }
    }
    
    loadData();
    setIsStaffModalOpen(false);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSettings = { ...settings, [e.target.name]: e.target.value };
    setSettings(newSettings as AppSettings);
  }

  const handleSaveSettings = () => {
    settingsService.saveSettings(settings);
    addNotification('Settings saved successfully!', 'success');
  }

  const handleRescheduleBooking = (booking: Booking) => {
    setBookingToEdit(booking);
    setIsBookingEditModalOpen(true);
  };

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsBookingCancelConfirmOpen(true);
  };
  
  const confirmCancelBooking = () => {
    if (bookingToCancel?.bookingId) {
        bookingService.cancelBooking(bookingToCancel.bookingId);
        addNotification(`Booking for ${bookingToCancel.clientName} cancelled.`, 'success');
        loadData();
    }
    setIsBookingCancelConfirmOpen(false);
    setBookingToCancel(null);
  };

  const handleSaveRescheduledBooking = (updatedBooking: Booking) => {
    bookingService.updateBooking(updatedBooking);
    addNotification('Booking successfully rescheduled!', 'success');
    loadData();
    setIsBookingEditModalOpen(false);
  };

  const isAddStaffDisabled = trialStatus ? (trialStatus.daysRemaining <= 0 || trialStatus.staffCount >= trialStatus.maxStaff) : false;

  const renderContent = () => {
      switch(activeTab) {
          case AdminViewTab.DASHBOARD:
              return <DashboardView trialStatus={trialStatus} />;
          case AdminViewTab.BOOKINGS:
              return (
                 <Card>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Client Bookings Management</h2>
                    <div className="relative mb-4">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="w-5 h-5 text-text-primary/80" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search by client or trainer name..."
                          value={bookingSearchInput}
                          onChange={(e) => setBookingSearchInput(e.target.value)}
                          className="w-full bg-background-dark border border-border-dark rounded pl-10 pr-4 py-2 text-text-primary focus-ring transition"
                        />
                    </div>
                    <BookingList bookings={filteredBookings} onReschedule={handleRescheduleBooking} onCancel={handleCancelBooking} />
                 </Card>
              );
          case AdminViewTab.STAFF:
              return (
                <Card>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-text-primary">Staff Management</h2>
                    <button
                      type="button"
                      onClick={handleAddStaff}
                      disabled={isAddStaffDisabled}
                      title={isAddStaffDisabled ? 'Staff limit reached or trial expired' : 'Add new staff'}
                      className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-secondary transition-colors disabled:bg-border-dark disabled:cursor-not-allowed focus-ring"
                    >
                      + Add New Staff
                    </button>
                  </div>
                  <div className="relative mb-4">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <SearchIcon className="w-5 h-5 text-text-primary/80" />
                      </span>
                        <input
                          type="text"
                          placeholder="Search by name, specialty, or bio..."
                          value={staffSearchInput}
                          onChange={(e) => setStaffSearchInput(e.target.value)}
                          className="w-full bg-background-dark border border-border-dark rounded pl-10 pr-10 py-2 text-text-primary focus-ring transition"
                        />
                      {staffSearchInput && (
                        <button 
                          type="button"
                          onClick={() => setStaffSearchInput('')} 
                          className="absolute inset-y-0 right-0 flex items-center pr-3 focus-ring"
                          aria-label="Clear search"
                        >
                            <CloseIcon className="w-5 h-5 text-text-primary/80 hover:text-text-primary" />
                        </button>
                      )}
                  </div>
                  <StaffList trainers={filteredTrainers} onEdit={handleEditStaff} onDelete={handleDeleteStaff} />
                </Card>
              );
          case AdminViewTab.SETTINGS:
              return (
                <div className="space-y-8">
                  <Card>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Business Settings</h2>
                    <div className="space-y-4">
                      <SettingsTextarea id="defaultCancellationPolicy" label="Default Cancellation Policy" value={settings.defaultCancellationPolicy} onChange={handleSettingsChange} />
                      <SettingsTextarea id="emailConfirmationTemplate" label="Email Confirmation Template" value={settings.emailConfirmationTemplate} onChange={handleSettingsChange} rows={5} hint="Use placeholders like {{clientName}}, {{trainerName}}, {{date}}, {{time}}."/>
                      <SettingsTextarea id="smsReminderTemplate" label="SMS Reminder Template" value={settings.smsReminderTemplate} onChange={handleSettingsChange} hint="Keep SMS messages concise to stay within standard character limits." />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveSettings}
                          className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-secondary transition-colors focus-ring"
                        >
                          Save Settings
                        </button>
                      </div>
                    </div>
                  </Card>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Availability Management</h2>
                    <p className="text-sm text-text-primary/80 mb-4">Select a staff member below to view and edit their weekly schedule. This list respects the staff search filter.</p>
                    <TrainerSelector trainers={filteredTrainers} selectedTrainer={selectedTrainerForAvailability} onSelectTrainer={setSelectedTrainerForAvailability} />
                  </div>
                  <AvailabilityManager selectedTrainer={selectedTrainerForAvailability} />
                </div>
              );
      }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Management Console</h1>
        <p className="text-text-primary/80">Manage business settings, staff, bookings, and availability.</p>
      </div>

      <div className="border-b border-border-dark">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            {availableTabs.map(tab => (
                 <AdminTabButton key={tab.key} label={tab.label} isActive={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} />
            ))}
        </nav>
      </div>

      <div>
        {renderContent()}
      </div>

      {/* Modals */}
      <StaffEditModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSave={handleSaveStaff}
        trainerToEdit={editingTrainer}
      />
      
      <ConfirmationModal
        isOpen={isStaffConfirmOpen}
        onClose={() => setIsStaffConfirmOpen(false)}
        onConfirm={confirmDeleteStaff}
        title={`Confirm Deletion: ${trainerToDelete?.name}`}
        confirmText="Yes, Delete Staff"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      >
        Are you sure you want to delete <strong>{trainerToDelete?.name}</strong>? This action cannot be undone.
      </ConfirmationModal>
      
      <BookingEditModal
          isOpen={isBookingEditModalOpen}
          onClose={() => setIsBookingEditModalOpen(false)}
          onSave={handleSaveRescheduledBooking}
          bookingToEdit={bookingToEdit}
      />

      <ConfirmationModal
        isOpen={isBookingCancelConfirmOpen}
        onClose={() => setIsBookingCancelConfirmOpen(false)}
        onConfirm={confirmCancelBooking}
        title="Confirm Cancellation"
        confirmText="Yes, Cancel Booking"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      >
        Are you sure you want to cancel the appointment for <strong>{bookingToCancel?.clientName}</strong>? This action cannot be undone.
      </ConfirmationModal>
    </div>
  );
};