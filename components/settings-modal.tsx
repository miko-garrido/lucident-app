"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, ExternalLink } from "lucide-react"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [name, setName] = useState("Mike Johnson")
  const [email, setEmail] = useState("miko+test1@dorxata.com")
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  // Integration status (in a real app, this would come from your backend)
  const integrations = {
    clickup: false,
    google: true,
    slack: false,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your account settings and service integrations.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="account" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/abstract-profile.png" />
                <AvatarFallback>MJ</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  Change avatar
                </Button>
              </div>
            </div>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                  disabled
                />
              </div>

              <Separator className="my-2" />

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notifications" className="text-right">
                  Notifications
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
                  <Label htmlFor="notifications">Enable email notifications</Label>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="darkMode" className="text-right">
                  Dark Mode
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Switch id="darkMode" checked={darkMode} onCheckedChange={setDarkMode} />
                  <Label htmlFor="darkMode">Enable dark mode</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="currentColor">
                      <path d="M12.012 2.572c.975 0 1.786.34 2.433 1.02.647.68.97 1.493.97 2.437 0 .954-.323 1.767-.97 2.437-.647.67-1.458 1.006-2.433 1.006-.985 0-1.8-.335-2.446-1.006-.647-.67-.97-1.483-.97-2.437 0-.944.323-1.757.97-2.437.647-.68 1.461-1.02 2.446-1.02zm8.275 9.984v7.88c0 .472-.17.876-.512 1.213-.341.336-.752.505-1.231.505H5.456c-.479 0-.89-.169-1.231-.505a1.66 1.66 0 01-.512-1.213v-7.88c0-.472.17-.876.512-1.213.341-.336.752-.505 1.231-.505h2.964c.108 0 .195.037.26.11.066.074.1.16.1.258 0 .099-.034.184-.1.258a.353.353 0 01-.26.11H5.456c-.239 0-.445.085-.617.252a.826.826 0 00-.257.607v7.88c0 .236.086.44.257.607.172.168.378.252.617.252h13.088c.239 0 .445-.084.617-.252a.826.826 0 00.257-.607v-7.88c0-.236-.086-.44-.257-.607a.839.839 0 00-.617-.252h-2.964a.353.353 0 01-.26-.11.353.353 0 01-.1-.258c0-.099.033-.184.1-.258a.353.353 0 01.26-.11h2.964c.479 0 .89.169 1.231.505.341.337.512.741.512 1.213zm-8.275-8.437c-.717 0-1.325.254-1.823.76-.498.507-.747 1.12-.747 1.84 0 .719.25 1.331.747 1.838.498.507 1.106.76 1.823.76.717 0 1.325-.253 1.823-.76.498-.507.747-1.12.747-1.838 0-.72-.249-1.333-.747-1.84-.498-.506-1.106-.76-1.823-.76zm4.31 7.88H7.69a.353.353 0 01-.26-.11.353.353 0 01-.1-.258c0-.099.033-.184.1-.258a.353.353 0 01.26-.11h8.62c.108 0 .195.037.26.11.066.074.1.16.1.258 0 .099-.034.184-.1.258a.353.353 0 01-.26.11z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">ClickUp</h3>
                    <p className="text-sm text-muted-foreground">Connect your ClickUp account to sync tasks</p>
                  </div>
                </div>
                {integrations.clickup ? (
                  <Button variant="outline" className="w-28 justify-between px-3">
                    <span>Connected</span> <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="w-28 justify-between px-3">
                    <span>Connect</span> <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-red-600 dark:text-red-300" fill="currentColor">
                      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Google</h3>
                    <p className="text-sm text-muted-foreground">Connect your Google account for calendar and docs</p>
                  </div>
                </div>
                {integrations.google ? (
                  <Button variant="outline" className="w-28 justify-between px-3">
                    <span>Connected</span> <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="w-28 justify-between px-3">
                    <span>Connect</span> <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 text-purple-600 dark:text-purple-300"
                      fill="currentColor"
                    >
                      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Slack</h3>
                    <p className="text-sm text-muted-foreground">Connect Slack to receive notifications</p>
                  </div>
                </div>
                {integrations.slack ? (
                  <Button variant="outline" className="w-28 justify-between px-3">
                    <span>Connected</span> <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="w-28 justify-between px-3">
                    <span>Connect</span> <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
