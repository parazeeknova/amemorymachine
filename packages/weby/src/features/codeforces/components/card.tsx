import { useQuery } from "@tanstack/react-query";
import { useTheme } from "#/shared/hooks/use-theme";
import { logger } from "#/shared/lib/logger";

interface CFUser {
  handle: string;
  rating?: number;
  rank?: string;
  maxRating?: number;
  maxRank?: string;
}

interface CFRatingChange {
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
}

const fetchJson = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
};

interface CodeforcesCardProps {
  username: string;
}

export const CodeforcesCard = ({ username }: CodeforcesCardProps) => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);

  const {
    data: userData,
    isError: userError,
    error: userErr,
  } = useQuery({
    queryFn: () =>
      fetchJson(`https://codeforces.com/api/user.info?handles=${username}`) as Promise<{
        status: string;
        result: CFUser[];
      }>,
    queryKey: ["codeforces-user", username],
    staleTime: 1000 * 60 * 10,
  });

  const { data: ratingData } = useQuery({
    queryFn: () =>
      fetchJson(`https://codeforces.com/api/user.rating?handle=${username}`) as Promise<{
        status: string;
        result: CFRatingChange[];
      }>,
    queryKey: ["codeforces-rating", username],
    staleTime: 1000 * 60 * 10,
  });

  if (userError) {
    logger.warn({ error: String(userErr), username }, "codeforces user fetch failed");
  }

  const user = userData?.result?.[0];

  if (!user) {
    if (!userError && !userData) {
      return null;
    }
    return (
      <div className={`mt-4 p-3 border ${t("border-border-dark/20", "border-border-light/20")}`}>
        <span className={`text-[10px] lowercase ${t("text-text-dark/30", "text-text-light/40")}`}>
          codeforces data unavailable
        </span>
      </div>
    );
  }
  const ratings = ratingData?.result ?? [];
  const recentContests = ratings.slice(-5).toReversed();

  if (!user) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider opacity-40">codeforces</span>
      </div>
      <div className={`p-3 border ${t("border-border-dark/20", "border-border-light/20")}`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[11px] font-mono font-medium lowercase">{user.handle}</span>
            {user.rank && (
              <span
                className={`ml-2 text-[10px] lowercase ${t("text-text-dark/50", "text-text-light/50")}`}
              >
                {user.rank}
              </span>
            )}
          </div>
          {user.rating && (
            <span
              className={`text-[11px] font-mono font-medium ${t("text-amber-400", "text-amber-600")}`}
            >
              {user.rating}
            </span>
          )}
        </div>

        {recentContests.length > 0 && (
          <div className="flex items-end gap-0.5 h-12 mt-1">
            {recentContests.map((rc, i) => {
              const minRating = Math.min(...recentContests.map((r) => r.oldRating));
              const maxRating = Math.max(...recentContests.map((r) => r.newRating));
              const range = maxRating - minRating || 1;
              const h = ((rc.newRating - minRating) / range) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 relative group"
                  title={`${rc.contestName}: ${rc.oldRating} → ${rc.newRating}`}
                >
                  <div
                    className={`w-full transition-all ${t("bg-amber-500/40", "bg-amber-600/40")}`}
                    style={{ height: `${Math.max(h, 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {user.maxRating && (
          <p className={`text-[9px] mt-1.5 ${t("text-text-dark/30", "text-text-light/30")}`}>
            max: {user.maxRating} ({user.maxRank})
          </p>
        )}
      </div>
    </div>
  );
};
