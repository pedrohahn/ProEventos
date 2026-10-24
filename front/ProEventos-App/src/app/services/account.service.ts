import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/models/identity/User';
import { UserUpdate } from '@app/models/identity/UserUpdate';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private currentUserSource = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSource.asObservable();

  baseUrl = environment.apiURL + 'api/account/';

  constructor(private http: HttpClient) {}

  public login(model: any): Observable<void> {
    return this.http.post<User>(this.baseUrl + 'login', model).pipe(
      take(1),
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      }),
    );
  }

  getUser(): Observable<UserUpdate> {
    return this.http.get<UserUpdate>(this.baseUrl + 'getUser').pipe(take(1));
  }

  updateUser(model: UserUpdate): Observable<void> {
    return this.http.put<UserUpdate>(this.baseUrl + 'updateUser', model).pipe(
      take(1),
      map((user: UserUpdate) => {
        if (user) {
          this.setCurrentUser(user);
        }
      }),
    );
  }

  public logout(): void {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }

  public setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  public register(model: any): Observable<void> {
    return this.http.post<User>(this.baseUrl + 'register', model).pipe(
      take(1),
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      }),
    );
  }

  postUpload(file: File): Observable<UserUpdate> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<UserUpdate>(`${this.baseUrl}upload-image`, formData)
      .pipe(take(1));
  }
}
