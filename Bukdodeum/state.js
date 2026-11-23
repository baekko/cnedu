// Pure progression rules. Original game scores and first-completion rewards stay intact.
export const normalizeAnswer = value => String(value ?? '').replace(/\s+/g, '').trim().toLowerCase();
export function hintLimit(mode, restriction = 0) {
  return Math.max(0, (mode.kind === 'classroom' ? 3 : 2) - Number(restriction || 0));
}
export function revealedCount(record = {}, question) {
  if (record.usedAnswer) return question.hints.length;
  return Math.min(question.hints.length, Math.max(Number(record.revealed || 0), record.usedHint ? 1 : 0));
}
export function revealStage(progress, number, question, stage) {
  const next = structuredClone(progress);
  const old = next[number] || {};
  const count = Math.min(question.hints.length, Math.max(revealedCount(old, question), stage));
  // Opening help after completion never rewrites the historical score or flags.
  if (old.completed) return next;
  next[number] = { ...old, completed: false, revealed: count, usedHint: count > 0, usedAnswer: count === question.hints.length };
  return next;
}
export function completeQuestion(progress, number, mode) {
  const next = structuredClone(progress);
  const old = next[number] || {};
  if (old.completed) return { progress: next, first: false, score: old.score ?? null };
  const score = mode.kind === 'classroom' ? null : mode.scoreRules[old.usedAnswer ? 'answer' : old.usedHint ? 'hint' : 'unassisted'];
  next[number] = { ...old, completed: true, ...(score !== null ? { score } : {}) };
  return { progress: next, first: true, score };
}
export function completedCount(progress) {
  return [1,2,3,4,5].filter(n => progress[n]?.completed === true).length;
}
export function totalScore(progress) {
  return [1,2,3,4,5].reduce((sum, n) => sum + (progress[n]?.completed ? Number(progress[n].score || 0) : 0), 0);
}
