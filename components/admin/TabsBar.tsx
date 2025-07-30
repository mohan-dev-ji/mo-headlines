"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabsBarProps {
  tabs: TabItem[];
  className?: string;
}

export function TabsBar({ tabs, className = "" }: TabsBarProps) {
  return (
    <div className={`w-full mb-2 bg-brand-card p-[var(--padding-md)] rounded-[var(--radius)] ${className}`}>
      <TabsList className="!flex !w-auto !h-auto !bg-transparent !p-0 !gap-2 !justify-start [&>*]:!flex-none [&>*]:!w-auto">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value} 
            className="flex items-center px-2 py-3 w-auto h-auto flex-shrink-0 text-body-primary border-0 data-[state=active]:!bg-[var(--brand-secondary-button)] data-[state=active]:!text-[var(--button-white)] data-[state=active]:!border-0"
          >
            <span>
              {tab.label}
              {typeof tab.count === 'number' && ` (${tab.count})`}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}