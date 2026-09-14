import { Component, OnInit } from '@angular/core';
import {
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ValidatorField } from '@app/helpers/ValidatorField';
import { UserUpdate } from '@app/models/identity/UserUpdate';
import { AccountService } from '@app/services/account.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  userUpdate = {} as UserUpdate;
  form!: FormGroup;
  isSubmitting = false;

  constructor(
    public fb: FormBuilder,
    public accountService: AccountService,
    private router: Router,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
  ) {}

  get f(): any {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.validation();
    this.carregarUsuario();
  }

  private carregarUsuario(): void {
    this.spinner.show();
    this.accountService
      .getUser()
      .subscribe(
        (userRetorno: UserUpdate) => {
          this.userUpdate = userRetorno;
          this.form.patchValue(this.userUpdate);
          this.toaster.success('Usuário carregado com sucesso!', 'Sucesso');
        },
        (error: any) => {
          console.error(error);
          this.toaster.error('Erro ao carregar usuário!', 'Erro');
          this.router.navigate(['/dashboard']);
        },
      )
      .add(() => this.spinner.hide());
  }

  private validation(): void {
    const formOptions: AbstractControlOptions = {
      validators: ValidatorField.MustMatch('password', 'confirmePassword'),
    };

    this.form = this.fb.group(
      {
        userName: [''],
        primeiroNome: ['', Validators.required],
        ultimoNome: ['', Validators.required],
        titulo: ['NaoInformado', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', Validators.required],
        descricao: ['', [Validators.required, Validators.maxLength(250)]],
        funcao: ['NaoInformado', Validators.required],
        password: ['', Validators.minLength(4)],
        confirmePassword: [''],
      },
      formOptions,
    );
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.atualizarUsuario();
  }

  public atualizarUsuario(): void {
    const { confirmePassword, ...userUpdate } = this.form.value;
    this.userUpdate = userUpdate;

    if (!this.userUpdate.password) {
      delete this.userUpdate.password;
    }

    this.isSubmitting = true;
    this.spinner.show();

    this.accountService.updateUser(this.userUpdate).subscribe(
        () => {
          this.toaster.success('Usuário atualizado com sucesso!', 'Sucesso');
          this.router.navigate(['/dashboard']);
        },
        (error: any) => {
          console.error(error);
          this.toaster.error('Erro ao atualizar usuário!', 'Erro');
        },
      )
      .add(() => {
        this.isSubmitting = false;
        this.spinner.hide();
      });
  }

  public resetForm(event: any): void {
    event.preventDefault();
    this.form.reset();
  }
}
