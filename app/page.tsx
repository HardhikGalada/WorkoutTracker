import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Dashboard from "@/components/dashboard"
import WorkoutHistory from "@/components/workout-history"
import Statistics from "@/components/statistics"
import Settings from "@/components/settings"

export default function Home() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Workout Tracker</h1>
        <p className="text-muted-foreground">Track your workouts, analyze progress, and achieve your fitness goals.</p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Dashboard />
        </TabsContent>
        <TabsContent value="history">
          <WorkoutHistory />
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
