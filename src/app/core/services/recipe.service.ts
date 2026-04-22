import { Injectable, signal, computed } from '@angular/core';
import { Recipe, RecipeCategory, Ingredient } from '../models/recipe.model';

const STORAGE_KEY = 'recipe-book-data';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

const MOCK_RECIPES: Recipe[] = [
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
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-04-15'),
  },
];

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly _recipes = signal<Recipe[]>(this.loadFromStorage());
  private readonly _searchQuery = signal('');
  private readonly _selectedCategory = signal<RecipeCategory | 'all'>('all');
  private readonly _loading = signal(false);

  readonly recipes = this._recipes.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly filteredRecipes = computed(() => {
    const query = this._searchQuery().toLowerCase();
    const category = this._selectedCategory();
    return this._recipes().filter(r => {
      const matchesSearch = !query ||
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(query)) ||
        r.tags.some(t => t.toLowerCase().includes(query));
      const matchesCategory = category === 'all' || r.category === category;
      return matchesSearch && matchesCategory;
    });
  });

  readonly favorites = computed(() => this._recipes().filter(r => r.isFavorite));

  setSearch(query: string): void {
    this._searchQuery.set(query);
  }

  setCategory(category: RecipeCategory | 'all'): void {
    this._selectedCategory.set(category);
  }

  getById(id: string): Recipe | undefined {
    return this._recipes().find(r => r.id === id);
  }

  add(data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>): Recipe {
    const recipe: Recipe = {
      ...data,
      id: generateId(),
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this._recipes.update(list => [...list, recipe]);
    this.saveToStorage();
    return recipe;
  }

  update(id: string, data: Partial<Omit<Recipe, 'id' | 'createdAt'>>): void {
    this._recipes.update(list =>
      list.map(r => r.id === id ? { ...r, ...data, updatedAt: new Date() } : r)
    );
    this.saveToStorage();
  }

  delete(id: string): void {
    this._recipes.update(list => list.filter(r => r.id !== id));
    this.saveToStorage();
  }

  toggleFavorite(id: string): void {
    this._recipes.update(list =>
      list.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r)
    );
    this.saveToStorage();
  }

  private loadFromStorage(): Recipe[] {
    try {
      if (typeof localStorage === 'undefined') return MOCK_RECIPES;
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return MOCK_RECIPES;
      const parsed = JSON.parse(data) as Recipe[];
      return parsed.map(r => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      }));
    } catch {
      return MOCK_RECIPES;
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._recipes()));
      }
    } catch { /* ignore */ }
  }

  generateIngredientId(): string {
    return generateId();
  }
}
