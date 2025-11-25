
import React from 'react';
import type { QueueItem } from '../types';

interface QueueDisplayProps {
  queue: QueueItem[];
  onNextClient: () => void;
}

export const QueueDisplay: React.FC<QueueDisplayProps> = ({ queue, onNextClient }) => {
  const nowServing = queue.length > 0 ? queue[0] : null;
  const upNext = queue.slice(1);

  return (
    <div className="w-full h-full flex flex-col gap-8">
      <div className="bg-surface-dark border-2 border-brand-primary rounded-xl shadow-2xl p-8 flex-1 flex flex-col justify-center items-center relative">
        <h2 className="text-2xl md:text-4xl font-bold text-brand-primary tracking-widest uppercase">Now Serving</h2>
        {nowServing ? (
          <>
            <p className="text-6xl md:text-9xl font-extrabold text-text-primary my-4">{nowServing.name}</p>
            <p className="text-xl md:text-3xl text-text-primary/80">{nowServing.service}</p>
            <button 
                onClick={onNextClient}
                className="mt-6 bg-brand-primary text-white font-bold py-3 px-6 rounded-md hover:bg-brand-secondary transition-colors duration-300 focus-ring"
            >
                Next Client
            </button>
          </>
        ) : (
          <p className="text-4xl font-bold text-text-primary/80 my-8">Queue is empty</p>
        )}
      </div>
      
      <div className="bg-surface-dark border border-border-dark rounded-xl shadow-lg p-8 flex-2">
        <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 text-center">Up Next</h3>
        {upNext.length > 0 ? (
          <ul className="space-y-4">
            {upNext.map((item) => (
              <li key={item.id} className="bg-background-dark p-4 rounded-lg flex justify-between items-baseline">
                <span className="text-2xl md:text-4xl font-semibold text-text-primary">{item.name}</span>
                <span className="text-lg md:text-xl text-text-primary/80">{item.service}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-text-primary/80 mt-8">No one else is waiting.</p>
        )}
      </div>
    </div>
  );
};
