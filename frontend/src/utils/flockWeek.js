const DAY_MS = 24 * 60 * 60 * 1000;

export function calculateFlockWeek(receivedOn, currentDate = new Date()) {
  const value = String(receivedOn || "").slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return "";

  const receivedUtc = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const currentUtc = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const elapsedDays = Math.trunc((currentUtc - receivedUtc) / DAY_MS);
  return Math.max(1, Math.trunc((elapsedDays + 1) / 7));
}
