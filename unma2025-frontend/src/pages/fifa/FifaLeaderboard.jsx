import { Link } from "react-router-dom";
import { useFifaLeaderboard } from "../../hooks/useFifa";
import FifaLeaderboardPanel from "../../components/fifa/FifaLeaderboardPanel";

export default function FifaLeaderboard() {
  const { data, isLoading } = useFifaLeaderboard();

  return (
    <div className="fifa-page">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-3xl font-bold text-[var(--fifa-dark)]">Leaderboard</h1>
          <Link to="/fifa/play" className="fifa-btn-outline text-sm px-4 py-2">
            My Predictions →
          </Link>
        </div>

        <FifaLeaderboardPanel
          isLoading={isLoading}
          leaderboard={data?.leaderboard ?? []}
          schools={data?.schools ?? []}
          slots={data?.slots ?? []}
        />
      </div>
    </div>
  );
}
