import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="skeleton" [style.width]="width" [style.height]="height" [class.skeleton--circle]="circle"></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, var(--skeleton-base) 25%, var(--skeleton-shine) 50%, var(--skeleton-base) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }
    .skeleton--circle { border-radius: 50%; }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() circle = false;
}
