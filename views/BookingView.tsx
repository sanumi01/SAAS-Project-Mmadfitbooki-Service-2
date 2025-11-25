
import React, { useState, useEffect, useCallback } from 'react';
import { TrainerSelector } from '../components/TrainerSelector';
import { Calendar } from '../components/Calendar';
import { TimeSlotPicker } from '../components/TimeSlotPicker';
import { BookingForm } from '../components/BookingForm';
import { Confirmation } from '../components/Confirmation';
import { Spinner } from '../components/common/Spinner';
import * as api from '../services/bookingService';
import type { Trainer, TimeSlot, Booking, MonthAvailability } from '../types';
import { AppView, type AppViewType } from '../constants';
import { useNotification } from '../contexts/NotificationContext';

interface BookingViewProps {
  setView: (view: AppViewType) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ setView }) => {
  const [step, setStep] = useState(1);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(true);

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[] | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [availabilitySummary, setAvailabilitySummary] = useState<string | null>(null);
  
  const [monthAvailability, setMonthAvailability] = useState<MonthAvailability>({});
  const [calendarMonth, setCalendarMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalBooking, setFinalBooking] = useState<Booking | null>(null);
  
  const { addNotification } = useNotification();

  useEffect(() => {
    api.fetchTrainers().then(data => {
      setTrainers(data);
      setIsLoadingTrainers(false);
    });
  }, []);
  
  const handleSelectTrainer = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setSelectedTime(null);
    setTimeSlots(null);
    setAvailabilitySummary(null);
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setTimeSlots(null);
    setAvailabilitySummary(null);
  };
  
  const handleMonthChange = (newMonth: Date) => {
    setCalendarMonth(newMonth);
  };

  const fetchAndSetSlotsForDay = useCallback(async () => {
    if (selectedTrainer && selectedDate) {
      setIsLoadingSlots(true);
      setTimeSlots(null);
      setAvailabilitySummary(null);
      const slots = await api.fetchAvailability(selectedTrainer.id, selectedDate);
      setTimeSlots(slots);
      const availableCount = slots.filter(s => s.available).length;
      setAvailabilitySummary(availableCount > 0 ? `${availableCount} slots available` : 'No slots available for this day');
      setIsLoadingSlots(false);
    }
  }, [selectedTrainer, selectedDate]);
  
  useEffect(() => {
    fetchAndSetSlotsForDay();
  }, [fetchAndSetSlotsForDay]);
  
  useEffect(() => {
    const fetchMonthData = async () => {
      if (selectedTrainer) {
        setIsLoadingMonth(true);
        setMonthAvailability({}); // Clear old data
        const data = await api.fetchMonthAvailability(selectedTrainer.id, calendarMonth);
        setMonthAvailability(data);
        setIsLoadingMonth(false);
      }
    };
    fetchMonthData();
  }, [selectedTrainer, calendarMonth]);


  const handleSubmitBooking = async (details: { name: string; email: string; phone: string; sendEmailConfirmation: boolean; reminderEmail: boolean; reminderSms: boolean; cancellationPolicy?: string; }) => {
    if (!selectedTrainer || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    
    const price = selectedTrainer.rate;
    const fee = price * 0.02;

    const bookingData = {
      trainerId: selectedTrainer.id,
      date: selectedDate,
      time: selectedTime,
      clientName: details.name,
      clientEmail: details.email,
      clientPhone: details.phone,
      price,
      fee,
      sendEmailConfirmation: details.sendEmailConfirmation,
      reminderEmail: details.reminderEmail,
      reminderSms: details.reminderSms,
      cancellationPolicy: details.cancellationPolicy,
    };
    
    const response = await api.submitBooking(bookingData);

    setFinalBooking({
        ...bookingData,
        trainer: selectedTrainer,
        bookingId: response.bookingId,
    });
    addNotification('Booking confirmed!', 'success');
    setIsSubmitting(false);
    setStep(2); // Move to confirmation
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedTrainer(null);
    setSelectedDate(new Date());
    setSelectedTime(null);
    setTimeSlots(null);
    setFinalBooking(null);
    setAvailabilitySummary(null);
  };

  if (isLoadingTrainers) {
    return <div className="flex justify-center items-center h-96"><Spinner size="16"/></div>;
  }

  if (step === 2 && finalBooking) {
    return <Confirmation bookingDetails={finalBooking} onNewBooking={resetBooking} setView={setView} />;
  }

  return (
    <div className="space-y-8 animate-fade-in p-4 rounded shadow-sm bg-muted">
      <TrainerSelector
        trainers={trainers}
        selectedTrainer={selectedTrainer}
        onSelectTrainer={handleSelectTrainer}
      />
      {selectedTrainer && (
        <div className="grid md:grid-cols-2 gap-8">
            <Calendar 
                selectedDate={selectedDate} 
                onDateSelect={handleDateSelect}
                availabilitySummary={isLoadingSlots ? 'Checking...' : availabilitySummary}
                monthAvailability={monthAvailability}
                currentMonth={calendarMonth}
                onMonthChange={handleMonthChange}
            />
            <TimeSlotPicker 
                timeSlots={timeSlots}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                isLoading={isLoadingSlots}
            />
        </div>
      )}
      {selectedTrainer && selectedDate && selectedTime && (
        <BookingForm 
          price={selectedTrainer.rate} 
          onSubmit={handleSubmitBooking} 
          isSubmitting={isSubmitting} 
        />
      )}
    </div>
  );
};
