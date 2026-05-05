interface ProfileCardProps {
  name: string;
  userId: number;
  color: string;
  avatarUrl?: string;
  onClick: () => void;
}

export function ProfileCard({ name, userId, color, avatarUrl, onClick }: ProfileCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-3 focus:outline-none"
    >
      <div
        className="w-24 h-24 md:w-32 md:h-32 rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition-all duration-200 group-hover:scale-105 flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to smiley face if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}
        {!avatarUrl && (
          <svg
            viewBox="0 0 120 120"
            className="w-20 h-20 md:w-28 md:h-28"
          >
            {/* Left Eye */}
            <circle cx="38" cy="42" r="8" fill="black" />
            {/* Right Eye */}
            <circle cx="82" cy="42" r="8" fill="black" />
            {/* Smile - curved path */}
            <path
              d="M 38 65 Q 60 85 82 65"
              stroke="black"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        {name}
      </span>
    </button>
  );
}
