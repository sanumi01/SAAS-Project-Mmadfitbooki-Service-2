import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import * as api from '../services/bookingService';
import type { Trainer, TimeSlot } from '../types';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';

export const ScheduleView: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [availability, setAvailability] = useState<Record<string, TimeSlot[]>>({});

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const trainerData = await api.fetchTrainers();
            setTrainers(trainerData);
            if (trainerData.length > 0) {
                const availabilityData = await api.fetchAllTrainersAvailabilityForDay(selectedDate);
                setAvailability(availabilityData);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [selectedDate]);
    
    const timeSlots = useMemo(() => {
        if (!availability || Object.keys(availability).length === 0) return [];
        const firstTrainerId = Object.keys(availability)[0];
        return availability[firstTrainerId]?.map(slot => slot.time).sort((a,b) => a.localeCompare(b)) || [];
    }, [availability]);
    
    const handleDateChange = (days: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        });
    };
    
    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-96"><Spinner size="12" /></div>;
        }
        if (trainers.length === 0) {
            return <p className="text-center text-text-primary/80 h-64 flex items-center justify-center">No trainers have been added to the schedule yet.</p>;
        }
        if (timeSlots.length === 0) {
            return <p className="text-center text-text-primary/80 h-64 flex items-center justify-center">No time slots available for this day.</p>;
        }
        return (
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    <div className={`grid gap-2`} style={{gridTemplateColumns: `80px repeat(${trainers.length}, minmax(140px, 1fr))`}}>
                        {/* Header Row */}
                        <div className="sticky top-0 z-10 bg-surface-dark"></div>
                        {trainers.map(trainer => (
                            <div key={trainer.id} className="text-center sticky top-0 z-10 bg-surface-dark py-3">
                                <img src={trainer.imageUrl} alt={trainer.name} className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-border-dark"/>
                                <p className="font-semibold text-text-primary text-sm">{trainer.name}</p>
                                <p className="text-xs text-text-primary/80">{trainer.specialty}</p>
                            </div>
                        ))}

                        {/* Data Rows */}
                        {timeSlots.map(time => (
                            <React.Fragment key={time}>
                                <div className="flex items-center justify-center font-mono text-sm text-text-primary/80 h-12">
                                    {new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </div>
                                {trainers.map(trainer => {
                                    const slot = availability[trainer.id]?.find(s => s.time === time);
                                    const isAvailable = slot?.available ?? false;
                                    return (
                                        <div key={`${trainer.id}-${time}`} className="flex items-center justify-center h-12">
                                            {isAvailable && (
                                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Schedule Overview</h1>
                <p className="text-text-primary/80">View all trainer availability for a selected day.</p>
            </div>
            
            <Card>
                 <div className="flex justify-between items-center mb-6 border-b border-border-dark pb-4">
                    <button type="button" onClick={() => handleDateChange(-1)} className="p-2 rounded-full hover:bg-border-dark focus-ring" aria-label="Previous day">
                        <ChevronLeftIcon className="w-6 h-6 text-text-primary/80"/>
                    </button>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-text-primary">
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h2>
                        <button type="button" onClick={goToToday} className="text-sm text-brand-primary hover:underline focus-ring">Go to Today</button>
                    </div>
                    <button type="button" onClick={() => handleDateChange(1)} className="p-2 rounded-full hover:bg-border-dark focus-ring" aria-label="Next day">
                        <ChevronRightIcon className="w-6 h-6 text-text-primary/80"/>
                    </button>
                </div>
                {renderContent()}
            </Card>
        </div>
    );
};
