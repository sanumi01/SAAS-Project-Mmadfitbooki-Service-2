
import React, { useState, useEffect, useCallback } from 'react';
import { QueueDisplay } from '../components/QueueDisplay';
import { Spinner } from '../components/common/Spinner';
import * as api from '../services/bookingService';
import type { QueueItem } from '../types';
import { AddToQueueForm } from '../components/AddToQueueForm';

export const QueueView: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetQueue = useCallback(async () => {
    try {
      const data = await api.fetchQueue();
      setQueue(data);
    } catch (error) {
      console.error("Failed to fetch queue data", error);
    } finally {
      if (isLoading) setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    fetchAndSetQueue();
     
  }, []);
  
  const handleAddToQueue = async (details: { name: string; service: string }) => {
    const updatedQueue = await api.addToQueue(details);
    setQueue(updatedQueue);
  };

  const handleNextClient = async () => {
    const updatedQueue = await api.advanceQueue();
    setQueue(updatedQueue);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><Spinner size="16"/></div>;
  }

  return (
    <div className="flex flex-col h-full">
        <AddToQueueForm onAddToQueue={handleAddToQueue} />
        <QueueDisplay queue={queue} onNextClient={handleNextClient} />
    </div>
  );
};
