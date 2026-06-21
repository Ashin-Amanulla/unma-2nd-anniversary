import { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import { formatCountdown, getMsUntilClose } from "../../utils/fifaSlots";

export default function FifaSlotCountdown({
  closesAt,
  locked = false,
  className = "",
  variant = "light",
  layout = "inline",
  showIcon = true,
  prefix = "Closes in",
}) {
  const [msLeft, setMsLeft] = useState(() => getMsUntilClose(closesAt));

  useEffect(() => {
    if (!closesAt || locked) return undefined;
    const tick = () => setMsLeft(getMsUntilClose(closesAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [closesAt, locked]);

  if (!closesAt || locked) return null;

  const countdown = formatCountdown(msLeft);
  const isClosed = msLeft <= 0;

  const textClass = variant === "light" ? "text-white/90" : "text-gray-600";
  const pillClass =
    variant === "light"
      ? "bg-black/20 text-white border-white/20"
      : "bg-gray-100 text-gray-800 border-gray-200";

  const content = (
    <>
      {showIcon && <ClockIcon className="h-3.5 w-3.5 flex-shrink-0 opacity-80" />}
      <span className="font-medium">{prefix}</span>
      <span
        className={`font-mono tabular-nums tracking-wide ${
          isClosed ? "text-[var(--fifa-gold)]" : ""
        }`}
      >
        {isClosed ? "Closed" : countdown?.label}
      </span>
    </>
  );

  if (layout === "pill") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs sm:text-sm ${pillClass} ${className}`}
      >
        {content}
      </div>
    );
  }

  if (layout === "stack") {
    return (
      <div className={`flex flex-col gap-0.5 text-xs sm:text-sm ${textClass} ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1.5 text-xs sm:text-sm ${textClass} ${className}`}
    >
      {content}
    </div>
  );
}
