import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ProfileCard } from "../components/ProfileCard";
import { useApp } from "../context/AppContext";

export const Route = createFileRoute("/profiles")({
  component: ProfilesPage,
  head: () => ({
    meta: [
      { title: "Select Profile — MovieFlix" },
      { name: "description", content: "Choose your profile to get personalized recommendations" },
    ],
  }),
});

const PROFILES = [
  { userId: 1, name: "Alex", color: "#E50914" },
  { userId: 2, name: "Jamie", color: "#0071EB" },
  { userId: 3, name: "Taylor", color: "#46D369" },
  { userId: 4, name: "Morgan", color: "#E87C03" },
  { userId: 5, name: "Casey", color: "#B9090B" },
  { userId: 1000, name: "Guest (New)", color: "#555555" },
];

function ProfilesPage() {
  const navigate = useNavigate();
  const { setSelectedUser, newProfile } = useApp();
  
  // Create a dynamic profiles list
  const displayProfiles = PROFILES.map(p => {
    // If we have a new profile and this is the guest slot, replace it
    if (newProfile && p.userId === 1000) {
      return { userId: newProfile.id, name: newProfile.name, color: newProfile.color };
    }
    return p;
  });

  const handleSelect = (userId: number, name: string) => {
    // All users (existing and new) go directly to dashboard
    // Genre selection happens on dashboard for new users
    console.log(`👤 User selected: ${userId} (${name}) — going to dashboard`);
    setSelectedUser(userId, name);
    navigate({ to: "/dashboard" });
  };

  // ── Profile picker view ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col px-4">
      {/* MovieFlix Logo */}
      <div className="pt-6 pb-12">
        <h2 className="text-3xl font-bold text-red-600">MovieFlix</h2>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col items-center justify-start flex-1 pt-20">
        <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-10">
          Who's watching?
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {displayProfiles.map((p) => (
            <ProfileCard
              key={p.userId}
              userId={p.userId}
              name={p.name}
              color={p.color}
              onClick={() => handleSelect(p.userId, p.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
