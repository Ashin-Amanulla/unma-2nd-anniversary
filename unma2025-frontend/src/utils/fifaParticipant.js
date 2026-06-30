/* Shared localStorage helpers for the saved FIFA participant credentials.
   The participant identity is { email, code } — the same creds posted to the
   contest API. Used by both the play page and the group chat. */

const LS_KEY = "fifaParticipant";
const LS_EMAIL_KEY = "fifaLastEmail";

export function readSavedParticipant() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || null;
  } catch {
    return null;
  }
}

export function writeSavedParticipant(val) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}

export function clearSavedParticipant() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

export function readLastEmail() {
  try {
    return localStorage.getItem(LS_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function writeLastEmail(email) {
  try {
    localStorage.setItem(LS_EMAIL_KEY, email);
  } catch {
    /* ignore */
  }
}
