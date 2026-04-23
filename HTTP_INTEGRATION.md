# HTTP Database Integration Guide

## Overview
The application now uses HTTP calls to simulate a real database instead of localStorage. All recipe operations are now asynchronous HTTP requests with realistic network delays (1 second per request).

## Architecture

### Services

#### BackendApiService (`backend-api.service.ts`)
The core service that simulates HTTP calls to a backend database.

**Methods:**
- `getAllRecipes()` - GET /api/recipes
- `getRecipeById(id)` - GET /api/recipes/:id
- `createRecipe(recipe)` - POST /api/recipes
- `updateRecipe(id, updates)` - PUT /api/recipes/:id
- `deleteRecipe(id)` - DELETE /api/recipes/:id
- `toggleFavorite(id)` - PATCH /api/recipes/:id/favorite
- `addReview(id, review)` - POST /api/recipes/:id/reviews
- `searchRecipes(query)` - GET /api/recipes/search
- `getRecipesByCategory(category)` - GET /api/recipes/category/:category
- `getFavoriteRecipes()` - GET /api/recipes/favorites

**Features:**
- In-memory database maintains all recipes
- Each request has a 1-second delay to simulate network latency
- Database persists during the session (resets on page refresh)

#### RecipeService (`recipe.service.ts`)
Updated to use HTTP calls for all CRUD operations while maintaining the signal-based state management.

**Key Changes:**
- Now uses `BackendApiService` for all data operations
- Loads recipes on service initialization via HTTP
- Uses optimistic updates for creating recipes (returns ID immediately for navigation)
- Removes localStorage dependency completely
- Added error tracking with `error` signal

#### OcrService (`ocr.service.ts`)
Updated with comments about real HTTP implementation for OCR processing.

## Usage

### In Components
The usage remains mostly the same:

```typescript
constructor(private recipeService: RecipeService) {}

// Get all recipes (loads from database)
recipes = this.recipeService.recipes;

// Add new recipe (optimistic - returns immediately)
addRecipe(data) {
  const recipe = this.recipeService.add(data);
  // Can navigate immediately using recipe.id
  this.router.navigate(['/recipes', recipe.id]);
}

// Update recipe (async operation)
updateRecipe(id: string, data: any) {
  this.recipeService.update(id, data);
}

// Delete recipe (async operation)
deleteRecipe(id: string) {
  this.recipeService.delete(id);
}

// Toggle favorite (async operation)
toggleFavorite(id: string) {
  this.recipeService.toggleFavorite(id);
}

// Listen to loading state
isLoading = this.recipeService.loading;

// Listen to errors
error = this.recipeService.error;
```

## Network Delays

All operations have a **1000ms (1 second) delay** to simulate real network requests:

- Fetching recipes: ~1s
- Adding recipe: ~1s
- Updating recipe: ~1s
- Deleting recipe: ~1s
- Toggling favorite: ~1s
- OCR processing: ~2s (simulates AI processing)

## Transitioning to Real Backend

To replace the mock backend with a real API:

1. **Replace BackendApiService**:
   ```typescript
   // Instead of simulating with of().pipe(delay())
   // Use actual HTTP calls:
   getAllRecipes(): Observable<Recipe[]> {
     return this.http.get<Recipe[]>('/api/recipes');
   }
   ```

2. **Update API endpoints** to match your backend (currently uses paths like `/api/recipes`)

3. **Remove mock database initialization** from `BackendApiService`

4. **Add error handling** for network failures (already in place in RecipeService)

5. **Add authentication** if needed using HTTP interceptors

## Optional: HTTP Logging

An HTTP logging interceptor is available (`http-logging.interceptor.ts`) that logs all requests and responses to the console. To enable it:

1. Register in `app.config.ts`:
```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpLoggingInterceptor } from './core/interceptors/http-logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    { provide: HTTP_INTERCEPTORS, useClass: HttpLoggingInterceptor, multi: true },
  ],
};
```

2. Check browser console to see HTTP request/response logs with timing.

## Data Persistence

- **During Session**: Data persists as long as the page is open
- **Page Refresh**: All data resets to initial mock recipes
- **Browser Close/Tab Close**: Data is lost (no localStorage)

For persistent data across sessions, implement backend storage or restore localStorage functionality.

## Troubleshooting

If recipes aren't loading:
1. Check browser console for errors
2. Ensure `RecipeService` is being injected properly
3. Verify `BackendApiService` is initialized
4. Check that `HttpClientModule` is provided in `app.config.ts` ✅ (already configured)

## Testing

The service is fully testable with Angular's testing utilities:
- Use `HttpTestingController` to mock HTTP calls
- Test signal updates with `effect()`
- Verify error handling and loading states
