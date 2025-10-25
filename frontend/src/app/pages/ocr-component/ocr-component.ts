import { Component, EventEmitter, Output, signal } from '@angular/core';
import { OcrService } from '../ocr-service';
import { JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-ocr-component',
  imports: [],
  templateUrl: './ocr-component.html',
  styleUrl: './ocr-component.scss'
})
export class OcrComponent {
  /**
     * text content from all uploaded files
     * @var ocrResult
     */
  //ocrResult = signal<string[]>([]);
  ocrResult = signal<any>(null);
  // Creamos un EventEmitter que emitirá strings
  @Output() messageEvent = new EventEmitter<string>();

  files: File[] = [];
  filesSelected = false;
  isLoading = false;
  uploadedFilesResults: any[] = [];
  constructor(private ocrService: OcrService) { }

  /**
  * upload few files
  * @param event
  */
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.filesSelected = true;
      this.files.push(input.files[0]);
      input.value = '';
    }
  }

  /**
   * send uploaded files to the service OcrService
   */
  uploadAllFiles() {
    if (this.files.length === 0) return;
    this.isLoading = true;

    const formData = new FormData();
    this.files.forEach(file => formData.append('files', file));

    this.ocrService.uploadMultiple(this.files)
      .subscribe({
        next: (res) => {
          console.log(res)
          this.ocrResult.set(res)
          this.sendToForm(this.ocrResult());
        },
        error: (err) => {
          console.error('Error al subir archivos:', err);
        },
        complete: () => {
          this.isLoading = false; // disactivate loading
        }
      });
  }


  /**
   * send result to form
   * @param cupsData
   */
  sendToForm(cupsData: any) {
    this.messageEvent.emit(cupsData);
  }
}

