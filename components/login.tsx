"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Dumbbell, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Login() {
  const { signInWithGoogle, signInWithApple, firebaseInitialized } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithApple()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Workout Tracker</CardTitle>
          <CardDescription>Sign in to save and sync your workout data across devices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!firebaseInitialized && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                Firebase configuration is missing or invalid. Please check your environment variables.
              </AlertDescription>
            </Alert>
          )}

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={isLoading || !firebaseInitialized}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" className="h-5 w-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleAppleSignIn}
            disabled={isLoading || !firebaseInitialized}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" className="h-5 w-5">
              <path
                d="M16.7023 0C15.1273 0.122 13.3253 1.041 12.2813 2.308C11.3243 3.458 10.5983 5.122 10.8743 6.758C12.5983 6.831 14.3833 5.883 15.3983 4.588C16.3403 3.375 16.9713 1.724 16.7023 0Z"
                fill="currentColor"
              />
              <path
                d="M22 17.25C21.25 19.167 20.667 20.167 19.5 21.75C18.625 22.917 17.333 24.167 15.5 24.167C13.833 24.167 12.833 23.25 11.333 23.25C9.75 23.25 9 24.167 7.333 24.167C5.5 24.167 4.125 22.75 3.25 21.583C1.333 18.75 0 14.333 0 10.25C0 4.417 3.833 1.5 7.583 1.5C9.333 1.5 10.75 2.417 11.833 2.417C12.833 2.417 14.417 1.417 16.417 1.5C17.667 1.5 20.083 1.917 21.75 4.167C17.917 6.417 18.667 11.75 22 13.417C21.167 14.833 20.167 16.417 20.167 16.417L22 17.25Z"
                fill="currentColor"
              />
            </svg>
            Sign in with Apple
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
          {!firebaseInitialized && (
            <p className="text-xs text-center text-destructive">
              You can still use the app without signing in, but your data won't be saved to the cloud.
            </p>
          )}
          {!firebaseInitialized && (
            <Button variant="link" className="text-xs" onClick={() => (window.location.href = "/")}>
              Continue without signing in
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
