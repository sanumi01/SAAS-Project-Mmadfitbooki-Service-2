
import React, { useState } from 'react';
import { Card } from './common/Card';

interface AddToQueueFormProps {
  onAddToQueue: (details: { name: string; service: string }) => void;
}

export const AddToQueueForm: React.FC<AddToQueueFormProps> = ({ onAddToQueue }) => {
  const [name, setName] = useState('');
  const [service, setService] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name && service) {
      onAddToQueue({ name, service });
      setName('');
      setService('');
    }
  };

  return (
    <Card className="mb-8">
      <h2 className="text-2xl font-bold text-text-primary mb-4">Add to Walk-in Queue</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client Name"
          required
          className="flex-grow bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition"
        />
        <input
          type="text"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Service (e.g., Consultation)"
          required
          className="flex-grow bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition"
        />
        <button
          type="submit"
          className="bg-brand-primary text-white font-bold py-2 px-6 rounded-md hover:bg-brand-secondary transition-colors duration-300 focus-ring"
        >
          Add Client
        </button>
      </form>
    </Card>
  );
};
