"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ProcessingStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Status - Placeholder</CardTitle>
        <CardDescription>
          Current processing status and article queue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This component will show the current processing status and list of articles being processed.
        </p>
      </CardContent>
    </Card>
  )
}