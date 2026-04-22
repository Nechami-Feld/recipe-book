import { Component, Input, OnDestroy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { TimerService } from '../../core/services/timer.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-step-timer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('pop', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.85)' }),
        animate('220ms cubic-bezier(0.34,1.56,0.64,1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' })),
      ]),
    ]),
  ],
  template: `
    @if (!open()) {
      <button class="timer-trigger" (click)="openTimer()" title="הפעל טיימר לשלב זה">
        ⏱️ טיימר
      </button>
    } @else {
      <div class="timer-widget" @pop>
        @if (timer(); as t) {
          <!-- Active timer -->
          <div class="timer-ring-wrap">
            <svg class="timer-ring" viewBox="0 0 80 80">
              <circle class="ring-bg" cx="40" cy="40" r="34" />
              <circle
                class="ring-progress"
                cx="40" cy="40" r="34"
                [class.ring-done]="t.state === 'done'"
                [style.stroke-dashoffset]="dashOffset()"
              />
            </svg>
            <div class="timer-display" [class.timer-display--done]="t.state === 'done'">
              @if (t.state === 'done') {
                <span class="done-icon">✅</span>
              } @else {
                <span class="timer-time">{{ timerService.formatTime(t.remainingSeconds) }}</span>
              }
            </div>
          </div>

          <div class="timer-controls">
            @if (t.state === 'idle' || t.state === 'paused') {
              <button class="ctrl-btn ctrl-btn--play"
                (click)="t.state === 'idle' ? startTimer() : resumeTimer()">
                ▶
              </button>
            }
            @if (t.state === 'running') {
              <button class="ctrl-btn ctrl-btn--pause" (click)="pauseTimer()">⏸</button>
            }
            @if (t.state !== 'idle') {
              <button class="ctrl-btn ctrl-btn--reset" (click)="resetTimer()" title="אפס">↺</button>
            }
            <button class="ctrl-btn ctrl-btn--close" (click)="closeTimer()" title="סגור">✕</button>
          </div>

          @if (t.state === 'done') {
            <p class="done-msg">הזמן הסתיים! 🎉</p>
          }
        } @else {
          <!-- Setup -->
          <div class="timer-setup" @pop>
            <span class="setup-label">⏱️ הגדר טיימר</span>
            <div class="setup-input-row">
              <input
                class="minutes-input"
                type="number"
                min="1" max="180"
                [(ngModel)]="inputMinutes"
                (keydown.enter)="createAndStart()"
              />
              <span class="minutes-label">דקות</span>
            </div>
            <div class="setup-presets">
              @for (p of presets; track p) {
                <button class="preset-btn" (click)="inputMinutes = p; createAndStart()">{{ p }}'</button>
              }
            </div>
            <div class="setup-actions">
              <button class="ctrl-btn ctrl-btn--play" (click)="createAndStart()">▶ התחל</button>
              <button class="ctrl-btn ctrl-btn--close" (click)="open.set(false)">✕</button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .timer-trigger {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.3rem 0.75rem; border-radius: 20px;
      border: 1.5px dashed var(--border); background: none;
      color: var(--text-secondary); font-size: 0.8rem; cursor: pointer;
      transition: all 0.2s; font-family: inherit;
    }
    .timer-trigger:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }

    .timer-widget {
      display: flex; align-items: center; gap: 0.75rem;
      background: var(--card-bg); border: 2px solid var(--border);
      border-radius: 14px; padding: 0.6rem 0.9rem;
      box-shadow: var(--card-shadow); flex-wrap: wrap;
    }

    /* SVG Ring */
    .timer-ring-wrap { position: relative; width: 64px; height: 64px; flex-shrink: 0; }
    .timer-ring { width: 64px; height: 64px; transform: rotate(-90deg); }
    .ring-bg { fill: none; stroke: var(--border); stroke-width: 5; }
    .ring-progress {
      fill: none; stroke: var(--primary); stroke-width: 5;
      stroke-linecap: round;
      stroke-dasharray: 213.6;
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 1s linear;
    }
    .ring-done { stroke: #22c55e; }
    .timer-display {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .timer-time { font-size: 0.85rem; font-weight: 800; color: var(--text-primary); font-variant-numeric: tabular-nums; }
    .timer-display--done .done-icon { font-size: 1.4rem; }

    /* Controls */
    .timer-controls { display: flex; gap: 0.4rem; align-items: center; }
    .ctrl-btn {
      width: 34px; height: 34px; border-radius: 50%; border: none;
      cursor: pointer; font-size: 0.9rem; display: flex; align-items: center;
      justify-content: center; transition: all 0.15s; font-family: inherit;
    }
    .ctrl-btn--play  { background: var(--primary); color: white; }
    .ctrl-btn--play:hover  { background: var(--primary-dark); transform: scale(1.08); }
    .ctrl-btn--pause { background: #f59e0b; color: white; }
    .ctrl-btn--pause:hover { background: #d97706; }
    .ctrl-btn--reset { background: var(--hover-bg); color: var(--text-secondary); }
    .ctrl-btn--reset:hover { background: var(--border); }
    .ctrl-btn--close { background: none; color: var(--text-secondary); border: 1.5px solid var(--border); font-size: 0.75rem; }
    .ctrl-btn--close:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

    .done-msg { font-size: 0.8rem; font-weight: 600; color: #22c55e; margin: 0; }

    /* Setup */
    .timer-setup { display: flex; flex-direction: column; gap: 0.6rem; }
    .setup-label { font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); }
    .setup-input-row { display: flex; align-items: center; gap: 0.5rem; }
    .minutes-input {
      width: 64px; padding: 0.4rem 0.5rem; border: 2px solid var(--border);
      border-radius: 8px; font-size: 1rem; font-weight: 700; text-align: center;
      background: var(--input-bg); color: var(--text-primary); font-family: inherit;
    }
    .minutes-input:focus { outline: none; border-color: var(--primary); }
    .minutes-label { font-size: 0.85rem; color: var(--text-secondary); }
    .setup-presets { display: flex; gap: 0.35rem; flex-wrap: wrap; }
    .preset-btn {
      padding: 0.2rem 0.55rem; border-radius: 20px; border: 1.5px solid var(--border);
      background: var(--hover-bg); color: var(--text-secondary); font-size: 0.78rem;
      cursor: pointer; transition: all 0.15s; font-family: inherit;
    }
    .preset-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
    .setup-actions { display: flex; gap: 0.4rem; }
    .setup-actions .ctrl-btn--play { width: auto; border-radius: 8px; padding: 0 0.75rem; font-size: 0.82rem; gap: 0.3rem; }
  `],
})
export class StepTimerComponent implements OnInit, OnDestroy {
  @Input({ required: true }) stepId!: string;
  @Input() stepLabel = '';

  readonly timerService = inject(TimerService);
  private readonly toastService = inject(ToastService);

  readonly open = signal(false);
  inputMinutes = 5;
  readonly presets = [1, 3, 5, 10, 15, 20, 30];

  readonly timer = computed(() => this.timerService.get(this.stepId));

  // SVG ring: circumference = 2π×34 ≈ 213.6
  readonly dashOffset = computed(() => {
    const t = this.timer();
    if (!t) return 0;
    return 213.6 * (1 - this.timerService.progressPercent(t) / 100);
  });

  ngOnInit(): void {
    // Restore open state if timer already exists
    if (this.timer()) this.open.set(true);
  }

  ngOnDestroy(): void {
    // Don't remove - timer keeps running if user navigates away
  }

  openTimer(): void { this.open.set(true); }

  createAndStart(): void {
    const mins = Math.max(1, Math.min(180, this.inputMinutes || 5));
    this.timerService.create(this.stepId, this.stepLabel || `שלב`, mins);
    this.startTimer();
  }

  startTimer(): void {
    this.timerService.start(this.stepId, label => {
      this.toastService.success(`⏰ הטיימר של "${label}" הסתיים!`);
      this.notify(label);
    });
  }

  resumeTimer(): void {
    this.timerService.resume(this.stepId, label => {
      this.toastService.success(`⏰ הטיימר של "${label}" הסתיים!`);
      this.notify(label);
    });
  }

  pauseTimer(): void { this.timerService.pause(this.stepId); }

  resetTimer(): void { this.timerService.reset(this.stepId); }

  closeTimer(): void {
    this.timerService.remove(this.stepId);
    this.open.set(false);
  }

  private notify(label: string): void {
    this.playDing();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⏰ הטיימר הסתיים!', { body: label, icon: '/favicon.ico' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') new Notification('⏰ הטיימר הסתיים!', { body: label });
      });
    }
  }

  private playDing(): void {
    try {
      const ctx = new AudioContext();
      // שלושה צלילים עולים - אפקט "ding ding ding"
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.4, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
        osc.start(start);
        osc.stop(start + 0.6);
      });
      setTimeout(() => ctx.close(), 1500);
    } catch { /* AudioContext לא נתמך */ }
  }
}
