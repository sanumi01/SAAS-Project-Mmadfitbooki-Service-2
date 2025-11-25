

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './common/Modal';
import type { Trainer } from '../types';

type StaffFormData = Omit<Trainer, 'id'> & { email?: string; password?: string };

interface StaffEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trainer: StaffFormData | Trainer) => void;
  trainerToEdit: Trainer | null;
}

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-primary/80 mb-1">{label}</label>
        <input
            id={id}
            {...props}
            className="w-full bg-background-dark border border-border-dark rounded-md px-3 py-2 text-text-primary focus:ring-brand-primary focus:border-brand-primary transition disabled:bg-border-dark/50 focus-ring"
        />
    </div>
);

const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-primary/80 mb-1">{label}</label>
        <textarea
            id={id}
            {...props}
            rows={3}
            className="w-full bg-background-dark border border-border-dark rounded-md px-3 py-2 text-text-primary focus:ring-brand-primary focus:border-brand-primary transition focus-ring"
        />
    </div>
);

const getInitialFormData = () => ({
    name: '',
    specialty: '',
    experience: '',
    bio: '',
    imageUrl: `https://picsum.photos/seed/${Date.now()}/300/300`,
    rate: 50.00,
    email: '',
    password: '',
    socials: {
        twitter: '',
        instagram: '',
        linkedin: ''
    }
});


export const StaffEditModal: React.FC<StaffEditModalProps> = ({ isOpen, onClose, onSave, trainerToEdit }) => {
    const [formData, setFormData] = useState<any>(getInitialFormData());
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (trainerToEdit) {
            setFormData({
                name: trainerToEdit.name,
                specialty: trainerToEdit.specialty,
                experience: trainerToEdit.experience,
                bio: trainerToEdit.bio,
                imageUrl: trainerToEdit.imageUrl,
                rate: trainerToEdit.rate,
                email: 'user-not-editable@maadfit.com', // Placeholder for editing
                password: '',
                socials: {
                    twitter: trainerToEdit.socials?.twitter || '',
                    instagram: trainerToEdit.socials?.instagram || '',
                    linkedin: trainerToEdit.socials?.linkedin || '',
                }
            });
        } else {
            setFormData(getInitialFormData());
        }
    }, [trainerToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseFloat(value) : value 
        }));
    };

    const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            socials: {
                ...prev.socials,
                [name]: value,
            }
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (trainerToEdit) {
            // Exclude email and password when saving an existing trainer
            const { email, password, ...profileData } = formData;
            onSave({ ...trainerToEdit, ...profileData });
        } else {
            onSave(formData);
        }
    };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={trainerToEdit ? 'Edit Staff Member' : 'Add New Staff Member'}>
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Full Name" id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
            
            {!trainerToEdit ? (
                <>
                    <InputField label="Login Email" id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    <InputField label="Password" id="password" name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
                </>
            ) : (
                 <InputField label="Login Email" id="email" name="email" type="email" value={"Email cannot be changed"} onChange={() => {}} disabled />
            )}
            
            <hr className="border-border-dark" />
            
            <h3 className="text-lg font-semibold text-text-primary/80 pt-2">Public Profile & Rate</h3>
            
            <div>
                <label className="block text-sm font-medium text-text-primary/80 mb-1">Profile Picture</label>
                <div className="flex items-center gap-4">
                    <img src={formData.imageUrl} alt="Profile preview" className="w-20 h-20 rounded-full object-cover border-2 border-border-dark" />
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden focus-ring" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold bg-surface-dark border border-border-dark text-text-primary py-2 px-4 rounded-md hover:bg-border-dark transition-colors focus-ring" aria-label="Change profile picture">
                        Change Picture
                    </button>
                </div>
            </div>

            <InputField label="Specialty" id="specialty" name="specialty" type="text" value={formData.specialty} onChange={handleChange} required />
            <InputField label="Session Rate ($)" id="rate" name="rate" type="number" value={formData.rate} onChange={handleChange} required min="0" step="0.01" />
            <InputField label="Experience" id="experience" name="experience" type="text" value={formData.experience} onChange={handleChange} required placeholder="e.g., 5 Years"/>
            <TextAreaField label="Bio" id="bio" name="bio" value={formData.bio} onChange={handleChange} required />

            <h3 className="text-lg font-semibold text-text-primary/80 pt-2">Social Media (Optional)</h3>
            <InputField label="Twitter URL" id="twitter" name="twitter" type="url" value={formData.socials.twitter} onChange={handleSocialsChange} placeholder="https://twitter.com/username" />
            <InputField label="Instagram URL" id="instagram" name="instagram" type="url" value={formData.socials.instagram} onChange={handleSocialsChange} placeholder="https://instagram.com/username" />
            <InputField label="LinkedIn URL" id="linkedin" name="linkedin" type="url" value={formData.socials.linkedin} onChange={handleSocialsChange} placeholder="https://linkedin.com/in/username" />

            <div className="flex justify-end items-center gap-4 pt-4">
                <button type="button" onClick={onClose} className="text-text-primary/80 font-semibold px-4 py-2 rounded-md hover:bg-border-dark focus-ring">
                    Cancel
                </button>
                <button type="submit" className="bg-brand-primary text-white font-bold px-4 py-2 rounded-md hover:bg-brand-secondary focus-ring">
                    {trainerToEdit ? 'Save Changes' : 'Create Staff Account'}
                </button>
            </div>
        </form>
    </Modal>
  );
};
