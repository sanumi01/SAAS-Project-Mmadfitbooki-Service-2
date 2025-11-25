import React from 'react';
import type { Trainer } from '../types';

interface StaffListProps {
  trainers: Trainer[];
  onEdit: (trainer: Trainer) => void;
  onDelete: (trainer: Trainer) => void;
}

export const StaffList: React.FC<StaffListProps> = ({ trainers, onEdit, onDelete }) => {
  if (trainers.length === 0) {
    return <p className="text-text-primary/80 text-center py-4">No staff members found. Click "Add New Staff" to get started.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-background-dark">
          <tr>
            <th className="p-3 text-sm font-semibold text-text-primary/80">Name</th>
            <th className="p-3 text-sm font-semibold text-text-primary/80">Specialty</th>
            <th className="p-3 text-sm font-semibold text-text-primary/80">Experience</th>
            <th className="p-3 text-sm font-semibold text-text-primary/80 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((trainer) => (
            <tr key={trainer.id} className="border-b border-border-dark last:border-0">
              <td className="p-3 text-text-primary font-medium">{trainer.name}</td>
              <td className="p-3 text-text-primary/80">{trainer.specialty}</td>
              <td className="p-3 text-text-primary/80">{trainer.experience}</td>
              <td className="p-3 text-right">
                <div className="flex justify-end items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(trainer)}
                      className="text-brand-primary hover:underline text-sm font-semibold focus-ring"
                      aria-label={`Edit ${trainer.name}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(trainer)}
                      className="text-red-500 hover:underline text-sm font-semibold focus-ring"
                      aria-label={`Delete ${trainer.name}`}
                    >
                      Delete
                    </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
