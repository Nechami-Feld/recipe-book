import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { RecipeService } from '../../core/services/recipe.service';
import { ToastService } from '../../core/services/toast.service';
import { OcrService } from '../../core/services/ocr.service';
import { CATEGORY_LABELS, RecipeCategory } from '../../core/models/recipe.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DragDropModule],
  template: `
    <div class="form-page">
      <div class="form-header">
        <button class="back-btn" [routerLink]="['/recipes']">← חזרה</button>
        <h1>{{ isEdit() ? '✏️ עריכת מתכון' : '➕ מתכון חדש' }}</h1>
      </div>

      <!-- OCR Upload -->
      @if (!isEdit()) {
        <div class="ocr-section">
          <label class="ocr-label">
            <span class="ocr-icon">📷</span>
            <span>סרוק מתכון מתמונה (OCR)</span>
            <input type="file" accept="image/*" (change)="onOcrUpload($event)" hidden />
          </label>
          @if (ocrLoading()) {
            <div class="ocr-loading">
              <div class="spinner"></div>
              <span>מחלץ מתכון מהתמונה...</span>
            </div>
          }
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="recipe-form">
        <!-- Basic Info -->
        <div class="form-section">
          <h2>📋 פרטים בסיסיים</h2>
          <div class="form-grid">
            <div class="field field--full">
              <label>כותרת המתכון *</label>
              <input formControlName="title" placeholder="שם המתכון" class="input" />
              @if (form.get('title')?.invalid && form.get('title')?.touched) {
                <span class="error">שדה חובה</span>
              }
            </div>
            <div class="field field--full">
              <label>תיאור</label>
              <textarea formControlName="description" placeholder="תיאור קצר של המתכון" class="input textarea" rows="2"></textarea>
            </div>
            <div class="field">
              <label>קטגוריה *</label>
              <select formControlName="category" class="input">
                @for (cat of categories; track cat.value) {
                  <option [value]="cat.value">{{ cat.label }}</option>
                }
              </select>
            </div>
            <div class="field">
              <label>מנות</label>
              <input formControlName="servings" type="number" min="1" class="input" />
            </div>
            <div class="field">
              <label>זמן הכנה (דקות)</label>
              <input formControlName="prepTime" type="number" min="0" class="input" />
            </div>
            <div class="field">
              <label>זמן בישול (דקות)</label>
              <input formControlName="cookTime" type="number" min="0" class="input" />
            </div>
          </div>
        </div>

        <!-- Image -->
        <div class="form-section">
          <h2>🖼️ תמונה</h2>
          <div class="image-upload-area">
            @if (imagePreview()) {
              <div class="image-preview-wrap">
                <img [src]="imagePreview()" alt="תצוגה מקדימה" class="image-preview" />
                <button type="button" class="remove-image" (click)="removeImage()">✕</button>
              </div>
            } @else {
              <label class="image-upload-label">
                <span class="upload-icon">📸</span>
                <span>לחץ להעלאת תמונה</span>
                <span class="upload-hint">או הכנס URL</span>
                <input type="file" accept="image/*" (change)="onImageUpload($event)" hidden />
              </label>
            }
          </div>
          <input formControlName="imageUrl" placeholder="או הכנס URL של תמונה" class="input" style="margin-top: 0.75rem" />
        </div>

        <!-- Ingredients -->
        <div class="form-section">
          <div class="section-header">
            <h2>🥘 רכיבים</h2>
            <button type="button" class="btn-add" (click)="addIngredient()">+ הוסף רכיב</button>
          </div>
          <div cdkDropList (cdkDropListDropped)="dropIngredient($event)" class="ingredients-list">
            @for (ing of ingredientsArray.controls; track $index; let i = $index) {
              <div class="ingredient-row" cdkDrag [formGroup]="getIngredientGroup(i)">
                <span class="drag-handle" cdkDragHandle>⠿</span>
                <input formControlName="name" placeholder="שם הרכיב" class="input input--sm" />
                <input formControlName="amount" placeholder="כמות" class="input input--xs" />
                <input formControlName="unit" placeholder="יחידה" class="input input--xs" />
                <button type="button" class="btn-remove" (click)="removeIngredient(i)">✕</button>
              </div>
            }
          </div>
          @if (ingredientsArray.length === 0) {
            <p class="empty-hint">לחץ "הוסף רכיב" להתחלה</p>
          }
        </div>

        <!-- Instructions -->
        <div class="form-section">
          <h2>📝 הוראות הכנה</h2>
          <textarea
            formControlName="instructions"
            placeholder="כתוב את הוראות ההכנה שלב אחר שלב...&#10;1. שלב ראשון&#10;2. שלב שני"
            class="input textarea"
            rows="8"
          ></textarea>
        </div>

        <!-- Tags -->
        <div class="form-section">
          <h2>🏷️ תגיות</h2>
          <input
            [value]="tagsInput()"
            (input)="tagsInput.set($any($event.target).value)"
            placeholder="הפרד תגיות בפסיק: איטלקי, צמחוני, קל"
            class="input"
          />
          <div class="tags-preview">
            @for (tag of parsedTags(); track tag) {
              <span class="tag">{{ tag }}</span>
            }
          </div>
        </div>

        <!-- Submit -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" [routerLink]="['/recipes']">ביטול</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
            @if (saving()) { <span class="spinner-sm"></span> }
            {{ isEdit() ? 'שמור שינויים' : 'הוסף מתכון' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-page { max-width: 800px; margin: 0 auto; padding: 1.5rem 1rem; }
    .form-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .form-header h1 { font-size: 1.6rem; font-weight: 800; margin: 0; color: var(--text-primary); }
    .back-btn { background: var(--card-bg); border: 2px solid var(--border); border-radius: 8px; padding: 0.5rem 1rem; cursor: pointer; font-weight: 600; color: var(--text-primary); transition: all 0.2s; }
    .back-btn:hover { border-color: var(--primary); color: var(--primary); }
    .ocr-section { margin-bottom: 1.5rem; }
    .ocr-label {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1rem 1.5rem; border: 2px dashed var(--primary);
      border-radius: 12px; cursor: pointer; color: var(--primary);
      font-weight: 600; transition: background 0.2s;
    }
    .ocr-label:hover { background: var(--primary-light); }
    .ocr-icon { font-size: 1.5rem; }
    .ocr-loading { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.75rem; color: var(--text-secondary); }
    .recipe-form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-section { background: var(--card-bg); border-radius: 16px; padding: 1.5rem; box-shadow: var(--card-shadow); }
    .form-section h2 { font-size: 1.1rem; font-weight: 700; margin: 0 0 1rem; color: var(--text-primary); }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .section-header h2 { margin: 0; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field--full { grid-column: 1 / -1; }
    label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
    .input {
      padding: 0.75rem 1rem; border: 2px solid var(--border); border-radius: 10px;
      font-size: 0.95rem; background: var(--input-bg); color: var(--text-primary);
      transition: border-color 0.2s; direction: rtl; width: 100%; box-sizing: border-box;
    }
    .input:focus { outline: none; border-color: var(--primary); }
    .input--sm { flex: 2; min-width: 0; }
    .input--xs { flex: 1; min-width: 0; }
    .textarea { resize: vertical; font-family: inherit; }
    select.input { cursor: pointer; }
    .error { color: #ef4444; font-size: 0.78rem; }
    .image-upload-area { border: 2px dashed var(--border); border-radius: 12px; overflow: hidden; }
    .image-upload-label {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 2.5rem; cursor: pointer; gap: 0.5rem; color: var(--text-secondary);
      transition: background 0.2s;
    }
    .image-upload-label:hover { background: var(--hover-bg); }
    .upload-icon { font-size: 2.5rem; }
    .upload-hint { font-size: 0.8rem; }
    .image-preview-wrap { position: relative; }
    .image-preview { width: 100%; height: 220px; object-fit: cover; display: block; }
    .remove-image {
      position: absolute; top: 0.5rem; left: 0.5rem;
      background: rgba(0,0,0,0.6); color: white; border: none;
      border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 0.8rem;
    }
    .ingredients-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .ingredient-row {
      display: flex; gap: 0.5rem; align-items: center;
      background: var(--input-bg); border-radius: 10px; padding: 0.5rem;
      border: 1px solid var(--border);
    }
    .drag-handle { cursor: grab; color: var(--text-secondary); font-size: 1.2rem; padding: 0 0.25rem; }
    .drag-handle:active { cursor: grabbing; }
    .btn-remove { background: none; border: none; cursor: pointer; color: #ef4444; font-size: 1rem; padding: 0.25rem 0.5rem; border-radius: 6px; }
    .btn-remove:hover { background: #fee2e2; }
    .btn-add { background: var(--primary); color: white; border: none; border-radius: 8px; padding: 0.5rem 1rem; cursor: pointer; font-size: 0.85rem; font-weight: 600; }
    .empty-hint { color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 1rem; }
    .tags-preview { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.75rem; }
    .tag { background: var(--tag-bg); color: var(--tag-color); padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
    .btn-primary, .btn-secondary {
      padding: 0.875rem 2rem; border-radius: 10px; border: none;
      cursor: pointer; font-size: 1rem; font-weight: 600; transition: all 0.2s;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover:not(:disabled) { background: var(--primary-dark); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background: var(--card-bg); border: 2px solid var(--border); color: var(--text-primary); text-decoration: none; }
    .spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .cdk-drag-preview { box-shadow: 0 8px 24px rgba(0,0,0,0.2); border-radius: 10px; opacity: 0.9; }
    .cdk-drag-placeholder { opacity: 0.3; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
  `],
})
export class RecipeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recipeService = inject(RecipeService);
  private readonly toastService = inject(ToastService);
  private readonly ocrService = inject(OcrService);

  readonly saving = signal(false);
  readonly ocrLoading = signal(false);
  readonly imagePreview = signal<string | null>(null);
  readonly tagsInput = signal('');
  readonly parsedTags = computed(() =>
    this.tagsInput().split(',').map(t => t.trim()).filter(Boolean)
  );

  readonly isEdit = computed(() => !!this.route.snapshot.paramMap.get('id'));

  readonly categories = (Object.entries(CATEGORY_LABELS) as [RecipeCategory, string][]).map(
    ([value, label]) => ({ value, label })
  );

  readonly form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    category: ['dinner' as RecipeCategory, Validators.required],
    servings: [4, [Validators.required, Validators.min(1)]],
    prepTime: [15, Validators.min(0)],
    cookTime: [30, Validators.min(0)],
    imageUrl: [''],
    instructions: [''],
    ingredients: this.fb.array([]),
  });

  get ingredientsArray() { return this.form.get('ingredients') as FormArray; }

  getIngredientGroup(i: number) {
    return this.ingredientsArray.at(i) as ReturnType<typeof this.fb.group>;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const recipe = this.recipeService.getById(id);
      if (recipe) {
        this.form.patchValue({
          title: recipe.title,
          description: recipe.description,
          category: recipe.category,
          servings: recipe.servings,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          imageUrl: recipe.imageUrl,
          instructions: recipe.instructions,
        });
        recipe.ingredients.forEach(ing => this.addIngredient(ing.name, ing.amount, ing.unit));
        this.tagsInput.set(recipe.tags.join(', '));
        if (recipe.imageUrl) this.imagePreview.set(recipe.imageUrl);
      }
    } else {
      this.addIngredient();
    }
  }

  addIngredient(name = '', amount = '', unit = ''): void {
    this.ingredientsArray.push(this.fb.group({ name: [name], amount: [amount], unit: [unit] }));
  }

  removeIngredient(i: number): void { this.ingredientsArray.removeAt(i); }

  dropIngredient(event: CdkDragDrop<unknown[]>): void {
    const arr = this.ingredientsArray.controls;
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.ingredientsArray.setValue(arr.map(c => c.value));
  }

  onImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      this.imagePreview.set(url);
      this.form.patchValue({ imageUrl: url });
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.form.patchValue({ imageUrl: '' });
  }

  onOcrUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.ocrLoading.set(true);
    this.ocrService.extractFromImage(file).subscribe({
      next: result => {
        this.form.patchValue({
          title: result.title,
          description: result.description,
          instructions: result.instructions,
        });
        this.ingredientsArray.clear();
        result.ingredients.forEach(ing => this.addIngredient(ing.name, ing.amount, ing.unit));
        this.ocrLoading.set(false);
        this.toastService.success('המתכון חולץ בהצלחה מהתמונה! 🎉');
      },
      error: () => {
        this.ocrLoading.set(false);
        this.toastService.error('שגיאה בחילוץ המתכון');
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const v = this.form.value;
    const data = {
      title: v.title!,
      description: v.description ?? '',
      category: v.category as RecipeCategory,
      servings: v.servings ?? 4,
      prepTime: v.prepTime ?? 0,
      cookTime: v.cookTime ?? 0,
      imageUrl: v.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600',
      instructions: v.instructions ?? '',
      ingredients: (v.ingredients as { name: string; amount: string; unit: string }[]).map((ing, i) => ({
        id: this.recipeService.generateIngredientId(),
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
      })),
      tags: this.parsedTags(),
    };

    const id = this.route.snapshot.paramMap.get('id');
    setTimeout(() => {
      if (id) {
        this.recipeService.update(id, data);
        this.toastService.success('המתכון עודכן בהצלחה ✅');
        this.router.navigate(['/recipes', id]);
      } else {
        const recipe = this.recipeService.add(data);
        this.toastService.success('המתכון נוסף בהצלחה 🎉');
        this.router.navigate(['/recipes', recipe.id]);
      }
      this.saving.set(false);
    }, 500);
  }
}
