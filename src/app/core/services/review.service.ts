import { Injectable, inject } from '@angular/core';
import { RecipeService } from './recipe.service';
import { Review } from '../models/recipe.model';

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly recipeService = inject(RecipeService);

  addReview(recipeId: string, author: string, rating: number, comment: string): Review {
    const recipe = this.recipeService.getById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const review: Review = {
      id: generateId(),
      author,
      rating: Math.max(1, Math.min(5, rating)),
      comment,
      createdAt: new Date(),
    };

    recipe.reviews.push(review);
    this.recipeService.update(recipeId, { reviews: [...recipe.reviews] });
    return review;
  }

  deleteReview(recipeId: string, reviewId: string): void {
    const recipe = this.recipeService.getById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const filtered = recipe.reviews.filter(r => r.id !== reviewId);
    this.recipeService.update(recipeId, { reviews: filtered });
  }

  getAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  getRatingDistribution(reviews: Review[]): Record<number, number> {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      dist[r.rating]++;
    });
    return dist;
  }
}
