/**
 * FIFA World Cup 2026 — all 48 qualified nations with flag emoji, short label,
 * and group, per the final draw (Washington DC, 5 Dec 2025) and the
 * March 2026 playoff results. Used to auto-enrich team names entered by admins.
 *
 * Lookup is done by normalising both sides to lowercase with no punctuation,
 * so "france", "France", "FRANCE" all hit the same entry.
 */
export const FIFA_TEAMS = [
  // Group A
  { name: "Mexico", short: "MEX", flag: "🇲🇽", group: "A" },
  { name: "South Africa", short: "RSA", flag: "🇿🇦", group: "A" },
  { name: "South Korea", short: "KOR", flag: "🇰🇷", group: "A" },
  { name: "Czechia", short: "CZE", flag: "🇨🇿", group: "A" },

  // Group B
  { name: "Canada", short: "CAN", flag: "🇨🇦", group: "B" },
  { name: "Bosnia and Herzegovina", short: "BIH", flag: "🇧🇦", group: "B" },
  { name: "Qatar", short: "QAT", flag: "🇶🇦", group: "B" },
  { name: "Switzerland", short: "SUI", flag: "🇨🇭", group: "B" },

  // Group C
  { name: "Brazil", short: "BRA", flag: "🇧🇷", group: "C" },
  { name: "Morocco", short: "MAR", flag: "🇲🇦", group: "C" },
  { name: "Haiti", short: "HAI", flag: "🇭🇹", group: "C" },
  { name: "Scotland", short: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C" },

  // Group D
  { name: "United States", short: "USA", flag: "🇺🇸", group: "D" },
  { name: "Paraguay", short: "PAR", flag: "🇵🇾", group: "D" },
  { name: "Australia", short: "AUS", flag: "🇦🇺", group: "D" },
  { name: "Turkey", short: "TUR", flag: "🇹🇷", group: "D" },

  // Group E
  { name: "Germany", short: "GER", flag: "🇩🇪", group: "E" },
  { name: "Curaçao", short: "CUW", flag: "🇨🇼", group: "E" },
  { name: "Ivory Coast", short: "CIV", flag: "🇨🇮", group: "E" },
  { name: "Ecuador", short: "ECU", flag: "🇪🇨", group: "E" },

  // Group F
  { name: "Netherlands", short: "NED", flag: "🇳🇱", group: "F" },
  { name: "Japan", short: "JPN", flag: "🇯🇵", group: "F" },
  { name: "Sweden", short: "SWE", flag: "🇸🇪", group: "F" },
  { name: "Tunisia", short: "TUN", flag: "🇹🇳", group: "F" },

  // Group G
  { name: "Belgium", short: "BEL", flag: "🇧🇪", group: "G" },
  { name: "Egypt", short: "EGY", flag: "🇪🇬", group: "G" },
  { name: "Iran", short: "IRN", flag: "🇮🇷", group: "G" },
  { name: "New Zealand", short: "NZL", flag: "🇳🇿", group: "G" },

  // Group H
  { name: "Spain", short: "ESP", flag: "🇪🇸", group: "H" },
  { name: "Cape Verde", short: "CPV", flag: "🇨🇻", group: "H" },
  { name: "Saudi Arabia", short: "KSA", flag: "🇸🇦", group: "H" },
  { name: "Uruguay", short: "URU", flag: "🇺🇾", group: "H" },

  // Group I
  { name: "France", short: "FRA", flag: "🇫🇷", group: "I" },
  { name: "Senegal", short: "SEN", flag: "🇸🇳", group: "I" },
  { name: "Iraq", short: "IRQ", flag: "🇮🇶", group: "I" },
  { name: "Norway", short: "NOR", flag: "🇳🇴", group: "I" },

  // Group J
  { name: "Argentina", short: "ARG", flag: "🇦🇷", group: "J" },
  { name: "Algeria", short: "ALG", flag: "🇩🇿", group: "J" },
  { name: "Austria", short: "AUT", flag: "🇦🇹", group: "J" },
  { name: "Jordan", short: "JOR", flag: "🇯🇴", group: "J" },

  // Group K
  { name: "Portugal", short: "POR", flag: "🇵🇹", group: "K" },
  { name: "DR Congo", short: "COD", flag: "🇨🇩", group: "K" },
  { name: "Uzbekistan", short: "UZB", flag: "🇺🇿", group: "K" },
  { name: "Colombia", short: "COL", flag: "🇨🇴", group: "K" },

  // Group L
  { name: "England", short: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L" },
  { name: "Croatia", short: "CRO", flag: "🇭🇷", group: "L" },
  { name: "Ghana", short: "GHA", flag: "🇬🇭", group: "L" },
  { name: "Panama", short: "PAN", flag: "🇵🇦", group: "L" },

  // Alternate spellings / codes admins might type
  { name: "USA", short: "USA", flag: "🇺🇸", group: "D" },
  { name: "Holland", short: "NED", flag: "🇳🇱", group: "F" },
  { name: "Côte d'Ivoire", short: "CIV", flag: "🇨🇮", group: "E" },
  { name: "Cote d'Ivoire", short: "CIV", flag: "🇨🇮", group: "E" },
  { name: "Korea", short: "KOR", flag: "🇰🇷", group: "A" },
  { name: "Korea Republic", short: "KOR", flag: "🇰🇷", group: "A" },
  { name: "Czech Republic", short: "CZE", flag: "🇨🇿", group: "A" },
  { name: "Türkiye", short: "TUR", flag: "🇹🇷", group: "D" },
  { name: "Bosnia", short: "BIH", flag: "🇧🇦", group: "B" },
  { name: "Curacao", short: "CUW", flag: "🇨🇼", group: "E" },
];

const _normalise = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const _index = new Map(FIFA_TEAMS.map((t) => [_normalise(t.name), t]));
// Also index by short code
FIFA_TEAMS.forEach((t) => {
  if (!_index.has(_normalise(t.short))) _index.set(_normalise(t.short), t);
});

/**
 * Look up a team by name or short code (case-insensitive, punctuation-tolerant).
 * Returns { name, short, flag, group } or null.
 */
export function getTeam(nameOrCode) {
  return _index.get(_normalise(nameOrCode)) ?? null;
}

/** Returns just the flag emoji, or a generic ⚽ if unknown. */
export function teamFlag(nameOrCode) {
  return getTeam(nameOrCode)?.flag ?? "⚽";
}

/** Short code + full country name for match headers. */
export function teamDisplayLabels(nameOrCode) {
  const team = getTeam(nameOrCode);
  if (!team) return { short: nameOrCode, full: null };
  const full =
    _normalise(team.short) !== _normalise(team.name) ? team.name : null;
  return { short: team.short, full };
}
