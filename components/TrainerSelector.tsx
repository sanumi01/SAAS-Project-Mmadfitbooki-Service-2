
import React, { useState } from 'react';
import type { Trainer } from '../types';
import { Card } from './common/Card';
import { TrainerProfileModal } from './TrainerProfileModal';

interface TrainerSelectorProps {
  trainers: Trainer[];
  selectedTrainer: Trainer | null;
  onSelectTrainer: (trainer: Trainer) => void;
}

export const TrainerSelector: React.FC<TrainerSelectorProps> = ({ trainers, selectedTrainer, onSelectTrainer }) => {
  const [viewingTrainer, setViewingTrainer] = useState<Trainer | null>(null);

  const handleViewProfile = (e: React.MouseEvent, trainer: Trainer) => {
    e.stopPropagation(); // Prevent selection when clicking the profile button
    setViewingTrainer(trainer);
  };

  return (
    <>
      <Card>
        <h2 className="text-2xl font-bold text-text-primary mb-4">1. Select a Trainer</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              onClick={() => onSelectTrainer(trainer)}
              className={`cursor-pointer rounded-lg p-3 text-center border-2 transition-all duration-200 flex flex-col justify-between ${
                selectedTrainer?.id === trainer.id
                  ? 'border-brand-primary bg-brand-secondary/20 scale-105'
                  : 'border-border-dark hover:border-brand-primary'
              }`}
            >
              <div>
                <img
                  src={trainer.imageUrl}
                  alt={trainer.name}
                  className="w-24 h-24 rounded-full mx-auto mb-2 border-2 border-border-dark"
                />
                <p className="font-semibold text-text-primary">{trainer.name}</p>
                <p className="text-xs text-text-primary/80">{trainer.specialty}</p>
              </div>
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectTrainer(trainer)}
                  className="px-2 py-1 text-xs bg-brand-primary text-white rounded-md focus-ring"
                  aria-label={`Select ${trainer.name}`}
                >
                  Select
                </button>
                <button 
                  type="button"
                  onClick={(e) => handleViewProfile(e, trainer)}
                  className="text-xs text-brand-primary hover:underline focus-ring"
                  aria-label={`View profile for ${trainer.name}`}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <TrainerProfileModal 
        trainer={viewingTrainer}
        isOpen={!!viewingTrainer}
        onClose={() => setViewingTrainer(null)}
      />
    </>
  );
};