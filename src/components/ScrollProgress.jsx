export default function ScrollProgress({ value }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent" aria-hidden="true">
      <div
        className="h-full origin-left bg-champagne shadow-[0_0_18px_rgba(232,217,189,0.55)] transition-transform duration-100"
        style={{ transform: `scaleX(${value})` }}
      />
    </div>
  );
}
