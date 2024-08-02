import {FormArray, FormControl} from "@angular/forms";
import {IFigureProperty} from "./figura-property.model";

export interface ICalculatingForm {
  sheetProps: FormControl<IFigureProperty>;
  figures: FormArray<FormControl<IFigureProperty>>;
}

export interface ICalculatingFormItem{
  name: FormControl<string>;
  width: FormControl<number>;
  weight: FormControl<number>;
}

