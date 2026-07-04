import FifaParticipant from "../models/FifaParticipant.js";

export function normalizeFifaCode(code) {
  if (!code) return code;
  const upper = String(code).toUpperCase().trim();
  const suffix = upper.startsWith("FIFA-")
    ? upper.slice(5)
    : upper.replace(/^FIFA-?/, "");
  return `FIFA-${suffix}`;
}

export async function resolveParticipant(campaign, email, code) {
  if (!campaign || !email || !code) return null;
  const p = await FifaParticipant.findOne({
    campaign: campaign._id,
    email: String(email).toLowerCase().trim(),
    code: normalizeFifaCode(code),
  });
  return p || null;
}
