import {ChangeDetectorRef, Component, ElementRef, inject, viewChildren} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ICalculatingForm} from "../../models/claculating-form.model";
import {FigureControlComponent} from "../figure-control/figure-control.component";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {IFigureProperty} from "../../models/figura-property.model";
import {ISizeAmount} from "../../models/size-amount.model";
import GLPKConstructor, {GLPK, LP} from 'glpk.js';
import {F} from "@angular/cdk/keycodes";
import {MatHint} from "@angular/material/form-field";

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FigureControlComponent,
    MatIconButton,
    MatIcon,
    MatButton,
    MatHint
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent{
  $canvases = viewChildren('canvas', {read: ElementRef<HTMLCanvasElement>});
  public form: FormGroup<ICalculatingForm> = this.initForm()
  public calculatedRows : any[][];
  public canvasWidth = 500;
  public amounts: ISizeAmount[];
  public showPrint = false;
  private cdR = inject(ChangeDetectorRef);



  public calculate() {
    this.calculatedRows = [];
    this.amounts = this.calculateAmounts();
    this.calculatedRows = this.cutSheetsOptimized(this.form.controls.sheetProps.value.width, this.amounts);
    this.cdR.detectChanges();

    this.$canvases().forEach((canvas: { nativeElement: HTMLCanvasElement; }, index: string | number) => {
      // @ts-ignore
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
        width: 4180,
        weight: 16.5
      }),
      figures:  new FormArray<FormControl<IFigureProperty>>([]),
    })

    form.valueChanges.subscribe(()=>{
      this.showPrint = false;
      this.cdR.markForCheck();
    })


    return form;
  }


  cutSheetsOptimized(sheetWidth: number, strips: ISizeAmount[]): number[][] {
     const map = this.createWidthAmountMap(strips);

     const combinations: number[][] = [];


    while (Array.from(map.entries()).map((v)=>v[1]).some((v)=>v>0)){
      const bestCombination = this.findBestCombination(map, sheetWidth)
      combinations.push(bestCombination)

      bestCombination.forEach((width)=>{
        map.set(width, map.get(width) - 1)
      })
    }


    console.log(combinations)

    return combinations
  }


  private createWidthAmountMap(items: ISizeAmount[]): Map<number, number> {
    const widthAmountMap = new Map<number, number>();

    items.forEach(item => {
      widthAmountMap.set(item.width, item.amount);
    });

    return widthAmountMap;
  }

  private findBestCombination(widthMap: Map<number, number>, maxWidth: number): number[] {
    // Преобразуем карту в массив ширин и их количеств
    const widths = Array.from(widthMap.entries());

    // Создаем массив для хранения максимальных значений ширины для каждого возможного значения до maxWidth
    const dp = new Array(maxWidth + 1).fill(0);
    const selection = new Array(maxWidth + 1).fill(null).map(() => new Array<number>());

    for (let [width, count] of widths) {
      for (let w = maxWidth; w >= width; w--) {
        for (let k = 1; k <= count; k++) {
          if (w - k * width >= 0 && dp[w - k * width] + k * width > dp[w]) {
            dp[w] = dp[w - k * width] + k * width;
            selection[w] = [...selection[w - k * width], ...Array(k).fill(width)];
          }
        }
      }
    }

    return selection[maxWidth];
  }


  private calculateAmounts(): ISizeAmount[]{
    const v = this.form.value;
    const rollWeight =v.sheetProps.weight;
    const rollWidth =v.sheetProps.width;


    return v.figures.map((figure)=>{
      const amount = {
        ...figure,
        amount: Math.ceil(figure.weight / (figure.width * rollWeight / rollWidth / 5))
      }

      amount.weight = (figure.width * rollWeight / rollWidth) * amount.amount / 5
      return amount
    })
  }
}




