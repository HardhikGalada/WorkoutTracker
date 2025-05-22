"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useWorkoutStore } from "@/lib/workout-store"

export default function Settings() {
  const { toast } = useToast()
  const { settings, updateSettings } = useWorkoutStore()
  const [weightUnit, setWeightUnit] = useState(settings.weightUnit)
  const [distanceUnit, setDistanceUnit] = useState(settings.distanceUnit)
  const [darkMode, setDarkMode] = useState(settings.darkMode)

  const handleSaveSettings = () => {
    updateSettings({
      weightUnit,
      distanceUnit,
      darkMode,
    })

    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
    })
  }

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Units</CardTitle>
          <CardDescription>Configure your preferred measurement units</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Weight Units</Label>
            <RadioGroup
              value={weightUnit}
              onValueChange={(value) => {
                setWeightUnit(value as "kg" | "lb")
                handleSaveSettings()
              }}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kg" id="kg" />
                <Label htmlFor="kg">Kilograms (kg)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lb" id="lb" />
                <Label htmlFor="lb">Pounds (lb)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Distance Units</Label>
            <RadioGroup
              value={distanceUnit}
              onValueChange={(value) => {
                setDistanceUnit(value as "km" | "mi")
                handleSaveSettings()
              }}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="km" id="km" />
                <Label htmlFor="km">Kilometers (km)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mi" id="mi" />
                <Label htmlFor="mi">Miles (mi)</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={(checked) => {
                setDarkMode(checked)
                handleSaveSettings()
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
