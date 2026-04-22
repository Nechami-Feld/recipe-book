import { Injectable, signal } from '@angular/core';

export type TimerState = 'idle' | 'running' | 'paused' | 'done';

export interface Timer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  state: TimerState;
}

@Injectable({ providedIn: 'root' })
export class TimerService {
  private readonly _timers = signal<Map<string, Timer>>(new Map());
  private readonly _intervals = new Map<string, ReturnType<typeof setInterval>>();

  readonly timers = this._timers.asReadonly();

  create(id: string, label: string, minutes: number): void {
    const seconds = minutes * 60;
    this._timers.update(map => {
      const next = new Map(map);
      next.set(id, { id, label, totalSeconds: seconds, remainingSeconds: seconds, state: 'idle' });
      return next;
    });
  }

  start(id: string, onDone: (label: string) => void): void {
    this._setState(id, 'running');
    const interval = setInterval(() => {
      const timer = this._timers().get(id);
      if (!timer || timer.state !== 'running') return;

      if (timer.remainingSeconds <= 1) {
        this._setRemaining(id, 0);
        this._setState(id, 'done');
        this._clearInterval(id);
        onDone(timer.label);
        return;
      }
      this._setRemaining(id, timer.remainingSeconds - 1);
    }, 1000);
    this._intervals.set(id, interval);
  }

  pause(id: string): void {
    this._clearInterval(id);
    this._setState(id, 'paused');
  }

  resume(id: string, onDone: (label: string) => void): void {
    this.start(id, onDone);
  }

  reset(id: string): void {
    this._clearInterval(id);
    const timer = this._timers().get(id);
    if (!timer) return;
    this._timers.update(map => {
      const next = new Map(map);
      next.set(id, { ...timer, remainingSeconds: timer.totalSeconds, state: 'idle' });
      return next;
    });
  }

  remove(id: string): void {
    this._clearInterval(id);
    this._timers.update(map => {
      const next = new Map(map);
      next.delete(id);
      return next;
    });
  }

  get(id: string): Timer | undefined {
    return this._timers().get(id);
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  progressPercent(timer: Timer): number {
    if (timer.totalSeconds === 0) return 0;
    return ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100;
  }

  private _setState(id: string, state: TimerState): void {
    this._timers.update(map => {
      const t = map.get(id);
      if (!t) return map;
      const next = new Map(map);
      next.set(id, { ...t, state });
      return next;
    });
  }

  private _setRemaining(id: string, remainingSeconds: number): void {
    this._timers.update(map => {
      const t = map.get(id);
      if (!t) return map;
      const next = new Map(map);
      next.set(id, { ...t, remainingSeconds });
      return next;
    });
  }

  private _clearInterval(id: string): void {
    const interval = this._intervals.get(id);
    if (interval) { clearInterval(interval); this._intervals.delete(id); }
  }
}
