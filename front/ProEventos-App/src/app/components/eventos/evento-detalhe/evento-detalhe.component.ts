import { error } from '@angular/compiler/src/util';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Evento } from '@app/models/Evento';
import { Lote } from '@app/models/Lote';
import { EventoService } from '@app/services/evento.service';
import { LoteService } from '@app/services/lote.service';
import { environment } from '@environments/environment';

import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss']
})
export class EventoDetalheComponent implements OnInit {
  
  modalRef?: BsModalRef;
  eventoId: number = 0;
  evento = {} as Evento;
  public form!: FormGroup;
  estadoSalvar: 'post' | 'put' = 'post';
  loteAtual = {id: 0, nome: '', index: 0};
  imagemURL = 'assets/img/upload.png';  
  file !: File;

  get lotes(): FormArray {
    return this.form.get('lotes') as FormArray;
  }

  get modoEditar(): boolean {
    return this.estadoSalvar === 'put';
  }

  get f(): any {
    return this.form.controls;
  }

  get bsConfig(): any {
    return {

      adaptivePosition: true, 
      dateInputFormat: 'DD/MM/YYYY HH:mm a',
      containerClass: 'theme-default',
      showWeekNumbers: false
    };
  }

   get bsConfigLote(): any {
    return {

      adaptivePosition: true, 
      dateInputFormat: 'DD/MM/YYYY',
      containerClass: 'theme-default',
      showWeekNumbers: false
    };

  }

  constructor(private fb: FormBuilder,
    private localeService: BsLocaleService,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private modalService: BsModalService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private loteService: LoteService) {  
        this.localeService.use('pt-br');
  }


  public carregarEvento(): void {
    this.eventoId = +this.activatedRouter.snapshot.paramMap.get('id')!;

    if (this.eventoId !== null && this.eventoId !== 0) {
      this.spinner.show();

      this.estadoSalvar = 'put';

      this.eventoService.getEventoById(this.eventoId).subscribe(
        (evento: Evento) => {
          this.evento = {...evento};
          this.form.patchValue(this.evento);
          this.evento.lotes.forEach(lote => this.lotes.push(this.criarLote(lote)));
          if (this.evento.imagemURL !== '') {
            this.imagemURL = environment.apiURL + 'resources/images/' + this.evento.imagemURL;
          }
          //this.carregarLotes();
        },
        (error: any) => {
          this.toastr.error('Erro ao carregar evento.', 'Erro!');
          console.error(error);
        }
      ).add(() => this.spinner.hide());
    } 
  }

  public carregarLotes(): void {
    this.loteService.getLotesByEventoId(this.eventoId).subscribe(
      (lotesRetorno: Lote[]) => {
        lotesRetorno.forEach(lote => this.lotes.push(this.criarLote(lote)));
      },
      (error: any) => {
        this.toastr.error('Erro ao carregar lotes.', 'Erro!');
        console.error(error);
      }
      ).add(() => this.spinner.hide());
  }

  ngOnInit(): void { 
    this.carregarEvento();
    this.validation();   
  }


  public validation(): void {
    this.form = this.fb.group({
      tema: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      local: ['', Validators.required],
      dataEvento : ['', Validators.required],
      qtdePessoas: ['', [Validators.required, Validators.max(120000)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      imagemURL: [''],
      lotes : this.fb.array([])
    });
  }

  adicionarLote(): void {
    this.lotes.push(this.criarLote({ id: 0 } as Lote));
  }

  criarLote(lote: Lote): FormGroup {
    return this.fb.group({
      id: [lote.id],
      nome: [lote.nome, Validators.required],
      preco: [lote.preco, Validators.required],
      dataInicio: [lote.dataInicio],
      dataFim: [lote.dataFim],
      quantidade: [lote.quantidade, Validators.required]
    });
  }

  public retornaTituloLote(nome: string): string {
    return nome || `Lote ${this.lotes.length}`;
  }

  public resetForm(): void {
    this.form.reset();
  }

  public cssValidator(campoForm: FormControl | AbstractControl): any {
    return {'is-invalid': campoForm.errors && campoForm.touched};
  }

  public salvarEvento(): void {
    if (this.form.valid) {
      this.spinner.show();

      this.evento = (this.estadoSalvar === 'post') 
          ? {...this.form.value} 
          : {id: this.evento.id, ...this.form.value};

      this.eventoService[this.estadoSalvar](this.evento).subscribe(
        (eventoRetorno: Evento) => { 
          this.toastr.success('Evento salvo com sucesso.', 'Sucesso!');
          this.router.navigate([`/eventos/detalhe/${eventoRetorno.id}`]);
        },
        (error: any) => {
          this.spinner.hide();
          this.toastr.error('Erro ao salvar evento.', 'Erro!');
          console.error(error);
        },
        () => this.spinner.hide()
      );
    }
  }

  public salvarLotes(): void {
    if ( this.form.controls.lotes.valid ) { 
      this.spinner.show(); 
      this.loteService.saveLote(this.form.value.lotes, this.eventoId).subscribe(
        () => {
          this.toastr.success('Lotes salvos com sucesso.', 'Sucesso!');
        },
        (error: any) => {
          this.toastr.error('Erro ao salvar lotes.', 'Erro!');
          console.error(error);
        }
      ).add(() => this.spinner.hide())
    }

  }

  public removerLote(template: TemplateRef<any>, index: number): void {
    this.loteAtual.id = this.lotes.get(index + '.id')?.value;
    this.loteAtual.nome = this.lotes.get(index + '.nome')?.value;
    this.loteAtual.index = index;

    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }

  confirmDeleteLote(): void {
    this.modalRef?.hide();
    this.spinner.show();

    this.loteService.deleteLote(this.loteAtual.id, this.eventoId).subscribe(
      () => {
        this.toastr.success('Lote excluído com sucesso.', 'Sucesso!');
        this.lotes.removeAt(this.loteAtual.index);
      },
      (error: any) => {
        this.toastr.error(`Erro ao excluir lote ${this.loteAtual.nome}`, 'Erro!');
        console.error(error);
      }
    ).add(() => this.spinner.hide());
  }

  declineDeleteLote(): void {
    this.modalRef?.hide();
  }

  onFileChange(ev: any): void {
    const reader = new FileReader();

    reader.onload = (event: any) => this.imagemURL = event.target.result;

    this.file = ev.target.files[0];
    reader.readAsDataURL(this.file);

    this.uploadImagem();
  }

  uploadImagem(): void {
    this.spinner.show();
    this.eventoService.postUpload(this.eventoId, this.file).subscribe(
      (evento: Evento) => {
        this.carregarEvento();
        this.toastr.success('Imagem atualizada com sucesso.', 'Sucesso!');
      },
      (error: any) => {
        this.toastr.error('Erro ao atualizar imagem.', 'Erro!');
        console.error(error);
      }
    ).add(() => this.spinner.hide());
  
  } 

}

