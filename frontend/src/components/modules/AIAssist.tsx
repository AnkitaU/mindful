"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AIAssistProps {
  setActiveTab: (tab: string) => void;
}

const AIAssist: React.FC<AIAssistProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const router = useRouter();

  const displayName = user?.email ? user.email.split('@') : "there";

  const handleSubmit = async () => {
    if (!prompt) return;

    try {
      const res = await fetch("/api/v1/ai/assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.redirect) {
          if (data.redirect === "/new-goal") {
            setActiveTab("new-goal");
          } else {
            window.location.href = data.redirect;
          }
        } else {
          setResponse(data.response);
        }
      } else {
        setResponse("Sorry, something went wrong.");
      }
    } catch (error) {
      setResponse("Sorry, something went wrong.");
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg animated-border-dark h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            AI Assist ✨
          </h2>
          <p className="text-muted-foreground">
            Knowledge, answers, ideas. One click away.
          </p>
        </div>
        <Button variant="ghost" size="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </Button>
      </div>
      <div className="text-center py-8 flex-grow flex flex-col justify-center">
        {response ? (
          <p>{response}</p>
        ) : (
          <>
            <p>Hi, {displayName}</p>
            <h3 className="text-2xl font-bold mb-4">How can I help you?</h3>
            <div className="flex justify-center mb-6">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                ✨
              </div>
            </div>
            <div className="space-y-2">
              <button className="bg-background hover:bg-muted text-foreground font-semibold py-2 px-4 rounded-full text-sm">
                "create new goal"
              </button>
              <button className="bg-background hover:bg-muted text-foreground font-semibold py-2 px-4 rounded-full text-sm">
                "go to to-do"
              </button>
              <button className="bg-background hover:bg-muted text-foreground font-semibold py-2 px-4 rounded-full text-sm">
                "go to dashboard"
              </button>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Write something.."
          className="flex-grow"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button onClick={handleSubmit} type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
        </Button>
      </div>
    </div>
  );
};

export default AIAssist;