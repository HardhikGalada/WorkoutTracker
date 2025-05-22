"use client"

import { useState } from "react"
import { Plus, Play, RotateCcw, Copy, Edit, Dumbbell } from "lucide-react"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import WorkoutEditor from "@/components/workout-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Update the Dashboard component to focus on individual workout plans
export default function Dashboard() {
  const { toast } = useToast()
  const { workouts, recentWorkouts, startWorkout, createWorkout, duplicateWorkout, deleteWorkout } = useWorkoutStore()
  const [newWorkoutName, setNewWorkoutName] = useState("")
  const [open, setOpen] = useState(false)
  const [editWorkoutId, setEditWorkoutId] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const handleCreateWorkout = () => {
    if (newWorkoutName.trim()) {
      const id = createWorkout(newWorkoutName)
      setNewWorkoutName("")
      setOpen(false)
      setEditWorkoutId(id)
      setShowEditor(true)
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

  const handleDuplicateWorkout = (id: string) => {
    const newId = duplicateWorkout(id)
    toast({
      title: "Workout Duplicated",
      description: "A copy of your workout has been created.",
    })
    return newId
  }

  const handleEditWorkout = (id: string) => {
    setEditWorkoutId(id)
    setShowEditor(true)
  }

  const handleDeleteWorkout = (id: string) => {
    deleteWorkout(id)
    toast({
      title: "Workout Deleted",
      description: "Your workout has been deleted.",
    })
  }

  return (
    <div className="space-y-6">
      {showEditor && editWorkoutId ? (
        <WorkoutEditor workoutId={editWorkoutId} onClose={() => setShowEditor(false)} />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Workout Plans</h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Workout Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Workout Plan</DialogTitle>
                  <DialogDescription>Give your workout plan a name to get started.</DialogDescription>
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
                  <Button onClick={handleCreateWorkout}>Create & Customize</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Plans</TabsTrigger>
              <TabsTrigger value="recent">Recent Workouts</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {workouts.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center space-y-4">
                    <Dumbbell className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-medium">No workout plans yet</h3>
                      <p className="text-sm text-muted-foreground">Create your first workout plan to get started</p>
                    </div>
                    <Button onClick={() => setOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Workout Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workouts.map((workout) => (
                    <Card key={workout.id} className={workout.isTemplate ? "border-primary/20" : ""}>
                      <CardHeader>
                        <CardTitle>{workout.name}</CardTitle>
                        <CardDescription>
                          {workout.exercises.length} exercises
                          {workout.isTemplate && " • Template"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          {workout.exercises.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {workout.exercises.slice(0, 3).map((exercise, i) => (
                                <li key={i}>{exercise.name}</li>
                              ))}
                              {workout.exercises.length > 3 && <li>+ {workout.exercises.length - 3} more</li>}
                            </ul>
                          ) : (
                            <p>No exercises added yet</p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Options
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditWorkout(workout.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateWorkout(workout.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteWorkout(workout.id)}
                              className="text-destructive focus:text-destructive"
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
                                className="mr-2 h-4 w-4"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                              </svg>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="default" size="sm" onClick={() => handleStartWorkout(workout.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Start Workout
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                  {/* Add Workout Plan Card */}
                  <Card className="border-dashed">
                    <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center h-full">
                      <Button variant="outline" className="h-20 w-full" onClick={() => setOpen(true)}>
                        <Plus className="mr-2 h-6 w-6" />
                        Add Workout Plan
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent">
              {recentWorkouts.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <p>No recent workouts. Complete a workout to see it here.</p>
                  </CardContent>
                </Card>
              ) : (
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
                        <Button
                          variant="outline"
                          className="flex-1 mr-2"
                          onClick={() => {
                            const newId = handleDuplicateWorkout(workout.workoutId)
                            handleEditWorkout(newId)
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Customize & Repeat
                        </Button>
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() => handleStartWorkout(workout.workoutId)}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Repeat
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
