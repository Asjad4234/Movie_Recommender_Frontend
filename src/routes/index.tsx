import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: SplashScreen,
});

function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"logo" | "text" | "exit">("logo");

  useEffect(() => {
    const textTimer = setTimeout(() => setPhase("text"), 2200);
    const exitTimer = setTimeout(() => setPhase("exit"), 3800);
    const navTimer = setTimeout(() => {
      navigate({ to: "/profiles" });
    }, 4500);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.577_0.245_27.325_/_0.08)_0%,_transparent_70%)]" />

      {/* Logo */}
      <div className={phase === "exit" ? "animate-netflix-shrink" : "animate-netflix-logo"}>
        <h1
          className="text-7xl md:text-9xl font-black tracking-tighter text-primary select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}
        >
          MOVIEFLIX
        </h1>
      </div>

      {/* Who's watching text */}
      {(phase === "text" || phase === "exit") && (
        <p
          className={`mt-8 text-xl md:text-3xl text-foreground/80 font-medium ${
            phase === "exit" ? "animate-netflix-shrink" : "animate-netflix-text"
          }`}
        >
          Who's watching?
        </p>
      )}
    </div>
  );
}
