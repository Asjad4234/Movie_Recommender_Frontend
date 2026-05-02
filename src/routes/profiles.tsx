import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
];

function ProfilesPage() {
  const navigate = useNavigate();
  const { setSelectedUser } = useApp();

  const handleSelect = (userId: number, name: string) => {
    setSelectedUser(userId, name);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-10">
        Who's watching?
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
        {PROFILES.map((p) => (
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
  );
}
