import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

@Injectable({ providedIn: 'root' })
export class QrCodeService {

  async generateDataUrl(text: string, size = 300): Promise<string> {
    return QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
  }

  async generateStyledDataUrl(text: string, label: string): Promise<string> {
    const size = 400;
    const qrDataUrl = await this.generateDataUrl(text, size - 80);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size + 80;
    const ctx = canvas.getContext('2d')!;

    // רקע לבן עם פינות מעוגלות
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, 0, 0, size, size + 80, 20);
    ctx.fill();

    // QR
    const qrImg = await this.loadImage(qrDataUrl);
    ctx.drawImage(qrImg, 40, 40, size - 80, size - 80);

    // לוגו מרכזי
    const logoSize = 56;
    const lx = size / 2 - logoSize / 2;
    const ly = (size - 80) / 2 - logoSize / 2 + 40;
    ctx.fillStyle = '#4f46e5';
    this.roundRect(ctx, lx, ly, logoSize, logoSize, 12);
    ctx.fill();
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText('🍳', size / 2, ly + logoSize / 2);

    // כותרת תחתית
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(0, size - 40, size, 120);
    ctx.font = 'bold 22px "Heebo", Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // חיתוך שם ארוך
    const maxLabel = label.length > 28 ? label.slice(0, 26) + '...' : label;
    ctx.fillText(maxLabel, size / 2, size + 20);
    ctx.font = '16px "Heebo", Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('סרוק לצפייה במתכון', size / 2, size + 50);

    return canvas.toDataURL('image/png');
  }

  download(dataUrl: string, filename: string): void {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qr-${filename.replace(/\s+/g, '-')}.png`;
    a.click();
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
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
}
