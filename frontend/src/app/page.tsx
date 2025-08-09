"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    // You can add a spinner or a loading component here
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="mt-4">
        Welcome, <span className="font-bold">{user?.email}</span>
      </p>
      <Button
        onClick={() => {
          logout();
          router.push("/login");
        }}
        className="mt-4"
      >
        Logout
      </Button>
    </div>
  );
}