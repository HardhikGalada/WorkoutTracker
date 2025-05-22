"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkoutStore } from "@/lib/workout-store"
import { format, subDays, isAfter, parseISO } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function ProgressTracking() {
  const { exerciseHistory, exerciseLibrary, settings } = useWorkoutStore()
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "all">("30days")

  // Get unique exercise IDs from history
  const exerciseIds = useMemo(() => {
    return [...new Set(exerciseHistory.map((history) => history.exerciseId))]
  }, [exerciseHistory])

  // Get exercise details for the selected exercise
  const selectedExercise = useMemo(() => {
    if (!selectedExerciseId) return null
    return exerciseHistory.find((history) => history.exerciseId === selectedExerciseId)
  }, [selectedExerciseId, exerciseHistory])

  // Get exercise name from library if available
  const getExerciseName = (exerciseId: string) => {
    const historyItem = exerciseHistory.find((h) => h.exerciseId === exerciseId)
    if (historyItem) return historyItem.exerciseName

    const libraryItem = exerciseLibrary.find((e) => e.id === exerciseId)
    if (libraryItem) return libraryItem.name

    return "Unknown Exercise"
  }

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!selectedExercise) return []

    let cutoffDate = new Date()
    if (timeRange === "7days") cutoffDate = subDays(new Date(), 7)
    else if (timeRange === "30days") cutoffDate = subDays(new Date(), 30)
    else if (timeRange === "90days") cutoffDate = subDays(new Date(), 90)

    return timeRange === "all"
      ? selectedExercise.sets
      : selectedExercise.sets.filter((set) => isAfter(parseISO(set.date), cutoffDate))
  }, [selectedExercise, timeRange])

  // Prepare data for charts
  const chartData = useMemo(() => {
    if (!filteredData.length) return []

    // Group sets by date
    const setsByDate = filteredData.reduce(
      (acc, set) => {
        const date = format(parseISO(set.date), "yyyy-MM-dd")
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(set)
        return acc
      },
      {} as Record<string, typeof filteredData>,
    )

    // Calculate max weight and volume for each date
    return Object.entries(setsByDate)
      .map(([date, sets]) => {
        const maxWeight = Math.max(...sets.map((set) => set.weight))
        const volume = sets.reduce((sum, set) => sum + set.weight * set.reps, 0)
        const avgWeight = volume / sets.reduce((sum, set) => sum + set.reps, 0)

        return {
          date,
          maxWeight,
          avgWeight: Number.parseFloat(avgWeight.toFixed(1)),
          volume,
          sets: sets.length,
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredData])

  // Calculate personal records
  const personalRecords = useMemo(() => {
    if (!selectedExercise) return { maxWeight: 0, maxVolume: 0, maxReps: 0 }

    const maxWeight = Math.max(...selectedExercise.sets.map((set) => set.weight))
    const maxReps = Math.max(...selectedExercise.sets.map((set) => set.reps))

    // Calculate volume for each workout session
    const setsByDate = selectedExercise.sets.reduce(
      (acc, set) => {
        const date = format(parseISO(set.date), "yyyy-MM-dd")
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(set)
        return acc
      },
      {} as Record<string, typeof selectedExercise.sets>,
    )

    const volumeByDate = Object.values(setsByDate).map((sets) =>
      sets.reduce((sum, set) => sum + set.weight * set.reps, 0),
    )

    const maxVolume = volumeByDate.length ? Math.max(...volumeByDate) : 0

    return { maxWeight, maxVolume, maxReps }
  }, [selectedExercise])

  if (exerciseIds.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <h3 className="text-lg font-medium mb-2">No Exercise Data Yet</h3>
          <p className="text-muted-foreground">Complete some workouts to start tracking your progress.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-64">
          <Card>
            <CardHeader>
              <CardTitle>Select Exercise</CardTitle>
              <CardDescription>Choose an exercise to view progress</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedExerciseId || ""} onValueChange={(value) => setSelectedExerciseId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {getExerciseName(id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Time Range</CardTitle>
                <CardDescription>Filter data by time period</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={timeRange === "7days" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("7days")}
                >
                  7 Days
                </Button>
                <Button
                  variant={timeRange === "30days" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("30days")}
                >
                  30 Days
                </Button>
                <Button
                  variant={timeRange === "90days" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("90days")}
                >
                  90 Days
                </Button>
                <Button
                  variant={timeRange === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("all")}
                >
                  All Time
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {selectedExercise ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Max Weight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {personalRecords.maxWeight} {settings.weightUnit}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Max Reps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{personalRecords.maxReps}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Max Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {personalRecords.maxVolume} {settings.weightUnit}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="weight">
            <TabsList>
              <TabsTrigger value="weight">Weight Progress</TabsTrigger>
              <TabsTrigger value="volume">Volume Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="weight">
              <Card>
                <CardHeader>
                  <CardTitle>Weight Progress - {getExerciseName(selectedExerciseId!)}</CardTitle>
                  <CardDescription>Track your strength gains over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {chartData.length > 0 ? (
                    <ChartContainer
                      config={{
                        maxWeight: {
                          label: `Max Weight (${settings.weightUnit})`,
                          color: "hsl(var(--chart-1))",
                        },
                        avgWeight: {
                          label: `Avg Weight (${settings.weightUnit})`,
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), "MMM d")} />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="maxWeight"
                            stroke="var(--color-maxWeight)"
                            name={`Max Weight (${settings.weightUnit})`}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="avgWeight"
                            stroke="var(--color-avgWeight)"
                            name={`Avg Weight (${settings.weightUnit})`}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No data available for the selected time range
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="volume">
              <Card>
                <CardHeader>
                  <CardTitle>Volume Progress - {getExerciseName(selectedExerciseId!)}</CardTitle>
                  <CardDescription>Track your total workout volume over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {chartData.length > 0 ? (
                    <ChartContainer
                      config={{
                        volume: {
                          label: `Volume (${settings.weightUnit})`,
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), "MMM d")} />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="volume" fill="var(--color-volume)" name={`Volume (${settings.weightUnit})`} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No data available for the selected time range
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
              <CardDescription>Recent sets for {getExerciseName(selectedExerciseId!)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Date</th>
                      <th className="p-2 text-left font-medium">Set</th>
                      <th className="p-2 text-left font-medium">Weight ({settings.weightUnit})</th>
                      <th className="p-2 text-left font-medium">Reps</th>
                      <th className="p-2 text-left font-medium">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData
                      .slice()
                      .reverse()
                      .map((set, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{format(parseISO(set.date), "MMM d, yyyy")}</td>
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2">{set.weight}</td>
                          <td className="p-2">{set.reps}</td>
                          <td className="p-2">{set.weight * set.reps}</td>
                        </tr>
                      ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No data available for the selected time range
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <h3 className="text-lg font-medium mb-2">Select an Exercise</h3>
            <p className="text-muted-foreground">Choose an exercise from the dropdown to view your progress.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
