"use client"

import { useState } from "react"
import { Plus, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useWorkoutStore } from "@/lib/workout-store"

export default function Dashboard() {
  const { toast } = useToast()
  const { workouts, recentWorkouts, startWorkout, createWorkout } = useWorkoutStore()
  const [newWorkoutName, setNewWorkoutName] = useState("")
  const [open, setOpen] = useState(false)

  const handleCreateWorkout = () => {
    if (newWorkoutName.trim()) {
      createWorkout(newWorkoutName)
      setNewWorkoutName("")
      setOpen(false)
      toast({
        title: "Workout Created",
        description: `${newWorkoutName} has been created successfully.`,
      })
    }
  }

  const handleStartWorkout = (id: string) => {
    startWorkout(id)
    toast({
      title: "Workout Started",
      description: "Your workout session has begun. Let's crush it!",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quick Start</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Workout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workout</DialogTitle>
              <DialogDescription>Give your workout a name to get started.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Workout Name</Label>
                <Input
                  id="name"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  placeholder="e.g., Push Day, Leg Day"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateWorkout}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workouts.map((workout) => (
          <Card key={workout.id}>
            <CardHeader>
              <CardTitle>{workout.name}</CardTitle>
              <CardDescription>{workout.exercises.length} exercises</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="default" className="w-full" onClick={() => handleStartWorkout(workout.id)}>
                <Play className="mr-2 h-4 w-4" />
                Start Workout
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {recentWorkouts.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-8">Recent Workouts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <CardTitle>{workout.name}</CardTitle>
                  <CardDescription>{new Date(workout.date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {workout.exercises.length} exercises • {workout.duration} min
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => handleStartWorkout(workout.workoutId)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Repeat
                  </Button>
                  <Button variant="default">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
