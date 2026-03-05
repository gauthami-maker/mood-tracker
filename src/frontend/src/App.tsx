import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { MoodType } from "./backend.d";
import type { MoodEntry } from "./backend.d";
import { useActor } from "./hooks/useActor";

/* ─── Mood Configuration ───────────────────────────────── */
interface MoodConfig {
  type: MoodType;
  emoji: string;
  label: string;
  sub: string;
  advice: string;
  color: string;
  glowColor: string;
  ocid: string;
}

const MOODS: MoodConfig[] = [
  {
    type: MoodType.firedUp,
    emoji: "🔥",
    label: "Fired Up",
    sub: "Hyper",
    advice: "High energy! Maybe go for a bike ride or hit the gym? 🏍️",
    color: "from-orange-500/20 to-red-600/10",
    glowColor: "rgba(249,115,22,0.5)",
    ocid: "mood.firedUp.button",
  },
  {
    type: MoodType.chill,
    emoji: "😎",
    label: "Chill",
    sub: "Cool",
    advice: "Perfect time to relax or plan your next gaming session. 🎧",
    color: "from-cyan-500/20 to-blue-600/10",
    glowColor: "rgba(6,182,212,0.5)",
    ocid: "mood.chill.button",
  },
  {
    type: MoodType.chaotic,
    emoji: "🌪️",
    label: "Chaotic",
    sub: "Swing",
    advice:
      "Mood swings happen. Take 5 deep breaths. Maybe step away from the screen? 🧘‍♀️",
    color: "from-yellow-400/20 to-amber-600/10",
    glowColor: "rgba(250,204,21,0.5)",
    ocid: "mood.chaotic.button",
  },
  {
    type: MoodType.gaming,
    emoji: "🎮",
    label: "Gaming",
    sub: "Focused",
    advice: "You're in the zone! Remember to blink and drink water. 🥤",
    color: "from-violet-500/20 to-purple-700/10",
    glowColor: "rgba(139,92,246,0.5)",
    ocid: "mood.gaming.button",
  },
  {
    type: MoodType.drained,
    emoji: "😴",
    label: "Drained",
    sub: "Tired",
    advice: "Low battery. How about a 20-min power nap or a snack? 🍎",
    color: "from-slate-500/20 to-gray-700/10",
    glowColor: "rgba(100,116,139,0.5)",
    ocid: "mood.drained.button",
  },
  {
    type: MoodType.happy,
    emoji: "✨",
    label: "Happy",
    sub: "Great",
    advice: "Keep this vibe going! Share a laugh with a friend. ✨",
    color: "from-pink-500/20 to-rose-600/10",
    glowColor: "rgba(236,72,153,0.5)",
    ocid: "mood.happy.button",
  },
];

/* ─── Helpers ──────────────────────────────────────────── */
function formatTimestamp(nanos: bigint): string {
  const ms = Number(nanos / 1_000_000n);
  const date = new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMoodConfig(type: MoodType): MoodConfig {
  return MOODS.find((m) => m.type === type) ?? MOODS[4];
}

/* ─── Video Data ───────────────────────────────────────── */
interface VideoItem {
  searchQuery: string; // YouTube search query — always finds the right video
  title: string;
  lang: string;
  thumbQuery: string; // short keyword for thumbnail placeholder
}

// Build a YouTube search URL so the user always lands on real results for that comedian.
function getSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

// Placeholder thumbnail using a gradient + emoji so no broken images appear.
function getThumbBg(index: number): string {
  const gradients = [
    "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
    "linear-gradient(135deg, #373b44 0%, #4286f4 100%)",
  ];
  return gradients[index % gradients.length];
}

const MOOD_VIDEOS: Partial<Record<MoodType, VideoItem[]>> = {
  [MoodType.firedUp]: [
    {
      searchQuery: "Kapil Sharma Comedy Show best moments funny",
      title: "Kapil Sharma Comedy | Best Moments",
      lang: "Hindi",
      thumbQuery: "kapil sharma",
    },
    {
      searchQuery: "Sunil Grover Gutthi best comedy scenes Kapil Show",
      title: "Sunil Grover as Gutthi | Funniest Scenes",
      lang: "Hindi",
      thumbQuery: "sunil grover",
    },
    {
      searchQuery: "Vadivelu non stop comedy Tamil funny scenes",
      title: "Vadivelu Non-Stop Comedy | Tamil",
      lang: "Tamil",
      thumbQuery: "vadivelu",
    },
  ],
  [MoodType.chaotic]: [
    {
      searchQuery: "Brahmanandam non stop comedy Telugu funny",
      title: "Brahmanandam Non-Stop Comedy | Telugu",
      lang: "Telugu",
      thumbQuery: "brahmanandam",
    },
    {
      searchQuery: "Rajpal Yadav best comedy scenes Bollywood",
      title: "Rajpal Yadav Best Comedy | Bollywood",
      lang: "Hindi",
      thumbQuery: "rajpal yadav",
    },
    {
      searchQuery: "Santhanam super comedy Tamil non stop laughs",
      title: "Santhanam Super Comedy | Tamil",
      lang: "Tamil",
      thumbQuery: "santhanam",
    },
  ],
  [MoodType.drained]: [
    {
      searchQuery: "Johnny Lever best comedy Bollywood funny moments",
      title: "Johnny Lever Best Comedy | Bollywood",
      lang: "Hindi",
      thumbQuery: "johnny lever",
    },
    {
      searchQuery: "Paresh Rawal Hera Pheri comedy scenes funny",
      title: "Paresh Rawal | Hera Pheri Comedy Classic",
      lang: "Hindi",
      thumbQuery: "paresh rawal hera pheri",
    },
    {
      searchQuery: "Vivek comedy Tamil super funny scenes",
      title: "Vivek Comedy | Tamil Super Laughs",
      lang: "Tamil",
      thumbQuery: "vivek tamil comedy",
    },
  ],
  [MoodType.chill]: [
    {
      searchQuery: "Kanan Gill stand up comedy best moments funny",
      title: "Kanan Gill Stand-Up | Best Moments",
      lang: "Hindi/English",
      thumbQuery: "kanan gill",
    },
    {
      searchQuery: "Biswa Kalyan Rath stand up comedy funny India",
      title: "Biswa Kalyan Rath | Stand-Up Comedy",
      lang: "Hindi/English",
      thumbQuery: "biswa kalyan",
    },
    {
      searchQuery: "Yogi B Natchathira Jannal Tamil comedy funny",
      title: "Yogi B | Chill Tamil Comedy",
      lang: "Tamil",
      thumbQuery: "yogi b tamil",
    },
  ],
  [MoodType.happy]: [
    {
      searchQuery: "Kapil Sharma Show best comedy 2024 funny moments",
      title: "Kapil Sharma Show | Funniest 2024",
      lang: "Hindi",
      thumbQuery: "kapil sharma 2024",
    },
    {
      searchQuery: "Sorabh Pant stand up comedy best funny India",
      title: "Sorabh Pant | Stand-Up Laughs",
      lang: "Hindi/English",
      thumbQuery: "sorabh pant",
    },
    {
      searchQuery: "Madurai Muthu comedy Tamil funny scenes",
      title: "Madurai Muthu Comedy | Tamil Laughs",
      lang: "Tamil",
      thumbQuery: "madurai muthu",
    },
  ],
};

const NEGATIVE_MOODS = new Set<MoodType>([
  MoodType.firedUp,
  MoodType.chaotic,
  MoodType.drained,
  MoodType.chill,
  MoodType.happy,
]);

/* ─── Game Data ─────────────────────────────────────────── */
interface GameItem {
  title: string;
  url: string;
  emoji: string;
  genre: string;
}

const BROWSER_GAMES: GameItem[] = [
  {
    title: "2048",
    url: "https://play2048.co/",
    emoji: "🔢",
    genre: "Puzzle",
  },
  {
    title: "Slither.io",
    url: "https://slither.io/",
    emoji: "🐍",
    genre: "Multiplayer",
  },
  {
    title: "Wordle",
    url: "https://www.nytimes.com/games/wordle/index.html",
    emoji: "🟩",
    genre: "Word",
  },
  {
    title: "Agar.io",
    url: "https://agar.io/",
    emoji: "🦠",
    genre: "Multiplayer",
  },
  {
    title: "Chess.com",
    url: "https://www.chess.com/play/computer",
    emoji: "♟️",
    genre: "Strategy",
  },
  {
    title: "GeoGuessr",
    url: "https://www.geoguessr.com/",
    emoji: "🌍",
    genre: "Geography",
  },
];

/* ─── GamingPanel ────────────────────────────────────────── */
function GamingPanel() {
  return (
    <div
      data-ocid="gaming.panel"
      className="relative rounded-xl border border-[oklch(0.65_0.26_290/0.35)] bg-[oklch(0.12_0_0)] overflow-hidden fade-in-up"
      style={{
        boxShadow:
          "0 0 0 1px oklch(0.65 0.26 290 / 0.1), 0 8px 32px oklch(0 0 0 / 0.5)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          background:
            "radial-gradient(ellipse at top left, oklch(0.65 0.26 290 / 0.09), transparent 55%)",
        }}
      />

      <div className="relative z-10 p-5 space-y-4">
        {/* Heading */}
        <div>
          <p
            className="text-xs font-display font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: "oklch(0.75 0.22 290)" }}
          >
            Play a Game 🎮
          </p>
          <p className="text-sm font-body text-white/55">
            Free browser games — no download needed, just click and play
          </p>
        </div>

        {/* Games grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BROWSER_GAMES.map((game, idx) => (
            <a
              key={game.url}
              data-ocid={`gaming.game.link.${idx + 1}` as string}
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none overflow-hidden text-center"
              style={{
                borderColor: "oklch(0.65 0.26 290 / 0.18)",
                background:
                  "linear-gradient(135deg, oklch(0.14 0.04 290 / 0.6), oklch(0.10 0 0 / 0.8))",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "oklch(0.65 0.26 290 / 0.7)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                  "0 0 16px oklch(0.65 0.26 290 / 0.25), inset 0 0 0 1px oklch(0.65 0.26 290 / 0.2)";
                (e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-2px) scale(1.02)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "oklch(0.65 0.26 290 / 0.18)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                (e.currentTarget as HTMLAnchorElement).style.transform = "none";
              }}
            >
              {/* Hover bg overlay */}
              <span
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, oklch(0.65 0.26 290 / 0.08) 0%, transparent 70%)",
                }}
              />

              {/* Emoji */}
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110 relative z-10">
                {game.emoji}
              </span>

              {/* Title */}
              <span className="font-display font-semibold text-sm text-white/90 relative z-10 leading-tight">
                {game.title}
              </span>

              {/* Genre badge */}
              <span
                className="text-[10px] font-body font-medium px-2 py-0.5 rounded-full relative z-10"
                style={{
                  color: "oklch(0.75 0.22 290)",
                  background: "oklch(0.65 0.26 290 / 0.12)",
                  border: "1px solid oklch(0.65 0.26 290 / 0.28)",
                }}
              >
                {game.genre}
              </span>

              {/* Play Now button */}
              <span
                className="mt-1 text-xs font-body font-semibold px-3 py-1 rounded-full transition-all duration-300 group-hover:scale-105 relative z-10"
                style={{
                  background: "oklch(0.65 0.26 290 / 0.18)",
                  color: "oklch(0.85 0.16 290)",
                  border: "1px solid oklch(0.65 0.26 290 / 0.35)",
                }}
              >
                Play Now ▶
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── VideoPanel ────────────────────────────────────────── */
interface VideoPanelProps {
  mood: MoodConfig;
  onDismiss: () => void;
}

function VideoPanel({ mood, onDismiss }: VideoPanelProps) {
  const [videoIndex, setVideoIndex] = useState(0);
  const videos = MOOD_VIDEOS[mood.type] ?? [];
  const current = videos[videoIndex];

  if (!current) return null;

  const searchUrl = getSearchUrl(current.searchQuery);
  const thumbBg = getThumbBg(videoIndex);

  const goPrev = () =>
    setVideoIndex((i) => (i - 1 + videos.length) % videos.length);
  const goNext = () => setVideoIndex((i) => (i + 1) % videos.length);

  // Emoji avatars for each comedian as thumbnail fallback
  const comedyEmojis = ["😂", "🤣", "😆"];
  const thumbEmoji = comedyEmojis[videoIndex % comedyEmojis.length];

  return (
    <div
      data-ocid="video.panel"
      className="relative rounded-xl border border-[oklch(0.56_0.26_350/0.35)] bg-[oklch(0.12_0_0)] overflow-hidden fade-in-up"
      style={{
        boxShadow:
          "0 0 0 1px oklch(0.56 0.26 350 / 0.1), 0 8px 32px oklch(0 0 0 / 0.5)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          background:
            "radial-gradient(ellipse at top left, oklch(0.56 0.26 350 / 0.07), transparent 55%)",
        }}
      />

      {/* Dismiss button */}
      <button
        type="button"
        data-ocid="video.close.button"
        onClick={onDismiss}
        aria-label="Dismiss video panel"
        className="absolute top-3 right-3 z-20 flex items-center justify-center w-7 h-7 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-all duration-200 text-lg leading-none"
      >
        ×
      </button>

      <div className="relative z-10 p-5 space-y-4">
        {/* Heading */}
        <div className="pr-8">
          <p
            className="text-xs font-display font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: "oklch(0.56 0.26 350)" }}
          >
            Comedy Videos 😂
          </p>
          <p className="text-sm font-body text-white/60">
            Indian comedy — {current.lang} — pure laughs, no thinking required
          </p>
        </div>

        {/* Card — clicking opens YouTube search for this comedian/clip */}
        <a
          key={current.searchQuery}
          data-ocid="video.thumbnail.button"
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center justify-center w-full rounded-lg overflow-hidden"
          style={{ background: thumbBg, minHeight: "180px" }}
        >
          {/* Big emoji */}
          <span className="text-7xl mb-3 transition-transform duration-300 group-hover:scale-110 select-none">
            {thumbEmoji}
          </span>

          {/* Comedian name */}
          <p className="text-base font-display font-bold text-white/90 text-center px-4 leading-tight">
            {current.title}
          </p>
          <p className="text-xs font-body text-white/50 mt-1">{current.lang}</p>

          {/* YouTube button */}
          <div
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-body font-semibold transition-all duration-300 group-hover:scale-105"
            style={{
              background: "rgba(255,0,0,0.9)",
              boxShadow: "0 4px 20px rgba(255,0,0,0.4)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-white"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Search on YouTube
          </div>
        </a>

        {/* Navigation dots + prev/next */}
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            data-ocid="video.prev.button"
            variant="outline"
            size="sm"
            onClick={goPrev}
            className="border-[oklch(0.56_0.26_350/0.35)] bg-transparent text-white/60 hover:text-white hover:border-[oklch(0.56_0.26_350/0.7)] hover:bg-[oklch(0.56_0.26_350/0.08)] transition-all duration-200 font-body text-xs"
          >
            ← Prev
          </Button>

          <div className="flex items-center justify-center gap-1.5">
            {videos.map((v, i) => (
              <button
                key={v.searchQuery}
                type="button"
                onClick={() => setVideoIndex(i)}
                className="transition-all duration-200 rounded-full"
                style={{
                  width: i === videoIndex ? "16px" : "6px",
                  height: "6px",
                  background:
                    i === videoIndex
                      ? "oklch(0.56 0.26 350)"
                      : "oklch(0.56 0.26 350 / 0.3)",
                }}
                aria-label={`Go to video ${i + 1}`}
              />
            ))}
          </div>

          <Button
            type="button"
            data-ocid="video.next.button"
            variant="outline"
            size="sm"
            onClick={goNext}
            className="border-[oklch(0.56_0.26_350/0.35)] bg-transparent text-white/60 hover:text-white hover:border-[oklch(0.56_0.26_350/0.7)] hover:bg-[oklch(0.56_0.26_350/0.08)] transition-all duration-200 font-body text-xs"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────── */
function HistorySkeleton() {
  return (
    <div data-ocid="mood.history.loading_state" className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg skeleton-shimmer h-14"
        />
      ))}
    </div>
  );
}

/* ─── MoodButton ───────────────────────────────────────── */
interface MoodButtonProps {
  config: MoodConfig;
  selected: boolean;
  loading: boolean;
  onClick: (config: MoodConfig) => void;
}

function MoodButton({ config, selected, loading, onClick }: MoodButtonProps) {
  return (
    <button
      type="button"
      data-ocid={config.ocid}
      disabled={loading}
      onClick={() => onClick(config)}
      className={[
        "group relative flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl",
        "border transition-all duration-300 cursor-pointer select-none overflow-hidden",
        "bg-gradient-to-br",
        config.color,
        selected
          ? "border-[oklch(0.56_0.26_350)] pink-glow-strong scale-[1.03]"
          : "border-[oklch(0.22_0_0)] hover:border-[oklch(0.56_0.26_350/0.6)] hover:pink-glow hover:scale-[1.02]",
        loading ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
      style={{
        minHeight: "120px",
        background: selected
          ? "linear-gradient(135deg, oklch(0.12 0 0), oklch(0.16 0 0))"
          : undefined,
      }}
    >
      {/* Selected indicator ring */}
      {selected && (
        <span
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: "inset 0 0 0 1.5px oklch(0.56 0.26 350)",
          }}
        />
      )}

      {/* Hover bg overlay */}
      <span
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${config.glowColor} 0%, transparent 70%)`,
          opacity: selected ? 0.08 : undefined,
        }}
      />

      {/* Emoji */}
      <span
        className={[
          "text-3xl transition-transform duration-300 relative z-10",
          selected ? "mood-float" : "group-hover:scale-110",
          loading ? "animate-spin" : "",
        ].join(" ")}
        role="img"
        aria-label={config.label}
      >
        {config.emoji}
      </span>

      {/* Label */}
      <span className="font-display font-semibold text-sm text-white/90 relative z-10 leading-tight">
        {config.label}
      </span>

      {/* Sub label */}
      <span
        className="text-xs font-body relative z-10 px-2 py-0.5 rounded-full"
        style={{
          color: "oklch(0.56 0.26 350)",
          background: "oklch(0.56 0.26 350 / 0.1)",
          border: "1px solid oklch(0.56 0.26 350 / 0.3)",
        }}
      >
        {config.sub}
      </span>
    </button>
  );
}

/* ─── AdvicePanel ──────────────────────────────────────── */
interface AdvicePanelProps {
  selected: MoodConfig | null;
}

function AdvicePanel({ selected }: AdvicePanelProps) {
  return (
    <div
      data-ocid="mood.advice.panel"
      className={[
        "relative rounded-xl p-5 border transition-all duration-500",
        "overflow-hidden",
        selected
          ? "border-[oklch(0.56_0.26_350/0.4)] bg-[oklch(0.12_0_0)]"
          : "border-[oklch(0.22_0_0)] bg-[oklch(0.11_0_0)]",
      ].join(" ")}
    >
      {/* Ambient glow when selected */}
      {selected && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background:
              "radial-gradient(ellipse at top left, oklch(0.56 0.26 350 / 0.06), transparent 60%)",
          }}
        />
      )}

      <div className="relative z-10 flex items-start gap-4">
        {selected ? (
          <>
            <span className="text-4xl flex-shrink-0 mood-float">
              {selected.emoji}
            </span>
            <div className="fade-in-up">
              <p
                className="text-xs font-display font-semibold uppercase tracking-widest mb-1"
                style={{ color: "oklch(0.56 0.26 350)" }}
              >
                {selected.label} · {selected.sub}
              </p>
              <p className="text-[0.95rem] font-body leading-relaxed text-white/80">
                {selected.advice}
              </p>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center gap-3">
            <span className="text-2xl opacity-40">💭</span>
            <p className="text-sm font-body text-white/30 italic">
              How are you feeling today?
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── HistoryItem ──────────────────────────────────────── */
interface HistoryItemProps {
  entry: MoodEntry;
  index: number;
}

function HistoryItem({ entry, index }: HistoryItemProps) {
  const config = getMoodConfig(entry.mood);
  const ocid = index <= 3 ? `mood.history.item.${index}` : "mood.history.row";

  return (
    <div
      data-ocid={ocid}
      className={[
        "flex items-center gap-3 px-4 py-3 rounded-lg",
        "border border-[oklch(0.22_0_0)] bg-[oklch(0.11_0_0)]",
        "transition-colors duration-200 hover:border-[oklch(0.56_0.26_350/0.3)]",
        "fade-in-up",
      ].join(" ")}
      style={{ animationDelay: `${Math.min(index - 1, 5) * 0.06}s` }}
    >
      <span className="text-xl flex-shrink-0">{config.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-display font-medium text-white/85 truncate">
          {config.label}
          <span
            className="ml-1.5 text-[10px] font-body font-normal px-1.5 py-0.5 rounded-full"
            style={{
              color: "oklch(0.56 0.26 350)",
              background: "oklch(0.56 0.26 350 / 0.1)",
            }}
          >
            {config.sub}
          </span>
        </p>
      </div>
      <time className="text-xs font-body text-white/30 flex-shrink-0 tabular-nums">
        {formatTimestamp(entry.timestamp)}
      </time>
    </div>
  );
}

/* ─── App ──────────────────────────────────────────────── */
export default function App() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const [selectedMood, setSelectedMood] = useState<MoodConfig | null>(null);
  const [loggingMood, setLoggingMood] = useState<MoodType | null>(null);
  const [videoDismissed, setVideoDismissed] = useState(false);

  /* Fetch history */
  const {
    data: history = [],
    isLoading: historyLoading,
    error: historyError,
  } = useQuery<MoodEntry[]>({
    queryKey: ["moodHistory"],
    queryFn: async () => {
      if (!actor) return [];
      const entries = await actor.getMoodHistory();
      // Sort newest first
      return [...entries].sort((a, b) =>
        Number(
          b.timestamp - a.timestamp > 0n
            ? 1n
            : b.timestamp - a.timestamp < 0n
              ? -1n
              : 0n,
        ),
      );
    },
    enabled: !!actor && !actorFetching,
  });

  const handleMoodClick = useCallback(
    async (config: MoodConfig) => {
      if (!actor || loggingMood !== null) return;

      setSelectedMood(config);
      setLoggingMood(config.type);
      setVideoDismissed(false);

      try {
        await actor.logMood(config.type);
        await queryClient.invalidateQueries({ queryKey: ["moodHistory"] });
      } catch (err) {
        console.error("Failed to log mood:", err);
      } finally {
        setLoggingMood(null);
      }
    },
    [actor, loggingMood, queryClient],
  );

  const isLoading = actorFetching || historyLoading;

  return (
    <div className="min-h-screen bg-[oklch(0.08_0_0)] flex flex-col relative overflow-x-hidden">
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.22 0 0 / 0.25) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.22 0 0 / 0.25) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient top glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.56 0.26 350 / 0.08) 0%, transparent 70%)",
        }}
      />

      {/* ── Header ─────────────────────────────────────── */}
      <header className="relative z-10 px-4 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full pink-pulse"
            style={{ background: "oklch(0.56 0.26 350)" }}
          />
          <span className="font-display text-xs uppercase tracking-[0.25em] text-white/30">
            Daily Check-In
          </span>
          <span
            className="w-2 h-2 rounded-full pink-pulse"
            style={{ background: "oklch(0.56 0.26 350)" }}
          />
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-white leading-none">
          Mood
          <span
            className="ml-2"
            style={{
              color: "oklch(0.56 0.26 350)",
              textShadow:
                "0 0 30px oklch(0.56 0.26 350 / 0.6), 0 0 60px oklch(0.56 0.26 350 / 0.3)",
            }}
          >
            Tracker
          </span>
        </h1>

        <p className="mt-2 font-body text-sm text-white/35">
          Log your vibe. Own your day.
        </p>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className="relative z-10 flex-1 w-full max-w-2xl mx-auto px-4 pb-8 space-y-6">
        {/* Mood grid */}
        <section aria-label="Select your mood">
          <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">
            How are you feeling?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {MOODS.map((config) => (
              <MoodButton
                key={config.type}
                config={config}
                selected={selectedMood?.type === config.type}
                loading={loggingMood === config.type}
                onClick={handleMoodClick}
              />
            ))}
          </div>
        </section>

        {/* Advice panel */}
        <section aria-label="Mood advice">
          <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">
            Today's Advice
          </h2>
          <AdvicePanel selected={selectedMood} />
        </section>

        {/* Gaming Panel — game links */}
        {selectedMood?.type === MoodType.gaming && (
          <section aria-label="Play a game">
            <GamingPanel />
          </section>
        )}

        {/* Feel Better Videos */}
        {selectedMood &&
          NEGATIVE_MOODS.has(selectedMood.type) &&
          !videoDismissed && (
            <section aria-label="Feel better videos">
              <VideoPanel
                mood={selectedMood}
                onDismiss={() => setVideoDismissed(true)}
              />
            </section>
          )}

        {/* History */}
        <section aria-label="Mood history">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-white/30">
              Recent History
            </h2>
            {history.length > 0 && (
              <span
                className="text-xs font-body px-2 py-0.5 rounded-full"
                style={{
                  color: "oklch(0.56 0.26 350)",
                  background: "oklch(0.56 0.26 350 / 0.1)",
                  border: "1px solid oklch(0.56 0.26 350 / 0.25)",
                }}
              >
                {history.length} {history.length === 1 ? "entry" : "entries"}
              </span>
            )}
          </div>

          <div className="rounded-xl border border-[oklch(0.22_0_0)] bg-[oklch(0.10_0_0)] overflow-hidden">
            {isLoading ? (
              <div className="p-4">
                <HistorySkeleton />
              </div>
            ) : historyError ? (
              <div
                data-ocid="mood.history.error_state"
                className="flex items-center gap-2 p-5 text-sm font-body text-red-400/70"
              >
                <span>⚠️</span>
                <span>Failed to load history. Try again later.</span>
              </div>
            ) : history.length === 0 ? (
              <div
                data-ocid="mood.history.empty_state"
                className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center"
              >
                <span className="text-3xl opacity-30">📭</span>
                <p className="text-sm font-body text-white/25">
                  No entries yet. Log your first mood!
                </p>
              </div>
            ) : (
              <div
                data-ocid="mood.history.list"
                className="divide-y divide-[oklch(0.18_0_0)]"
              >
                {history.map((entry, idx) => (
                  <HistoryItem
                    key={`${entry.mood}-${entry.timestamp}`}
                    entry={entry}
                    index={idx + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="relative z-10 text-center py-5 px-4 border-t border-[oklch(0.22_0_0/0.5)]">
        <p className="text-xs font-body text-white/20">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-white/40"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
