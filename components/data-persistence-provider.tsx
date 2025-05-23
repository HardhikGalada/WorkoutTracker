"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useWorkoutStore } from "@/lib/workout-store"
import { useToast } from "@/hooks/use-toast"

type DataPersistenceContextType = {
  exportData: () => void
  importData: (jsonData: string) => boolean
}

const DataPersistenceContext = createContext<DataPersistenceContextType | null>(null)

export function DataPersistenceProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const workoutStore = useWorkoutStore()
  const [isInitialized, setIsInitialized] = useState(false)

  // Export all workout data to a JSON file
  const exportData = () => {
    try {
      const { workouts, completedWorkouts, exerciseLibrary, exerciseHistory, bodyMetrics, settings } = workoutStore

      const exportData = {
        workouts,
        completedWorkouts,
        exerciseLibrary,
        exerciseHistory,
        bodyMetrics,
        settings,
        exportDate: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

      const exportFileDefaultName = `workout-tracker-data-${new Date().toISOString().slice(0, 10)}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Data Exported",
        description: "Your workout data has been exported successfully.",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Import workout data from a JSON file
  const importData = (jsonData: string): boolean => {
    try {
      const parsedData = JSON.parse(jsonData)

      // Validate the imported data has the expected structure
      if (!parsedData.workouts || !Array.isArray(parsedData.workouts)) {
        throw new Error("Invalid data format: workouts array is missing")
      }

      // Update the store with the imported data
      if (parsedData.workouts) workoutStore.setWorkouts(parsedData.workouts)
      if (parsedData.completedWorkouts) workoutStore.setCompletedWorkouts(parsedData.completedWorkouts)
      if (parsedData.exerciseLibrary) workoutStore.setExerciseLibrary(parsedData.exerciseLibrary)
      if (parsedData.exerciseHistory) workoutStore.setExerciseHistory(parsedData.exerciseHistory)
      if (parsedData.bodyMetrics) workoutStore.setBodyMetrics(parsedData.bodyMetrics)
      if (parsedData.settings) workoutStore.setSettings(parsedData.settings)

      toast({
        title: "Data Imported",
        description: "Your workout data has been imported successfully.",
      })
      return true
    } catch (error) {
      console.error("Error importing data:", error)
      toast({
        title: "Import Failed",
        description: "There was an error importing your data. Please check the file format and try again.",
        variant: "destructive",
      })
      return false
    }
  }

  // Initialize the store from local storage (handled by Zustand persist middleware)
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  return (
    <DataPersistenceContext.Provider
      value={{
        exportData,
        importData,
      }}
    >
      {children}
    </DataPersistenceContext.Provider>
  )
}

export function useDataPersistence() {
  const context = useContext(DataPersistenceContext)
  if (!context) {
    throw new Error("useDataPersistence must be used within a DataPersistenceProvider")
  }
  return context
}
