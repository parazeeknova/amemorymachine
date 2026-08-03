import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { useTheme } from "#/shared/hooks/use-theme";
import { useRevealOnReady } from "#/shared/hooks/use-reveal-on-ready";
import { SkeletonBar } from "#/shared/components/skeleton";
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
  ratingUpdateTimeSeconds?: number;
}

interface CFProblem {
  contestId: number;
  index: string;
  name: string;
  solvedTimeSeconds: number;
}

interface CFData {
  user?: CFUser;
  ratings: CFRatingChange[];
  solvedCount?: number;
  lastSolved?: CFProblem[];
}

interface CodeforcesCardProps {
  username: string;
}

interface MonthBucket {
  count: number;
  label: string;
  maxRating: number;
  bestContest: string;
}

// Build the last `span` months of activity from the raw rating history, keyed
// by calendar month so we can render a GitHub-style heatmap of colored boxes.
const buildMonthBuckets = (ratings: CFRatingChange[], span = 12): MonthBucket[] => {
  const now = new Date();
  const buckets: MonthBucket[] = [];
  for (let i = span - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthContests = ratings.filter((r) => {
      if (!r.ratingUpdateTimeSeconds) {
        return false;
      }
      const rd = new Date(r.ratingUpdateTimeSeconds * 1000);
      return rd.getFullYear() === year && rd.getMonth() === month;
    });
    buckets.push({
      bestContest: monthContests.at(-1)?.contestName ?? "",
      count: monthContests.length,
      label: d.toLocaleString("en-US", { month: "short" }),
      maxRating: monthContests.length > 0 ? Math.max(...monthContests.map((r) => r.newRating)) : 0,
    });
  }
  return buckets;
};

const bucketClass = (
  bucket: MonthBucket,
  maxOverall: number,
  t: (d: string, l: string) => string,
) => {
  if (bucket.count === 0) {
    return t("bg-text-dark/5", "bg-text-light/5");
  }
  const intensity = maxOverall > 0 ? bucket.maxRating / maxOverall : 0;
  if (intensity > 0.66) {
    return t("bg-amber-500", "bg-amber-600");
  }
  if (intensity > 0.33) {
    return t("bg-amber-500/60", "bg-amber-600/60");
  }
  return t("bg-amber-500/30", "bg-amber-600/30");
};

const bucketTitle = (bucket: MonthBucket) =>
  `${bucket.label}: ${bucket.count} contest${bucket.count === 1 ? "" : "s"}${
    bucket.maxRating ? ` · peak ${bucket.maxRating}` : ""
  }${bucket.bestContest ? ` · ${bucket.bestContest}` : ""}`;

// formatSolvedDate renders a Codeforces epoch timestamp (seconds) as a compact
// relative or short date.
const formatSolvedDate = (ts: number): string => {
  const days = Math.max(0, (Date.now() / 1000 - ts) / 86_400);
  if (days < 1) {
    return "today";
  }
  if (days < 2) {
    return "yesterday";
  }
  if (days < 30) {
    return `${Math.floor(days)}d ago`;
  }
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short" });
};

export const CodeforcesCard = ({ username }: CodeforcesCardProps) => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);
  const contentRef = useRef<HTMLDivElement>(null);

  // Codeforces sends no CORS headers, so we proxy both user.info and
  // user.rating through backy (/api/cf/data) which fetches server-side.
  const { data, isError, error, isLoading } = useQuery({
    queryFn: async () => {
      const res = await fetch(`/api/cf/data?handle=${encodeURIComponent(username)}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json() as Promise<CFData>;
    },
    queryKey: ["codeforces-data", username],
    staleTime: 1000 * 60 * 10,
  });

  const isReady = !isLoading;

  // Reveal the graph with the same blur-fade the text sections use. The
  // skeleton below is a ghost of this exact layout, so the swap is seamless.
  useRevealOnReady(isReady, contentRef, { stagger: 0.06, y: 12 });

  if (isError) {
    logger.warn({ error: String(error), username }, "codeforces data fetch failed");
  }

  const user = data?.user;
  const ratings = data?.ratings ?? [];
  const buckets = buildMonthBuckets(ratings);
  const maxOverall = Math.max(0, ...buckets.map((b) => b.maxRating));
  const activeMonths = buckets.filter((b) => b.count > 0).length;
  const solvedCount = data?.solvedCount ?? 0;
  const lastSolved = data?.lastSolved ?? [];

  // Single-level ternaries only — nested ternaries are lint-banned, so the
  // loaded content (user card vs unavailable) is computed separately from the
  // loading-vs-loaded switch.
  const content = user ? (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-base font-semibold lowercase">codeforces</span>
        <a
          className="text-sm font-mono font-medium lowercase underline decoration-gray-500/40 underline-offset-4 hover:decoration-gray-500"
          href={`https://codeforces.com/profile/${encodeURIComponent(user.handle)}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          {user.handle}
        </a>
        {user.rank && (
          <span
            className={`text-xs lowercase opacity-50 ${t("text-text-dark/40", "text-text-light/40")}`}
          >
            {user.rank}
          </span>
        )}
        {user.rating && (
          <span
            className={`ml-auto text-sm font-mono font-medium ${t("text-amber-400", "text-amber-600")}`}
          >
            {user.rating}
          </span>
        )}
      </div>

      {/* GitHub-style month heatmap: one colored box per month. */}
      <div className="flex items-end gap-0.5 h-10">
        {buckets.map((b, i) => (
          <div
            className={`cf-month-box flex-1 h-8 ${bucketClass(b, maxOverall, t)}`}
            key={i}
            title={bucketTitle(b)}
          />
        ))}
      </div>
      <div className="flex gap-0.5 mt-0.5">
        {buckets.map((b, i) => (
          <span
            className={`flex-1 text-center text-[7px] ${i % 2 === 0 ? "opacity-30" : "opacity-0"}`}
            key={i}
          >
            {b.label}
          </span>
        ))}
      </div>

      {/* CF stats: same stat-block styling as GitHubStats */}
      {/* (number on top, small gray uppercase label below). */}
      <div className="mt-4 sm:mt-6">
        <div className="flex space-x-6">
          {solvedCount > 0 && (
            <div className="flex flex-col">
              <span className="font-medium text-xs tabular-nums sm:text-sm">
                {solvedCount.toLocaleString("en-US")}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider sm:text-xs">
                solved
              </span>
            </div>
          )}
          {ratings.length > 0 && (
            <div className="flex flex-col">
              <span className="font-medium text-xs tabular-nums sm:text-sm">
                {ratings.length.toLocaleString("en-US")}
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider sm:text-xs">
                contests
              </span>
            </div>
          )}
          {activeMonths > 0 && (
            <div className="flex flex-col">
              <span className="font-medium text-xs tabular-nums sm:text-sm">{activeMonths}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider sm:text-xs">
                active months
              </span>
            </div>
          )}
          {user.maxRating && (
            <div className="flex flex-col">
              <span className="font-medium text-xs tabular-nums sm:text-sm">{user.maxRating}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider sm:text-xs">
                max rating
              </span>
            </div>
          )}
        </div>
      </div>

      {lastSolved.length > 0 && (
        <div className="mt-4">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider sm:text-xs">
            recently solved
          </span>
          <ul className="mt-1 space-y-0.5">
            {lastSolved.map((p) => (
              <li
                className="flex items-baseline justify-between gap-2 text-xs"
                key={`${p.contestId}-${p.index}`}
              >
                <span className="min-w-0 truncate text-gray-400">
                  {p.name || `${p.contestId}${p.index}`}
                </span>
                <span className="shrink-0 text-[10px] text-gray-500">
                  {formatSolvedDate(p.solvedTimeSeconds)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  ) : (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-base font-semibold lowercase">codeforces</span>
        <span className={`text-xs lowercase ${t("text-text-dark/30", "text-text-light/40")}`}>
          data unavailable
        </span>
      </div>
      <div className="flex items-end gap-0.5 h-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <div className={`flex-1 h-8 ${t("bg-text-dark/5", "bg-text-light/5")}`} key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-4">
      {isLoading ? (
        <div className="skeleton-shimmer" aria-hidden>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base font-semibold lowercase opacity-40">codeforces</span>
            <SkeletonBar className="h-3.5 w-24" />
            <SkeletonBar className="h-3.5 w-8 ml-auto" />
          </div>
          <div className="flex items-end gap-0.5 h-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div className={`flex-1 h-8 ${t("bg-amber-500/10", "bg-amber-600/10")}`} key={i} />
            ))}
          </div>
          <div className="flex gap-6 mt-4 sm:mt-6">
            {[
              { label: "solved" },
              { label: "contests" },
              { label: "active months" },
              { label: "max rating" },
            ].map((stat) => (
              <div className="flex flex-col" key={stat.label}>
                <SkeletonBar className="h-4 w-8" />
                <span className="text-[10px] uppercase tracking-wider text-gray-500 opacity-40 mt-1 sm:text-xs">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 opacity-40 sm:text-xs">
              recently solved
            </span>
            <div className="space-y-1.5 mt-1.5">
              <SkeletonBar className="h-3 w-3/5" />
              <SkeletonBar className="h-3 w-1/2" />
              <SkeletonBar className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      ) : (
        <div ref={contentRef}>{content}</div>
      )}
    </div>
  );
};
