interface HeaderBannerProps {
  userName: string;
  statusMessage: string;
}

export default function HeaderBanner({
  userName,
  statusMessage,
}: HeaderBannerProps) {
  return (
    <div className="flex w-full max-w-6xl flex-col gap-3 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-7 shadow-[var(--shadow-subtle)]">
      <h1 className="text-2xl font-semibold text-[color:var(--heading)] sm:text-3xl" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
        Welcome back, {userName}
      </h1>
      <p className="text-base text-[color:var(--muted)] leading-7" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>{statusMessage}</p>
    </div>
  );
}
