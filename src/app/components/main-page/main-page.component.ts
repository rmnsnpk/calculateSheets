import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Signal,
  inject,
  viewChildren,
  input,
  InputSignal, effect
} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ICalculatingForm, ICalculatingFormValue} from "../../models/claculating-form.model";
import {FigureControlComponent} from "../figure-control/figure-control.component";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {IFigureProperty} from "../../models/figura-property.model";
import {ISizeAmount} from "../../models/size-amount.model";
import {MatHint} from "@angular/material/form-field";
import {CutsService} from "../../services/cuts.service";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FigureControlComponent,
    MatIconButton,
    MatIcon,
    MatButton,
    MatHint,
    MatTooltip
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent{
  $formValue: InputSignal<ICalculatingFormValue> = input({
    sheetProps: {
      name: '',
      width: 4180,
      weight: 16.5
    },
    figures:  [],
  } as ICalculatingFormValue, {alias: 'formValue'})
  $canvases = viewChildren('canvas', {read: ElementRef<HTMLCanvasElement>});
  public form: FormGroup<ICalculatingForm> = this.initForm()
  public calculatedRows : number[][];
  public canvasWidth = 500;
  public amounts: ISizeAmount[];
  public showPrint = false;
  public showCanvases = false;
  private cdR = inject(ChangeDetectorRef);
  private cutsService = inject(CutsService);


  constructor() {
    effect(() => {
      this.form.controls.sheetProps.patchValue(this.$formValue().sheetProps)

      this.$formValue().figures.forEach((figure)=>{
        this.form.controls.figures.push(new FormControl(figure))
      })
    });
  }


  public calculate() {
    this.calculatedRows = [];
    this.amounts = [];
    this.amounts = this.cutsService.calculateAmounts(this.form.value as ICalculatingFormValue);
    this.calculatedRows = this.cutsService.cutSheetsOptimized(this.form.controls.sheetProps.value.width, this.amounts);
    this.showCanvases = true;
    this.cdR.detectChanges();

    this.$canvases().forEach((canvas: { nativeElement: HTMLCanvasElement; }, index:  number) => {
      this.drawCanvas(canvas.nativeElement, this.calculatedRows[index]);
    });

    this.showPrint = true;
    this.cdR.markForCheck();
  }

  public removeFilter(filterIndex: number): void {
    this.form.controls.figures.removeAt(filterIndex);
  }

  public addNewFigure(): void {
    const figureControl = new FormControl<IFigureProperty>({
        name: '',
        width: 1,
        weight: 1
      });
    this.form.controls.figures.push(figureControl);
    this.form.updateValueAndValidity();
  }

  public printCanvas(){
    if (!this.$canvases() || this.$canvases().length === 0) {
      console.error("No canvases found");
      return;
    }

    const printWindow = window.open('', '_blank');

    let leftTotalWidth = 0;
    let leftTotalWeight = 0;

    const htmlContent = `
    <html>
      <head>
        <title>${this.form.controls.sheetProps.value.name}</title>
        <style>
          body { text-align: center; }
          img { display: block; margin: 10px auto; border: 3px solid black }
        </style>
      </head>
      <body>
        ${this.$canvases().map((canvas, index) => {
      const imgSrc = (canvas.nativeElement as HTMLCanvasElement).toDataURL('image/png');
      const rowSum = this.calculatedRows[index].reduce((usedWidth, width)=>{
        return usedWidth += width
      }, 0)
      const figureWidth = (this.form.controls.sheetProps.value.width) - rowSum
      const figureWeight = (figureWidth * this.form.controls.sheetProps.value.weight / this.form.controls.sheetProps.value.width)  / 5
      leftTotalWidth += figureWidth;
      leftTotalWeight +=  figureWeight
      return `
          <span>${this.form.controls.sheetProps.value.name}. Ролл: ${Math.trunc(index / 5) + 1}. Срез: ${ (index % 5) + 1}. Остаток: ${ figureWidth }мм. (${figureWeight.toFixed(5) }т.)</span>
          <img src="${imgSrc}">
          <br>
       `;
    }).join('')}
        <div>
            <p>Чистая ширина ролла ${this.form.controls.sheetProps.value.width}мм. Вес ролла ${this.form.controls.sheetProps.value.weight}т.</p>
            <p>Итого: </p>
            ${this.amounts.map(amount => {
              return `<p>${this.form.controls.sheetProps.value.name}. Формат: ${amount.width}мм. Заказ: ${this.form.controls.figures.value.find((format)=>format.width === amount.width).weight}т. Выход: ${amount.weight}т.</p>`
            })}
            <p>Остаток: ${leftTotalWidth}мм. (${leftTotalWeight}т.)</p>
        </div>
      </body>
    </html>
  `;


    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Ensure the document is fully loaded before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }

  public addOneFigureItem(formControl:  FormControl<IFigureProperty>, weightToBeAdded: number){
    formControl.patchValue({...formControl.value, weight: formControl.value.weight + weightToBeAdded})
  }


  private drawCanvas(canvas: HTMLCanvasElement, row: number[]) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const blockHeight = 150; // Height of each block row

      let prevWidth = 0;

      row.forEach((width) => {
        const lineWidth = this.canvasWidth  * width / this.form.controls.sheetProps.value.width ;

        this.drawVerticalLine(ctx, prevWidth, blockHeight, lineWidth, width);

        prevWidth += lineWidth;
      });
    }};

    private drawVerticalLine(context: CanvasRenderingContext2D, x: number, height: number, width: number, text: number) {
      context.beginPath();
      context.rect(x, 0, width, height);
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = 'white';
      context.fill();

      context.fillStyle = 'black';
      context.font = '16px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText( ''+text, x + width / 2, height / 2);
    }


  private initForm():FormGroup<ICalculatingForm>{
    const form =  new FormGroup<ICalculatingForm>({
      sheetProps: new FormControl({
        name: '',
        width: 0,
        weight: 0
      }),
      figures:  new FormArray<FormControl<IFigureProperty>>([]),
    })


    form.valueChanges.subscribe(()=>{
      this.showPrint = false;
      this.showCanvases = false;
      this.cdR.markForCheck();
    })


    return form;
  }



}




