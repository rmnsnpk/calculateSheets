import { Injectable } from '@angular/core';
import {ISizeAmount} from "../models/size-amount.model";
import {ICalculatingForm, ICalculatingFormValue} from "../models/claculating-form.model";

@Injectable({
  providedIn: 'root'
})
export class CutsService {

  constructor() { }

  public calculateAmounts(value: ICalculatingFormValue): ISizeAmount[]{
    const rollWeight =value.sheetProps.weight;
    const rollWidth =value.sheetProps.width;


    return value.figures.map((figure)=>{
      const amount = {
        ...figure,
        amount: Math.ceil(figure.weight / (figure.width * rollWeight / rollWidth / 5))
      }

      amount.weight = (figure.width * rollWeight / rollWidth) * amount.amount / 5
      return amount
    })
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
    const widths = Array.from(widthMap.entries());

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



}
