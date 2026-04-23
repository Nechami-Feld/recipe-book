import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe, RecipeCategory } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class BackendApiService {
  private readonly BASE_URL = 'https://localhost:7253/api/recipes';

  constructor(private http: HttpClient) {}

  getAllRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.BASE_URL);
  }

  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.BASE_URL}/${id}`);
  }

  createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Observable<Recipe> {
    return this.http.post<Recipe>(this.BASE_URL, recipe);
  }

  updateRecipe(id: string, updates: Partial<Omit<Recipe, 'id' | 'createdAt'>>): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.BASE_URL}/${id}`, updates);
  }

  deleteRecipe(id: string): Observable<{ success: boolean; id: string }> {
    return this.http.delete<{ success: boolean; id: string }>(`${this.BASE_URL}/${id}`);
  }

  toggleFavorite(id: string): Observable<Recipe> {
    return this.http.patch<Recipe>(`${this.BASE_URL}/${id}/favorite`, {});
  }

  addReview(
    id: string,
    review: Omit<{ id: string; author: string; rating: number; comment: string; createdAt: Date }, 'id' | 'createdAt'>
  ): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.BASE_URL}/${id}/reviews`, review);
  }

  searchRecipes(query: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.BASE_URL}/search`, { params: { q: query } });
  }

  getRecipesByCategory(category: RecipeCategory): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.BASE_URL}/category/${category}`);
  }

  getFavoriteRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.BASE_URL}/favorites`);
  }
}
