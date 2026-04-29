export default function PageHeader({ eyebrow, title, description }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-packrs-orange/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-packrs-orange">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 h-display text-4xl tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
