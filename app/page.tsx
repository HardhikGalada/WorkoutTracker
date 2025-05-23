"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkoutPlans from "@/components/workout-plans"
import ExerciseLibrary from "@/components/exercise-library"
import Statistics from "@/components/statistics"
import Settings from "@/components/settings"
import ProgressTracking from "@/components/progress-tracking"
import DataManagement from "@/components/data-management"

export default function Home() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Workout Tracker</h1>
        <p className="text-muted-foreground">Track your workouts, analyze progress, and achieve your fitness goals.</p>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger value="plans">Workout Plans</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>
        <TabsContent value="plans">
          <WorkoutPlans />
        </TabsContent>
        <TabsContent value="exercises">
          <ExerciseLibrary />
        </TabsContent>
        <TabsContent value="progress">
          <ProgressTracking />
        </TabsContent>
        <TabsContent value="statistics">
          <Statistics />
        </TabsContent>
        <TabsContent value="settings">
          <Settings />
        </TabsContent>
        <TabsContent value="data">
          <DataManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
