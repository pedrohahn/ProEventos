import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '@app/models/identity/User';
import { AccountService } from '@app/services/account.service';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private accountService: AccountService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {

    return this.accountService.currentUser$.pipe(
      take(1),
      switchMap((user) => {
        if (user?.token) {
          request = request.clone({
            setHeaders: { Authorization: `Bearer ${user.token}` },
          });
        }

        return next.handle(request);
      }),
    );
  }
}
