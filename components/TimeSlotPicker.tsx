
import React from 'react';
import type { TimeSlot } from '../types';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[] | null;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  isLoading: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ timeSlots, selectedTime, onTimeSelect, isLoading }) => {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-text-primary mb-4">3. Select a Time</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner />
        </div>
      ) : !timeSlots || timeSlots.length === 0 ? (
        <p className="text-text-primary/80 text-center h-48 flex items-center justify-center">Please select a trainer and a date to see available times.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => onTimeSelect(slot.time)}
              className={`p-2 rounded-md font-medium text-sm transition-all duration-200 focus-ring ${
                !slot.available
                  ? 'bg-border-dark text-text-primary/80 cursor-not-allowed opacity-50'
                  : selectedTime === slot.time
                  ? 'bg-brand-primary text-white ring-2 ring-offset-2 ring-offset-surface-dark ring-brand-primary'
                  : 'bg-surface-dark border border-border-dark text-text-primary hover:bg-brand-secondary hover:border-brand-secondary'
              }`}
            >
              {new Date(`1970-01-01T${slot.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
};
