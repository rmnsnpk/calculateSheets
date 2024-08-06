import * as XLSX from 'xlsx';
import {IFigureProperty} from "../models/figura-property.model";
import {COLUMN_NAMES} from "../constants/column-names.constant";
import {ICalculatingFormValue} from "../models/claculating-form.model";


self.addEventListener('message', (event) => {
  const reader: FileReader = new FileReader();
  reader.onload = (readFile: any) => {
    const workbook: XLSX.WorkBook = XLSX.read(new Uint8Array(readFile.target.result), { type: 'array' });
    const worksheet: XLSX.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: true });

    const fullData:ICalculatingFormValue[] = [];
    let lastFullRow: unknown = null;

    let obj: ICalculatingFormValue = null;

    console.log(data)

    data.forEach((row, index) => {
      // @ts-ignore
      if (row[COLUMN_NAMES.name.ru] ) {
        if(obj?.figures?.length){
          fullData.push(obj);
        }
        obj = {
          sheetProps: {
            name: '',
            width: 0,
            weight: 0
          },
          figures: []
        };
        // @ts-ignore
        obj.sheetProps.name = row[COLUMN_NAMES.name.ru];
        obj.sheetProps.weight = 16.5;
        obj.sheetProps.width = 4200;
      }
        const figure: IFigureProperty = {width: 0, weight: 0};

        // @ts-ignore
        figure.width = row[COLUMN_NAMES.format.ru]
        // @ts-ignore
        figure.weight = row[COLUMN_NAMES.weight.ru]

        obj.figures.push({...figure})


      if(index === data.length - 1){
        fullData.push(obj);
      }
    });

    postMessage(fullData);
  };
  reader.readAsArrayBuffer(event['data'].file);
});

