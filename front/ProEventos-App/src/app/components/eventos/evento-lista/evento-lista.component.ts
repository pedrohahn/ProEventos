import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Evento } from '@app/models/Evento';
import { EventoService } from 'src/app/services/evento.service';
import { environment } from '@environments/environment';
import { PaginatedResult, Pagination } from '@app/models/Pagination';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-evento-lista',
  templateUrl: './evento-lista.component.html',
  styleUrls: ['./evento-lista.component.scss']
})
export class EventoListaComponent implements OnInit {
  modalRef?: BsModalRef;
  public eventos: Evento[] = [];
  public eventoId = 0;
  public pagination = { } as Pagination;

  public larguraImagem = 150;
  public margemImagem = 2;
  public exibirImagem = true;

  termoBuscaChanged: Subject<string> = new Subject<string>();


  public filtrarEventos(evt: any): void {

    if (this.termoBuscaChanged.observers.length === 0) {
      
      this.termoBuscaChanged.pipe(debounceTime(1000)).subscribe(
        filtrarPor => {
          () => this.spinner.show();
          this.eventoService.getEventos(
            this.pagination.currentPage,
            this.pagination.itemsPerPage,
            filtrarPor
          ).subscribe(
            (paginatedResult: PaginatedResult<Evento[]>) => {
              this.eventos = paginatedResult.result ?? [];
              this.pagination = paginatedResult.pagination;
            },
            (error: any) => {
              this.spinner.hide();
              this.toastr.error('Erro ao carregar os eventos', 'Erro!');
            }
          ).add(() => this.spinner.hide());

        }
      )
    }
    this.termoBuscaChanged.next(evt.value);
  }

  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private Router: Router
  ) { }

  public ngOnInit(): void {
    this.pagination = {totalItems: 0, itemsPerPage: 3, currentPage: 1 } as Pagination;
    this.carregarEventos();
  }

  public mostraImagem(imagemURL: string): string {
    return (imagemURL !== '')
      ? `${environment.apiURL}resources/images/${imagemURL}`
      : 'assets/img/semImagem.jpg';
  }

  public carregarEventos(): void {
    this.spinner.show();

    this.eventoService.getEventos(this.pagination.currentPage, this.pagination.itemsPerPage
    ).subscribe(
      (paginatedResult: PaginatedResult<Evento[]>) => {
        this.eventos = paginatedResult.result ?? [];
        this.pagination = paginatedResult.pagination;
      },
      (error: any) => {
        this.spinner.hide();
        this.toastr.error('Erro ao carregar os eventos', 'Erro!');
      }
    ).add(() => this.spinner.hide());
  }

  openModal(event: any, template: TemplateRef<any>, eventoId: number): void {
    event.stopPropagation();
    this.eventoId = eventoId;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  public pageChanged(event: PageChangedEvent): void {
    this.pagination.currentPage = event.page;
    this.carregarEventos();
  }

  confirm(): void {
    this.modalRef?.hide();
    this.spinner.show();

    this.eventoService.deleteEvento(this.eventoId).subscribe(
      (result: any) => {
        this.toastr.success('Evento deletado com sucesso!', 'Deletado!');
        this.carregarEventos();
      },
      (error: any) => {
        this.toastr.error(`Erro ao tentar deletar o evento ${this.eventoId}`, 'Erro!');
        console.error(error);
      }
    ).add(() => this.spinner.hide());
  }

  decline(): void {
    this.modalRef?.hide();
  }

  detalheEvento(id: number): void {
    this.Router.navigate([`/eventos/detalhe/${id}`]);
  }
}
