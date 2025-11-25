
import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import * as userService from '../services/userService';
import type { UserProfile } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';

// Re-usable components from other views to avoid refactoring
const InputField: React.FC<{ id: string; name: string; label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }> = ({ id, name, label, type, value, onChange, required }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-primary/80 mb-1">{label}</label>
        <input type={type} id={id} name={name} value={value} onChange={onChange} required={required} className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition" />
    </div>
);

const RadioGroup: React.FC<{ options: string[], selected: string, onChange: (value: string) => void }> = ({ options, selected, onChange }) => (
    <div className="flex flex-wrap gap-2">
        {options.map(option => (
            <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${selected === option ? 'bg-brand-primary text-white' : 'bg-surface-dark text-text-primary/80 hover:bg-border-dark hover:text-text-primary'} focus-ring`}
                aria-pressed={selected === option ? 'true' : 'false'}
            >
                {option}
            </button>
        ))}
    </div>
);

const CheckboxField: React.FC<{ id: string; name: string; label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ id, name, label, checked, onChange }) => (
    <div className="flex items-center">
        <input id={id} name={name} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary focus-ring" />
        <label htmlFor={id} className="ml-2 block text-sm text-text-primary/80">{label}</label>
    </div>
);

// Constants from WorkoutPlannerView
const goals = ["Build Muscle", "Lose Weight", "Improve Endurance", "Increase Flexibility", "General Fitness"];
const levels = ["Beginner", "Intermediate", "Advanced"];

export const AccountView: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        const profileData = userService.getUserProfile();
        setProfile(profileData);
        setIsLoading(false);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (profile) {
            if (name === 'emailNotify' || name === 'smsNotify') {
                setProfile({
                    ...profile,
                    notificationPreferences: {
                        ...profile.notificationPreferences,
                        [name === 'emailNotify' ? 'email' : 'sms']: checked
                    }
                });
            } else {
                 setProfile({ ...profile, [name]: value });
            }
        }
    };
    
    const handleRadioChange = (field: keyof UserProfile, value: string) => {
        if (profile) {
            setProfile({ ...profile, [field]: value });
        }
    };

    const handleSave = () => {
        if (profile) {
            setIsSaving(true);
            userService.saveUserProfile(profile);
            // Simulate network delay for user feedback
            setTimeout(() => {
                setIsSaving(false);
                addNotification('Profile updated successfully!', 'success');
            }, 500);
        }
    };

    if (isLoading || !profile) {
        return <div className="flex justify-center items-center h-96"><Spinner size="16"/></div>;
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
                    <UserCircleIcon className="w-8 h-8 text-brand-primary" />
                    My Account
                </h1>
                <p className="text-text-primary/80">View and edit your personal information and preferences.</p>
            </div>

            <Card>
                <h2 className="text-xl font-bold text-text-primary mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField id="name" name="name" label="Full Name" type="text" value={profile.name} onChange={handleChange} required />
                    <InputField id="email" name="email" label="Email Address" type="email" value={profile.email} onChange={handleChange} required />
                    <InputField id="phone" name="phone" label="Phone Number" type="tel" value={profile.phone} onChange={handleChange} />
                </div>
            </Card>

            <Card>
                 <h2 className="text-xl font-bold text-text-primary mb-4">Fitness Preferences</h2>
                 <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary/80 mb-2">My primary fitness goal is...</label>
                        <RadioGroup options={goals} selected={profile.fitnessGoal} onChange={value => handleRadioChange('fitnessGoal', value)} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-primary/80 mb-2">My current experience level is...</label>
                        <RadioGroup options={levels} selected={profile.experienceLevel} onChange={value => handleRadioChange('experienceLevel', value)} />
                    </div>
                 </div>
            </Card>
            
             <Card>
                 <h2 className="text-xl font-bold text-text-primary mb-4">Notification Settings</h2>
                 <div className="space-y-3">
                    <CheckboxField id="emailNotify" name="emailNotify" label="Receive email notifications and reminders" checked={profile.notificationPreferences.email} onChange={handleChange} />
                    <CheckboxField id="smsNotify" name="smsNotify" label="Receive SMS text message reminders" checked={profile.notificationPreferences.sms} onChange={handleChange} />
                 </div>
            </Card>
            
            <div className="flex justify-end pt-4">
                 <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-2 px-6 rounded-md hover:bg-brand-secondary transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed focus-ring"
                >
                    {isSaving ? <Spinner size="5" /> : null}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};
