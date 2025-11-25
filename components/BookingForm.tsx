
import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { getSettings } from '../services/settingsService';

interface BookingFormProps {
  price: number;
  onSubmit: (details: { name: string; email: string; phone: string, sendEmailConfirmation: boolean; reminderEmail: boolean; reminderSms: boolean; cancellationPolicy?: string; }) => void;
  isSubmitting: boolean;
}

const InputField: React.FC<{
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
}> = ({ id, label, type, placeholder, required }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-text-primary/80 mb-1">{label}</label>
    <input
      type={type}
      id={id}
      name={id}
      placeholder={placeholder}
      required={required}
      className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring focus:border-brand-primary transition"
    />
  </div>
);

const CheckboxField: React.FC<{ id: string; label: string; defaultChecked?: boolean; }> = ({ id, label, defaultChecked }) => (
  <div className="flex items-center">
    <input
      id={id}
      name={id}
      type="checkbox"
      defaultChecked={defaultChecked}
      className="h-4 w-4 rounded border-gray-300 text-brand-primary focus-ring"
    />
    <label htmlFor={id} className="ml-2 block text-sm text-text-primary/80">
      {label}
    </label>
  </div>
);

const CancellationPolicyField: React.FC<{ enabled: boolean; onToggle: () => void; defaultPolicy: string; }> = ({ enabled, onToggle, defaultPolicy }) => (
  <div>
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={enabled}
        onChange={onToggle}
        className="h-4 w-4 rounded border-gray-300 text-brand-primary focus-ring"
      />
      <span className="text-sm font-medium text-text-primary/80">Add Cancellation Policy</span>
    </label>
    {enabled && (
      <textarea
        name="cancellationPolicy"
        rows={3}
        className="mt-2 w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring focus:border-brand-primary transition text-sm"
        placeholder="Enter policy details..."
        defaultValue={defaultPolicy}
      ></textarea>
    )}
  </div>
);

export const BookingForm: React.FC<BookingFormProps> = ({ price, onSubmit, isSubmitting }) => {
  const [policyEnabled, setPolicyEnabled] = useState(false);
  const [defaultPolicy, setDefaultPolicy] = useState('');
  const fee = price * 0.02;
  const total = price + fee;

  useEffect(() => {
    const settings = getSettings();
    setDefaultPolicy(settings.defaultCancellationPolicy);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const policyText = formData.get('cancellationPolicy') as string;

    const details = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      sendEmailConfirmation: formData.get('sendEmailConfirmation') === 'on',
      reminderEmail: formData.get('reminderEmail') === 'on',
      reminderSms: formData.get('reminderSms') === 'on',
      cancellationPolicy: policyEnabled ? policyText : undefined,
    };
    onSubmit(details);
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-text-primary mb-4">4. Your Details & Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <InputField id="name" label="Full Name" type="text" placeholder="John Doe" required />
        <InputField id="email" label="Email Address" type="email" placeholder="you@example.com" required />
        <InputField id="phone" label="Phone Number" type="tel" placeholder="123-456-7890" required />
        
        <div>
            <label className="block text-sm font-medium text-text-primary/80 mb-2">Notifications</label>
            <div className="space-y-2">
                <CheckboxField id="sendEmailConfirmation" label="Send email confirmation" defaultChecked={true} />
                <CheckboxField id="reminderEmail" label="Send me an email reminder" />
                <CheckboxField id="reminderSms" label="Send me an SMS reminder" />
            </div>
        </div>

        <CancellationPolicyField 
          enabled={policyEnabled} 
          onToggle={() => setPolicyEnabled(!policyEnabled)}
          defaultPolicy={defaultPolicy}
        />
        
        <div className="bg-muted border border-border-dark rounded p-4 space-y-2 shadow-sm">
            <div className="flex justify-between text-text-primary/80"><span>Session Price:</span> <span>${price.toFixed(2)}</span></div>
            <div className="flex justify-between text-text-primary/80"><span>Platform Fee (2%):</span> <span>${fee.toFixed(2)}</span></div>
            <hr className="border-border-dark"/>
            <div className="flex justify-between font-bold text-text-primary text-lg"><span>Total:</span> <span>${total.toFixed(2)}</span></div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-secondary transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center focus-ring shadow-sm"
        >
          {isSubmitting ? <Spinner size="6" /> : 'Confirm & Book'}
        </button>
      </form>
    </Card>
  );
};