// Reusable admin page shell — page header + breathing-room body.
export default function AdminPageShell({ title, description, actions, children }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 px-6 py-5 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-white">{title}</h1>
            {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </header>
      <div className="px-6 py-6 lg:px-10 lg:py-8">{children}</div>
    </div>
  );
}
