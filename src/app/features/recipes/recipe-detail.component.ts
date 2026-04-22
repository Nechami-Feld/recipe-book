import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RecipeService } from '../../core/services/recipe.service';
import { ToastService } from '../../core/services/toast.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { StepTimerComponent } from '../../shared/components/step-timer.component';
import { RelatedRecipesComponent } from '../../shared/components/related-recipes.component';
import { ShareCardDialogComponent } from '../../shared/components/share-card-dialog.component';
import { QrCodeDialogComponent } from '../../shared/components/qr-code-dialog.component';
import { PdfExportService } from '../../core/services/pdf-export.service';
import { CATEGORY_LABELS } from '../../core/models/recipe.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StepTimerComponent, RelatedRecipesComponent],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  template: `
    @if (recipe()) {
      <div class="detail-page" @fadeIn>
        <!-- Hero Image -->
        <div class="detail-hero">
          <img [src]="recipe()!.imageUrl" [alt]="recipe()!.title" class="detail-hero__img"
            (error)="onImgError($event)" />
          <div class="detail-hero__overlay">
            <div class="detail-hero__content">
              <span class="category-badge">{{ categoryLabels[recipe()!.category] }}</span>
              <h1 class="detail-hero__title">{{ recipe()!.title }}</h1>
              <p class="detail-hero__desc">{{ recipe()!.description }}</p>
            </div>
          </div>
          <button class="back-btn" [routerLink]="['/recipes']">← חזרה</button>
        </div>

        <div class="detail-body">
          <!-- Meta Stats -->
          <div class="stats-row">
            <div class="stat-card">
              <span class="stat-icon">⏱️</span>
              <span class="stat-value">{{ recipe()!.prepTime }}</span>
              <span class="stat-label">דק' הכנה</span>
            </div>
            <div class="stat-card">
              <span class="stat-icon">🔥</span>
              <span class="stat-value">{{ recipe()!.cookTime }}</span>
              <span class="stat-label">דק' בישול</span>
            </div>
            <div class="stat-card">
              <span class="stat-icon">🍽️</span>
              <span class="stat-value">{{ recipe()!.servings }}</span>
              <span class="stat-label">מנות</span>
            </div>
            <div class="stat-card">
              <span class="stat-icon">🥗</span>
              <span class="stat-value">{{ recipe()!.ingredients.length }}</span>
              <span class="stat-label">רכיבים</span>
            </div>
          </div>

          <!-- Servings Scaler -->
          <div class="scaler">
            <span class="scaler__label">🍽️ מנות:</span>
            <button class="scaler__btn" (click)="decreaseServings()" [disabled]="currentServings() <= 1">−</button>
            <div class="scaler__slider-wrap">
              <input
                class="scaler__slider"
                type="range"
                [min]="1"
                [max]="maxServings()"
                [value]="currentServings()"
                (input)="currentServings.set(+$any($event.target).value)"
              />
            </div>
            <button class="scaler__btn" (click)="increaseServings()" [disabled]="currentServings() >= maxServings()">+</button>
            <span class="scaler__value">{{ currentServings() }}</span>
            @if (currentServings() !== recipe()!.servings) {
              <button class="scaler__reset" (click)="currentServings.set(recipe()!.servings)" title="אפס">
                ↺ {{ recipe()!.servings }}
              </button>
            }
          </div>

          <!-- Tags -->
          <div class="tags-row">
            @for (tag of recipe()!.tags; track tag) {
              <span class="tag">{{ tag }}</span>
            }
          </div>

          <!-- Mode Toggle -->
          <div class="mode-toggle">
            <button class="mode-btn" [class.active]="!stepMode()" (click)="stepMode.set(false)">📋 רשימה</button>
            <button class="mode-btn" [class.active]="stepMode()" (click)="stepMode.set(true)">👣 שלב אחר שלב</button>
          </div>

          <div class="detail-grid">
            <!-- Ingredients -->
            <section class="ingredients-section">
              <h2>🥘 רכיבים</h2>
              <ul class="ingredients-list">
                @for (ing of scaledIngredients(); track ing.id; let i = $index) {
                  <li class="ingredient-item" [class.highlighted]="stepMode() && currentStep() === i">
                    <span class="ingredient-amount" [class.amount--changed]="currentServings() !== recipe()!.servings">
                      {{ ing.scaledAmount }} {{ ing.unit }}
                    </span>
                    <span class="ingredient-name">{{ ing.name }}</span>
                  </li>
                }
              </ul>
            </section>

            <!-- Instructions -->
            <section class="instructions-section">
              <h2>📝 הוראות הכנה</h2>
              @if (!stepMode()) {
                <div class="instructions-text" [innerHTML]="formattedInstructions()"></div>
              } @else {
                <div class="steps-container">
                  @for (step of steps(); track $index; let i = $index) {
                    <div class="step" [class.step--active]="currentStep() === i" (click)="currentStep.set(i)">
                      <div class="step__number">{{ i + 1 }}</div>
                      <div class="step__body">
                        <div class="step__text">{{ step }}</div>
                        <app-step-timer
                          [stepId]="recipe()!.id + '-step-' + i"
                          [stepLabel]="'שלב ' + (i + 1)"
                        />
                      </div>
                    </div>
                  }
                  <div class="step-nav">
                    <button class="btn-secondary" [disabled]="currentStep() === 0" (click)="prevStep()">← הקודם</button>
                    <span>{{ currentStep() + 1 }} / {{ steps().length }}</span>
                    <button class="btn-secondary" [disabled]="currentStep() === steps().length - 1" (click)="nextStep()">הבא →</button>
                  </div>
                </div>
              }
            </section>
          </div>

          <!-- Actions -->
          <div class="detail-actions">
            <button class="btn-fav" [class.active]="recipe()!.isFavorite" (click)="toggleFavorite()">
              {{ recipe()!.isFavorite ? '❤️ במועדפים' : '🤍 הוסף למועדפים' }}
            </button>
            <button class="btn-secondary" [routerLink]="['/recipes', recipe()!.id, 'edit']">✏️ עריכה</button>
            <button class="btn-danger" (click)="deleteRecipe()">🗑️ מחיקה</button>
            <button class="btn-secondary" (click)="printRecipe()">🖨️ הדפסה</button>
            <button class="btn-share" (click)="shareCard()">📤 שתף</button>
            <button class="btn-qr" (click)="showQr()">📱 QR</button>
            <button class="btn-pdf" (click)="exportPdf()" [disabled]="exportingPdf()">
              @if (exportingPdf()) { <span class="spinner-sm"></span> }
              @else { 📄 }
              PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Related Recipes -->
      <app-related-recipes [recipeId]="recipe()!.id" />

    } @else {
      <div class="not-found">
        <div style="font-size: 4rem">🔍</div>
        <h2>מתכון לא נמצא</h2>
        <a [routerLink]="['/recipes']" class="btn-primary">חזרה לרשימה</a>
      </div>
    }
  `,
  styles: [`
    .detail-page { max-width: 900px; margin: 0 auto; }
    .detail-hero { position: relative; height: 380px; overflow: hidden; }
    .detail-hero__img { width: 100%; height: 100%; object-fit: cover; }
    .detail-hero__overlay {
      position: absolute; inset: 0;
      background: linear-gradient(transparent 20%, rgba(0,0,0,0.75));
      display: flex; align-items: flex-end;
    }
    .detail-hero__content { padding: 2rem; color: white; }
    .category-badge {
      background: var(--primary); color: white;
      padding: 0.25rem 0.75rem; border-radius: 20px;
      font-size: 0.8rem; font-weight: 600; display: inline-block; margin-bottom: 0.5rem;
    }
    .detail-hero__title { font-size: clamp(1.5rem, 4vw, 2.2rem); font-weight: 800; margin: 0 0 0.5rem; }
    .detail-hero__desc { margin: 0; opacity: 0.9; font-size: 1rem; }
    .back-btn {
      position: absolute; top: 1rem; right: 1rem;
      background: rgba(255,255,255,0.9); border: none; border-radius: 8px;
      padding: 0.5rem 1rem; cursor: pointer; font-weight: 600; backdrop-filter: blur(4px);
      transition: background 0.2s;
    }
    .back-btn:hover { background: white; }
    .detail-body { padding: 1.5rem 1rem; }
    .stats-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .stat-card {
      flex: 1; min-width: 80px;
      background: var(--card-bg); border-radius: 12px; padding: 1rem;
      text-align: center; box-shadow: var(--card-shadow);
      display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
    }
    .stat-icon { font-size: 1.5rem; }
    .stat-value { font-size: 1.4rem; font-weight: 800; color: var(--primary); }
    .stat-label { font-size: 0.75rem; color: var(--text-secondary); }
    .scaler {
      display: flex; align-items: center; gap: 0.6rem;
      background: var(--card-bg); border-radius: 12px; padding: 0.75rem 1rem;
      box-shadow: var(--card-shadow); margin-bottom: 1.5rem; flex-wrap: wrap;
    }
    .scaler__label { font-size: 0.88rem; font-weight: 700; color: var(--text-secondary); white-space: nowrap; }
    .scaler__btn {
      width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border);
      background: var(--card-bg); color: var(--text-primary); font-size: 1.1rem;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; font-weight: 700; flex-shrink: 0;
    }
    .scaler__btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
    .scaler__btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .scaler__slider-wrap { flex: 1; min-width: 100px; }
    .scaler__slider {
      width: 100%; accent-color: var(--primary); cursor: pointer; height: 4px;
    }
    .scaler__value {
      font-size: 1.2rem; font-weight: 900; color: var(--primary);
      min-width: 2ch; text-align: center;
    }
    .scaler__reset {
      background: var(--hover-bg); border: 1.5px solid var(--border); border-radius: 20px;
      padding: 0.2rem 0.65rem; font-size: 0.78rem; font-weight: 600;
      color: var(--text-secondary); cursor: pointer; transition: all 0.15s; font-family: inherit;
    }
    .scaler__reset:hover { border-color: var(--primary); color: var(--primary); }
    .amount--changed { color: #f59e0b !important; }
    .tags-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .tag { background: var(--tag-bg); color: var(--tag-color); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
    .mode-toggle { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; background: var(--card-bg); border-radius: 12px; padding: 0.25rem; width: fit-content; }
    .mode-btn { padding: 0.5rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; background: none; color: var(--text-secondary); transition: all 0.2s; }
    .mode-btn.active { background: var(--primary); color: white; font-weight: 600; }
    .detail-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; margin-bottom: 2rem; }
    @media (max-width: 640px) { .detail-grid { grid-template-columns: 1fr; } }
    h2 { font-size: 1.2rem; font-weight: 700; margin: 0 0 1rem; color: var(--text-primary); }
    .ingredients-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .ingredient-item {
      display: flex; gap: 0.75rem; align-items: center;
      padding: 0.6rem 0.75rem; border-radius: 8px;
      background: var(--card-bg); border: 1px solid var(--border);
      transition: all 0.2s;
    }
    .ingredient-item.highlighted { background: var(--primary-light); border-color: var(--primary); }
    .ingredient-amount { font-weight: 700; color: var(--primary); min-width: 60px; font-size: 0.9rem; }
    .ingredient-name { color: var(--text-primary); font-size: 0.9rem; }
    .instructions-text { line-height: 1.8; color: var(--text-primary); white-space: pre-line; }
    .steps-container { display: flex; flex-direction: column; gap: 0.75rem; }
    .step {
      display: flex; gap: 1rem; align-items: flex-start;
      padding: 1rem; border-radius: 12px; border: 2px solid var(--border);
      cursor: pointer; transition: all 0.2s;
    }
    .step--active { border-color: var(--primary); background: var(--primary-light); }
    .step__number {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--primary); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.9rem; flex-shrink: 0;
    }
    .step__body { display: flex; flex-direction: column; gap: 0.6rem; flex: 1; min-width: 0; }
    .step__text { color: var(--text-primary); line-height: 1.6; }
    .step-nav { display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; color: var(--text-secondary); }
    .detail-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .btn-fav, .btn-secondary, .btn-danger, .btn-primary {
      padding: 0.75rem 1.25rem; border-radius: 10px; border: none;
      cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.2s;
      text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;
    }
    .btn-fav { background: var(--card-bg); border: 2px solid var(--border); color: var(--text-primary); }
    .btn-fav.active { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
    .btn-secondary { background: var(--card-bg); border: 2px solid var(--border); color: var(--text-primary); }
    .btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
    .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-danger { background: #fee2e2; color: #dc2626; border: 2px solid #fca5a5; }
    .btn-danger:hover { background: #dc2626; color: white; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-share {
      padding: 0.75rem 1.25rem; border-radius: 10px; border: none;
      cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.2s;
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: linear-gradient(135deg, #4f46e5, #818cf8); color: white;
    }
    .btn-share:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-qr {
      padding: 0.75rem 1.25rem; border-radius: 10px; border: 2px solid var(--border);
      cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.2s;
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: var(--card-bg); color: var(--text-primary);
    }
    .btn-qr:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
    .btn-pdf {
      padding: 0.75rem 1.25rem; border-radius: 10px; border: 2px solid var(--border);
      cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.2s;
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: var(--card-bg); color: var(--text-primary);
    }
    .btn-pdf:hover:not(:disabled) { border-color: #ef4444; color: #ef4444; background: #fee2e2; }
    .btn-pdf:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner-sm {
      width: 14px; height: 14px; border: 2px solid var(--border);
      border-top-color: var(--primary); border-radius: 50%;
      animation: spin 0.8s linear infinite; flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .not-found { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }
    .not-found h2 { color: var(--text-primary); margin: 1rem 0; }
  `],
})
export class RecipeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recipeService = inject(RecipeService);
  private readonly toastService = inject(ToastService);
  private readonly recentlyViewed = inject(RecentlyViewedService);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recentlyViewed.add(id);
      const recipe = this.recipeService.getById(id);
      if (recipe) this.currentServings.set(recipe.servings);
    }
  }

  readonly categoryLabels = CATEGORY_LABELS;
  readonly stepMode = signal(false);
  readonly currentStep = signal(0);
  readonly currentServings = signal(1);

  readonly recipe = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.recipeService.getById(id) : undefined;
  });

  readonly maxServings = computed(() => Math.max(20, (this.recipe()?.servings ?? 4) * 4));

  readonly scaledIngredients = computed(() => {
    const r = this.recipe();
    if (!r) return [];
    const ratio = this.currentServings() / r.servings;
    return r.ingredients.map(ing => ({
      ...ing,
      scaledAmount: this.scaleAmount(ing.amount, ratio),
    }));
  });

  readonly steps = computed(() =>
    this.recipe()?.instructions.split('\n').filter(s => s.trim()) ?? []
  );

  readonly formattedInstructions = computed(() =>
    this.recipe()?.instructions.replace(/\n/g, '<br>') ?? ''
  );

  // מחשב כמות משוקללת - תומך במספרים, שברים (בסלש ובנקודה) וטקסט חופשי
  private scaleAmount(amount: string, ratio: number): string {
    const trimmed = amount.trim();
    if (!trimmed) return trimmed;

    // שבר עם קו נטוי או רווח - למשל 1/2, 3/4
    const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
      const val = parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]) * ratio;
      return this.formatNumber(val);
    }

    // מספר שלם ושבר - למשל 1 1/2
    const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
      const val = (parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3])) * ratio;
      return this.formatNumber(val);
    }

    // מספר רגיל (כולל עשרוני)
    const numMatch = trimmed.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (numMatch) {
      const val = parseFloat(numMatch[1]) * ratio;
      return this.formatNumber(val) + numMatch[2];
    }

    // טקסט חופשי (למשל "קמצוץ") - לא משנה
    return trimmed;
  }

  private formatNumber(n: number): string {
    if (n === 0) return '0';
    // שברים ניקיים
    const fractions: [number, string][] = [[0.25,'¼'],[0.5,'½'],[0.75,'¾'],[0.33,'⅓'],[0.67,'⅔']];
    const whole = Math.floor(n);
    const decimal = n - whole;
    const frac = fractions.find(([v]) => Math.abs(decimal - v) < 0.08);
    if (frac) return whole > 0 ? `${whole}${frac[1]}` : frac[1];
    // עיגול לספרתיים
    if (n < 10) return parseFloat(n.toFixed(1)).toString();
    return Math.round(n).toString();
  }

  increaseServings(): void { this.currentServings.update(s => Math.min(s + 1, this.maxServings())); }
  decreaseServings(): void { this.currentServings.update(s => Math.max(1, s - 1)); }

  toggleFavorite(): void {
    const r = this.recipe();
    if (!r) return;
    this.recipeService.toggleFavorite(r.id);
    this.toastService.success(r.isFavorite ? 'הוסר מהמועדפים' : 'נוסף למועדפים ❤️');
  }

  deleteRecipe(): void {
    const r = this.recipe();
    if (!r) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'מחיקת מתכון', message: `למחוק את "${r.title}"?`, confirmText: 'מחק' },
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.recipeService.delete(r.id);
        this.toastService.success('המתכון נמחק');
        this.router.navigate(['/recipes']);
      }
    });
  }

  private readonly pdfService = inject(PdfExportService);
  readonly exportingPdf = signal(false);

  async exportPdf(): Promise<void> {
    const r = this.recipe();
    if (!r) return;
    this.exportingPdf.set(true);
    try {
      await this.pdfService.export(r);
      this.toastService.success('ה-PDF הורד בהצלחה 📄');
    } catch {
      this.toastService.error('שגיאה ביצוא ה-PDF');
    } finally {
      this.exportingPdf.set(false);
    }
  }

  showQr(): void {
    const r = this.recipe();
    if (!r) return;
    this.dialog.open(QrCodeDialogComponent, {
      data: { title: r.title, recipeId: r.id },
      maxWidth: '420px',
      width: '90vw',
    });
  }

  shareCard(): void {
    const r = this.recipe();
    if (!r) return;
    this.dialog.open(ShareCardDialogComponent, {
      data: r,
      maxWidth: '480px',
      width: '90vw',
      panelClass: 'share-dialog-panel',
    });
  }

  printRecipe(): void { window.print(); }

  prevStep(): void { this.currentStep.update(s => Math.max(0, s - 1)); }
  nextStep(): void { this.currentStep.update(s => Math.min(this.steps().length - 1, s + 1)); }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600';
  }
}
