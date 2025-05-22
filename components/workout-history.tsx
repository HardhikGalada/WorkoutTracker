"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkoutStore } from "@/lib/workout-store"
import { formatDistanceToNow } from "date-fns"
import { Dumbbell, Clock, CalendarIcon } from "lucide-react"

export default function WorkoutHistory() {
  const { completedWorkouts } = useWorkoutStore()
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Filter workouts by selected date if a date is selected
  const filteredWorkouts = date
    ? completedWorkouts.filter((workout) => {
        const workoutDate = new Date(workout.date)
        return workoutDate.toDateString() === date.toDateString()
      })
    : completedWorkouts

  // Get dates with workouts for calendar highlighting
  const workoutDates = completedWorkouts.map((workout) => new Date(workout.date))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-80">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view workouts</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                workout: workoutDates,
              }}
              modifiersStyles={{
                workout: {
                  fontWeight: "bold",
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                },
              }}
            />
          </CardContent>
        </Card>

        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold">
            {date
              ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
              : "All Workouts"}
          </h2>

          {filteredWorkouts.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No workouts found for this date.
              </CardContent>
            </Card>
          ) : (
            filteredWorkouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{workout.name}</CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex items-center text-sm">
                      <Dumbbell className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{workout.exercises.length} exercises</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{workout.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(workout.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
