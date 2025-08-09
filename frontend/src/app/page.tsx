"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("loading...");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/health`
        );
        const data = await res.json();
        setStatus(data.status);
      } catch (error) {
        setStatus("error");
      }
    };

    fetchStatus();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">AI Habit Builder</h1>
      <p className="mt-4">
        Backend Status: <span className="font-bold">{status}</span>
      </p>
    </main>
  );
}