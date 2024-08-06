import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {FileInputComponent} from "../../components/file-input/file-input.component";
import { ExcelFileService } from '../../services/excel-file.service';
import {ICalculatingFormValue} from "../../models/claculating-form.model";
import {Observable} from "rxjs";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MainPageComponent} from "../../components/main-page/main-page.component";


@Component({
  selector: 'app-import-page',
  standalone: true,
  imports: [
    FileInputComponent,
    MatTabGroup,
    MatTab,
    MainPageComponent
  ],
  templateUrl: './import-page.component.html',
  styleUrl: './import-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportPageComponent implements OnInit{

  public calculatingFormValues: ICalculatingFormValue[] = [];

  private fileParserService = inject(ExcelFileService)
  private cdR = inject(ChangeDetectorRef)

  ngOnInit() {
    this.fileParserService.importedData.subscribe((importedData)=>{
      this.calculatingFormValues = importedData;
      this.cdR.markForCheck()
    })
  }


  public fileInputChanged(file: File) {
    this.fileParserService.parseFile(file)
  }
}
