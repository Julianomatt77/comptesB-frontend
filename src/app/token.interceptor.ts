import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private cookieService = inject(CookieService);
  private router = inject(Router);


  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (
      (request.url.includes('comptes') ||
        request.url.includes('recap') ||
        request.url.includes('depensesCommunes') ||
        request.url.includes('gestionUser')) &&
      this.cookieService.check('compty-auth-tok') === false
    ) {
      this.router.navigateByUrl('/login');
    } else if (this.cookieService.check('compty-auth-tok') === true) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.cookieService.get('compty-auth-tok')}`,
        },
      });
    }

    return next.handle(request);
  }
}

export const tokenInterceptor = {
  provide: HTTP_INTERCEPTORS,
  useClass: TokenInterceptor,
  multi: true,
};
