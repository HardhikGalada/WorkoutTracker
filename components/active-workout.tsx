"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useWorkoutStore } from "@/lib/workout-store"
import { X, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

export default function ActiveWorkout({ workoutId, onComplete }: { workoutId: string; onComplete: () => void }) {
  const { toast } = useToast()
  const { workouts, settings, completeWorkout } = useWorkoutStore()
  const workout = workouts.find((w) => w.id === workoutId)

  const [exercises, setExercises] = useState(workout?.exercises || [])
  const [cardio, setCardio] = useState(workout?.cardio || [])
  const [showAddCardio, setShowAddCardio] = useState(false)
  const [newCardio, setNewCardio] = useState({ type: "running", minutes: 0, distance: 0 })

  // Handle exercise sets
  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex].sets[setIndex].completed = !updatedExercises[exerciseIndex].sets[setIndex].completed
    setExercises(updatedExercises)
  }

  // Update set values
  const updateSetValue = (exerciseIndex: number, setIndex: number, field: "reps" | "weight", value: number) => {
    const updatedExercises = [...exercises]
    updatedExercises[exerciseIndex].sets[setIndex][field] = value
    setExercises(updatedExercises)
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
      duration: 0, // We're not tracking duration anymore
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
          </div>
        </CardHeader>
        <CardFooter className="flex justify-end">
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
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exercise.muscleGroups.map((mg) => (
                        <Badge key={mg} variant="secondary" className="capitalize">
                          {mg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium">
                    <div className="col-span-1">Set</div>
                    <div className="col-span-5">Reps</div>
                    <div className="col-span-5">Weight ({settings.weightUnit})</div>
                    <div className="col-span-1">Done</div>
                  </div>
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1 text-center">{setIndex + 1}</div>
                      <div className="col-span-5">
                        <Input
                          type="number"
                          placeholder="Reps"
                          value={set.reps || ""}
                          onChange={(e) =>
                            updateSetValue(exerciseIndex, setIndex, "reps", Number.parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          type="number"
                          placeholder="Weight"
                          value={set.weight || ""}
                          onChange={(e) =>
                            updateSetValue(exerciseIndex, setIndex, "weight", Number.parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button
                          variant={set.completed ? "default" : "outline"}
                          size="icon"
                          onClick={() => toggleSetCompletion(exerciseIndex, setIndex)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
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
