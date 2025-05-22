"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Types
export type WeightUnit = "kg" | "lb"
export type DistanceUnit = "km" | "mi"

export interface Set {
  reps: number
  weight: number
  completed: boolean
}

export interface Exercise {
  name: string
  muscleGroup: string
  sets: Set[]
}

export interface CardioSession {
  type: string
  minutes: number
  distance: number
}

export interface Workout {
  id: string
  name: string
  exercises: Exercise[]
  cardio: CardioSession[]
}

export interface CompletedWorkout {
  id: string
  workoutId: string
  name: string
  exercises: Exercise[]
  cardio: CardioSession[]
  date: string
  duration: number
}

export interface Settings {
  weightUnit: WeightUnit
  distanceUnit: DistanceUnit
  darkMode: boolean
}

interface WorkoutStore {
  workouts: Workout[]
  completedWorkouts: CompletedWorkout[]
  activeWorkoutId: string | null
  settings: Settings
  recentWorkouts: CompletedWorkout[]

  createWorkout: (name: string) => void
  updateWorkout: (workout: Workout) => void
  deleteWorkout: (id: string) => void
  startWorkout: (id: string) => void
  completeWorkout: (workout: CompletedWorkout) => void
  updateSettings: (settings: Settings) => void
}

// Create store with persistence
export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      workouts: [
        {
          id: "1",
          name: "Push Day",
          exercises: [
            {
              name: "Bench Press",
              muscleGroup: "chest",
              sets: [
                { reps: 10, weight: 60, completed: false },
                { reps: 8, weight: 70, completed: false },
                { reps: 6, weight: 80, completed: false },
              ],
            },
            {
              name: "Overhead Press",
              muscleGroup: "shoulders",
              sets: [
                { reps: 10, weight: 40, completed: false },
                { reps: 8, weight: 45, completed: false },
                { reps: 6, weight: 50, completed: false },
              ],
            },
          ],
          cardio: [],
        },
        {
          id: "2",
          name: "Pull Day",
          exercises: [
            {
              name: "Pull-ups",
              muscleGroup: "back",
              sets: [
                { reps: 8, weight: 0, completed: false },
                { reps: 8, weight: 0, completed: false },
                { reps: 6, weight: 0, completed: false },
              ],
            },
            {
              name: "Barbell Row",
              muscleGroup: "back",
              sets: [
                { reps: 10, weight: 60, completed: false },
                { reps: 8, weight: 70, completed: false },
                { reps: 6, weight: 80, completed: false },
              ],
            },
          ],
          cardio: [],
        },
        {
          id: "3",
          name: "Leg Day",
          exercises: [
            {
              name: "Squats",
              muscleGroup: "legs",
              sets: [
                { reps: 10, weight: 80, completed: false },
                { reps: 8, weight: 90, completed: false },
                { reps: 6, weight: 100, completed: false },
              ],
            },
            {
              name: "Deadlifts",
              muscleGroup: "legs",
              sets: [
                { reps: 10, weight: 100, completed: false },
                { reps: 8, weight: 110, completed: false },
                { reps: 6, weight: 120, completed: false },
              ],
            },
          ],
          cardio: [],
        },
      ],
      completedWorkouts: [],
      activeWorkoutId: null,
      settings: {
        weightUnit: "kg",
        distanceUnit: "km",
        darkMode: false,
      },

      get recentWorkouts() {
        return get()
          .completedWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3)
      },

      createWorkout: (name) =>
        set((state) => ({
          workouts: [
            ...state.workouts,
            {
              id: crypto.randomUUID(),
              name,
              exercises: [],
              cardio: [],
            },
          ],
        })),

      updateWorkout: (workout) =>
        set((state) => ({
          workouts: state.workouts.map((w) => (w.id === workout.id ? workout : w)),
        })),

      deleteWorkout: (id) =>
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        })),

      startWorkout: (id) => set({ activeWorkoutId: id }),

      completeWorkout: (workout) =>
        set((state) => ({
          completedWorkouts: [...state.completedWorkouts, workout],
          activeWorkoutId: null,
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: "workout-tracker-storage",
    },
  ),
)
