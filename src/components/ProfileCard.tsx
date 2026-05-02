interface ProfileCardProps {
  name: string;
  userId: number;
  color: string;
  onClick: () => void;
}

export function ProfileCard({ name, userId, color, onClick }: ProfileCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-3 focus:outline-none"
    >
      <div
        className="w-24 h-24 md:w-32 md:h-32 rounded-md overflow-hidden border-2 border-transparent group-hover:border-foreground transition-all duration-200 group-hover:scale-105"
        style={{ backgroundColor: color }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-12 h-12 md:w-16 md:h-16 text-white/80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        {name}
      </span>
    </button>
  );
}
