import {Component, Signal, effect, inject, input} from '@angular/core';
import {FormControl, FormGroup, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ICalculatingFormItem} from "../../models/claculating-form.model";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {IFigureProperty} from "../../models/figura-property.model";
import { toSignal } from '@angular/core/rxjs-interop';
import {Observable} from "rxjs";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-figure-control',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './figure-control.component.html',
  styleUrl: './figure-control.component.scss',
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic'
      }
    }
  ],
})
export class FigureControlComponent {
  public $showName = input<boolean>(true, {alias: 'showName'});
  public form: FormGroup<ICalculatingFormItem> = this.initForm();

  private $formValue: Signal<IFigureProperty> = toSignal<IFigureProperty>(this.form.valueChanges as Observable<IFigureProperty>);

  private ngControl = inject(NgControl)

  constructor() {
    this.initFormValueChangesEffect();
    this.ngControl.valueAccessor = this;
  }

  public onChange: Function = () => {};
  public onTouched: Function = () => {};

  public writeValue(value: IFigureProperty): void {
    this.form.patchValue(value);
  }

  public registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  private initFormValueChangesEffect(): void {
    effect(() => {
      this.onChange(this.$formValue());
      if(this.form.invalid) {
        this.ngControl.control.setErrors({invalid: true});
      }
    });
  }


  public setDisabledState(isDisabled: boolean): void {
    isDisabled
      ? this.form.disable()
      : this.form.enable();
  }

  private initForm(): FormGroup<ICalculatingFormItem>{
    return new FormGroup<ICalculatingFormItem>({
      name: new FormControl(''),
      width: new FormControl(1, [Validators.required, Validators.min(1)]),
      weight: new FormControl(1, [Validators.required, Validators.min(0)])
    })
  }
}
