export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-wp-main px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-wp-accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="15" width="4" height="7" rx="1" fill="white" fillOpacity="0.55" />
              <rect x="10" y="9" width="4" height="13" rx="1" fill="white" fillOpacity="0.8" />
              <rect x="18" y="2" width="4" height="20" rx="1" fill="white" />
            </svg>
          </div>
          <span className="font-heading text-[17px] font-extrabold tracking-tight">Waypoint</span>
        </div>
        {children}
      </div>
    </div>
  );
}
