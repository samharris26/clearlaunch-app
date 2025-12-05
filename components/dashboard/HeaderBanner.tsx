interface HeaderBannerProps {
  userName: string;
  statusMessage: string;
}

export default function HeaderBanner({
  userName,
  statusMessage,
}: HeaderBannerProps) {
  return (
    <div className="flex w-full max-w-6xl flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xl shadow-slate-950/60">
      <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
        Welcome back, {userName}
      </h1>
      <p className="text-base text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>{statusMessage}</p>
    </div>
  );
}
