import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'recipes', pathMatch: 'full' },
  {
    path: 'recipes',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/recipes/recipe-list.component').then(m => m.RecipeListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./features/recipes/recipe-form.component').then(m => m.RecipeFormComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./features/recipes/recipe-detail.component').then(m => m.RecipeDetailComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/recipes/recipe-form.component').then(m => m.RecipeFormComponent),
      },
    ],
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent),
  },
  { path: '**', redirectTo: 'recipes' },
];
