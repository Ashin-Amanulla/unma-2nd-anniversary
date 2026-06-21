import { useEffect, useMemo, useState } from "react";
import { FireIcon } from "@heroicons/react/24/solid";

const TABS = [
  { value: "overall", label: "Overall" },
  { value: "slot", label: "By Game Day" },
  { value: "schools", label: "By JNV School" },
];

function RankCell({ rank }) {
  return (
    <td className="px-3 py-3 w-12 text-center tabular-nums font-semibold text-gray-500">
      {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : rank}
    </td>
  );
}

function NameCell({ name, hotStreak }) {
  return (
    <td className="px-3 py-3 min-w-[140px] text-left font-medium">
      <span className="inline-flex items-center gap-1.5">
        {name}
        {hotStreak && (
          <FireIcon className="h-3.5 w-3.5 shrink-0 text-orange-500" title="Hot streak!" />
        )}
      </span>
    </td>
  );
}

function SchoolCell({ jnvSchool }) {
  return (
    <td className="px-3 py-3 w-36 text-center text-gray-600 whitespace-nowrap text-xs">
      {jnvSchool ?? "—"}
    </td>
  );
}

function PointsCell({ points, mutedZero = false }) {
  if (points === null || points === undefined) {
    return <td className="px-3 py-3 w-20 text-right text-gray-300">—</td>;
  }
  return (
    <td className="px-3 py-3 w-20 text-right tabular-nums font-bold">
      {mutedZero && points === 0 ? (
        <span className="text-gray-400 font-normal">0</span>
      ) : (
        points
      )}
    </td>
  );
}

function ScrollableTable({ children }) {
  return (
    <div className="rounded-lg border overflow-hidden bg-white">
      <div className="overflow-auto" style={{ maxHeight: "min(70vh, 640px)" }}>
        <table className="w-full min-w-[320px] border-collapse text-sm">{children}</table>
      </div>
    </div>
  );
}

function TableMessageRow({ colSpan, children }) {
  return (
    <tr className="border-b">
      <td colSpan={colSpan} className="px-3 py-10 text-center text-gray-500">
        {children}
      </td>
    </tr>
  );
}

function buildSlotRows(leaderboard, slotId) {
  return leaderboard
    .map((row) => {
      const slotEntry = row.slotPoints?.find(
        (sp) => String(sp.slotId) === String(slotId)
      );
      return {
        participantId: row.participantId,
        name: row.name,
        jnvSchool: row.jnvSchool,
        hotStreak: row.hotStreak,
        points: slotEntry?.points ?? null,
      };
    })
    .filter((row) => row.points !== null)
    .sort(
      (a, b) =>
        b.points - a.points ||
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    )
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export default function FifaLeaderboardPanel({
  isLoading,
  leaderboard = [],
  schools = [],
  slots = [],
}) {
  const [tab, setTab] = useState("overall");
  const [selectedSlotId, setSelectedSlotId] = useState("");

  useEffect(() => {
    if (!slots.length) {
      setSelectedSlotId("");
      return;
    }
    const stillValid = slots.some((s) => String(s._id) === String(selectedSlotId));
    if (!selectedSlotId || !stillValid) {
      setSelectedSlotId(slots[0]._id);
    }
  }, [slots, selectedSlotId]);

  const slotRows = useMemo(() => {
    if (!selectedSlotId) return [];
    return buildSlotRows(leaderboard, selectedSlotId);
  }, [leaderboard, selectedSlotId]);

  const selectedSlot = slots.find((s) => String(s._id) === String(selectedSlotId));

  const tabBtn = (active) =>
    `rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? "border-[var(--fifa-green)] bg-[var(--fifa-green)] text-white"
        : "border-gray-200 hover:bg-gray-50"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={tabBtn(tab === t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overall" && (
        <ScrollableTable>
          <thead className="sticky top-0 z-10 border-b bg-gray-50">
            <tr>
              <th className="px-3 py-3 w-12 text-center text-xs font-semibold uppercase text-gray-500">#</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-500">Name</th>
              <th className="px-3 py-3 w-36 text-center text-xs font-semibold uppercase text-gray-500">JNV School</th>
              <th className="px-3 py-3 w-20 text-right text-xs font-semibold uppercase text-gray-500">Points</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableMessageRow colSpan={4}>Loading…</TableMessageRow>}
            {!isLoading && leaderboard.length === 0 && (
              <TableMessageRow colSpan={4}>
                No scores yet — points appear once results are entered.
              </TableMessageRow>
            )}
            {leaderboard.map((row) => (
              <tr key={row.participantId} className="border-b last:border-0 hover:bg-gray-50">
                <RankCell rank={row.rank} />
                <NameCell name={row.name} hotStreak={row.hotStreak} />
                <SchoolCell jnvSchool={row.jnvSchool} />
                <PointsCell points={row.points} />
              </tr>
            ))}
          </tbody>
        </ScrollableTable>
      )}

      {tab === "slot" && (
        <div className="space-y-4">
          {slots.length === 0 && !isLoading ? (
            <div className="rounded-lg border px-4 py-10 text-center text-gray-500 bg-white">
              No game days published yet.
            </div>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {slots.map((slot) => (
                  <button
                    key={slot._id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot._id)}
                    className={tabBtn(String(selectedSlotId) === String(slot._id))}
                  >
                    {slot.title}
                  </button>
                ))}
              </div>
              {selectedSlot && (
                <p className="text-sm text-gray-600">
                  Standings for{" "}
                  <span className="font-medium text-gray-900">{selectedSlot.title}</span>
                </p>
              )}
              <ScrollableTable>
                <thead className="sticky top-0 z-10 border-b bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 w-12 text-center text-xs font-semibold uppercase text-gray-500">#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-500">Name</th>
                    <th className="px-3 py-3 w-36 text-center text-xs font-semibold uppercase text-gray-500">JNV School</th>
                    <th className="px-3 py-3 w-20 text-right text-xs font-semibold uppercase text-gray-500">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && <TableMessageRow colSpan={4}>Loading…</TableMessageRow>}
                  {!isLoading && slotRows.length === 0 && (
                    <TableMessageRow colSpan={4}>
                      No predictions scored for this game day yet.
                    </TableMessageRow>
                  )}
                  {slotRows.map((row) => (
                    <tr key={row.participantId} className="border-b last:border-0 hover:bg-gray-50">
                      <RankCell rank={row.rank} />
                      <NameCell name={row.name} hotStreak={row.hotStreak} />
                      <SchoolCell jnvSchool={row.jnvSchool} />
                      <PointsCell points={row.points} mutedZero />
                    </tr>
                  ))}
                </tbody>
              </ScrollableTable>
            </>
          )}
        </div>
      )}

      {tab === "schools" && (
        <ScrollableTable>
          <thead className="sticky top-0 z-10 border-b bg-gray-50">
            <tr>
              <th className="px-3 py-3 w-12 text-center text-xs font-semibold uppercase text-gray-500">#</th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-500">JNV School</th>
              <th className="px-3 py-3 w-24 text-center text-xs font-semibold uppercase text-gray-500">Members</th>
              <th className="px-3 py-3 w-24 text-right text-xs font-semibold uppercase text-gray-500">Total Points</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableMessageRow colSpan={4}>Loading…</TableMessageRow>}
            {!isLoading && schools.length === 0 && (
              <TableMessageRow colSpan={4}>No school scores yet.</TableMessageRow>
            )}
            {schools.map((school, index) => (
              <tr key={school.jnvSchool} className="border-b last:border-0 hover:bg-gray-50">
                <RankCell rank={index + 1} />
                <td className="px-3 py-3 text-left font-medium">{school.jnvSchool ?? "—"}</td>
                <td className="px-3 py-3 w-24 text-center text-gray-600 tabular-nums">{school.members}</td>
                <PointsCell points={school.points} />
              </tr>
            ))}
          </tbody>
        </ScrollableTable>
      )}
    </div>
  );
}
