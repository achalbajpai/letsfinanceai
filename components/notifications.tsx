"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Clock, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { getStorageItem, setStorageItem } from "@/lib/storage"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  date: string
  read: boolean
}

interface NotificationPreferences {
  expenseAlerts: boolean
  investmentAlerts: boolean
  goalAlerts: boolean
  marketAlerts: boolean
  budgetAlerts: boolean
}

export function Notifications() {
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    expenseAlerts: true,
    investmentAlerts: true,
    goalAlerts: true,
    marketAlerts: true,
    budgetAlerts: true
  })
  const [activeTab, setActiveTab] = useState<"notifications" | "settings">("notifications")

  // Load notifications and preferences from storage
  useEffect(() => {
    setMounted(true)
    const storedNotifications = getStorageItem<Notification[]>("NOTIFICATIONS", [])
    setNotifications(storedNotifications)

    const storedPreferences = getStorageItem<NotificationPreferences>("NOTIFICATION_PREFERENCES", {
      expenseAlerts: true,
      investmentAlerts: true,
      goalAlerts: true,
      marketAlerts: true,
      budgetAlerts: true
    })
    setPreferences(storedPreferences)
  }, [])

  // Save notifications when they change
  useEffect(() => {
    if (!mounted) return
    setStorageItem("NOTIFICATIONS", notifications)
  }, [notifications, mounted])

  // Save preferences when they change
  useEffect(() => {
    if (!mounted) return
    setStorageItem("NOTIFICATION_PREFERENCES", preferences)
  }, [preferences, mounted])

  // Function to generate sample notifications
  const generateSampleNotifications = () => {
    const sampleNotifications: Notification[] = [
      {
        id: "1",
        title: "Budget Alert",
        message: "You've exceeded your dining budget by 15% this month.",
        type: "warning",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false
      },
      {
        id: "2",
        title: "Investment Update",
        message: "AAPL stock price increased by 3.2% today.",
        type: "success",
        date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        read: false
      },
      {
        id: "3",
        title: "Goal Milestone",
        message: "You're halfway to your 'New Car' savings goal!",
        type: "info",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true
      },
      {
        id: "4",
        title: "Recurring Expense",
        message: "Your subscription payment of $12.99 is due tomorrow.",
        type: "info",
        date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
        read: true
      },
      {
        id: "5",
        title: "Market Alert",
        message: "Market volatility detected - consider reviewing your portfolio.",
        type: "warning",
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        read: true
      }
    ]
    setNotifications(sampleNotifications)
  }

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
  }

  // Toggle notification preference
  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Get filtered notifications
  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(notification => !notification.read)

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "success":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "error":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  // Format date to relative time (e.g. "2 hours ago")
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  // Loading state
  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading notifications...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notifications Center</h1>
      
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant={activeTab === "notifications" ? "default" : "outline"} 
            onClick={() => setActiveTab("notifications")}
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <Button 
            variant={activeTab === "settings" ? "default" : "outline"} 
            onClick={() => setActiveTab("settings")}
            className="gap-2"
          >
            Settings
          </Button>
        </div>
        
        {activeTab === "notifications" && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFilter(filter === "all" ? "unread" : "all")}
            >
              {filter === "all" ? "Show Unread" : "Show All"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllNotifications}
            >
              Clear All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateSampleNotifications}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {activeTab === "notifications" ? (
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Bell className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No notifications to display</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={generateSampleNotifications}
                >
                  Generate Sample Notifications
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(notification => (
                <Card 
                  key={notification.id} 
                  className={cn(
                    "transition-colors",
                    !notification.read && "border-l-4 border-l-primary"
                  )}
                >
                  <CardContent className="p-4 flex">
                    <div className="mr-3 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{notification.title}</h3>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(notification.date)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => markAsRead(notification.id)}
                            className="h-7 px-2 text-xs gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Expense Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when you exceed budget categories
                </p>
              </div>
              <Switch 
                checked={preferences.expenseAlerts} 
                onCheckedChange={() => togglePreference("expenseAlerts")} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Investment Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified about significant changes in your investments
                </p>
              </div>
              <Switch 
                checked={preferences.investmentAlerts}
                onCheckedChange={() => togglePreference("investmentAlerts")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Goal Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Updates on your financial goals progress
                </p>
              </div>
              <Switch 
                checked={preferences.goalAlerts}
                onCheckedChange={() => togglePreference("goalAlerts")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Market Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Notifications about market changes that may affect you
                </p>
              </div>
              <Switch 
                checked={preferences.marketAlerts}
                onCheckedChange={() => togglePreference("marketAlerts")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Budget Reminders</h3>
                <p className="text-sm text-muted-foreground">
                  Reminders about upcoming bill payments and subscriptions
                </p>
              </div>
              <Switch 
                checked={preferences.budgetAlerts}
                onCheckedChange={() => togglePreference("budgetAlerts")}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 