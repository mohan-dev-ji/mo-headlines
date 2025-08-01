"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ProducerCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Producer Card - Placeholder</CardTitle>
        <CardDescription>
          Individual RSS producer display component
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This component will display individual RSS producer information with dual status indicators.
        </p>
      </CardContent>
    </Card>
  )
}