import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Spinner } from '../components/common/Spinner';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import * as aiService from '../services/aiService';
import type { WorkoutPlan, WorkoutPreferences } from '../types';
import { WorkoutPlanDisplay } from '../components/WorkoutPlanDisplay';
import { useNotification } from '../contexts/NotificationContext';

const goals = ["Build Muscle", "Lose Weight", "Improve Endurance", "Increase Flexibility", "General Fitness"];
const levels = ["Beginner", "Intermediate", "Advanced"];
const allEquipment = ["Bodyweight only", "Dumbbells", "Barbell", "Kettlebells", "Resistance Bands", "Pull-up Bar", "Treadmill", "Stationary Bike"];

const FormField: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-text-primary/80 mb-2">{label}</label>
        {children}
    </div>
);

const RadioGroup: React.FC<{ options: string[], selected: string, onChange: (value: string) => void }> = ({ options, selected, onChange }) => (
    <div className="flex flex-wrap gap-2">
        {options.map(option => (
            <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                    selected === option 
                    ? 'bg-brand-primary text-white' 
                    : 'bg-surface-dark text-text-primary/80 hover:bg-border-dark hover:text-text-primary'
                } focus-ring`}
                aria-pressed={selected === option ? 'true' : 'false'}
            >
                {option}
            </button>
        ))}
    </div>
);

const EquipmentSelector: React.FC<{ selected: string[], onChange: (value: string[]) => void }> = ({ selected, onChange }) => {
    const handleToggle = (item: string) => {
        if (item === "Bodyweight only") {
            onChange(["Bodyweight only"]);
        } else {
            const newSelection = selected.includes(item)
                ? selected.filter(i => i !== item && i !== "Bodyweight only")
                : [...selected.filter(i => i !== "Bodyweight only"), item];
            
            if (newSelection.length === 0) {
                 onChange(["Bodyweight only"]);
            } else {
                onChange(newSelection);
            }
        }
    };
    
    return (
        <div className="flex flex-wrap gap-2">
            {allEquipment.map(item => (
                 <button
                    key={item}
                    type="button"
                    onClick={() => handleToggle(item)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${
                        selected.includes(item)
                        ? 'bg-brand-primary border-brand-primary text-white' 
                        : 'bg-surface-dark border-border-dark text-text-primary/80 hover:bg-border-dark hover:text-text-primary'
                    } focus-ring`}
                    aria-pressed={selected.includes(item) ? 'true' : 'false'}
                >
                    {item}
                </button>
            ))}
        </div>
    );
};

export const WorkoutPlannerView: React.FC = () => {
    const [preferences, setPreferences] = useState<WorkoutPreferences>({
        goal: 'General Fitness',
        level: 'Beginner',
        duration: 45,
        equipment: ['Bodyweight only'],
        daysPerWeek: 3,
        notes: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
    const { addNotification } = useNotification();

    const handlePreferenceChange = <K extends keyof WorkoutPreferences>(key: K, value: WorkoutPreferences[K]) => {
        setPreferences(prev => ({...prev, [key]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setGeneratedPlan(null);
        
        try {
            const plan = await aiService.generateWorkoutPlan(preferences);
            if (plan) {
                setGeneratedPlan(plan);
                addNotification('Your workout plan has been generated!', 'success');
            } else {
                throw new Error("Failed to generate plan.");
            }
        } catch (error) {
            console.error(error);
            addNotification('Could not generate workout plan. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">AI Workout Planner</h1>
                <p className="text-text-primary/80">Get a personalized workout plan tailored to your goals, powered by Gemini.</p>
            </div>
            
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField label="My primary fitness goal is...">
                            <RadioGroup options={goals} selected={preferences.goal} onChange={value => handlePreferenceChange('goal', value)} />
                        </FormField>
                        <FormField label="My current experience level is...">
                            <RadioGroup options={levels} selected={preferences.level} onChange={value => handlePreferenceChange('level', value)} />
                        </FormField>
                    </div>

                    <FormField label="I have access to...">
                        <EquipmentSelector selected={preferences.equipment} onChange={value => handlePreferenceChange('equipment', value)} />
                    </FormField>

                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField label="How many days per week can you work out?">
                            <input
                                    type="number"
                                    min="1"
                                    max="7"
                                    value={preferences.daysPerWeek}
                                    onChange={e = className="focus-ring"> handlePreferenceChange('daysPerWeek', parseInt(e.target.value, 10))}
                                    className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition"
                                />
                        </FormField>
                         <FormField label="How long should each session be? (minutes)">
                            <input
                                type="number"
                                min="15"
                                max="120"
                                step="15"
                                value={preferences.duration}
                                onChange={e = className="focus-ring"> handlePreferenceChange('duration', parseInt(e.target.value, 10))}
                                className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition"
                            />
                        </FormField>
                    </div>

                    <FormField label="Any additional notes? (e.g., focus areas, injuries to avoid)">
                         <textarea
                            rows={3}
                            value={preferences.notes}
                            onChange={e => handlePreferenceChange('notes', e.target.value)}
                            placeholder="e.g., I want to focus on my legs, I have a sensitive right knee..."
                            className="w-full bg-background-dark border border-border-dark rounded px-3 py-2 text-text-primary focus-ring transition"
                        />
                    </FormField>

                    <div className="pt-4 text-center">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-8 rounded-full hover:bg-brand-secondary transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed focus-ring"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="6" />
                                    <span>Generating Plan...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-6 h-6" />
                                    <span>Generate My Plan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Card>

            {generatedPlan && <WorkoutPlanDisplay plan={generatedPlan} />}
        </div>
    );
};
