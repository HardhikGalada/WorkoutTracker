"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  GoogleAuthProvider,
  OAuthProvider,
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth"
import { auth, db, isFirebaseInitialized } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { useWorkoutStore } from "@/lib/workout-store"
import { useToast } from "@/hooks/use-toast"

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  logout: () => Promise<void>
  firebaseInitialized: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [firebaseInitialized, setFirebaseInitialized] = useState(isFirebaseInitialized())
  const { toast } = useToast()
  const {
    workouts,
    completedWorkouts,
    exerciseLibrary,
    exerciseHistory,
    bodyMetrics,
    settings,
    setWorkouts,
    setCompletedWorkouts,
    setExerciseLibrary,
    setExerciseHistory,
    setBodyMetrics,
    setSettings,
  } = useWorkoutStore()

  // Check if Firebase is initialized
  useEffect(() => {
    setFirebaseInitialized(isFirebaseInitialized())
    if (!isFirebaseInitialized()) {
      setLoading(false)
      console.warn("Firebase is not initialized. Authentication features will not work.")
    }
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user && db) {
        // Load user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()

            // Update local state with user data
            if (userData.workouts) setWorkouts(userData.workouts)
            if (userData.completedWorkouts) setCompletedWorkouts(userData.completedWorkouts)
            if (userData.exerciseLibrary) setExerciseLibrary(userData.exerciseLibrary)
            if (userData.exerciseHistory) setExerciseHistory(userData.exerciseHistory)
            if (userData.bodyMetrics) setBodyMetrics(userData.bodyMetrics)
            if (userData.settings) setSettings(userData.settings)

            toast({
              title: "Data Loaded",
              description: "Your workout data has been loaded from the cloud.",
            })
          } else {
            // First time user, save current data to Firestore
            await saveUserData(user.uid)
          }
        } catch (error) {
          console.error("Error loading user data:", error)
          toast({
            title: "Error",
            description: "Failed to load your data. Please try again.",
            variant: "destructive",
          })
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [firebaseInitialized])

  // Save user data to Firestore whenever it changes
  useEffect(() => {
    if (user && db) {
      const saveTimeout = setTimeout(() => {
        saveUserData(user.uid)
      }, 2000) // Debounce to avoid too many writes

      return () => clearTimeout(saveTimeout)
    }
  }, [workouts, completedWorkouts, exerciseLibrary, exerciseHistory, bodyMetrics, settings, user])

  const saveUserData = async (userId: string) => {
    if (!db) return

    try {
      await setDoc(doc(db, "users", userId), {
        workouts,
        completedWorkouts,
        exerciseLibrary,
        exerciseHistory,
        bodyMetrics,
        settings,
        lastUpdated: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error saving user data:", error)
      toast({
        title: "Error",
        description: "Failed to save your data to the cloud.",
        variant: "destructive",
      })
    }
  }

  const signInWithGoogle = async () => {
    if (!auth) {
      toast({
        title: "Error",
        description: "Authentication is not available. Please check your configuration.",
        variant: "destructive",
      })
      return
    }

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      toast({
        title: "Welcome!",
        description: "You've successfully signed in with Google.",
      })
    } catch (error) {
      console.error("Error signing in with Google:", error)
      toast({
        title: "Sign In Failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      })
    }
  }

  const signInWithApple = async () => {
    if (!auth) {
      toast({
        title: "Error",
        description: "Authentication is not available. Please check your configuration.",
        variant: "destructive",
      })
      return
    }

    try {
      const provider = new OAuthProvider("apple.com")
      await signInWithPopup(auth, provider)
      toast({
        title: "Welcome!",
        description: "You've successfully signed in with Apple.",
      })
    } catch (error) {
      console.error("Error signing in with Apple:", error)
      toast({
        title: "Sign In Failed",
        description: "Could not sign in with Apple. Please try again.",
        variant: "destructive",
      })
    }
  }

  const logout = async () => {
    if (!auth) return

    try {
      await signOut(auth)
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithApple,
        logout,
        firebaseInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
