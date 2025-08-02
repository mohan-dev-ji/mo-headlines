"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause } from "lucide-react"

export function ConsumerTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Batch Consumer</h2>
          <p className="text-muted-foreground">
            Configure and monitor AI batch processing of queued articles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Processing ON</Badge>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Process Now
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consumer Feature - Coming Soon</CardTitle>
          <CardDescription>
            This is a placeholder for the Consumer tab. The actual implementation will include:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Batch processing controls (ON/OFF toggle, frequency settings)</li>
            <li>Terminal-style display with monospace font</li>
            <li>Real-time countdown timer updating every second</li>
            <li>Processing status with currently processing article list</li>
            <li>Manual "Process Now" functionality with loading states</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}