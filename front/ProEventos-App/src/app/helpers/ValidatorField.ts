import { AbstractControl, Form, FormGroup } from '@angular/forms';

export class ValidatorField {
  static MustMatch(controlName: string, matchingControlName: string) {
    return (group: AbstractControl) => {
      const formgroup = group as FormGroup;
      const control = formgroup.controls[controlName];
      const matchingControl = formgroup.controls[matchingControlName];

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            return null;
        }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
      
      return null;
    };
  }
}
