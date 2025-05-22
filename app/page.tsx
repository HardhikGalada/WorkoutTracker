"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkoutPlans from "@/components/workout-plans"
import ExerciseLibrary from "@/components/exercise-library"
import Statistics from "@/components/statistics"
import Settings from "@/components/settings"
import ProgressTracking from "@/components/progress-tracking"
import { useAuth } from "@/components/auth-provider"
import Login from "@/components/login"
import UserProfile from "@/components/user-profile"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function Home() {
  const { user, loading, firebaseInitialized } = useAuth()

  // If still loading auth state, show a loading indicator
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not logged in and Firebase is initialized, show login screen
  if (!user && firebaseInitialized) {
    return <Login />
  }

  // User is logged in or Firebase is not initialized, show the app
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Workout Tracker</h1>
          <p className="text-muted-foreground">
            Track your workouts, analyze progress, and achieve your fitness goals.
          </p>
        </div>
        {user && <UserProfile />}
      </div>

      {!firebaseInitialized && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Not Initialized</AlertTitle>
          <AlertDescription>
            Firebase configuration is missing or invalid. You can still use the app, but your data won't be saved to the
            cloud.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="plans">Workout Plans</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
      </Tabs>
    </div>
  )
}
