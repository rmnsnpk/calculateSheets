import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Input,
  InputSignal,
  output,
  Output
} from '@angular/core';
import {CommonModule} from '@angular/common';



@Component({
    selector: 'app-file-input',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './file-input.component.html',
    styleUrls: ['./file-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileInputComponent {
    $acceptableTypes:InputSignal<string> = input('application/vnd.ms-excel', {alias: 'acceptableTypes'});
    onFileInput = output<File>()


    public onDrop(event: DragEvent) {
        event.preventDefault();
        const files = event.dataTransfer?.files;

        if (files) {
            this.onFileChange(files);
        }
    }

    public onFileChange(files: FileList): void {
        const file: File = files[0];

        console.log(file)
        if (this.$acceptableTypes() === file.type) {
            this.onFileInput.emit(file);
        } else {
            alert('Данный формат файла не поддерживатеся, загрузите файл excel');
        }
    }
}
