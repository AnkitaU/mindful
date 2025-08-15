"use client";

import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";

interface FiltersProps {
  daily: boolean;
  setDaily: (value: boolean) => void;
  weekly: boolean;
  setWeekly: (value: boolean) => void;
  monthly: boolean;
  setMonthly: (value: boolean) => void;
}

export default function Filters({
  daily,
  setDaily,
  weekly,
  setWeekly,
  monthly,
  setMonthly,
}: FiltersProps) {
  return (
    <div className="bg-white dark:bg-card p-6 rounded-lg max-w-xs animated-border">
      <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
        Filters
      </h2>
      <div className="space-y-6">
        <div>
          <div className="space-y-2">
            <div className="flex items-center justify-between max-w-[150px]">
              <label htmlFor="daily" className="text-black dark:text-white">
                Daily
              </label>
              <Switch id="daily" checked={daily} onCheckedChange={setDaily} />
            </div>
            <div className="flex items-center justify-between max-w-[150px]">
              <label htmlFor="weekly" className="text-black dark:text-white">
                Weekly
              </label>
              <Switch id="weekly" checked={weekly} onCheckedChange={setWeekly} />
            </div>
            <div className="flex items-center justify-between max-w-[150px]">
              <label htmlFor="monthly" className="text-black dark:text-white">
                Monthly
              </label>
              <Switch id="monthly" checked={monthly} onCheckedChange={setMonthly} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}