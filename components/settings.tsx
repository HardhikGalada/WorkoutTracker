"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useWorkoutStore } from "@/lib/workout-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Settings() {
  const { toast } = useToast()
  const { settings, updateSettings, addBodyMetrics, getLatestBodyMetrics, calculateBMI, calculateFFMI } =
    useWorkoutStore()

  const [weightUnit, setWeightUnit] = useState(settings.weightUnit)
  const [distanceUnit, setDistanceUnit] = useState(settings.distanceUnit)
  const [heightUnit, setHeightUnit] = useState(settings.heightUnit)
  const [darkMode, setDarkMode] = useState(settings.darkMode)

  // Body metrics
  const latestMetrics = getLatestBodyMetrics()
  const [weight, setWeight] = useState(latestMetrics?.weight || 0)
  const [height, setHeight] = useState(latestMetrics?.height || 0)
  const [bodyFatPercentage, setBodyFatPercentage] = useState(latestMetrics?.bodyFatPercentage || 0)

  const handleSaveSettings = () => {
    updateSettings({
      weightUnit,
      distanceUnit,
      heightUnit,
      darkMode,
    })

    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
    })
  }

  const handleSaveBodyMetrics = () => {
    addBodyMetrics({
      weight,
      height,
      bodyFatPercentage: bodyFatPercentage || undefined,
    })

    toast({
      title: "Body Metrics Updated",
      description: "Your body metrics have been saved.",
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

  // BMI categories
  const getBMICategory = (bmi: number | null) => {
    if (bmi === null) return "Not calculated"
    if (bmi < 18.5) return "Underweight"
    if (bmi < 25) return "Normal weight"
    if (bmi < 30) return "Overweight"
    return "Obese"
  }

  // FFMI categories (for men, typically)
  const getFFMICategory = (ffmi: number | null) => {
    if (ffmi === null) return "Not calculated"
    if (ffmi < 18) return "Below average"
    if (ffmi < 20) return "Average"
    if (ffmi < 22) return "Above average"
    if (ffmi < 23) return "Excellent"
    if (ffmi < 26) return "Superior"
    if (ffmi < 28) return "Exceptional"
    return "Elite"
  }

  const bmi = calculateBMI()
  const ffmi = calculateFFMI()

  return (
    <div className="space-y-6">
      <Tabs defaultValue="preferences">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="body-metrics">Body Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
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
                <Label>Height Units</Label>
                <RadioGroup
                  value={heightUnit}
                  onValueChange={(value) => {
                    setHeightUnit(value as "cm" | "in")
                    handleSaveSettings()
                  }}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cm" id="cm" />
                    <Label htmlFor="cm">Centimeters (cm)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in" id="in" />
                    <Label htmlFor="in">Inches (in)</Label>
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
        </TabsContent>

        <TabsContent value="body-metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Body Measurements</CardTitle>
              <CardDescription>Track your body metrics for BMI and FFMI calculations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight ({weightUnit})</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight || ""}
                    onChange={(e) => setWeight(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height ({heightUnit})</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={height || ""}
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="body-fat">Body Fat Percentage (optional)</Label>
                <Input
                  id="body-fat"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={bodyFatPercentage || ""}
                  onChange={(e) => setBodyFatPercentage(Number(e.target.value))}
                  placeholder="Enter body fat percentage"
                />
              </div>
              <Button onClick={handleSaveBodyMetrics} className="w-full">
                Save Body Metrics
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Body Mass Index (BMI)</CardTitle>
                <CardDescription>Weight relative to height</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{bmi || "N/A"}</div>
                  <p className="text-muted-foreground">{getBMICategory(bmi)}</p>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-4">
                    {bmi && (
                      <div
                        className={`h-full ${
                          bmi < 18.5
                            ? "bg-blue-500"
                            : bmi < 25
                              ? "bg-green-500"
                              : bmi < 30
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(bmi * 2.5, 100)}%` }}
                      ></div>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Underweight</span>
                    <span>Normal</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fat-Free Mass Index (FFMI)</CardTitle>
                <CardDescription>Muscle mass relative to height</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{ffmi || "N/A"}</div>
                  <p className="text-muted-foreground">{getFFMICategory(ffmi)}</p>
                  {!ffmi && bodyFatPercentage === 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter your body fat percentage to calculate FFMI
                    </p>
                  )}
                  {ffmi && (
                    <>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-4">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.min((ffmi / 30) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Below Avg</span>
                        <span>Average</span>
                        <span>Above Avg</span>
                        <span>Superior</span>
                        <span>Elite</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
