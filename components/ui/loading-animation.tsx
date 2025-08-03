"use client"

import Lottie from 'lottie-react'
import { useState, useEffect } from 'react'

interface LoadingAnimationProps {
  size?: number
  className?: string
}

// Cache the animation data globally to avoid re-fetching
let cachedAnimationData: any = null
let isLoading = false
const loadPromises: Promise<any>[] = []

export function LoadingAnimation({ size = 100, className = "" }: LoadingAnimationProps) {
  const [animationData, setAnimationData] = useState(cachedAnimationData)
  const [hasError, setHasError] = useState(false)

  // Load animation data with caching
  useEffect(() => {
    if (cachedAnimationData) {
      setAnimationData(cachedAnimationData)
      return
    }

    if (isLoading) {
      // If already loading, wait for the existing promise
      loadPromises[0]?.then(data => {
        setAnimationData(data)
      }).catch(() => setHasError(true))
      return
    }

    isLoading = true
    const loadPromise = fetch('/animations/loading_gray.json')
      .then(response => response.json())
      .then(data => {
        cachedAnimationData = data
        setAnimationData(data)
        isLoading = false
        return data
      })
      .catch(() => {
        setHasError(true)
        isLoading = false
        throw new Error('Failed to load animation')
      })

    loadPromises[0] = loadPromise
  }, [])

  // Only show fallback if there's an error, not while loading
  if (hasError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div 
          className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
          style={{ height: size, width: size }}
        />
      </div>
    )
  }

  // Show nothing while loading to prevent flash
  if (!animationData) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div style={{ height: size, width: size }} />
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie
        animationData={animationData}
        style={{ height: size, width: size }}
        loop
      />
    </div>
  )
}