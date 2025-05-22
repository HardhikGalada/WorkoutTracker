"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useWorkoutStore, type LibraryExercise, type MuscleGroup } from "@/lib/workout-store"
import { Plus, Search, Edit, X, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ExerciseLibrary() {
  const { toast } = useToast()
  const { exerciseLibrary, addExerciseToLibrary, updateExerciseInLibrary, deleteExerciseFromLibrary } =
    useWorkoutStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>([])
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [editingExercise, setEditingExercise] = useState<LibraryExercise | null>(null)
  const [showExerciseDetails, setShowExerciseDetails] = useState<string | null>(null)

  const [newExercise, setNewExercise] = useState<LibraryExercise>({
    id: "",
    name: "",
    muscleGroups: [],
    description: "",
    equipment: [],
  })

  // All available muscle groups
  const muscleGroups: MuscleGroup[] = [
    "chest",
    "back",
    "shoulders",
    "arms",
    "quads",
    "hamstrings",
    "core",
    "neck",
    "forearms",
  ]

  // Filter exercises based on search and selected muscle groups
  const filteredExercises = exerciseLibrary.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesMuscleGroups =
      selectedMuscleGroups.length === 0 || selectedMuscleGroups.some((mg) => exercise.muscleGroups.includes(mg))

    return matchesSearch && matchesMuscleGroups
  })

  // Group exercises by muscle group for the categorized view
  const exercisesByMuscleGroup = muscleGroups.reduce(
    (acc, muscleGroup) => {
      const exercises = filteredExercises.filter((ex) => ex.muscleGroups.includes(muscleGroup))
      if (exercises.length > 0) {
        acc[muscleGroup] = exercises
      }
      return acc
    },
    {} as Record<MuscleGroup, LibraryExercise[]>,
  )

  const handleAddExercise = () => {
    if (newExercise.name.trim() && newExercise.muscleGroups.length > 0) {
      if (editingExercise) {
        updateExerciseInLibrary({
          ...newExercise,
          id: editingExercise.id,
        })
        toast({
          title: "Exercise Updated",
          description: `${newExercise.name} has been updated in your library.`,
        })
      } else {
        addExerciseToLibrary({
          ...newExercise,
          id: crypto.randomUUID(),
        })
        toast({
          title: "Exercise Added",
          description: `${newExercise.name} has been added to your library.`,
        })
      }

      setNewExercise({
        id: "",
        name: "",
        muscleGroups: [],
        description: "",
        equipment: [],
      })
      setEditingExercise(null)
      setShowAddExercise(false)
    }
  }

  const handleEditExercise = (exercise: LibraryExercise) => {
    setEditingExercise(exercise)
    setNewExercise({
      ...exercise,
    })
    setShowAddExercise(true)
  }

  const handleDeleteExercise = (id: string) => {
    deleteExerciseFromLibrary(id)
    toast({
      title: "Exercise Deleted",
      description: "The exercise has been removed from your library.",
    })
  }

  const toggleMuscleGroupFilter = (muscleGroup: MuscleGroup) => {
    setSelectedMuscleGroups((prev) =>
      prev.includes(muscleGroup) ? prev.filter((mg) => mg !== muscleGroup) : [...prev, muscleGroup],
    )
  }

  const toggleMuscleGroupSelection = (muscleGroup: MuscleGroup) => {
    setNewExercise((prev) => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(muscleGroup)
        ? prev.muscleGroups.filter((mg) => mg !== muscleGroup)
        : [...prev.muscleGroups, muscleGroup],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Exercise Library</h2>
        <Button
          onClick={() => {
            setEditingExercise(null)
            setNewExercise({
              id: "",
              name: "",
              muscleGroups: [],
              description: "",
              equipment: [],
            })
            setShowAddExercise(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search exercises..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filter by Muscle Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {muscleGroups.map((muscleGroup) => (
                  <div key={muscleGroup} className="flex items-center space-x-2">
                    <Checkbox
                      id={`filter-${muscleGroup}`}
                      checked={selectedMuscleGroups.includes(muscleGroup)}
                      onCheckedChange={() => toggleMuscleGroupFilter(muscleGroup)}
                    />
                    <Label htmlFor={`filter-${muscleGroup}`} className="capitalize">
                      {muscleGroup}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
            {selectedMuscleGroups.length > 0 && (
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelectedMuscleGroups([])}>
                  Clear Filters
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="flex-1">
          <Tabs defaultValue="grid">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="categorized">Categorized</TabsTrigger>
              </TabsList>
              <p className="text-sm text-muted-foreground">
                {filteredExercises.length} exercise{filteredExercises.length !== 1 ? "s" : ""}
              </p>
            </div>

            <TabsContent value="grid">
              {filteredExercises.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <p>No exercises found. Try adjusting your filters or add a new exercise.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredExercises.map((exercise) => (
                    <Card key={exercise.id}>
                      <CardHeader>
                        <div className="flex justify-between">
                          <CardTitle>{exercise.name}</CardTitle>
                          <div className="flex space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowExerciseDetails(exercise.id)}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleEditExercise(exercise)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit exercise</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteExercise(exercise.id)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete exercise</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {exercise.muscleGroups.map((mg) => (
                            <Badge key={mg} variant="secondary" className="capitalize">
                              {mg}
                            </Badge>
                          ))}
                        </div>
                        {exercise.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>
                        )}
                      </CardContent>
                      {exercise.equipment && exercise.equipment.length > 0 && (
                        <CardFooter>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Equipment:</span> {exercise.equipment.slice(0, 3).join(", ")}
                            {exercise.equipment.length > 3 && "..."}
                          </p>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="categorized">
              {Object.keys(exercisesByMuscleGroup).length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <p>No exercises found. Try adjusting your filters or add a new exercise.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {Object.entries(exercisesByMuscleGroup).map(([muscleGroup, exercises]) => (
                    <div key={muscleGroup}>
                      <h3 className="text-lg font-medium capitalize mb-3">{muscleGroup}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {exercises.map((exercise) => (
                          <Card key={exercise.id}>
                            <CardHeader>
                              <div className="flex justify-between">
                                <CardTitle>{exercise.name}</CardTitle>
                                <div className="flex space-x-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setShowExerciseDetails(exercise.id)}
                                        >
                                          <Info className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>View details</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleEditExercise(exercise)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit exercise</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteExercise(exercise.id)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete exercise</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {exercise.muscleGroups
                                  .filter((mg) => mg !== muscleGroup)
                                  .map((mg) => (
                                    <Badge key={mg} variant="secondary" className="capitalize">
                                      {mg}
                                    </Badge>
                                  ))}
                              </div>
                              {exercise.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>
                              )}
                            </CardContent>
                            {exercise.equipment && exercise.equipment.length > 0 && (
                              <CardFooter>
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium">Equipment:</span>{" "}
                                  {exercise.equipment.slice(0, 3).join(", ")}
                                  {exercise.equipment.length > 3 && "..."}
                                </p>
                              </CardFooter>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Exercise Details Dialog */}
      <Dialog open={showExerciseDetails !== null} onOpenChange={() => setShowExerciseDetails(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {showExerciseDetails &&
            (() => {
              const exercise = exerciseLibrary.find((ex) => ex.id === showExerciseDetails)
              if (!exercise) return null

              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{exercise.name}</DialogTitle>
                    <DialogDescription>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exercise.muscleGroups.map((mg) => (
                          <Badge key={mg} variant="secondary" className="capitalize">
                            {mg}
                          </Badge>
                        ))}
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {exercise.description || "No description available."}
                    </p>

                    {exercise.equipment && exercise.equipment.length > 0 && (
                      <>
                        <h4 className="text-sm font-medium mb-1">Equipment</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {exercise.equipment.map((item, index) => (
                            <li key={index} className="capitalize">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleEditExercise(exercise)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Exercise
                    </Button>
                  </DialogFooter>
                </>
              )
            })()}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Exercise Dialog */}
      <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingExercise ? "Edit Exercise" : "Add New Exercise"}</DialogTitle>
            <DialogDescription>
              {editingExercise
                ? "Update the details of this exercise in your library."
                : "Add a new exercise to your personal exercise library."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exercise-name">Exercise Name</Label>
              <Input
                id="exercise-name"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="e.g., Bench Press, Squat"
              />
            </div>

            <div className="grid gap-2">
              <Label>Muscle Groups (select all that apply)</Label>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="grid grid-cols-2 gap-2">
                  {muscleGroups.map((muscleGroup) => (
                    <div key={muscleGroup} className="flex items-center space-x-2">
                      <Checkbox
                        id={`muscle-${muscleGroup}`}
                        checked={newExercise.muscleGroups.includes(muscleGroup)}
                        onCheckedChange={() => toggleMuscleGroupSelection(muscleGroup)}
                      />
                      <Label htmlFor={`muscle-${muscleGroup}`} className="capitalize">
                        {muscleGroup}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exercise-description">Description (Optional)</Label>
              <Textarea
                id="exercise-description"
                value={newExercise.description || ""}
                onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                placeholder="Describe how to perform this exercise..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exercise-equipment">Equipment (Optional)</Label>
              <Input
                id="exercise-equipment"
                value={newExercise.equipment?.join(", ") || ""}
                onChange={(e) =>
                  setNewExercise({
                    ...newExercise,
                    equipment: e.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g., barbell, dumbbells, bench (comma separated)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleAddExercise}
              disabled={!newExercise.name || newExercise.muscleGroups.length === 0}
            >
              {editingExercise ? "Update Exercise" : "Add Exercise"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
