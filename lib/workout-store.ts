"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Types
export type WeightUnit = "kg" | "lb"
export type DistanceUnit = "km" | "mi"
export type HeightUnit = "cm" | "in"

// Updated muscle groups
export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "quads"
  | "hamstrings"
  | "core"
  | "neck"
  | "forearms"

export interface Set {
  reps: number
  weight: number
  completed: boolean
  date?: string // For tracking progress over time
}

export interface Exercise {
  id: string
  name: string
  muscleGroups: MuscleGroup[] // Allow multiple muscle groups
  sets: Set[]
  notes?: string
}

export interface LibraryExercise {
  id: string
  name: string
  muscleGroups: MuscleGroup[]
  description?: string
  equipment?: string[]
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
  notes?: string
  isTemplate?: boolean
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

export interface ExerciseHistory {
  exerciseId: string
  exerciseName: string
  sets: (Set & { date: string })[]
}

export interface BodyMetrics {
  date: string
  weight: number
  height: number
  bodyFatPercentage?: number
}

export interface Settings {
  weightUnit: WeightUnit
  distanceUnit: DistanceUnit
  heightUnit: HeightUnit
  darkMode: boolean
}

interface WorkoutStore {
  workouts: Workout[]
  completedWorkouts: CompletedWorkout[]
  exerciseLibrary: LibraryExercise[]
  exerciseHistory: ExerciseHistory[]
  bodyMetrics: BodyMetrics[]
  activeWorkoutId: string | null
  settings: Settings
  recentWorkouts: CompletedWorkout[]

  // New methods for cloud sync
  setWorkouts: (workouts: Workout[]) => void
  setCompletedWorkouts: (completedWorkouts: CompletedWorkout[]) => void
  setExerciseLibrary: (exerciseLibrary: LibraryExercise[]) => void
  setExerciseHistory: (exerciseHistory: ExerciseHistory[]) => void
  setBodyMetrics: (bodyMetrics: BodyMetrics[]) => void
  setSettings: (settings: Settings) => void

  createWorkout: (name: string) => string
  updateWorkout: (workout: Workout) => void
  deleteWorkout: (id: string) => void
  startWorkout: (id: string) => void
  completeWorkout: (workout: CompletedWorkout) => void
  updateSettings: (settings: Settings) => void
  duplicateWorkout: (id: string) => string
  addExerciseToLibrary: (exercise: LibraryExercise) => void
  updateExerciseInLibrary: (exercise: LibraryExercise) => void
  deleteExerciseFromLibrary: (id: string) => void
  recordExerciseProgress: (exerciseId: string, exerciseName: string, sets: Set[]) => void
  addBodyMetrics: (metrics: Omit<BodyMetrics, "date">) => void
  getLatestBodyMetrics: () => BodyMetrics | null
  calculateBMI: () => number | null
  calculateFFMI: () => number | null
}

// Create an expanded default exercise library
const defaultExerciseLibrary: LibraryExercise[] = [
  // Chest exercises
  {
    id: "ex1",
    name: "Bench Press",
    muscleGroups: ["chest", "shoulders", "arms"],
    description: "Lie on a flat bench and press the weight upward until arms are extended.",
    equipment: ["barbell", "bench"],
  },
  {
    id: "ex2",
    name: "Incline Bench Press",
    muscleGroups: ["chest", "shoulders"],
    description: "Perform a bench press on an inclined bench to target the upper chest.",
    equipment: ["barbell", "incline bench"],
  },
  {
    id: "ex3",
    name: "Decline Bench Press",
    muscleGroups: ["chest"],
    description: "Perform a bench press on a declined bench to target the lower chest.",
    equipment: ["barbell", "decline bench"],
  },
  {
    id: "ex4",
    name: "Dumbbell Fly",
    muscleGroups: ["chest"],
    description: "Lie on a bench and open your arms wide with dumbbells, then bring them together above your chest.",
    equipment: ["dumbbells", "bench"],
  },
  {
    id: "ex5",
    name: "Cable Crossover",
    muscleGroups: ["chest"],
    description: "Using cable machines, pull handles together in front of your chest.",
    equipment: ["cable machine"],
  },
  {
    id: "ex6",
    name: "Push-Up",
    muscleGroups: ["chest", "shoulders", "arms", "core"],
    description:
      "Support your body with your hands and toes, lower until your chest nearly touches the floor, then push back up.",
    equipment: ["bodyweight"],
  },

  // Back exercises
  {
    id: "ex7",
    name: "Pull-up",
    muscleGroups: ["back", "arms", "forearms"],
    description: "Hang from a bar and pull your body upward until your chin is above the bar.",
    equipment: ["pull-up bar"],
  },
  {
    id: "ex8",
    name: "Lat Pulldown",
    muscleGroups: ["back", "arms"],
    description: "Pull a bar down to chest level from an overhead position.",
    equipment: ["cable machine"],
  },
  {
    id: "ex9",
    name: "Bent Over Row",
    muscleGroups: ["back", "forearms"],
    description: "Bend at the hips, keep your back straight, and pull a weight toward your lower chest/abdomen.",
    equipment: ["barbell", "dumbbells"],
  },
  {
    id: "ex10",
    name: "T-Bar Row",
    muscleGroups: ["back"],
    description: "Using a T-bar row machine or landmine attachment, pull the weight toward your torso.",
    equipment: ["t-bar row machine", "barbell"],
  },
  {
    id: "ex11",
    name: "Seated Cable Row",
    muscleGroups: ["back", "arms"],
    description: "Sit at a cable row station and pull the handle toward your lower abdomen.",
    equipment: ["cable machine"],
  },
  {
    id: "ex12",
    name: "Single-Arm Dumbbell Row",
    muscleGroups: ["back", "forearms"],
    description: "With one hand on a bench for support, pull a dumbbell up with the other arm.",
    equipment: ["dumbbell", "bench"],
  },

  // Leg exercises
  {
    id: "ex13",
    name: "Squat",
    muscleGroups: ["quads", "hamstrings", "core"],
    description: "Lower your body by bending your knees and hips, then return to standing position.",
    equipment: ["barbell", "squat rack"],
  },
  {
    id: "ex14",
    name: "Deadlift",
    muscleGroups: ["back", "hamstrings", "quads", "forearms"],
    description: "Lift a weight from the ground to hip level, keeping your back straight.",
    equipment: ["barbell"],
  },
  {
    id: "ex15",
    name: "Leg Press",
    muscleGroups: ["quads", "hamstrings"],
    description: "Push a weight away from your body using your legs.",
    equipment: ["leg press machine"],
  },
  {
    id: "ex16",
    name: "Leg Extension",
    muscleGroups: ["quads"],
    description: "Extend your legs against resistance from a seated position.",
    equipment: ["leg extension machine"],
  },
  {
    id: "ex17",
    name: "Leg Curl",
    muscleGroups: ["hamstrings"],
    description: "Curl your legs against resistance from a prone or seated position.",
    equipment: ["leg curl machine"],
  },
  {
    id: "ex18",
    name: "Romanian Deadlift",
    muscleGroups: ["hamstrings", "back"],
    description: "Hinge at the hips with a slight knee bend, lowering the weight while keeping back straight.",
    equipment: ["barbell", "dumbbells"],
  },
  {
    id: "ex19",
    name: "Bulgarian Split Squat",
    muscleGroups: ["quads", "hamstrings"],
    description: "With one foot elevated behind you, lower your body into a lunge position.",
    equipment: ["dumbbells", "bench"],
  },
  {
    id: "ex20",
    name: "Calf Raise",
    muscleGroups: ["quads"],
    description: "Raise your heels off the ground by extending your ankles.",
    equipment: ["calf raise machine", "barbell", "dumbbells"],
  },

  // Shoulder exercises
  {
    id: "ex21",
    name: "Overhead Press",
    muscleGroups: ["shoulders", "arms"],
    description: "Press a weight overhead from shoulder height until arms are fully extended.",
    equipment: ["barbell", "dumbbells"],
  },
  {
    id: "ex22",
    name: "Lateral Raise",
    muscleGroups: ["shoulders"],
    description: "Raise weights out to the sides until arms are parallel to the floor.",
    equipment: ["dumbbells"],
  },
  {
    id: "ex23",
    name: "Front Raise",
    muscleGroups: ["shoulders"],
    description: "Raise weights in front of you until arms are parallel to the floor.",
    equipment: ["dumbbells", "barbell", "weight plate"],
  },
  {
    id: "ex24",
    name: "Reverse Fly",
    muscleGroups: ["shoulders", "back"],
    description: "Bend forward and raise weights out to the sides, focusing on squeezing shoulder blades together.",
    equipment: ["dumbbells", "cable machine"],
  },
  {
    id: "ex25",
    name: "Face Pull",
    muscleGroups: ["shoulders", "back"],
    description: "Pull a rope attachment toward your face, focusing on external rotation of the shoulders.",
    equipment: ["cable machine"],
  },
  {
    id: "ex26",
    name: "Upright Row",
    muscleGroups: ["shoulders", "forearms"],
    description: "Pull a weight up along the front of your body to chin height.",
    equipment: ["barbell", "dumbbells", "cable machine"],
  },

  // Arm exercises
  {
    id: "ex27",
    name: "Bicep Curl",
    muscleGroups: ["arms", "forearms"],
    description: "Curl a weight from a hanging position to shoulder height, keeping elbows fixed.",
    equipment: ["dumbbells", "barbell", "cable machine"],
  },
  {
    id: "ex28",
    name: "Hammer Curl",
    muscleGroups: ["arms", "forearms"],
    description: "Perform a bicep curl with palms facing each other.",
    equipment: ["dumbbells"],
  },
  {
    id: "ex29",
    name: "Preacher Curl",
    muscleGroups: ["arms"],
    description: "Perform bicep curls with the back of your arms resting on an angled pad.",
    equipment: ["preacher bench", "dumbbells", "barbell", "ez-bar"],
  },
  {
    id: "ex30",
    name: "Tricep Extension",
    muscleGroups: ["arms"],
    description: "Extend your arms against resistance, targeting the triceps.",
    equipment: ["dumbbells", "cable machine"],
  },
  {
    id: "ex31",
    name: "Tricep Pushdown",
    muscleGroups: ["arms"],
    description: "Push a cable attachment down by extending your elbows.",
    equipment: ["cable machine"],
  },
  {
    id: "ex32",
    name: "Skull Crusher",
    muscleGroups: ["arms"],
    description: "Lying on a bench, lower a weight toward your forehead by bending at the elbows.",
    equipment: ["barbell", "dumbbells", "ez-bar", "bench"],
  },
  {
    id: "ex33",
    name: "Dip",
    muscleGroups: ["chest", "arms"],
    description: "Lower your body between parallel bars by bending your elbows, then push back up.",
    equipment: ["dip bars", "bench"],
  },

  // Core exercises
  {
    id: "ex34",
    name: "Plank",
    muscleGroups: ["core"],
    description: "Hold a position similar to a push-up, maintaining a straight body.",
    equipment: ["bodyweight"],
  },
  {
    id: "ex35",
    name: "Crunch",
    muscleGroups: ["core"],
    description: "Lie on your back and curl your torso toward your knees.",
    equipment: ["bodyweight", "exercise mat"],
  },
  {
    id: "ex36",
    name: "Russian Twist",
    muscleGroups: ["core"],
    description: "Sit with knees bent and rotate your torso from side to side.",
    equipment: ["bodyweight", "weight plate", "medicine ball"],
  },
  {
    id: "ex37",
    name: "Leg Raise",
    muscleGroups: ["core"],
    description: "Lie on your back and raise your legs toward the ceiling.",
    equipment: ["bodyweight", "exercise mat", "captain's chair"],
  },
  {
    id: "ex38",
    name: "Ab Wheel Rollout",
    muscleGroups: ["core", "shoulders"],
    description: "Kneel and roll an ab wheel forward, extending your body, then pull back to starting position.",
    equipment: ["ab wheel"],
  },
  {
    id: "ex39",
    name: "Mountain Climber",
    muscleGroups: ["core", "quads"],
    description: "In a push-up position, alternate bringing knees toward chest in a running motion.",
    equipment: ["bodyweight"],
  },

  // Neck exercises
  {
    id: "ex40",
    name: "Neck Curl",
    muscleGroups: ["neck"],
    description: "Strengthen neck muscles by curling your head forward against resistance.",
    equipment: ["weight plate", "neck harness"],
  },
  {
    id: "ex41",
    name: "Neck Extension",
    muscleGroups: ["neck"],
    description: "Strengthen neck muscles by extending your head backward against resistance.",
    equipment: ["weight plate", "neck harness"],
  },
  {
    id: "ex42",
    name: "Lateral Neck Flexion",
    muscleGroups: ["neck"],
    description: "Tilt your head to the side against resistance to strengthen neck muscles.",
    equipment: ["weight plate", "neck harness", "resistance band"],
  },

  // Forearm exercises
  {
    id: "ex43",
    name: "Wrist Curl",
    muscleGroups: ["forearms"],
    description: "Curl your wrists upward against resistance.",
    equipment: ["dumbbells", "barbell"],
  },
  {
    id: "ex44",
    name: "Reverse Wrist Curl",
    muscleGroups: ["forearms"],
    description: "Curl your wrists downward against resistance.",
    equipment: ["dumbbells", "barbell"],
  },
  {
    id: "ex45",
    name: "Farmer's Walk",
    muscleGroups: ["forearms", "shoulders", "core"],
    description: "Walk while carrying heavy weights in each hand.",
    equipment: ["dumbbells", "kettlebells", "farmer's walk handles"],
  },
  {
    id: "ex46",
    name: "Plate Pinch",
    muscleGroups: ["forearms"],
    description: "Pinch weight plates together with your fingers and hold.",
    equipment: ["weight plates"],
  },
  {
    id: "ex47",
    name: "Grip Trainer",
    muscleGroups: ["forearms"],
    description: "Squeeze a grip strengthener device to build forearm and grip strength.",
    equipment: ["grip trainer"],
  },

  // Compound movements
  {
    id: "ex48",
    name: "Clean and Press",
    muscleGroups: ["shoulders", "back", "quads", "hamstrings", "core"],
    description: "Lift a weight from the floor to shoulder height, then press it overhead.",
    equipment: ["barbell", "dumbbells", "kettlebells"],
  },
  {
    id: "ex49",
    name: "Turkish Get-Up",
    muscleGroups: ["shoulders", "core", "arms", "quads"],
    description: "Rise from lying to standing position while holding a weight overhead.",
    equipment: ["kettlebell", "dumbbell"],
  },
  {
    id: "ex50",
    name: "Thruster",
    muscleGroups: ["shoulders", "quads", "core"],
    description: "Combine a front squat with an overhead press in one fluid movement.",
    equipment: ["barbell", "dumbbells", "kettlebells"],
  },
]

// Update the store to include body metrics and BMI/FFMI calculations
export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      workouts: [],
      completedWorkouts: [],
      exerciseLibrary: defaultExerciseLibrary,
      exerciseHistory: [],
      bodyMetrics: [],
      activeWorkoutId: null,
      settings: {
        weightUnit: "kg",
        distanceUnit: "km",
        heightUnit: "cm",
        darkMode: true, // Set dark mode to true by default
      },

      // New methods for cloud sync
      setWorkouts: (workouts) => set({ workouts }),
      setCompletedWorkouts: (completedWorkouts) => set({ completedWorkouts }),
      setExerciseLibrary: (exerciseLibrary) => set({ exerciseLibrary }),
      setExerciseHistory: (exerciseHistory) => set({ exerciseHistory }),
      setBodyMetrics: (bodyMetrics) => set({ bodyMetrics }),
      setSettings: (settings) => set({ settings }),

      get recentWorkouts() {
        return get()
          .completedWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3)
      },

      createWorkout: (name) => {
        const id = crypto.randomUUID()
        set((state) => ({
          workouts: [
            ...state.workouts,
            {
              id,
              name,
              exercises: [],
              cardio: [],
            },
          ],
        }))
        return id
      },

      updateWorkout: (workout) =>
        set((state) => ({
          workouts: state.workouts.map((w) => (w.id === workout.id ? workout : w)),
        })),

      deleteWorkout: (id) =>
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        })),

      startWorkout: (id) => set({ activeWorkoutId: id }),

      completeWorkout: (workout) => {
        // Record exercise progress when completing a workout
        workout.exercises.forEach((exercise) => {
          const completedSets = exercise.sets.filter((set) => set.completed)
          if (completedSets.length > 0) {
            get().recordExerciseProgress(exercise.id, exercise.name, completedSets)
          }
        })

        set((state) => ({
          completedWorkouts: [...state.completedWorkouts, workout],
          activeWorkoutId: null,
        }))
      },

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      duplicateWorkout: (id) => {
        const workout = get().workouts.find((w) => w.id === id)
        if (!workout) return ""

        const newId = crypto.randomUUID()
        const newWorkout = {
          ...workout,
          id: newId,
          name: `${workout.name} (Copy)`,
          isTemplate: false,
        }

        set((state) => ({
          workouts: [...state.workouts, newWorkout],
        }))

        return newId
      },

      addExerciseToLibrary: (exercise) => {
        set((state) => ({
          exerciseLibrary: [...state.exerciseLibrary, { ...exercise, id: exercise.id || crypto.randomUUID() }],
        }))
      },

      updateExerciseInLibrary: (exercise) => {
        set((state) => ({
          exerciseLibrary: state.exerciseLibrary.map((ex) => (ex.id === exercise.id ? exercise : ex)),
        }))
      },

      deleteExerciseFromLibrary: (id) => {
        set((state) => ({
          exerciseLibrary: state.exerciseLibrary.filter((ex) => ex.id !== id),
        }))
      },

      recordExerciseProgress: (exerciseId, exerciseName, sets) => {
        const date = new Date().toISOString()
        const setsWithDate = sets.map((set) => ({ ...set, date }))

        set((state) => {
          // Find if we already have history for this exercise
          const existingHistoryIndex = state.exerciseHistory.findIndex((history) => history.exerciseId === exerciseId)

          if (existingHistoryIndex >= 0) {
            // Update existing history
            const updatedHistory = [...state.exerciseHistory]
            updatedHistory[existingHistoryIndex] = {
              ...updatedHistory[existingHistoryIndex],
              sets: [...updatedHistory[existingHistoryIndex].sets, ...setsWithDate],
            }
            return { exerciseHistory: updatedHistory }
          } else {
            // Create new history entry
            return {
              exerciseHistory: [
                ...state.exerciseHistory,
                {
                  exerciseId,
                  exerciseName,
                  sets: setsWithDate,
                },
              ],
            }
          }
        })
      },

      // Add body metrics
      addBodyMetrics: (metrics) => {
        set((state) => ({
          bodyMetrics: [
            ...state.bodyMetrics,
            {
              ...metrics,
              date: new Date().toISOString(),
            },
          ],
        }))
      },

      // Get latest body metrics
      getLatestBodyMetrics: () => {
        const { bodyMetrics } = get()
        if (bodyMetrics.length === 0) return null

        return bodyMetrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      },

      // Calculate BMI
      calculateBMI: () => {
        const latestMetrics = get().getLatestBodyMetrics()
        if (!latestMetrics) return null

        const { weight, height } = latestMetrics
        const { weightUnit, heightUnit } = get().settings

        // Convert to metric if needed
        const weightInKg = weightUnit === "lb" ? weight * 0.453592 : weight
        const heightInM = heightUnit === "in" ? height * 0.0254 : height / 100

        // BMI formula: weight(kg) / height(m)²
        return Number((weightInKg / (heightInM * heightInM)).toFixed(1))
      },

      // Calculate FFMI
      calculateFFMI: () => {
        const latestMetrics = get().getLatestBodyMetrics()
        if (!latestMetrics || latestMetrics.bodyFatPercentage === undefined) return null

        const { weight, height, bodyFatPercentage } = latestMetrics
        const { weightUnit, heightUnit } = get().settings

        // Convert to metric if needed
        const weightInKg = weightUnit === "lb" ? weight * 0.453592 : weight
        const heightInM = heightUnit === "in" ? height * 0.0254 : height / 100

        // Calculate lean body mass: weight * (1 - body fat percentage)
        const leanMass = weightInKg * (1 - bodyFatPercentage / 100)

        // FFMI formula: lean mass(kg) / height(m)² + 6.1 * (1.8 - height(m))
        return Number((leanMass / (heightInM * heightInM) + 6.1 * (1.8 - heightInM)).toFixed(1))
      },
    }),
    {
      name: "workout-tracker-storage",
    },
  ),
)
