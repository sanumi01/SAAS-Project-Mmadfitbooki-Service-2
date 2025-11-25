
import React, { useState } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { Card } from './common/Card';
import type { MonthAvailability } from '../types';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  availabilitySummary?: string | null;
  monthAvailability: MonthAvailability;
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ 
    selectedDate, 
    onDateSelect, 
    availabilitySummary,
    monthAvailability,
    currentMonth,
    onMonthChange
}) => {
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const days = [];
  let currentDate = new Date(startDate);

  while (days.length < 42) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <h2 className="text-2xl font-bold text-text-primary mb-4">2. Select a Date</h2>
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={prevMonth} aria-label="Previous month" title="Previous month" className="p-2 rounded-full hover:bg-border-dark focus-ring">
          <ChevronLeftIcon className="w-5 h-5 text-text-primary/80"/>
        </button>
        <h3 className="text-lg font-semibold text-text-primary">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <button type="button" onClick={nextMonth} aria-label="Next month" title="Next month" className="p-2 rounded-full hover:bg-border-dark focus-ring">
          <ChevronRightIcon className="w-5 h-5 text-text-primary/80"/>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {weekdays.map(day => <div key={day} className="text-xs font-bold text-text-primary/80">{day}</div>)}
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isPast = day < today;
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);

          const dateKey = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;
          const availableSlots = monthAvailability[dateKey] ?? -1;
          const dayTitle = !isPast && isCurrentMonth && availableSlots > 0 ? `${availableSlots} slots available` : '';

          let availabilityIndicator = null;
          if (!isPast && isCurrentMonth && availableSlots > 0) {
            if (availableSlots >= 5) {
              availabilityIndicator = <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-400 rounded-full"></div>;
            } else {
              availabilityIndicator = <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>;
            }
          }

          const baseClasses = "relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200";
          let stateClasses = "";
          if (isPast || !isCurrentMonth) {
            stateClasses = "text-border-dark cursor-not-allowed";
          } else {
            if (isSelected) {
              stateClasses = "bg-brand-primary text-white font-bold";
            } else if (isToday) {
              stateClasses = "border-2 border-brand-secondary text-brand-primary";
            } else {
              stateClasses = "text-text-primary hover:bg-border-dark cursor-pointer";
            }
          }

          return (
            <button
              key={index}
              type="button"
              className={
          
          `${baseClasses} ${stateClasses} focus-ring`}
              onClick={() => !isPast && isCurrentMonth && onDateSelect(day)}
              onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !isPast && isCurrentMonth) { e.preventDefault(); onDateSelect(day); } }}
              title={dayTitle}
            >
              {day.getDate()}
              {availabilityIndicator}
            </button>
          );
        })}
      </div>
      {availabilitySummary && (
        <p className="text-center text-text-primary/80 mt-4 text-sm">{availabilitySummary}</p>
      )}
    </Card>
  );
};
