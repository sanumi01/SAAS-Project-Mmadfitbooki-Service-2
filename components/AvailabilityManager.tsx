import React, { useState, useEffect, useCallback } from 'react';
import type { Trainer, Availability } from '../types';
import { Card } from './common/Card';
import * as availabilityService from '../services/availabilityService';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { useNotification } from '../contexts/NotificationContext';
import { ConfirmationModal } from './common/ConfirmationModal';

const TimeSlotToggle: React.FC<{ time: string, isAvailable: boolean, onToggle: (time: string, isAvailable: boolean) => void }> = ({ time, isAvailable, onToggle }) => (
    <div className="flex items-center justify-between p-3 bg-background-dark rounded-lg">
        <span className="text-text-primary font-mono">{new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
        <label htmlFor={`toggle-${time}`} className="inline-flex relative items-center cursor-pointer">
            <input aria-label={`Toggle availability for ${time}`} type="checkbox" checked={isAvailable} onChange={(e) => onToggle(time, e.target.checked)} id={`toggle-${time}`} className="sr-only peer" />
            <div className="w-11 h-6 bg-border-dark rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-secondary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
        </label>
    </div>
);

interface AvailabilityManagerProps {
    selectedTrainer: Trainer | null;
}

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ selectedTrainer }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availability, setAvailability] = useState<Availability>({});
    const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [daysWithSettings, setDaysWithSettings] = useState<Set<string>>(new Set());
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const { addNotification } = useNotification();

    const loadAvailability = useCallback(() => {
        if (selectedTrainer) {
            const savedAvailability = availabilityService.getAvailability(selectedTrainer.id, selectedDate);
            setAvailability(savedAvailability || availabilityService.generateFullDaySlots(true));
        }
    }, [selectedTrainer, selectedDate]);

    useEffect(() => {
        loadAvailability();
    }, [loadAvailability]);
    
     useEffect(() => {
        if (selectedTrainer) {
            const checkMonthAvailability = () => {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                const settingsSet = new Set<string>();
                const tempDate = new Date(year, month, 1);

                while (tempDate.getMonth() === month) {
                    if (availabilityService.getAvailability(selectedTrainer.id, tempDate)) {
                        settingsSet.add(tempDate.toISOString().split('T')[0]);
                    }
                    tempDate.setDate(tempDate.getDate() + 1);
                }
                setDaysWithSettings(settingsSet);
            };
            checkMonthAvailability();
        }
    }, [selectedTrainer, currentMonth]);

    const handleToggle = (time: string, isAvailable: boolean) => {
        const newAvailability = { ...availability, [time]: isAvailable };
        setAvailability(newAvailability);
        if (selectedTrainer) {
            availabilityService.setAvailability(selectedTrainer.id, selectedDate, newAvailability);
            setDaysWithSettings(prev => new Set(prev).add(selectedDate.toISOString().split('T')[0]));
        }
    };
    
    const handleSetAll = (isAvailable: boolean) => {
        const fullDay = availabilityService.generateFullDaySlots(isAvailable);
        setAvailability(fullDay);
        if (selectedTrainer) {
            availabilityService.setAvailability(selectedTrainer.id, selectedDate, fullDay);
            setDaysWithSettings(prev => new Set(prev).add(selectedDate.toISOString().split('T')[0]));
        }
    };

    const handleCopyFromPreviousDay = () => {
        if (!selectedTrainer) return;

        const previousDay = new Date(selectedDate);
        previousDay.setDate(selectedDate.getDate() - 1);
        
        const availabilityToCopy = availabilityService.getAvailability(selectedTrainer.id, previousDay) || availabilityService.generateFullDaySlots(true);
        
        setAvailability(availabilityToCopy);
        availabilityService.setAvailability(selectedTrainer.id, selectedDate, availabilityToCopy);
        setDaysWithSettings(prev => new Set(prev).add(selectedDate.toISOString().split('T')[0]));
        
        addNotification(`Availability copied from ${previousDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, 'success');
    };

    const handleCopyFromPreviousWeek = () => {
        if (!selectedTrainer) return;

        const previousWeekDay = new Date(selectedDate);
        previousWeekDay.setDate(selectedDate.getDate() - 7);
        
        const availabilityToCopy = availabilityService.getAvailability(selectedTrainer.id, previousWeekDay) || availabilityService.generateFullDaySlots(true);
        
        setAvailability(availabilityToCopy);
        availabilityService.setAvailability(selectedTrainer.id, selectedDate, availabilityToCopy);
        setDaysWithSettings(prev => new Set(prev).add(selectedDate.toISOString().split('T')[0]));
        
        addNotification(`Schedule copied from ${previousWeekDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`, 'success');
    };

    const handleResetSchedule = () => {
        if (selectedTrainer) {
            setIsResetConfirmOpen(true);
        }
    };
    
    const confirmResetSchedule = () => {
         if (selectedTrainer) {
            availabilityService.clearAvailability(selectedTrainer.id, selectedDate);
            const defaultAvailability = availabilityService.generateFullDaySlots(true);
            setAvailability(defaultAvailability);
            setDaysWithSettings(prev => {
                const newSet = new Set(prev);
                newSet.delete(selectedDate.toISOString().split('T')[0]);
                return newSet;
            });
            addNotification(`Schedule for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} has been reset.`, 'success');
        }
        setIsResetConfirmOpen(false);
    }

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const days = [];
    let d = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 1 - startOfMonth.getDay());
    while (days.length < 42) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const goToToday = () => {
        const now = new Date();
        setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
        setSelectedDate(now);
    };
    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    if (!selectedTrainer) {
        return (
            <Card>
                <div className="text-center text-text-primary/80 py-12">
                    <p className="font-semibold">Please select a trainer from the list above to manage their availability.</p>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <h3 className="text-2xl font-bold text-text-primary mb-4">Set Availability for {selectedTrainer.name}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <button type="button" onClick={prevMonth} aria-label="Previous month" title="Previous month" className="p-2 rounded-full hover:bg-border-dark focus-ring"><ChevronLeftIcon className="w-5 h-5"/></button>
                            <div className="text-center">
                                <h3 className="font-semibold">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                <button type="button" onClick={goToToday} className="text-xs text-brand-primary hover:underline focus-ring">Today</button>
                            </div>
                            <button type="button" onClick={nextMonth} aria-label="Next month" title="Next month" className="p-2 rounded-full hover:bg-border-dark focus-ring"><ChevronRightIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-primary/80">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="w-10 h-10 flex items-center justify-center">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 mt-1">
                            {days.map((day, i) => {
                                const isSelected = isSameDay(day, selectedDate);
                                const isTodayFlag = isSameDay(day, today);
                                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                                const hasSettings = daysWithSettings.has(day.toISOString().split('T')[0]);

                                let stateClasses = "hover:bg-surface-dark";
                                if (!isCurrentMonth) stateClasses = 'text-border-dark';
                                if (isTodayFlag) stateClasses += ' border-2 border-brand-secondary';
                                if (isSelected) stateClasses = 'bg-brand-primary text-white';

                                return (
                                    <button key={i} type="button" onClick={() => setSelectedDate(day)} className={`relative h-10 w-10 rounded-full flex items-center justify-center transition-colors ${stateClasses} focus-ring`}>
                                        {day.getDate()}
                                        {hasSettings && !isSelected && <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-primary rounded-full"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-text-primary mb-2 text-center">
                            Slots for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        <div className="flex flex-col gap-2 mb-4">
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleSetAll(true)} type="button" className="flex-1 bg-brand-secondary text-white text-sm py-2 rounded-md hover:bg-brand-primary transition-colors focus-ring">Make All Available</button>
                                <button onClick={() => handleSetAll(false)} type="button" className="flex-1 bg-border-dark text-text-primary/80 text-sm py-2 rounded-md hover:bg-surface-dark transition-colors focus-ring">Block All Day</button>
                                <button 
                                    onClick={handleCopyFromPreviousDay}
                                    type="button"
                                    className="bg-surface-dark border border-border-dark text-text-primary text-sm py-2 rounded-md hover:bg-border-dark transition-colors focus-ring"
                                >
                                    Copy from Prev. Day
                                </button>
                                 <button 
                                    onClick={handleCopyFromPreviousWeek}
                                    type="button"
                                    className="bg-surface-dark border border-border-dark text-text-primary text-sm py-2 rounded-md hover:bg-border-dark transition-colors focus-ring"
                                >
                                    Copy from Last Week
                                </button>
                            </div>
                            <button 
                                type="button"
                                onClick={handleResetSchedule}
                                className="w-full bg-surface-dark border border-border-dark text-red-500 text-sm py-2 rounded-md hover:bg-border-dark transition-colors font-semibold focus-ring"
                            >
                                Reset Schedule
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
                            {Object.entries(availability).sort((a,b) => a[0].localeCompare(b[0])).map(([time, isAvailable]) => (
                                <TimeSlotToggle key={time} time={time} isAvailable={isAvailable} onToggle={handleToggle} />
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
            <ConfirmationModal
                isOpen={isResetConfirmOpen}
                onClose={() => setIsResetConfirmOpen(false)}
                onConfirm={confirmResetSchedule}
                title="Confirm Schedule Reset"
            >
                Are you sure you want to reset the schedule for <strong>{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</strong>? All custom availability for this day will be lost.
            </ConfirmationModal>
        </>
    );
};