"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useWorkoutStore } from "@/lib/workout-store"
import { Play, Copy, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import WorkoutEditor from "@/components/workout-editor"

export default function WorkoutTemplates() {
  const { toast } = useToast()
  const { workouts, startWorkout, duplicateWorkout } = useWorkoutStore()
  const [editWorkoutId, setEditWorkoutId] = useState<string | null>(null)

  // Filter to only show templates
  const templates = workouts.filter((workout) => workout.isTemplate)

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

  if (editWorkoutId) {
    return <WorkoutEditor workoutId={editWorkoutId} onClose={() => setEditWorkoutId(null)} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workout Templates</h2>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p>No templates available. Save a workout as a template to see it here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.exercises.length} exercises</CardDescription>
                  </div>
                  <Badge variant="outline">Template</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {template.exercises.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {template.exercises.slice(0, 3).map((exercise, i) => (
                        <li key={i}>{exercise.name}</li>
                      ))}
                      {template.exercises.length > 3 && <li>+ {template.exercises.length - 3} more</li>}
                    </ul>
                  ) : (
                    <p>No exercises added yet</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setEditWorkoutId(template.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => handleDuplicateWorkout(template.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
                <Button variant="default" onClick={() => handleStartWorkout(template.id)}>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
