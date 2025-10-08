import { useRef } from "react";

export default function DatePickerRow({
  date,
  setDate,
}: {
  date: string;
  setDate: (v: string) => void;
}) {
  // reference to the actual date input element
  const dateRef = useRef<HTMLInputElement>(null);

  // open the native date picker if supported
  const openPicker = () => {
    const el = dateRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus(); // fallback for browsers without showPicker()
    }
  };

  return (
    <div className="relative">
      {/* the whole container is clickable */}
      <div
        className="relative cursor-pointer select-none"
        onMouseDown={(e) => {
          e.preventDefault(); // prevent text selection on click
          openPicker();
        }}
        onKeyDown={(e) => {
          // allow keyboard activation
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Choose date"
        title="Choose date"
      >
        {/* the real date input (disabled mouse events so outer div handles clicks) */}
        <input
          ref={dateRef}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="
          input pointer-events-none font-medium text-center tabular-nums
          h-11 text-base
          pl-[40px] pr-5        /* mobile spacing for icon + localized date */
          sm:pl-10 sm:pr-0      /* desktop/tablet overrides */
          rounded-xl
        "
        />

        {/* left calendar icon for visual hint */}
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-80">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="5"
              width="18"
              height="16"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 3v4M16 3v4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
