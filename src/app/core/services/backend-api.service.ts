import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Recipe, RecipeCategory } from '../models/recipe.model';

/**
 * Mock Backend API Service
 * Simulates HTTP calls to a real database with realistic network delays
 */
@Injectable({ providedIn: 'root' })
export class BackendApiService {
  // Simulated database
  private db: Recipe[] = [];
  private readonly DELAY_MS = 1000; // Simulate 1 second network latency
  private readonly BASE_URL = 'api/recipes';

  constructor(private http: HttpClient) {
    this.initializeDatabase();
  }

  /**
   * Initialize database with mock recipes
   */
  private initializeDatabase(): void {
    this.db = [
      {
        id: '1',
        title: 'פסטה ברוטב עגבניות קלאסי',
        description: 'פסטה איטלקית מסורתית עם רוטב עגבניות טרי ובזיליקום',
        ingredients: [
          { id: '1', name: 'פסטה ספגטי', amount: '400', unit: 'גרם' },
          { id: '2', name: 'עגבניות מרוסקות', amount: '800', unit: 'גרם' },
          { id: '3', name: 'שום', amount: '4', unit: 'שיני' },
          { id: '4', name: 'שמן זית', amount: '3', unit: 'כפות' },
          { id: '5', name: 'בזיליקום טרי', amount: '1', unit: 'צרור' },
        ],
        instructions: `1. בשל את הפסטה במים מומלחים לפי הוראות האריזה.\n2. טגן שום בשמן זית על אש בינונית.\n3. הוסף עגבניות מרוסקות ובשל 20 דקות.\n4. ערבב פסטה עם הרוטב.\n5. קשט בבזיליקום טרי.`,
        category: 'dinner',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600',
        prepTime: 10,
        cookTime: 30,
        servings: 4,
        tags: ['איטלקי', 'צמחוני', 'קל'],
        isFavorite: false,
        reviews: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        title: 'עוגת שוקולד לחה',
        description: 'עוגת שוקולד עשירה ולחה שתמיס בפה',
        ingredients: [
          { id: '1', name: 'שוקולד מריר', amount: '200', unit: 'גרם' },
          { id: '2', name: 'חמאה', amount: '150', unit: 'גרם' },
          { id: '3', name: 'סוכר', amount: '200', unit: 'גרם' },
          { id: '4', name: 'ביצים', amount: '4', unit: 'יחידות' },
          { id: '5', name: 'קמח', amount: '100', unit: 'גרם' },
          { id: '6', name: 'אבקת קקאו', amount: '50', unit: 'גרם' },
        ],
        instructions: `1. חמם תנור ל-180 מעלות.\n2. המס שוקולד וחמאה בבן מארי.\n3. ערבב סוכר וביצים.\n4. הוסף שוקולד מומס.\n5. הוסף קמח וקקאו.\n6. אפה 35 דקות.`,
        category: 'dessert',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
        prepTime: 20,
        cookTime: 35,
        servings: 8,
        tags: ['שוקולד', 'עוגה', 'קינוח'],
        isFavorite: true,
        reviews: [],
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
      },
      {
        id: '3',
        title: 'סלט ירקות קיץ',
        description: 'סלט טרי וצבעוני עם ירקות עונתיים ורוטב לימון',
        ingredients: [
          { id: '1', name: 'עגבנייה', amount: '3', unit: 'יחידות' },
          { id: '2', name: 'מלפפון', amount: '2', unit: 'יחידות' },
          { id: '3', name: 'פלפל אדום', amount: '1', unit: 'יחידות' },
          { id: '4', name: 'בצל סגול', amount: '1', unit: 'יחידות' },
          { id: '5', name: 'שמן זית', amount: '3', unit: 'כפות' },
          { id: '6', name: 'לימון', amount: '1', unit: 'יחידות' },
        ],
        instructions: `1. חתוך את כל הירקות לקוביות.\n2. ערבב בקערה גדולה.\n3. הוסף שמן זית ומיץ לימון.\n4. תבל במלח ופלפל.\n5. הגש מיד.`,
        category: 'lunch',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
        prepTime: 15,
        cookTime: 0,
        servings: 4,
        tags: ['בריא', 'טבעוני', 'קל'],
        isFavorite: false,
        reviews: [],
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-05'),
      },
      {
        id: '4',
        title: 'שקשוקה ביתית',
        description: 'שקשוקה ישראלית קלאסית עם ביצים ברוטב עגבניות חריף',
        ingredients: [
          { id: '1', name: 'ביצים', amount: '4', unit: 'יחידות' },
          { id: '2', name: 'עגבניות', amount: '4', unit: 'יחידות' },
          { id: '3', name: 'פלפל אדום', amount: '2', unit: 'יחידות' },
          { id: '4', name: 'בצל', amount: '1', unit: 'יחידות' },
          { id: '5', name: 'שום', amount: '3', unit: 'שיני' },
          { id: '6', name: 'פפריקה חריפה', amount: '1', unit: 'כפית' },
        ],
        instructions: `1. טגן בצל ושום בשמן זית.\n2. הוסף פלפלים ועגבניות.\n3. בשל 15 דקות עד שהרוטב מסמיך.\n4. שבור ביצים לתוך הרוטב.\n5. כסה ובשל 5 דקות.`,
        category: 'breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600',
        prepTime: 10,
        cookTime: 25,
        servings: 2,
        tags: ['ישראלי', 'ביצים', 'ארוחת בוקר'],
        isFavorite: true,
        reviews: [],
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-20'),
      },
      {
        id: '5',
        title: 'לימונדה ביתית',
        description: 'לימונדה רעננה ומרעננת עם נענע טרייה',
        ingredients: [
          { id: '1', name: 'לימונים', amount: '6', unit: 'יחידות' },
          { id: '2', name: 'סוכר', amount: '150', unit: 'גרם' },
          { id: '3', name: 'מים', amount: '1', unit: 'ליטר' },
          { id: '4', name: 'נענע טרייה', amount: '1', unit: 'צרור' },
          { id: '5', name: 'קרח', amount: '2', unit: 'כוסות' },
        ],
        instructions: `1. סחט לימונים.\n2. הכן סירופ סוכר עם מים חמים.\n3. ערבב מיץ לימון עם סירופ.\n4. הוסף מים קרים.\n5. הגש עם קרח ונענע.`,
        category: 'drink',
        imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600',
        prepTime: 10,
        cookTime: 5,
        servings: 6,
        tags: ['קיץ', 'קר', 'רענן'],
        isFavorite: false,
        reviews: [],
        createdAt: new Date('2024-04-01'),
        updatedAt: new Date('2024-04-01'),
      },
      {
        id: '6',
        title: 'חומוס ביתי',
        description: 'חומוס קרמי וחלק עם טחינה ושמן זית',
        ingredients: [
          { id: '1', name: 'חומוס מבושל', amount: '400', unit: 'גרם' },
          { id: '2', name: 'טחינה גולמית', amount: '100', unit: 'גרם' },
          { id: '3', name: 'לימון', amount: '2', unit: 'יחידות' },
          { id: '4', name: 'שום', amount: '2', unit: 'שיני' },
          { id: '5', name: 'שמן זית', amount: '3', unit: 'כפות' },
          { id: '6', name: 'כמון', amount: '1', unit: 'כפית' },
        ],
        instructions: `1. שים חומוס, טחינה, לימון ושום בבלנדר.\n2. טחן עד לקבלת מרקם חלק.\n3. הוסף מים לפי הצורך.\n4. תבל במלח וכמון.\n5. הגש עם שמן זית ופלפל.`,
        category: 'snack',
        imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600',
        prepTime: 15,
        cookTime: 0,
        servings: 6,
        tags: ['ישראלי', 'טבעוני', 'בריא'],
        isFavorite: false,
        reviews: [],
        createdAt: new Date('2024-04-15'),
        updatedAt: new Date('2024-04-15'),
      },
    ];
  }

  /**
   * GET /api/recipes - Fetch all recipes
   */
  getAllRecipes(): Observable<Recipe[]> {
    return of([...this.db]).pipe(delay(this.DELAY_MS));
  }

  /**
   * GET /api/recipes/:id - Fetch single recipe
   */
  getRecipeById(id: string): Observable<Recipe> {
    const recipe = this.db.find(r => r.id === id);
    if (!recipe) {
      return throwError(() => new Error(`Recipe with ID ${id} not found`));
    }
    return of({ ...recipe }).pipe(delay(this.DELAY_MS));
  }

  /**
   * POST /api/recipes - Create new recipe
   */
  createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Observable<Recipe> {
    const newRecipe: Recipe = {
      ...recipe,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.db.push(newRecipe);
    return of({ ...newRecipe }).pipe(delay(this.DELAY_MS));
  }

  /**
   * PUT /api/recipes/:id - Update recipe
   */
  updateRecipe(id: string, updates: Partial<Omit<Recipe, 'id' | 'createdAt'>>): Observable<Recipe> {
    const index = this.db.findIndex(r => r.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Recipe with ID ${id} not found`));
    }
    this.db[index] = {
      ...this.db[index],
      ...updates,
      updatedAt: new Date(),
    };
    return of({ ...this.db[index] }).pipe(delay(this.DELAY_MS));
  }

  /**
   * DELETE /api/recipes/:id - Delete recipe
   */
  deleteRecipe(id: string): Observable<{ success: boolean; id: string }> {
    const index = this.db.findIndex(r => r.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Recipe with ID ${id} not found`));
    }
    this.db.splice(index, 1);
    return of({ success: true, id }).pipe(delay(this.DELAY_MS));
  }

  /**
   * PATCH /api/recipes/:id/favorite - Toggle favorite status
   */
  toggleFavorite(id: string): Observable<Recipe> {
    const recipe = this.db.find(r => r.id === id);
    if (!recipe) {
      return throwError(() => new Error(`Recipe with ID ${id} not found`));
    }
    recipe.isFavorite = !recipe.isFavorite;
    recipe.updatedAt = new Date();
    return of({ ...recipe }).pipe(delay(this.DELAY_MS));
  }

  /**
   * POST /api/recipes/:id/reviews - Add review to recipe
   */
  addReview(
    id: string,
    review: Omit<{ id: string; author: string; rating: number; comment: string; createdAt: Date }, 'id' | 'createdAt'>
  ): Observable<Recipe> {
    const recipe = this.db.find(r => r.id === id);
    if (!recipe) {
      return throwError(() => new Error(`Recipe with ID ${id} not found`));
    }
    const newReview = {
      id: this.generateId(),
      ...review,
      createdAt: new Date(),
    };
    recipe.reviews.push(newReview);
    recipe.updatedAt = new Date();
    return of({ ...recipe }).pipe(delay(this.DELAY_MS));
  }

  /**
   * GET /api/recipes/search?q=query - Search recipes
   */
  searchRecipes(query: string): Observable<Recipe[]> {
    const searchLower = query.toLowerCase();
    const results = this.db.filter(r =>
      r.title.toLowerCase().includes(searchLower) ||
      r.description.toLowerCase().includes(searchLower) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(searchLower)) ||
      r.tags.some(t => t.toLowerCase().includes(searchLower))
    );
    return of(results).pipe(delay(this.DELAY_MS));
  }

  /**
   * GET /api/recipes/category/:category - Get recipes by category
   */
  getRecipesByCategory(category: RecipeCategory): Observable<Recipe[]> {
    const results = this.db.filter(r => r.category === category);
    return of(results).pipe(delay(this.DELAY_MS));
  }

  /**
   * GET /api/recipes/favorites - Get all favorite recipes
   */
  getFavoriteRecipes(): Observable<Recipe[]> {
    const results = this.db.filter(r => r.isFavorite);
    return of(results).pipe(delay(this.DELAY_MS));
  }

  /**
   * Private helper to generate unique IDs
   */
  private generateId(): string {
    return Math.random().toString(36).slice(2, 11);
  }
}
