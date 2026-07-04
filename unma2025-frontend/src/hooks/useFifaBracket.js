export const fifaBracketKeys = {
  contest: ["fifa-bracket", "contest"],
  board: (filters) => ["fifa-bracket", "board", filters],
  entry: (id) => ["fifa-bracket", "entry", id],
  adminContest: ["fifa-bracket", "admin", "contest"],
  adminEntries: ["fifa-bracket", "admin", "entries"],
};

const STALE_TIME = 2 * 60 * 1000;

export { STALE_TIME as fifaBracketStaleTime };
