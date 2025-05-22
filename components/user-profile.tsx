"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function UserProfile() {
  const { user, logout } = useAuth()
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  if (!user) return null

  const userInitials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() || "U"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>Your account information</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg font-medium">{user.displayName || "User"}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="w-full">
              <p className="text-sm text-muted-foreground">
                Account created: {new Date(user.metadata.creationTime || "").toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Last sign in: {new Date(user.metadata.lastSignInTime || "").toLocaleDateString()}
              </p>
            </div>
          </div>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
              Close
            </Button>
            <Button variant="destructive" onClick={() => logout()}>
              Sign Out
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
