import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recipe, RecipeCategory, ApiRecipe, ApiPagedResponse } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class BackendApiService {
  private readonly BASE_URL = 'https://localhost:7253/api/recipes';

  constructor(private http: HttpClient) {}

  private mapApiRecipe(api: ApiRecipe): Recipe {
    return {
      id: api.id,
      title: api.title,
      description: api.description,
      instructions: api.instructions,
      isFavorite: api.isFavorite,
      category: (api.category?.toLowerCase() as RecipeCategory) ?? 'other',
      createdAt: new Date(api.createdAt),
      updatedAt: new Date(api.createdAt),
      imageUrl: '',
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      tags: [],
      reviews: [],
      ingredients: api.ingredients.map(ing => ({
        id: ing.id,
        name: ing.name,
        amount: ing.quantity,
        unit: '',
      })),
    };
  }

  getAllRecipes(): Observable<Recipe[]> {
    return this.http.get<ApiPagedResponse<ApiRecipe>>(this.BASE_URL).pipe(
      map(res => res.items.map(r => this.mapApiRecipe(r)))
    );
  }

  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<ApiRecipe>(`${this.BASE_URL}/${id}`).pipe(
      map(r => this.mapApiRecipe(r))
    );
  }

  createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Observable<Recipe> {
    return this.http.post<ApiRecipe>(this.BASE_URL, {
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions,
      isFavorite: recipe.isFavorite,
      category: recipe.category,
      ingredients: recipe.ingredients.map(ing => ({
        name: ing.name,
        quantity: ing.amount,
      })),
    }).pipe(map(r => this.mapApiRecipe(r)));
  }

  updateRecipe(id: string, updates: Partial<Omit<Recipe, 'id' | 'createdAt'>>): Observable<Recipe> {
    return this.http.put<ApiRecipe>(`${this.BASE_URL}/${id}`, {
      title: updates.title,
      description: updates.description,
      instructions: updates.instructions,
      isFavorite: updates.isFavorite,
      category: updates.category,
      ingredients: updates.ingredients?.map(ing => ({
        name: ing.name,
        quantity: ing.amount,
      })),
    }).pipe(map(r => this.mapApiRecipe(r)));
  }

  deleteRecipe(id: string): Observable<{ success: boolean; id: string }> {
    return this.http.delete<{ success: boolean; id: string }>(`${this.BASE_URL}/${id}`);
  }

  toggleFavorite(id: string): Observable<Recipe> {
    return this.http.patch<ApiRecipe>(`${this.BASE_URL}/${id}/favorite`, {}).pipe(
      map(r => this.mapApiRecipe(r))
    );
  }

  addReview(
    id: string,
    review: Omit<{ id: string; author: string; rating: number; comment: string; createdAt: Date }, 'id' | 'createdAt'>
  ): Observable<Recipe> {
    return this.http.post<ApiRecipe>(`${this.BASE_URL}/${id}/reviews`, review).pipe(
      map(r => this.mapApiRecipe(r))
    );
  }

  searchRecipes(query: string): Observable<Recipe[]> {
    return this.http.get<ApiPagedResponse<ApiRecipe>>(`${this.BASE_URL}/search`, { params: { q: query } }).pipe(
      map(res => res.items.map(r => this.mapApiRecipe(r)))
    );
  }

  getRecipesByCategory(category: RecipeCategory): Observable<Recipe[]> {
    return this.http.get<ApiPagedResponse<ApiRecipe>>(`${this.BASE_URL}/category/${category}`).pipe(
      map(res => res.items.map(r => this.mapApiRecipe(r)))
    );
  }

  getFavoriteRecipes(): Observable<Recipe[]> {
    return this.http.get<ApiPagedResponse<ApiRecipe>>(`${this.BASE_URL}/favorites`).pipe(
      map(res => res.items.map(r => this.mapApiRecipe(r)))
    );
  }
}
