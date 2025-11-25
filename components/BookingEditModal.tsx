import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from './common/Modal';
import type { Booking, Trainer, TimeSlot, MonthAvailability } from '../types';
import * as api from '../services/bookingService';
import * as staffService from '../services/staffService';
import { Calendar } from './Calendar';
import { TimeSlotPicker } from './TimeSlotPicker';
import { Spinner } from './common/Spinner';

interface BookingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBooking: Booking) => void;
  bookingToEdit: Booking | null;
}

export const BookingEditModal: React.FC<BookingEditModalProps> = ({ isOpen, onClose, onSave, bookingToEdit }) => {
    const [allTrainers, setAllTrainers] = useState<Trainer[]>([]);
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[] | null>(null);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [monthAvailability, setMonthAvailability] = useState<MonthAvailability>({});
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    useEffect(() => {
        if (isOpen) {
            setAllTrainers(staffService.getTrainers());
            if (bookingToEdit) {
                setSelectedTrainer(bookingToEdit.trainer);
                setSelectedDate(bookingToEdit.date);
                setSelectedTime(bookingToEdit.time);
                setCalendarMonth(new Date(bookingToEdit.date.getFullYear(), bookingToEdit.date.getMonth(), 1));
            }
        }
    }, [isOpen, bookingToEdit]);

    const fetchAndSetSlotsForDay = useCallback(async () => {
        if (selectedTrainer && selectedDate) {
            setIsLoadingSlots(true);
            setTimeSlots(null);
            const slots = await api.fetchAvailability(selectedTrainer.id, selectedDate);
            setTimeSlots(slots);
            setIsLoadingSlots(false);
        }
    }, [selectedTrainer, selectedDate]);

    useEffect(() => {
        if(isOpen) fetchAndSetSlotsForDay();
    }, [isOpen, fetchAndSetSlotsForDay]);
    
    useEffect(() => {
        const fetchMonthData = async () => {
          if (selectedTrainer && isOpen) {
            setMonthAvailability({});
            const data = await api.fetchMonthAvailability(selectedTrainer.id, calendarMonth);
            setMonthAvailability(data);
          }
        };
        fetchMonthData();
    }, [selectedTrainer, calendarMonth, isOpen]);

    const handleSave = () => {
        if (bookingToEdit && selectedTrainer && selectedDate && selectedTime) {
            const updatedBooking: Booking = {
                ...bookingToEdit,
                trainer: selectedTrainer,
                date: selectedDate,
                time: selectedTime,
            };
            onSave(updatedBooking);
        }
    };
    
    const isSaveDisabled = !selectedTrainer || !selectedDate || !selectedTime || 
        (bookingToEdit?.trainer.id === selectedTrainer.id &&
         bookingToEdit?.date.getTime() === selectedDate.getTime() &&
         bookingToEdit?.time === selectedTime);

    if (!bookingToEdit) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Reschedule for ${bookingToEdit.clientName}`}>
            <div className="space-y-6">
                <div>
                    <label htmlFor="trainer-select" className="block text-sm font-medium text-text-primary/80 mb-1">Trainer</label>
                    <select
                        id="trainer-select"
                        aria-label="Select trainer"
                        value={selectedTrainer?.id || ''}
                        onChange={(e) => {
                            const newTrainer = allTrainers.find(t => t.id === e.target.value);
                            if(newTrainer) setSelectedTrainer(newTrainer);
                            setSelectedTime(null);
                        }}
                        className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition"
                    >
                        {allTrainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                
                {!selectedTrainer ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                         <Calendar 
                            selectedDate={selectedDate} 
                            onDateSelect={(date) => {
                                setSelectedDate(date);
                                setSelectedTime(null);
                            }}
                            monthAvailability={monthAvailability}
                            currentMonth={calendarMonth}
                            onMonthChange={setCalendarMonth}
                        />
                        <TimeSlotPicker 
                            timeSlots={timeSlots}
                            selectedTime={selectedTime}
                            onTimeSelect={setSelectedTime}
                            isLoading={isLoadingSlots}
                        />
                    </div>
                )}

                <div className="flex justify-end items-center gap-4 pt-4 border-t border-border-dark">
                    <button type="button" onClick={onClose} className="text-text-primary/80 font-semibold px-4 py-2 rounded-md hover:bg-border-dark focus-ring">
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={handleSave} 
                        disabled={isSaveDisabled}
                        className="bg-brand-primary text-white font-bold px-4 py-2 rounded-md hover:bg-brand-secondary disabled:bg-border-dark disabled:cursor-not-allowed transition-colors focus-ring"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </Modal>
    );
};