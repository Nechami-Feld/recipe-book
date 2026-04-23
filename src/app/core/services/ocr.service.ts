import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Ingredient } from '../models/recipe.model';

export interface OcrResult {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string;
}

@Injectable({ providedIn: 'root' })
export class OcrService {
  private readonly DELAY_MS = 2000; // Simulate 2 second network latency for OCR processing

  /**
   * POST /api/ocr/extract - Extract recipe from image via HTTP
   * Simulates sending image to OCR API (AWS Textract, Google Vision, etc.)
   */
  extractFromImage(_file: File): Observable<OcrResult> {
    // Simulate HTTP POST request to OCR service
    // In production, this would be:
    // return this.http.post<OcrResult>('/api/ocr/extract', formData)
    
    const mockResult: OcrResult = {
      title: 'מתכון שחולץ מתמונה',
      description: 'מתכון שנסרק אוטומטית על ידי מערכת ה-OCR',
      ingredients: [
        { id: '1', name: 'קמח', amount: '2', unit: 'כוסות' },
        { id: '2', name: 'סוכר', amount: '1', unit: 'כוס' },
        { id: '3', name: 'ביצים', amount: '3', unit: 'יחידות' },
        { id: '4', name: 'חמאה', amount: '100', unit: 'גרם' },
      ],
      instructions: '1. ערבב את כל החומרים היבשים.\n2. הוסף ביצים וחמאה.\n3. אפה ב-180 מעלות למשך 30 דקות.',
    };
    
    return of(mockResult).pipe(delay(this.DELAY_MS));
  }
}
