import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * HTTP Logging Interceptor
 * Logs all HTTP requests and responses to the console for debugging
 */
@Injectable()
export class HttpLoggingInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const startTime = performance.now();
    
    console.log(`📤 HTTP REQUEST: ${req.method} ${req.url}`);
    if (req.body) {
      console.log('   Body:', req.body);
    }

    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const duration = (performance.now() - startTime).toFixed(2);
            console.log(
              `✅ HTTP RESPONSE: ${req.method} ${req.url} (${duration}ms)`,
              event.body
            );
          }
        },
        error: (error) => {
          const duration = (performance.now() - startTime).toFixed(2);
          console.error(
            `❌ HTTP ERROR: ${req.method} ${req.url} (${duration}ms)`,
            error
          );
        },
      })
    );
  }
}
