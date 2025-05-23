"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDataPersistence } from "@/components/data-persistence-provider"
import { Download, Upload, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function DataManagement() {
  const { exportData, importData } = useDataPersistence()
  const { toast } = useToast()
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        const success = importData(jsonData)

        if (!success) {
          toast({
            title: "Import Failed",
            description: "The file format is invalid. Please select a valid workout data file.",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "There was an error reading the file. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsImporting(false)
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }

    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "There was an error reading the file. Please try again.",
        variant: "destructive",
      })
      setIsImporting(false)
    }

    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or import your workout data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Data</CardTitle>
                <CardDescription>Save your workout data to a file</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Export all your workout plans, history, and settings to a file that you can save on your device.
                </p>
                <Button onClick={exportData} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export to File
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Import Data</CardTitle>
                <CardDescription>Load workout data from a file</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Import workout data from a previously exported file. This will replace your current data.
                </p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                <Button onClick={handleImportClick} className="w-full" disabled={isImporting}>
                  <Upload className="mr-2 h-4 w-4" />
                  {isImporting ? "Importing..." : "Import from File"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Your workout data is saved automatically in your browser's local storage. However, this data may be lost
              if you clear your browser data or switch to a different browser. We recommend regularly exporting your
              data as a backup.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
