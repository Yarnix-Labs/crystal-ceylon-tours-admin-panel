import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const loaderVariants = cva("animate-spin text-primary", {
  variants: {
    size: {
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface LoaderProps extends VariantProps<typeof loaderVariants> {
  className?: string;
}

/**
 * Simple spinner loader using Lucide's Loader2 icon
 * Use for inline loading states, buttons, or small areas
 */
export function Loader({ size, className }: LoaderProps) {
  return <Loader2 className={cn(loaderVariants({ size }), className)} />;
}

interface FullPageLoaderProps {
  message?: string;
  className?: string;
}

/**
 * Full-page centered loader with optional message
 * Use for page-level loading states during data fetching
 */
export function FullPageLoader({ message = "Loading...", className }: FullPageLoaderProps) {
  return (
    <div
      className={cn(
        "min-h-[400px] w-full flex flex-col items-center justify-center gap-4",
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <Loader size="xl" />
      {message && (
        <p className="text-muted-foreground text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
}

interface OverlayLoaderProps {
  message?: string;
  className?: string;
}

/**
 * Overlay loader that covers its parent container
 * Use for section-level loading states (tables, forms, cards)
 */
export function OverlayLoader({ message, className }: OverlayLoaderProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-50",
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <Loader size="lg" />
      {message && (
        <p className="text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  );
}

interface ButtonLoaderProps {
  children?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

/**
 * Button content wrapper that shows a loader when loading
 * Use inside buttons to show loading state
 * Example:
 * <Button disabled={loading}>
 *   <ButtonLoader loading={loading}>Save</ButtonLoader>
 * </Button>
 */
export function ButtonLoader({
  children,
  loading = false,
  className,
}: ButtonLoaderProps) {
  if (!loading) return <>{children}</>;

  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Loader size="sm" />
      {children}
    </span>
  );
}

interface ContentLoaderProps {
  lines?: number;
  className?: string;
}

/**
 * Skeleton content loader for text content
 * Use as placeholder while content is loading
 */
export function ContentLoader({ lines = 3, className }: ContentLoaderProps) {
  return (
    <div className={cn("space-y-3 animate-pulse", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-muted rounded",
            i === lines - 1 ? "w-4/5" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

interface CardLoaderProps {
  cards?: number;
  className?: string;
}

/**
 * Skeleton card loader for grid layouts
 * Use as placeholder for card grids while loading
 */
export function CardLoader({ cards = 4, className }: CardLoaderProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="border rounded-lg p-4 space-y-3 animate-pulse"
        >
          <div className="h-32 bg-muted rounded-md" />
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

interface TableLoaderProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Skeleton table loader
 * Use as placeholder for tables while loading
 */
export function TableLoader({
  rows = 5,
  columns = 4,
  className,
}: TableLoaderProps) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-5 bg-muted rounded",
              i === columns - 1 ? "flex-1" : "w-24"
            )}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                "h-4 bg-muted rounded",
                colIndex === columns - 1 ? "flex-1" : "w-24"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
