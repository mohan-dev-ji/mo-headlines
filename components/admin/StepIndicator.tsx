"use client";

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-8 mb-8">
      {steps.map((stepName, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                  isActive || isCompleted
                    ? "bg-brand-primary-button text-button-white"
                    : "bg-body-greyed-out text-button-white"
                )}
              >
                {stepNumber}
              </div>
              <span className="text-caption text-body-secondary mt-2 text-center">
                {stepName}
              </span>
            </div>
            
            {/* Connector line */}
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "w-16 h-0.5 mx-4 transition-colors",
                  stepNumber < currentStep
                    ? "bg-brand-primary-button"
                    : "bg-body-greyed-out"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}