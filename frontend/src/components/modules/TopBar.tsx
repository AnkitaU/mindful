"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "@/components/modules/ThemeSwitcher";

interface TopBarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
}

export default function TopBar({ activeTab, setActiveTab }: TopBarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleNavigation = (path: string, tab?: string) => {
    if (tab && setActiveTab) {
      setActiveTab(tab);
    }
    router.push(path);
  };

  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center">
        <div className="bg-primary p-2 rounded-full mr-4">
          <svg
            className="w-6 h-6 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">mindful web app</h1>
      </div>
      <nav className="flex items-center space-x-8">
        <button onClick={() => handleNavigation("/", "dashboard")} className={`text-lg ${activeTab === 'dashboard' ? 'font-bold' : ''}`}>
          Dashboard
        </button>
        <button onClick={() => handleNavigation("/", "todos")} className={`text-lg ${activeTab === 'todos' ? 'font-bold' : ''}`}>
          To-Do
        </button>
        <button onClick={() => handleNavigation("/new-goal")} className={`text-lg ${activeTab === 'new-goal' ? 'font-bold' : ''}`}>
          Create New Goal
        </button>
      </nav>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </Button>
        <Button variant="ghost" size="icon">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </Button>
        <Button variant="ghost" size="icon">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>
        <ThemeSwitcher />
        <Button
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}