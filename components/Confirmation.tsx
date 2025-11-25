
import React, { useMemo } from 'react';
import type { Booking } from '../types';
import { Card } from './common/Card';
import { getSettings } from '../services/settingsService';
import { useAuth } from '../contexts/AuthContext';
import { AppView, type AppViewType } from '../constants';

interface ConfirmationProps {
  bookingDetails: Booking;
  onNewBooking: () => void;
  setView: (view: AppViewType) => void;
}

const populateTemplate = (template: string, booking: Booking): string => {
    return template
        .replace(/{{clientName}}/g, booking.clientName)
        .replace(/{{trainerName}}/g, booking.trainer.name)
        .replace(/{{date}}/g, booking.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
        .replace(/{{time}}/g, new Date(`1970-01-01T${booking.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
};

export const Confirmation: React.FC<ConfirmationProps> = ({ bookingDetails, onNewBooking, setView }) => {
  const { currentUser } = useAuth();
  const { trainer, date, time, clientName, bookingId, price, fee, reminderEmail, reminderSms, cancellationPolicy } = bookingDetails;
  
  const settings = useMemo(() => getSettings(), []);
  const emailPreview = useMemo(() => populateTemplate(settings.emailConfirmationTemplate, bookingDetails), [settings.emailConfirmationTemplate, bookingDetails]);

  const qrData = {
      bookingId,
      clientName,
      trainer: trainer.name,
      date: date.toISOString().split('T')[0],
      time,
  };
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(qrData))}`;
  
  return (
    <div className="max-w-3xl mx-auto my-10 text-center">
        <Card className="text-left">
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Booking Confirmed!</h1>
                <p className="text-text-primary/80 mb-6">Your appointment is set. A confirmation email will be sent shortly.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-background-dark border border-border-dark rounded-lg p-6 space-y-4 flex-grow w-full">
                  <div className="flex justify-between items-center">
                      <span className="font-semibold text-text-primary/80">Trainer:</span>
                      <span className="font-bold text-text-primary">{trainer.name}</span>
                  </div>
                   <hr className="border-border-dark" />
                  <div className="flex justify-between items-center">
                      <span className="font-semibold text-text-primary/80">Date:</span>
                      <span className="font-bold text-text-primary">{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                   <hr className="border-border-dark" />
                  <div className="flex justify-between items-center">
                      <span className="font-semibold text-text-primary/80">Time:</span>
                      <span className="font-bold text-text-primary">{new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </div>
                   <hr className="border-border-dark" />
                  <div className="flex justify-between items-center">
                      <span className="font-semibold text-text-primary/80">Booked for:</span>
                      <span className="font-bold text-text-primary">{clientName}</span>
                  </div>
              </div>
              <div className="flex-shrink-0 bg-white p-2 rounded-lg">
                 <img src={qrCodeUrl} alt="Booking QR Code" className="w-36 h-36" />
                 <p className="text-xs text-black text-center mt-1">Scan for Check-in</p>
              </div>
            </div>

            <div className="bg-background-dark border border-border-dark rounded-lg p-4 space-y-2 mt-6">
                <div className="flex justify-between text-text-primary/80 text-sm"><span>Session Price:</span> <span>${price?.toFixed(2)}</span></div>
                <div className="flex justify-between text-text-primary/80 text-sm"><span>Platform Fee:</span> <span>${fee?.toFixed(2)}</span></div>
                <hr className="border-border-dark"/>
                <div className="flex justify-between font-bold text-text-primary text-lg"><span>Total Paid:</span> <span>${(price && fee ? price + fee : 0).toFixed(2)}</span></div>
            </div>
            
            {(reminderEmail || reminderSms || cancellationPolicy) && (
                 <div className="bg-background-dark border border-border-dark rounded-lg p-4 mt-6 space-y-4">
                    <h3 className="font-bold text-text-primary text-lg">Reminders & Policies</h3>
                    { (reminderEmail || reminderSms) &&
                        <div>
                            <h4 className="font-semibold text-text-primary/80 mb-1">Appointment Reminders</h4>
                            <div className="text-text-primary text-sm space-y-1">
                                {reminderEmail && <p className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>You will receive an email reminder.</p>}
                                {reminderSms && <p className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>You will receive an SMS reminder.</p>}
                            </div>
                        </div>
                    }
                    { cancellationPolicy && (reminderEmail || reminderSms) && <hr className="border-border-dark" /> }
                    { cancellationPolicy &&
                        <div>
                            <h4 className="font-semibold text-text-primary/80 mb-1">Cancellation Policy</h4>
                            <p className="text-text-primary text-sm">{cancellationPolicy}</p>
                        </div>
                    }
                </div>
            )}
            
            {reminderEmail && (
                 <div className="bg-background-dark border border-border-dark rounded-lg p-4 mt-6 space-y-2">
                    <h3 className="font-bold text-text-primary text-lg mb-2">Email Preview</h3>
                    <div className="border-2 border-dashed border-border-dark bg-surface-dark p-4 rounded-md text-text-primary text-sm whitespace-pre-wrap">{emailPreview}</div>
                </div>
            )}

            {!currentUser && (
                <Card className="mt-6 text-center animate-fade-in border-brand-secondary">
                    <h3 className="text-lg font-bold text-text-primary">Manage Your Bookings</h3>
                    <p className="text-text-primary/80 mt-2 mb-4">To view your booking history or make changes to your appointment, please log in to your account.</p>
                    <button
                        type="button"
                        onClick={() => setView(AppView.LOGIN)}
                        className="bg-brand-secondary text-white font-bold py-2 px-6 rounded-md hover:bg-brand-primary transition-colors focus-ring"
                    >
                        Login to Your Account
                    </button>
                </Card>
            )}

            <button
                type="button"
                onClick={onNewBooking}
                className="w-full mt-8 bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-secondary transition-colors duration-300 focus-ring"
            >
                Book Another Appointment
            </button>
      </Card>
    </div>
  );
};
