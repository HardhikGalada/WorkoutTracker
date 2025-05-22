"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useWorkoutStore } from "@/lib/workout-store"
import { Plus, X, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ActiveWorkout({ workoutId, onComplete }: { workoutId: string; onComplete: () => void }) {
  const { toast } = useToast()
  const { workouts, settings, completeWorkout } = useWorkoutStore()
  const workout = workouts.find((w) => w.id === workoutId)

  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [exercises, setExercises] = useState(workout?.exercises || [])
  const [cardio, setCardio] = useState(workout?.cardio || [])
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showAddCardio, setShowAddCardio] = useState(false)
  const [newExercise, setNewExercise] = useState({ name: "", muscleGroup: "chest", sets: [] })
  const [newCardio, setNewCardio] = useState({ type: "running", minutes: 0, distance: 0 })

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle exercise sets
  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex].sets.push({
      reps: 0,
      weight: 0,
      completed: false,
    })
    setExercises(updatedExercises)
  }

  const updateSet = (exerciseIndex: number, setIndex: number, field: "reps" | "weight", value: number) => {
    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex].sets[setIndex][field] = value
    setExercises(updatedExercises)
  }

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex].sets[setIndex].completed = !updatedExercises[exerciseIndex].sets[setIndex].completed
    setExercises(updatedExercises)
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1)
    setExercises(updatedExercises)
  }

  // Add new exercise
  const handleAddExercise = () => {
    if (newExercise.name.trim()) {
      setExercises([...exercises, { ...newExercise, sets: [{ reps: 0, weight: 0, completed: false }] }])
      setNewExercise({ name: "", muscleGroup: "chest", sets: [] })
      setShowAddExercise(false)
    }
  }

  // Add new cardio
  const handleAddCardio = () => {
    setCardio([...cardio, newCardio])
    setNewCardio({ type: "running", minutes: 0, distance: 0 })
    setShowAddCardio(false)
  }

  // Update cardio
  const updateCardio = (index: number, field: "minutes" | "distance", value: number) => {
    const updatedCardio = [...cardio]
    updatedCardio[index][field] = value
    setCardio(updatedCardio)
  }

  const removeCardio = (index: number) => {
    const updatedCardio = [...cardio]
    updatedCardio.splice(index, 1)
    setCardio(updatedCardio)
  }

  // Complete workout
  const handleCompleteWorkout = () => {
    if (!workout) return

    completeWorkout({
      id: crypto.randomUUID(),
      workoutId: workout.id,
      name: workout.name,
      exercises,
      cardio,
      date: new Date().toISOString(),
      duration: Math.floor(timer / 60),
    })

    toast({
      title: "Workout Completed",
      description: "Your workout has been saved successfully.",
    })

    onComplete()
  }

  if (!workout) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{workout.name}</CardTitle>
              <CardDescription>Active Workout</CardDescription>
            </div>
            <div className="text-2xl font-mono">{formatTime(timer)}</div>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? "Pause Timer" : "Resume Timer"}
          </Button>
          <Button onClick={handleCompleteWorkout}>Complete Workout</Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="exercises">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          {exercises.map((exercise, exerciseIndex) => (
            <Card key={exerciseIndex}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{exercise.name}</CardTitle>
                    <CardDescription>{exercise.muscleGroup}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center space-x-2">
                      <div className="w-10 text-center">{setIndex + 1}</div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`reps-${exerciseIndex}-${setIndex}`} className="sr-only">
                            Reps
                          </Label>
                          <Input
                            id={`reps-${exerciseIndex}-${setIndex}`}
                            type="number"
                            placeholder="Reps"
                            value={set.reps || ""}
                            onChange={(e) =>
                              updateSet(exerciseIndex, setIndex, "reps", Number.parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={`weight-${exerciseIndex}-${setIndex}`}
                            type="number"
                            placeholder="Weight"
                            value={set.weight || ""}
                            onChange={(e) =>
                              updateSet(exerciseIndex, setIndex, "weight", Number.parseInt(e.target.value) || 0)
                            }
                          />
                          <span className="text-sm">{settings.weightUnit}</span>
                        </div>
                      </div>
                      <Button
                        variant={set.completed ? "default" : "outline"}
                        size="icon"
                        onClick={() => toggleSetCompletion(exerciseIndex, setIndex)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeSet(exerciseIndex, setIndex)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => addSet(exerciseIndex)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Set
                </Button>
              </CardFooter>
            </Card>
          ))}

          <Button onClick={() => setShowAddExercise(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Exercise
          </Button>

          <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Exercise</DialogTitle>
                <DialogDescription>Add a new exercise to your workout</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="exercise-name">Exercise Name</Label>
                  <Input
                    id="exercise-name"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                    placeholder="e.g., Bench Press, Squat"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="muscle-group">Muscle Group</Label>
                  <Select
                    value={newExercise.muscleGroup}
                    onValueChange={(value) => setNewExercise({ ...newExercise, muscleGroup: value })}
                  >
                    <SelectTrigger id="muscle-group">
                      <SelectValue placeholder="Select muscle group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chest">Chest</SelectItem>
                      <SelectItem value="back">Back</SelectItem>
                      <SelectItem value="legs">Legs</SelectItem>
                      <SelectItem value="shoulders">Shoulders</SelectItem>
                      <SelectItem value="arms">Arms</SelectItem>
                      <SelectItem value="core">Core</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddExercise}>Add Exercise</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="cardio" className="space-y-4">
          {cardio.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="capitalize">{item.type}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => removeCardio(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`cardio-minutes-${index}`}>Minutes</Label>
                    <Input
                      id={`cardio-minutes-${index}`}
                      type="number"
                      value={item.minutes || ""}
                      onChange={(e) => updateCardio(index, "minutes", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cardio-distance-${index}`}>Distance ({settings.distanceUnit})</Label>
                    <Input
                      id={`cardio-distance-${index}`}
                      type="number"
                      step="0.1"
                      value={item.distance || ""}
                      onChange={(e) => updateCardio(index, "distance", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={() => setShowAddCardio(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Cardio
          </Button>

          <Dialog open={showAddCardio} onOpenChange={setShowAddCardio}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Cardio</DialogTitle>
                <DialogDescription>Add a new cardio session to your workout</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="cardio-type">Type</Label>
                  <Select value={newCardio.type} onValueChange={(value) => setNewCardio({ ...newCardio, type: value })}>
                    <SelectTrigger id="cardio-type">
                      <SelectValue placeholder="Select cardio type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="cycling">Cycling</SelectItem>
                      <SelectItem value="swimming">Swimming</SelectItem>
                      <SelectItem value="elliptical">Elliptical</SelectItem>
                      <SelectItem value="rowing">Rowing</SelectItem>
                      <SelectItem value="stair-climber">Stair Climber</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cardio-minutes">Minutes</Label>
                  <Input
                    id="cardio-minutes"
                    type="number"
                    value={newCardio.minutes || ""}
                    onChange={(e) => setNewCardio({ ...newCardio, minutes: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cardio-distance">Distance ({settings.distanceUnit})</Label>
                  <Input
                    id="cardio-distance"
                    type="number"
                    step="0.1"
                    value={newCardio.distance || ""}
                    onChange={(e) => setNewCardio({ ...newCardio, distance: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddCardio}>Add Cardio</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
