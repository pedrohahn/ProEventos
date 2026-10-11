import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evento } from '../models/Evento';
import { map, take } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { PaginatedResult, Pagination } from '@app/models/Pagination';

@Injectable() 
export class EventoService {
  baseURL = environment.apiURL + 'api/eventos';
  tokenHeader = new HttpHeaders({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token}` });

  constructor(private http: HttpClient) {}

  public getEventos(page?: number, itemsPerPage?: number, term?: string) : Observable<PaginatedResult<Evento[]>> {
    const paginatedResult: PaginatedResult<Evento[]> = new PaginatedResult<Evento[]>();
    
    let params = new HttpParams;

    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page.toString());
      params = params.append('pageSize', itemsPerPage.toString());
    }
  
    if (term != null && term != '') {
      params = params.append('term', term);
    }

    return this.http
      .get<Evento[]>(this.baseURL, { observe: 'response', params })
      .pipe(take(1),
        map((response) => {
          const paginationHeader = response.headers.get('Pagination');
          if (!paginationHeader) {
            throw new Error('A resposta da API não contém os metadados de paginação.');
          }

          return {
            result: response.body,
            pagination: JSON.parse(paginationHeader) as Pagination
          };
        })
      );
  }

  // public getElementosByTema(tema: string) : Observable<Evento[]> {
  //   return this.http
  //     .get<Evento[]>(`${this.baseURL}/${tema}/tema`)
  //     .pipe(take(1));
  // }

  public getEventoById(id: number) : Observable<Evento> {
    return this.http
      .get<Evento>(`${this.baseURL}/${id}`)
      .pipe(take(1));
  }

  public post(evento: Evento) : Observable<Evento> {
    return this.http
      .post<Evento>(this.baseURL, evento)
      .pipe(take(1));
  }

  public put(evento: Evento) : Observable<Evento> {
    return this.http
      .put<Evento>(`${this.baseURL}/${evento.id}`, evento)
      .pipe(take(1));
  }

   public deleteEvento(id: number) : Observable<any> {
    return this.http
      .delete(`${this.baseURL}/${id}`)
      .pipe(take(1));
  }

  postUpload(eventoId: number, file: File): Observable<Evento> {
    //const fileToUpload = file[0] as File;
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<Evento>(`${this.baseURL}/upload-image/${eventoId}`, formData)
      .pipe(take(1));
  }
}
