import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorField } from '@app/helpers/ValidatorField';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

   form !: FormGroup;

  
    constructor(public fb: FormBuilder) { }
  
    get f(): any {
      return this.form.controls;
    }
  
    ngOnInit(): void {
      this.validation();
    }
  
      private validation(): void {
  
        const formOptions: AbstractControlOptions = {
          validators: ValidatorField.MustMatch('senha', 'confirmeSenha')
        };
  
  
        this.form = this.fb.group({
          primeiroNome: ['', Validators.required], 
          ultimoNome: ['', Validators.required],
          titulo: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]], 
          telefone: ['', Validators.required],
          descricao: ['', [Validators.required, Validators.maxLength(250)]],
          funcao: ['', Validators.required],
          senha: ['', [Validators.required, Validators.minLength(6)]],
          confirmeSenha: ['', Validators.required]
          }, formOptions);
        }

        onSubmit(): void {  
          if (this.form.invalid) {
            return;
          }
        }

        public resetForm(event: any): void {
          event.preventDefault();
          this.form.reset();
        }
}
