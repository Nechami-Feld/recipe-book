import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Recipe, CATEGORY_LABELS } from '../models/recipe.model';

// צבעים
const C = {
  primary:   [79,  70,  229] as [number,number,number],
  dark:      [15,  23,  42]  as [number,number,number],
  gray:      [100, 116, 139] as [number,number,number],
  lightGray: [241, 245, 249] as [number,number,number],
  border:    [226, 232, 240] as [number,number,number],
  white:     [255, 255, 255] as [number,number,number],
  green:     [34,  197, 94]  as [number,number,number],
  amber:     [245, 158, 11]  as [number,number,number],
};

@Injectable({ providedIn: 'root' })
export class PdfExportService {

  async export(recipe: Recipe): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297;
    const margin = 18;
    let y = 0;

    // ── Hero תמונה ──────────────────────────────────────────
    const img = await this.loadImage(recipe.imageUrl).catch(() => null);
    if (img) {
      doc.addImage(img, 'JPEG', 0, 0, W, 72);
    } else {
      doc.setFillColor(...C.lightGray);
      doc.rect(0, 0, W, 72, 'F');
    }

    // גרדיאנט כהה על התמונה (שכבות שקופות)
    for (let i = 0; i < 30; i++) {
      doc.setFillColor(15, 23, 42);
      doc.setGState(doc.GState({ opacity: i / 100 }));
      doc.rect(0, 42 + i * 1, W, 2, 'F');
    }
    doc.setGState(doc.GState({ opacity: 1 }));

    // תגית קטגוריה
    const catLabel = CATEGORY_LABELS[recipe.category];
    doc.setFillColor(...C.primary);
    doc.roundedRect(margin, 14, this.textWidth(doc, catLabel, 9) + 12, 9, 2, 2, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(catLabel, margin + 6, 20.5);

    // כותרת על התמונה
    y = 52;
    doc.setTextColor(...C.white);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(recipe.title, W - margin * 2);
    doc.text(titleLines, W - margin, y, { align: 'right' });
    y += titleLines.length * 9;

    // תיאור
    if (recipe.description) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 210, 230);
      const descLines = doc.splitTextToSize(recipe.description, W - margin * 2);
      doc.text(descLines.slice(0, 2), W - margin, y + 2, { align: 'right' });
    }

    y = 80;

    // ── Meta chips ──────────────────────────────────────────
    const metas = [
      { icon: '⏱', label: `${recipe.prepTime + recipe.cookTime} דקות` },
      { icon: '🍽', label: `${recipe.servings} מנות` },
      { icon: '🥗', label: `${recipe.ingredients.length} רכיבים` },
      { icon: '📂', label: CATEGORY_LABELS[recipe.category] },
    ];
    const chipW = (W - margin * 2 - 9) / 4;
    metas.forEach((m, i) => {
      const x = margin + i * (chipW + 3);
      doc.setFillColor(...C.lightGray);
      doc.roundedRect(x, y, chipW, 16, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C.dark);
      doc.text(m.label, x + chipW / 2, y + 10, { align: 'center' });
      doc.setFontSize(7);
      doc.setTextColor(...C.gray);
      doc.text(m.icon, x + chipW / 2, y + 5.5, { align: 'center' });
    });
    y += 24;

    // ── תגיות ──────────────────────────────────────────────
    if (recipe.tags.length > 0) {
      let tx = W - margin;
      recipe.tags.slice(0, 6).forEach(tag => {
        const tw = this.textWidth(doc, tag, 8) + 10;
        tx -= tw + 3;
        doc.setFillColor(...C.primary);
        doc.setGState(doc.GState({ opacity: 0.12 }));
        doc.roundedRect(tx, y, tw, 7, 2, 2, 'F');
        doc.setGState(doc.GState({ opacity: 1 }));
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.primary);
        doc.text(tag, tx + tw / 2, y + 5, { align: 'center' });
      });
      y += 13;
    }

    // קו מפריד
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.4);
    doc.line(margin, y, W - margin, y);
    y += 8;

    // ── גוף: שתי עמודות ────────────────────────────────────
    const colLeft = margin;
    const colRight = W / 2 + 4;
    const colW = W / 2 - margin - 4;

    // כותרת רכיבים
    y = this.sectionTitle(doc, '🥘 רכיבים', colLeft, y, colW);

    const ingStartY = y;
    recipe.ingredients.forEach((ing, i) => {
      if (y > H - 30) { doc.addPage(); y = margin; }
      // שורה מוצללת לסירוגין
      if (i % 2 === 0) {
        doc.setFillColor(...C.lightGray);
        doc.rect(colLeft, y - 3.5, colW, 7, 'F');
      }
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C.primary);
      doc.text(`${ing.amount} ${ing.unit}`, colLeft + colW, y + 0.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.dark);
      doc.text(ing.name, colLeft + colW - this.textWidth(doc, `${ing.amount} ${ing.unit}`, 9) - 4, y + 0.5, { align: 'right' });
      y += 7;
    });

    // כותרת הוראות (עמודה ימנית)
    let ry = ingStartY;
    ry = this.sectionTitle(doc, '📝 הוראות הכנה', colRight, ry, colW);

    const steps = recipe.instructions.split('\n').filter(s => s.trim());
    steps.forEach((step, i) => {
      if (ry > H - 30) { doc.addPage(); ry = margin; }
      // מספר שלב
      doc.setFillColor(...C.primary);
      doc.circle(colRight + 4, ry, 3.5, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C.white);
      doc.text(`${i + 1}`, colRight + 4, ry + 1, { align: 'center' });

      // טקסט שלב
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.dark);
      const clean = step.replace(/^\d+\.\s*/, '');
      const lines = doc.splitTextToSize(clean, colW - 10);
      doc.text(lines, colRight + colW, ry + 1, { align: 'right' });
      ry += lines.length * 5 + 4;
    });

    y = Math.max(y, ry) + 8;

    // ── Footer ──────────────────────────────────────────────
    if (y < H - 20) {
      doc.setDrawColor(...C.border);
      doc.line(margin, H - 18, W - margin, H - 18);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.gray);
      doc.text('🍳 חוברת מתכונים', W / 2, H - 11, { align: 'center' });
      doc.text(new Date().toLocaleDateString('he-IL'), W - margin, H - 11, { align: 'right' });
    }

    doc.save(`${recipe.title.replace(/\s+/g, '-')}.pdf`);
  }

  private sectionTitle(doc: jsPDF, title: string, x: number, y: number, w: number): number {
    doc.setFillColor(...C.primary);
    doc.rect(x, y - 1, 3, 8, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.dark);
    doc.text(title, x + w, y + 5, { align: 'right' });
    return y + 12;
  }

  private textWidth(doc: jsPDF, text: string, size: number): number {
    doc.setFontSize(size);
    return doc.getTextWidth(text);
  }

  private loadImage(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = src.includes('unsplash.com') ? src + '&auto=format' : src;
    });
  }
}
