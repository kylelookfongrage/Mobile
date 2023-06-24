import { Workout } from "../aws/models";
import React from 'react'


export interface WorkoutAddition{
    addedAlready?: boolean;
    name: string; 
    id: string;
    img: string;
}


interface ExerciseAdditions {
    workouts: WorkoutAddition[];
    setWorkouts: React.Dispatch<React.SetStateAction<WorkoutAddition[]>>;
}


export const ExerciseAdditionsContext = React.createContext<ExerciseAdditions>({
    workouts: [],
    setWorkouts: () => {}
})


export const useExerciseAdditions = () => React.useContext<ExerciseAdditions>(ExerciseAdditionsContext)