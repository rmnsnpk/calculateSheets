import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {ICalculatingFormValue} from "../models/claculating-form.model";

@Injectable({
  providedIn: 'root'
})
export class ExcelFileService {
  public importedData = new Subject<ICalculatingFormValue[]>();
  private fileParser: Worker;

  constructor() {
    // @ts-ignore
    this.fileParser = new Worker(new URL('../workers/excel-file-parser.worker.ts', import.meta.url));
    this.fileParser.addEventListener('message', this.onFileParsingEnd.bind(this));
  }

  public parseFile(file: any) {
    this.fileParser.postMessage({ file });
  }

  private onFileParsingEnd(event: MessageEvent<ICalculatingFormValue[]>): void {
    const result = event.data;
    this.importedData.next(result);
  }
}
