import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedResult, Pagination } from '@app/models/Pagination';
import { Palestrante } from '@app/models/Palestrante';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PalestranteService {
  baseURL = environment.apiURL + 'api/palestrantes';
  tokenHeader = new HttpHeaders({
    Authorization: `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}`,
  });

  constructor(private http: HttpClient) {}

  public getPalestrantes(
    page?: number,
    itemsPerPage?: number,
    term?: string,
  ): Observable<PaginatedResult<Palestrante[]>> {
    const paginatedResult: PaginatedResult<Palestrante[]> = new PaginatedResult<
      Palestrante[]
    >();

    let params = new HttpParams();

    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page.toString());
      params = params.append('pageSize', itemsPerPage.toString());
    }

    if (term != null && term != '') {
      params = params.append('term', term);
    }

    return this.http
      .get<Palestrante[]>(this.baseURL + '/all', { observe: 'response', params })
      .pipe(
        take(1),
        map((response) => {
          const paginationHeader = response.headers.get('Pagination');
          if (!paginationHeader) {
            throw new Error(
              'A resposta da API não contém os metadados de paginação.',
            );
          }

          return {
            result: response.body,
            pagination: JSON.parse(paginationHeader) as Pagination,
          };
        }),
      );
  }

  public getPalestrante(): Observable<Palestrante> {
    return this.http.get<Palestrante>(`${this.baseURL}`).pipe(take(1));
  }

  public post(): Observable<Palestrante> {
    return this.http.post<Palestrante>(this.baseURL, {} as Palestrante).pipe(take(1));
  }

  public put(palestrante: Palestrante): Observable<Palestrante> {
    return this.http
      .put<Palestrante>(`${this.baseURL}`, palestrante)
      .pipe(take(1));
  }

}
