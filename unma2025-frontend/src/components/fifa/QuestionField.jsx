import {
  isFifaAnswerProvided,
  readScoreAnswer,
  readNumberAnswer,
} from "../../utils/fifaAnswers";
import {
  getWinnerChoices,
  winnerQuestionHint,
  scoreQuestionHint,
} from "../../utils/fifaStages";

export default function QuestionField({
  question,
  teamA,
  teamB,
  stage = "group",
  flagA = "⚽",
  flagB = "⚽",
  value,
  onChange,
  locked,
  result,
}) {
  const { type, text, points, options } = question;

  const pillBase =
    "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-150 select-none";
  const pillActive = "border-[var(--fifa-green)] bg-[var(--fifa-green)] text-white shadow-sm";
  const pillIdle =
    "border-gray-200 bg-white hover:border-[var(--fifa-field)] hover:bg-[var(--fifa-light)] cursor-pointer";
  const pillLocked = "pointer-events-none opacity-60";

  const pill = (active) =>
    `${pillBase} ${active ? pillActive : pillIdle} ${locked ? pillLocked : ""}`;

  let input = null;
  let typeHint = null;

  if (type === "winner") {
    const choices = getWinnerChoices(stage, teamA, teamB, { flagA, flagB });
    typeHint = winnerQuestionHint(stage);
    input = (
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <button
            key={c.value}
            type="button"
            className={pill(value === c.value)}
            onClick={() => !locked && onChange(c.value)}
          >
            <span className="text-base leading-none">{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    );
  } else if (type === "score") {
    typeHint = scoreQuestionHint(stage);
    const sv = readScoreAnswer(value);
    input = (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xl leading-none">{flagA}</span>
          <input
            type="number"
            min="0"
            className="input w-16 text-center font-bold"
            placeholder="–"
            value={sv.a}
            disabled={locked}
            onChange={(e) => onChange({ ...sv, a: e.target.value })}
          />
        </div>
        <span className="text-gray-500 font-bold text-lg">–</span>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            className="input w-16 text-center font-bold"
            placeholder="–"
            value={sv.b}
            disabled={locked}
            onChange={(e) => onChange({ ...sv, b: e.target.value })}
          />
          <span className="text-xl leading-none">{flagB}</span>
        </div>
      </div>
    );
  } else if (type === "choice") {
    input = (
      <div className="flex flex-wrap gap-2">
        {(options || []).map((opt) => (
          <button
            key={opt}
            type="button"
            className={pill(value === opt)}
            onClick={() => !locked && onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  } else if (type === "number") {
    input = (
      <input
        type="number"
        min="0"
        className="input w-28 text-center font-bold"
        placeholder="–"
        value={readNumberAnswer(value)}
        disabled={locked}
        onChange={(e) => onChange(e.target.value === "" ? "" : e.target.value)}
      />
    );
  } else {
    input = (
      <input
        type="text"
        className="input max-w-xs"
        placeholder="Your answer…"
        value={value ?? ""}
        disabled={locked}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  const hasAnswer = isFifaAnswerProvided(type, value);

  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <span className="text-sm font-semibold text-gray-800 leading-snug">{text}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {result?.graded ? (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                result.pointsAwarded > 0
                  ? "bg-[var(--fifa-green)] text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {result.pointsAwarded > 0 ? `+${result.pointsAwarded}` : "0"} / {points} pts
            </span>
          ) : (
            <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              {points} pts
            </span>
          )}
        </div>
      </div>
      {typeHint ? <p className="text-xs text-gray-500">{typeHint}</p> : null}
      {input}
      {locked && !hasAnswer && (
        <p className="text-xs text-gray-500 italic">Not answered</p>
      )}
      {locked && !result?.graded && hasAnswer && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 inline-block" />
          Awaiting results
        </p>
      )}
    </div>
  );
}
