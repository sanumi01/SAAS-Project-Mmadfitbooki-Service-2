
import React from 'react';
import { Modal } from './common/Modal';
import type { Trainer } from '../types';
import { TwitterIcon } from './icons/TwitterIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { LinkedinIcon } from './icons/LinkedinIcon';

interface TrainerProfileModalProps {
  trainer: Trainer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TrainerProfileModal: React.FC<TrainerProfileModalProps> = ({ trainer, isOpen, onClose }) => {
  if (!trainer) return null;

  const hasSocials = trainer.socials && Object.values(trainer.socials).some(link => !!link);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${trainer.name}'s Profile`}>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0 text-center sm:w-1/3">
          <img
            src={trainer.imageUrl}
            alt={trainer.name}
            className="w-32 h-32 rounded-full mx-auto border-4 border-brand-primary"
          />
          <p className="font-bold text-text-primary mt-2 text-lg">{trainer.name}</p>
          <p className="text-brand-primary text-sm">{trainer.specialty}</p>
        </div>
        <div className="space-y-4 flex-1">
          <div>
            <h3 className="font-semibold text-text-primary/80">Experience</h3>
            <p className="text-text-primary">{trainer.experience}</p>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary/80">About</h3>
            <p className="text-text-primary text-sm">{trainer.bio}</p>
          </div>
           {hasSocials && (
              <div className="pt-2">
                <h3 className="font-semibold text-text-primary/80">Connect</h3>
                <div className="flex items-center gap-4 mt-2">
                    {trainer.socials?.twitter && (
                        <a href={trainer.socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter profile" className="text-text-primary/80 hover:text-brand-primary transition-colors focus-ring">
                            <TwitterIcon className="w-6 h-6" />
                        </a>
                    )}
                     {trainer.socials?.instagram && (
                        <a href={trainer.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram profile" className="text-text-primary/80 hover:text-brand-primary transition-colors focus-ring">
                            <InstagramIcon className="w-6 h-6" />
                        </a>
                    )}
                     {trainer.socials?.linkedin && (
                        <a href={trainer.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="text-text-primary/80 hover:text-brand-primary transition-colors focus-ring">
                            <LinkedinIcon className="w-6 h-6" />
                        </a>
                    )}
                </div>
              </div>
            )}
        </div>
      </div>
    </Modal>
  );
};