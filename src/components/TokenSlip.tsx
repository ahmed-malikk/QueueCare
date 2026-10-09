import { cn } from "@/lib/utils";

/**
 * The paper token slip clinics hand out, as a screen element: a caption, the token number in
 * extra-condensed print, a tear line, then whatever details belong underneath.
 * `print` plays the one animation in the app (the slip sliding out) when a token is new.
 */
export function TokenSlip({
  caption,
  token,
  print = false,
  className,
  tokenTestId,
  children,
}: {
  caption: React.ReactNode;
  token: string;
  print?: boolean;
  className?: string;
  tokenTestId?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("slip px-6 pt-7 pb-8 text-center", print && "slip-print", className)}>
      <p className="text-sm text-secondary-foreground">{caption}</p>
      <p data-testid={tokenTestId} className="token-type mt-1 text-[5.5rem] text-foreground sm:text-[6.5rem]">
        {token}
      </p>
      {children && (
        <div className="mt-5 border-t border-dashed border-slip-edge pt-4 text-sm text-secondary-foreground">
          {children}
        </div>
      )}
    </div>
  );
}
