"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkoutStore } from "@/lib/workout-store"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

export default function Statistics() {
  const { completedWorkouts } = useWorkoutStore()

  // Calculate sets per muscle group per week
  const currentDate = new Date()
  const oneWeekAgo = new Date(currentDate)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const workoutsThisWeek = completedWorkouts.filter(
    (workout) => new Date(workout.date) >= oneWeekAgo && new Date(workout.date) <= currentDate,
  )

  // Aggregate sets by muscle group
  const muscleGroupSets = workoutsThisWeek.reduce(
    (acc, workout) => {
      workout.exercises.forEach((exercise) => {
        // Count sets for each muscle group in the exercise
        exercise.muscleGroups.forEach((muscleGroup) => {
          if (!acc[muscleGroup]) {
            acc[muscleGroup] = 0
          }
          acc[muscleGroup] += exercise.sets.length
        })
      })
      return acc
    },
    {} as Record<string, number>,
  )

  // Define colors for each muscle group
  const muscleGroupColors = {
    chest: "#FF6B6B",
    back: "#4ECDC4",
    shoulders: "#45B7D1",
    arms: "#96CEB4",
    quads: "#FFEAA7",
    hamstrings: "#DDA0DD",
    core: "#98D8C8",
    neck: "#F7DC6F",
    forearms: "#BB8FCE",
  }

  const muscleGroupData = Object.entries(muscleGroupSets)
    .map(([name, sets]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      sets,
      fill: muscleGroupColors[name as keyof typeof muscleGroupColors] || "#8884d8",
    }))
    .sort((a, b) => b.sets - a.sets) // Sort by sets descending

  // Cardio statistics
  const cardioWorkouts = workoutsThisWeek.flatMap((workout) =>
    workout.cardio.map((c) => ({
      date: new Date(workout.date).toLocaleDateString(),
      minutes: c.minutes,
      distance: c.distance,
      type: c.type,
    })),
  )

  // Aggregate cardio by type
  const cardioByType = cardioWorkouts.reduce(
    (acc, cardio) => {
      if (!acc[cardio.type]) {
        acc[cardio.type] = {
          minutes: 0,
          distance: 0,
          count: 0,
        }
      }
      acc[cardio.type].minutes += cardio.minutes
      acc[cardio.type].distance += cardio.distance
      acc[cardio.type].count += 1
      return acc
    },
    {} as Record<string, { minutes: number; distance: number; count: number }>,
  )

  const cardioTypeData = Object.entries(cardioByType).map(([type, stats]) => ({
    name: type,
    minutes: stats.minutes,
  }))

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="muscle-groups">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="muscle-groups">Muscle Groups</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
        </TabsList>

        <TabsContent value="muscle-groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sets Per Muscle Group (This Week)</CardTitle>
              <CardDescription>Training volume breakdown by muscle group over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {muscleGroupData.length > 0 ? (
                <ChartContainer
                  config={{
                    sets: {
                      label: "Sets",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={muscleGroupData}
                      layout="horizontal"
                      margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
                                    <span className="font-bold text-muted-foreground">{payload[0].value} sets</span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="sets" fill={(entry) => entry.fill} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No workout data available for this week
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workoutsThisWeek.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Most Trained</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{muscleGroupData.length > 0 ? muscleGroupData[0].name : "N/A"}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cardio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cardio Minutes By Type (This Week)</CardTitle>
              <CardDescription>Distribution of cardio training by type over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {cardioTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cardioTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="minutes"
                    >
                      {cardioTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} minutes`, "Duration"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No cardio data available for this week
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Cardio Minutes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cardioWorkouts.reduce((sum, cardio) => sum + cardio.minutes, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cardioWorkouts.reduce((sum, cardio) => sum + cardio.distance, 0).toFixed(1)} km
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cardio Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cardioWorkouts.length}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
