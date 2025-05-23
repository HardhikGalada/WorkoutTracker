"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { Mail, ArrowLeft } from "lucide-react"
import { z } from "zod"

const emailSchema = z.string().email("Please enter a valid email address")

export default function PasswordResetForm({ onBack }: { onBack: () => void }) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateEmail = () => {
    try {
      emailSchema.parse(email)
      setError(null)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail()) {
      return
    }

    setIsLoading(true)
    try {
      await resetPassword(email)
      setEmailSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-4 text-center">
        <h3 className="text-lg font-medium">Check Your Email</h3>
        <p className="text-sm text-muted-foreground">
          We've sent a password reset link to <span className="font-medium">{email}</span>. Please check your inbox and
          follow the instructions to reset your password.
        </p>
        <Button type="button" onClick={onBack} className="mt-4">
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium ml-2">Reset Password</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="reset-email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  )
}
