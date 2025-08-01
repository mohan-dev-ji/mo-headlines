"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function QueueItemCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue Item Card - Placeholder</CardTitle>
        <CardDescription>
          Individual queue article display component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This component will display individual queued articles with processing status.
        </p>
      </CardContent>
    </Card>
  )
}