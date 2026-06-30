const JNVTAA_URL = "https://jnvtaa.in";

export default function FifaOrganizerCredit({ variant = "page", className = "", compact = false }) {
  const isLight = variant === "light";

  const boxClass = isLight
    ? "border-white/30 bg-white/15 text-white"
    : "border-[var(--fifa-green)]/25 bg-[var(--fifa-green)]/8 text-gray-800";

  const linkClass = isLight
    ? "text-[#ffe08a] hover:text-white font-bold underline underline-offset-2"
    : "text-[var(--fifa-green)] hover:text-[var(--fifa-dark)] font-bold underline underline-offset-2";

  if (compact) {
    return (
      <p className={`text-center text-xs sm:text-sm ${isLight ? "text-white/75" : "text-gray-600"} ${className}`}>
        Created &amp; organised by{" "}
        <span className={isLight ? "font-semibold text-white/90" : "font-semibold text-gray-800"}>
          JNVTAA
        </span>
        {" · "}
        <a
          href={JNVTAA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          jnvtaa.in
        </a>
      </p>
    );
  }

  return (
    <div className={`rounded-xl border px-4 py-3 text-center ${boxClass} ${className}`}>
      <p className={`text-sm font-semibold ${isLight ? "text-white" : "text-gray-900"}`}>
        Created &amp; organised by JNVTAA
      </p>
      <a
        href={JNVTAA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-1 inline-block text-base ${linkClass}`}
      >
        jnvtaa.in
      </a>
    </div>
  );
}
