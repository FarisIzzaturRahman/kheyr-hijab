export default function SectionHeading({ eyebrow, title, children, align = 'left', action }) {
  const alignment = align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left';

  return (
    <div className={`mb-8 flex max-w-3xl flex-col ${alignment} gap-3 md:mb-11`} data-reveal>
      {eyebrow ? <p className="text-sm font-semibold uppercase text-goldMuted">{eyebrow}</p> : null}
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
            {title}
          </h2>
          {children ? <p className="mt-4 max-w-2xl text-base leading-8 text-ink/70">{children}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
