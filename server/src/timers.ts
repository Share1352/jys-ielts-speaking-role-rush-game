import type { TimerState } from './state.js';

export function createTimer(kind: TimerState['kind'], durationSec: number): TimerState {
  return { kind, durationSec, remainingSec: durationSec, running: false, startedAtEpochMs: null };
}

export function startTimer(timer: TimerState, now = Date.now()): TimerState {
  if (timer.running || timer.remainingSec <= 0) return timer;
  return { ...timer, running: true, startedAtEpochMs: now };
}

export function pauseTimer(timer: TimerState, now = Date.now()): TimerState {
  if (!timer.running || timer.startedAtEpochMs === null) return timer;
  const elapsed = Math.floor((now - timer.startedAtEpochMs) / 1000);
  return { ...timer, running: false, startedAtEpochMs: null, remainingSec: Math.max(0, timer.remainingSec - elapsed) };
}

export function stopTimer(timer: TimerState): TimerState {
  return { ...timer, running: false, startedAtEpochMs: null, remainingSec: 0 };
}

export function resetTimer(timer: TimerState): TimerState {
  return { ...timer, running: false, startedAtEpochMs: null, remainingSec: timer.durationSec };
}
