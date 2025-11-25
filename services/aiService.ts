import { GoogleGenAI, Type } from "@google/genai";
import type { WorkoutPreferences, WorkoutPlan } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const workoutPlanSchema = {
    type: Type.OBJECT,
    properties: {
        planName: { type: Type.STRING, description: "A catchy and motivational name for the workout plan." },
        weeklySchedule: {
            type: Type.ARRAY,
            description: "An array of daily workout objects for the week, corresponding to the number of days requested.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "The day of the week (e.g., 'Monday', 'Day 1')." },
                    focus: { type: Type.STRING, description: "The main focus of the workout (e.g., 'Upper Body Strength', 'Full Body Conditioning', 'Active Recovery')." },
                    warmup: {
                        type: Type.ARRAY,
                        description: "A list of 2-3 specific warmup exercises or activities.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                exercise: { type: Type.STRING, description: "Name of the warmup exercise." },
                                duration: { type: Type.STRING, description: "Duration or reps for the warmup, e.g., '5 minutes' or '2 rounds of 10 reps'." }
                            },
                            required: ['exercise', 'duration'],
                        }
                    },
                    exercises: {
                        type: Type.ARRAY,
                        description: "An array of 5-8 exercise objects for the main workout.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "Name of the exercise." },
                                sets: { type: Type.STRING, description: "Number of sets, e.g., '3' or '3-4'." },
                                reps: { type: Type.STRING, description: "Number of reps or duration, e.g., '8-12', 'AMRAP 1 min', or '30 seconds'." },
                                rest: { type: Type.STRING, description: "Rest time between sets in seconds or minutes, e.g., '60-90s'." }
                            },
                            required: ['name', 'sets', 'reps', 'rest'],
                        }
                    },
                    cooldown: {
                        type: Type.ARRAY,
                        description: "A list of 2-3 specific cooldown stretches.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                stretch: { type: Type.STRING, description: "Name of the stretch." },
                                duration: { type: Type.STRING, description: "Duration to hold the stretch, e.g., '30 seconds per side'." }
                            },
                            required: ['stretch', 'duration'],
                        }
                    }
                },
                required: ['day', 'focus', 'warmup', 'exercises', 'cooldown'],
            }
        },
        disclaimer: { type: Type.STRING, description: "A brief, friendly disclaimer about consulting a professional before starting a new workout routine and listening to your body." }
    },
    required: ['planName', 'weeklySchedule', 'disclaimer'],
};

export const generateWorkoutPlan = async (preferences: WorkoutPreferences): Promise<WorkoutPlan | null> => {
    const { goal, level, duration, equipment, daysPerWeek, notes } = preferences;

    const prompt = `
        Create a personalized ${daysPerWeek}-day workout plan for a user with the following preferences:
        - Primary Goal: ${goal}
        - Experience Level: ${level}
        - Desired Workout Duration per session: ${duration} minutes
        - Available Equipment: ${equipment.join(', ')}
        - Additional Notes: ${notes || 'None'}

        The plan should be well-structured, balanced, and appropriate for their experience level. 
        Each day's workout must include a warm-up, the main exercises with sets, reps, and rest periods, and a cool-down.
        Generate a creative and motivational name for the plan.
        Ensure the total number of items in the 'weeklySchedule' array is exactly ${daysPerWeek}.
        Provide a friendly disclaimer.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: workoutPlanSchema,
            },
        });

        const jsonString = response.text;
        const plan = JSON.parse(jsonString) as WorkoutPlan;
        return plan;
    } catch (error) {
        console.error("Error generating workout plan:", error);
        return null;
    }
};
