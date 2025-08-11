"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="icon"
        className="w-6 h-6 rounded-full bg-gray-200"
        onClick={() => setTheme("light")}
      >
        <span className="sr-only">Light</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="w-6 h-6 rounded-full bg-gray-800"
        onClick={() => setTheme("dark")}
      >
        <span className="sr-only">Dark</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="w-6 h-6 rounded-full bg-blue-500"
        onClick={() => setTheme("blue")}
      >
        <span className="sr-only">Blue</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="w-6 h-6 rounded-full bg-coral-500"
        onClick={() => setTheme("coral")}
      >
        <span className="sr-only">Coral</span>
      </Button>
    </div>
  );
}