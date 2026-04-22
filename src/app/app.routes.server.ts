import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'recipes/:id', renderMode: RenderMode.Client },
  { path: 'recipes/:id/edit', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
