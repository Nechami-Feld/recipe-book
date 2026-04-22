import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Ingredient, RecipeCategory } from '../models/recipe.model';

export interface UrlImportResult {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string;
  imageUrl: string;
  tags: string[];
  category: RecipeCategory;
  servings: number;
  prepTime: number;
  cookTime: number;
}

const MOCK_URL_RESULTS: Record<string, UrlImportResult> = {
  'tasty.co': {
    title: 'סלט עוף עם עגבניות שרי',
    description: 'סלט קייצי רענן עם עוף בגריל, עגבניות שרי ורוטב לימון.',
    ingredients: [
      { id: '1', name: 'חזה עוף', amount: '2', unit: 'יחידות' },
      { id: '2', name: 'עגבניות שרי', amount: '250', unit: 'גרם' },
      { id: '3', name: 'מלפפון', amount: '1', unit: 'יחידות' },
      { id: '4', name: 'בצל ירוק', amount: '2', unit: 'קישוט' },
      { id: '5', name: 'עלעלי בייבי ספינאצ׳', amount: '100', unit: 'גרם' },
    ],
    instructions: '1. גריל את חזה העוף לתוצאה זהובה.\n2. חתוך ירקות וערבב בקערה.\n3. חתוך את העוף ושילב בסלט.\n4. הוסף רוטב לימון ושמן זית.\n5. ערבב והגש קר.',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
    tags: ['בריא', 'קיץ', 'קל'],
    category: 'lunch',
    servings: 4,
    prepTime: 15,
    cookTime: 15,
  },
  'bbcgoodfood.com': {
    title: 'מרק עגבניות עם בזיליקום',
    description: 'מרק עגבניות קרמי ועשיר עם נגיעה של בזיליקום טרי.',
    ingredients: [
      { id: '1', name: 'עגבניות מרוסקות', amount: '800', unit: 'גרם' },
      { id: '2', name: 'בצל', amount: '1', unit: 'יחידות' },
      { id: '3', name: 'שום', amount: '3', unit: 'שיני' },
      { id: '4', name: 'ציר ירקות', amount: '500', unit: 'מ"ל' },
      { id: '5', name: 'בזיליקום טרי', amount: 'חופן', unit: '' },
    ],
    instructions: '1. טגן בצל ושום בשמן זית.\n2. הוסף עגבניות מרוסקות וציר ירקות.\n3. בשל 20 דקות.\n4. טחן למרקם חלק.\n5. ערבב בזיליקום והגש חם.',
    imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600',
    tags: ['מרק', 'עגבניות', 'נוחות'],
    category: 'dinner',
    servings: 4,
    prepTime: 10,
    cookTime: 25,
  },
};

@Injectable({ providedIn: 'root' })
export class UrlImportService {
  extractFromUrl(url: string): Observable<UrlImportResult> {
    try {
      const parsedUrl = new URL(url.trim());
      const host = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();
      const result = MOCK_URL_RESULTS[host];

      if (!result) {
        const fallback: UrlImportResult = {
          title: 'מתכון מיובא מקישור אינטרנט',
          description: 'מתכון שנמצא בקישור שסופק על ידי המשתמש.',
          ingredients: [
            { id: '1', name: 'קמח', amount: '2', unit: 'כוסות' },
            { id: '2', name: 'ביצים', amount: '3', unit: 'יחידות' },
            { id: '3', name: 'חלב', amount: '250', unit: 'מ"ל' },
            { id: '4', name: 'מלח', amount: '1', unit: 'כפית' },
          ],
          instructions: '1. ערבב את כל הרכיבים.\n2. אפה בתנור עד להזהבה.\n3. הגש חם.',
          imageUrl: 'https://images.unsplash.com/photo-1514516870921-06a0b8b0f6f8?w=600',
          tags: ['ייבוא', 'דגום'],
          category: 'other',
          servings: 4,
          prepTime: 10,
          cookTime: 30,
        };
        return of(fallback).pipe(delay(2200));
      }

      return of(result).pipe(delay(2200));
    } catch {
      return throwError(() => new Error('כתובת URL לא חוקית')); 
    }
  }
}
