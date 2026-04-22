import { Injectable } from '@angular/core';
import { Recipe, CATEGORY_LABELS } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class ShareCardService {

  async generate(recipe: Recipe): Promise<string> {
    const W = 1080, H = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // טען תמונה
    const img = await this.loadImage(recipe.imageUrl).catch(() => null);

    // --- רקע ---
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // תמונת רקע מטושטשת
    if (img) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.filter = 'blur(24px)';
      ctx.drawImage(img, -40, -40, W + 80, H + 80);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // גרדיאנט כהה מלמטה
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(15,23,42,0.3)');
    grad.addColorStop(0.45, 'rgba(15,23,42,0.6)');
    grad.addColorStop(1, 'rgba(15,23,42,0.97)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // --- תמונה מרכזית עגולה ---
    if (img) {
      const cx = W / 2, cy = 390, r = 260;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      // כיסוי מרכזי
      const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);
      ctx.restore();

      // מסגרת עגולה
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // --- תגית קטגוריה ---
    const catLabel = CATEGORY_LABELS[recipe.category];
    this.drawPill(ctx, catLabel, W / 2, 90, '#4f46e5', 'white');

    // --- כותרת ---
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    this.drawWrappedText(ctx, recipe.title, W / 2, 690, W - 120, 72, 800, '#ffffff');

    // --- תיאור ---
    if (recipe.description) {
      this.drawWrappedText(ctx, recipe.description, W / 2, 790, W - 160, 32, 400, 'rgba(255,255,255,0.7)', 2);
    }

    // --- מטא-נתונים ---
    const metaY = 900;
    const metas = [
      { icon: '⏱', label: `${recipe.prepTime + recipe.cookTime} דק'` },
      { icon: '🍽', label: `${recipe.servings} מנות` },
      { icon: '🥗', label: `${recipe.ingredients.length} רכיבים` },
    ];
    const metaSpacing = 240;
    const startX = W / 2 - metaSpacing;
    metas.forEach((m, i) => {
      const x = startX + i * metaSpacing;
      this.drawMetaChip(ctx, m.icon, m.label, x, metaY);
    });

    // --- לוגו / watermark ---
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '500 26px "Heebo", Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🍳 חוברת מתכונים', W / 2, H - 48);

    // --- קו עליון דקורטיבי ---
    const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.3, '#4f46e5');
    lineGrad.addColorStop(0.7, '#818cf8');
    lineGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(0, 0, W, 5);

    return canvas.toDataURL('image/png');
  }

  private drawPill(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, bg: string, fg: string): void {
    ctx.font = 'bold 28px "Heebo", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(text).width;
    const pw = tw + 48, ph = 48, px = cx - pw / 2, py = cy - ph / 2;
    ctx.fillStyle = bg;
    this.roundRect(ctx, px, py, pw, ph, 24);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.fillText(text, cx, cy);
  }

  private drawMetaChip(ctx: CanvasRenderingContext2D, icon: string, label: string, cx: number, cy: number): void {
    const pw = 180, ph = 64;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this.roundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(icon, cx - 36, cy);

    ctx.font = 'bold 26px "Heebo", Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(label, cx + 20, cy);
  }

  private drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string, cx: number, y: number,
    maxWidth: number, fontSize: number, weight: number,
    color: string, maxLines = 3
  ): void {
    ctx.font = `${weight} ${fontSize}px "Heebo", Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
        if (lines.length >= maxLines) break;
      } else {
        current = test;
      }
    }
    if (current && lines.length < maxLines) lines.push(current);

    const lineH = fontSize * 1.3;
    lines.forEach((line, i) => ctx.fillText(line, cx, y + i * lineH));
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      // proxy לעקיפת CORS - מוסיף פרמטר כדי לאלץ CORS headers מ-Unsplash
      img.src = src.includes('unsplash.com') ? src + '&auto=format' : src;
    });
  }

  async download(recipe: Recipe): Promise<void> {
    const dataUrl = await this.generate(recipe);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${recipe.title.replace(/\s+/g, '-')}.png`;
    a.click();
  }

  async copyToClipboard(recipe: Recipe): Promise<void> {
    const dataUrl = await this.generate(recipe);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  }

  async share(recipe: Recipe): Promise<boolean> {
    if (!navigator.share) return false;
    const dataUrl = await this.generate(recipe);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `${recipe.title}.png`, { type: 'image/png' });
    await navigator.share({ title: recipe.title, text: recipe.description, files: [file] });
    return true;
  }
}
