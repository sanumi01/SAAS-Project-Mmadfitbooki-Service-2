import React from 'react';
import type { WorkoutPlan, DailyWorkout, WorkoutExercise, WorkoutActivity } from '../types';
import { Card } from './common/Card';

const ActivityList: React.FC<{ title: string, activities: WorkoutActivity[] }> = ({ title, activities }) => (
    <div>
        <h4 className="font-semibold text-text-primary/80">{title}</h4>
        <ul className="list-disc list-inside text-text-primary text-sm space-y-1 mt-1">
            {activities.map((activity, index) => (
                <li key={index}>
                    {activity.exercise || activity.stretch}: <span className="text-text-primary/80">{activity.duration}</span>
                </li>
            ))}
        </ul>
    </div>
);

const ExerciseTable: React.FC<{ exercises: WorkoutExercise[] }> = ({ exercises }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-background-dark text-xs text-text-primary/80 uppercase">
                <tr>
                    <th className="px-4 py-2">Exercise</th>
                    <th className="px-4 py-2 text-center">Sets</th>
                    <th className="px-4 py-2 text-center">Reps</th>
                    <th className="px-4 py-2 text-center">Rest</th>
                </tr>
            </thead>
            <tbody>
                {exercises.map((ex, index) => (
                    <tr key={index} className="border-b border-border-dark last:border-0">
                        <td className="px-4 py-2 font-medium text-text-primary">{ex.name}</td>
                        <td className="px-4 py-2 text-center text-text-primary/80">{ex.sets}</td>
                        <td className="px-4 py-2 text-center text-text-primary/80">{ex.reps}</td>
                        <td className="px-4 py-2 text-center text-text-primary/80">{ex.rest}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const DailyWorkoutCard: React.FC<{ dailyWorkout: DailyWorkout }> = ({ dailyWorkout }) => (
    <Card className="bg-background-dark">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-text-primary">{dailyWorkout.day}</h3>
            <span className="text-sm font-medium bg-brand-secondary text-brand-primary px-3 py-1 rounded-full">{dailyWorkout.focus}</span>
        </div>
        <div className="space-y-4">
            {dailyWorkout.warmup && dailyWorkout.warmup.length > 0 && (
                <ActivityList title="Warm-up" activities={dailyWorkout.warmup} />
            )}
            
            <div>
                 <h4 className="font-semibold text-text-primary/80 mb-2">Workout</h4>
                 <ExerciseTable exercises={dailyWorkout.exercises} />
            </div>

            {dailyWorkout.cooldown && dailyWorkout.cooldown.length > 0 && (
                <ActivityList title="Cool-down" activities={dailyWorkout.cooldown} />
            )}
        </div>
    </Card>
);

interface WorkoutPlanDisplayProps {
    plan: WorkoutPlan;
}

export const WorkoutPlanDisplay: React.FC<WorkoutPlanDisplayProps> = ({ plan }) => {
    return (
        <div className="mt-10 space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-4xl font-extrabold text-text-primary tracking-tight">{plan.planName}</h2>
                <p className="mt-4 text-lg text-text-primary/80">Your personalized weekly workout plan is ready!</p>
            </div>
            
            <div className="space-y-6">
                {plan.weeklySchedule.map((dailyWorkout, index) => (
                    <DailyWorkoutCard key={index} dailyWorkout={dailyWorkout} />
                ))}
            </div>

            <Card className="bg-surface-dark border-yellow-500/50">
                <p className="text-center text-sm text-yellow-300/80">
                    <span className="font-bold">Disclaimer:</span> {plan.disclaimer}
                </p>
            </Card>
        </div>
    );
};
