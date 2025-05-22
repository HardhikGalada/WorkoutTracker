"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useWorkoutStore, type LibraryExercise } from "@/lib/workout-store"
import { Plus, X, ArrowLeft, Save, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function WorkoutEditor({ workoutId, onClose }: { workoutId: string; onClose: () => void }) {
  const { toast } = useToast()
  const { workouts, updateWorkout, settings, exerciseLibrary } = useWorkoutStore()
  const originalWorkout = workouts.find((w) => w.id === workoutId)

  const [workout, setWorkout] = useState(
    originalWorkout || {
      id: workoutId,
      name: "",
      exercises: [],
      cardio: [],
      notes: "",
      isTemplate: false,
    },
  )

  const [showAddCardio, setShowAddCardio] = useState(false)
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [newCardio, setNewCardio] = useState({ type: "running", minutes: 0, distance: 0 })

  // All available muscle groups
  const muscleGroups = ["chest", "back", "shoulders", "arms", "quads", "hamstrings", "core", "neck", "forearms"]

  // Filter exercises based on search and selected muscle groups
  const filteredExercises = exerciseLibrary.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesMuscleGroups =
      selectedMuscleGroups.length === 0 || selectedMuscleGroups.some((mg) => exercise.muscleGroups.includes(mg))

    return matchesSearch && matchesMuscleGroups
  })

  // Remove exercise
  const removeExercise = (index: number) => {
    const updatedExercises = [...workout.exercises]
    updatedExercises.splice(index, 1)
    setWorkout({ ...workout, exercises: updatedExercises })
  }

  // Add exercise from library
  const addExerciseFromLibrary = (exercise: LibraryExercise) => {
    // Add exercise with a standard set of 3 sets
    setWorkout({
      ...workout,
      exercises: [
        ...workout.exercises,
        {
          id: exercise.id,
          name: exercise.name,
          muscleGroups: [...exercise.muscleGroups],
          sets: [
            { reps: 10, weight: 0, completed: false },
            { reps: 10, weight: 0, completed: false },
            { reps: 10, weight: 0, completed: false },
          ],
        },
      ],
    })
    setShowExerciseLibrary(false)
    toast({
      title: "Exercise Added",
      description: `${exercise.name} has been added to your workout.`,
    })
  }

  // Add new cardio
  const handleAddCardio = () => {
    setWorkout({
      ...workout,
      cardio: [...workout.cardio, newCardio],
    })
    setNewCardio({ type: "running", minutes: 0, distance: 0 })
    setShowAddCardio(false)
  }

  // Update cardio
  const updateCardio = (index: number, field: "type" | "minutes" | "distance", value: any) => {
    const updatedCardio = [...workout.cardio]
    updatedCardio[index][field] = value
    setWorkout({ ...workout, cardio: updatedCardio })
  }

  const removeCardio = (index: number) => {
    const updatedCardio = [...workout.cardio]
    updatedCardio.splice(index, 1)
    setWorkout({ ...workout, cardio: updatedCardio })
  }

  // Save workout
  const handleSaveWorkout = () => {
    updateWorkout(workout)
    toast({
      title: "Workout Saved",
      description: "Your workout has been saved successfully.",
    })
    onClose()
  }

  // Move exercise up or down
  const moveExercise = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === workout.exercises.length - 1)) {
      return
    }

    const newIndex = direction === "up" ? index - 1 : index + 1
    const updatedExercises = [...workout.exercises]
    const exercise = updatedExercises[index]
    updatedExercises.splice(index, 1)
    updatedExercises.splice(newIndex, 0, exercise)
    setWorkout({ ...workout, exercises: updatedExercises })
  }

  const toggleMuscleGroupFilter = (muscleGroup: string) => {
    setSelectedMuscleGroups((prev) =>
      prev.includes(muscleGroup) ? prev.filter((mg) => mg !== muscleGroup) : [...prev, muscleGroup],
    )
  }

  // Update exercise sets count
  const updateExerciseSetsCount = (exerciseIndex: number, count: number) => {
    const updatedExercises = [...workout.exercises]
    const currentSets = updatedExercises[exerciseIndex].sets
    const newSets = [...currentSets]

    // Get the current reps and weight values (from the first set)
    const currentReps = currentSets.length > 0 ? currentSets[0].reps : 10
    const currentWeight = currentSets.length > 0 ? currentSets[0].weight : 0

    // If we need to add sets
    if (count > currentSets.length) {
      for (let i = currentSets.length; i < count; i++) {
        newSets.push({ reps: currentReps, weight: currentWeight, completed: false })
      }
    }
    // If we need to remove sets
    else if (count < currentSets.length) {
      newSets.splice(count)
    }

    updatedExercises[exerciseIndex].sets = newSets
    setWorkout({ ...workout, exercises: updatedExercises })
  }

  // Update all sets for an exercise with the same reps and weight
  const updateAllSets = (exerciseIndex: number, field: "reps" | "weight", value: number) => {
    const updatedExercises = [...workout.exercises]
    const sets = updatedExercises[exerciseIndex].sets

    // Update all sets with the same value
    updatedExercises[exerciseIndex].sets = sets.map((set) => ({
      ...set,
      [field]: value,
    }))

    setWorkout({ ...workout, exercises: updatedExercises })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Edit Workout</h2>
        <Button onClick={handleSaveWorkout}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="workout-name">Workout Name</Label>
            <Input
              id="workout-name"
              value={workout.name}
              onChange={(e) => setWorkout({ ...workout, name: e.target.value })}
              placeholder="e.g., Push Day, Leg Day"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="workout-notes">Notes</Label>
            <Textarea
              id="workout-notes"
              value={workout.notes || ""}
              onChange={(e) => setWorkout({ ...workout, notes: e.target.value })}
              placeholder="Add any notes about this workout..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="exercises">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          {workout.exercises.map((exercise, exerciseIndex) => (
            <Card key={exerciseIndex}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <CardTitle>{exercise.name}</CardTitle>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exercise.muscleGroups.map((mg) => (
                        <Badge key={mg} variant="secondary" className="capitalize">
                          {mg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveExercise(exerciseIndex, "up")}
                      disabled={exerciseIndex === 0}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveExercise(exerciseIndex, "down")}
                      disabled={exerciseIndex === workout.exercises.length - 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeExercise(exerciseIndex)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`sets-count-${exerciseIndex}`}>Number of Sets</Label>
                      <Select
                        value={exercise.sets.length.toString()}
                        onValueChange={(value) => updateExerciseSetsCount(exerciseIndex, Number.parseInt(value))}
                      >
                        <SelectTrigger id={`sets-count-${exerciseIndex}`}>
                          <SelectValue placeholder="Sets" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`reps-${exerciseIndex}`}>Reps per Set</Label>
                      <Input
                        id={`reps-${exerciseIndex}`}
                        type="number"
                        value={exercise.sets.length > 0 ? exercise.sets[0].reps : ""}
                        onChange={(e) => updateAllSets(exerciseIndex, "reps", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`weight-${exerciseIndex}`}>Weight ({settings.weightUnit})</Label>
                      <Input
                        id={`weight-${exerciseIndex}`}
                        type="number"
                        value={exercise.sets.length > 0 ? exercise.sets[0].weight : ""}
                        onChange={(e) => updateAllSets(exerciseIndex, "weight", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {exercise.sets.length} {exercise.sets.length === 1 ? "set" : "sets"} of{" "}
                    {exercise.sets[0]?.reps || 0} reps at {exercise.sets[0]?.weight || 0} {settings.weightUnit}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowExerciseLibrary(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add from Library
            </Button>
          </div>

          <Dialog open={showExerciseLibrary} onOpenChange={setShowExerciseLibrary}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Exercise Library</DialogTitle>
                <DialogDescription>Select exercises to add to your workout</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search exercises..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {muscleGroups.map((muscleGroup) => (
                    <Badge
                      key={muscleGroup}
                      variant={selectedMuscleGroups.includes(muscleGroup) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => toggleMuscleGroupFilter(muscleGroup)}
                    >
                      {muscleGroup}
                    </Badge>
                  ))}
                </div>

                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {filteredExercises.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No exercises found</p>
                    ) : (
                      filteredExercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex justify-between items-center p-2 rounded-md hover:bg-muted"
                        >
                          <div>
                            <p className="font-medium">{exercise.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {exercise.muscleGroups.map((mg) => (
                                <Badge key={mg} variant="secondary" className="capitalize text-xs">
                                  {mg}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button size="sm" onClick={() => addExerciseFromLibrary(exercise)}>
                            Add
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="cardio" className="space-y-4">
          {workout.cardio.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Select value={item.type} onValueChange={(value) => updateCardio(index, "type", value)}>
                    <SelectTrigger className="w-[180px] border-none p-0 h-auto font-bold text-lg focus:ring-0">
                      <SelectValue />
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
