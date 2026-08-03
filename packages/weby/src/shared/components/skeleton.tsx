// Content-shaped skeletons for the landing page. Each bar mirrors the size of
// the real content it stands in for, so the layout reserves the exact space
// the loaded content will occupy — no jump when the data arrives.
import { useTheme } from "#/shared/hooks/use-theme";

interface SkeletonBarProps {
  className?: string;
}

const useSkeletonColor = (): string => {
  const { isDarkMode } = useTheme();
  return isDarkMode ? "bg-white/10" : "bg-black/10";
};

// SkeletonBar is a single soft block sized via className. Used for text lines,
// labels and stat numbers.
export const SkeletonBar = ({ className = "" }: SkeletonBarProps) => {
  const color = useSkeletonColor();
  return <div className={`rounded-sm ${color} ${className}`} aria-hidden />;
};

// SkeletonCircle is a round block for avatars / org icons.
export const SkeletonCircle = ({ className = "" }: SkeletonBarProps) => {
  const color = useSkeletonColor();
  return <div className={`rounded-full ${color} ${className}`} aria-hidden />;
};

interface SkeletonTextProps {
  className?: string;
  lines?: number;
}

// SkeletonText renders a stack of bars sized like wrapped paragraph lines.
// Pass `lines` for a body of text; the last line is narrower to suggest wrap.
export const SkeletonText = ({ className = "", lines = 3 }: SkeletonTextProps) => {
  const color = useSkeletonColor();
  const widths = ["w-full", "w-11/12", "w-4/5"];
  return (
    <div className={`space-y-2 ${className}`} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div className={`h-3 rounded-sm ${color} ${widths[i % widths.length]}`} key={i} />
      ))}
    </div>
  );
};

interface SkeletonThumbProps {
  className?: string;
}

// SkeletonThumb is a square block for image thumbnails / project covers.
export const SkeletonThumb = ({ className = "" }: SkeletonThumbProps) => {
  const color = useSkeletonColor();
  return <div className={`rounded-sm ${color} ${className}`} aria-hidden />;
};
