import { Component } from '@angular/core';
import { OcrService } from '../ocr-service';
import { JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-ocr-component',
  imports: [JsonPipe],
  templateUrl: './ocr-component.html',
  styleUrl: './ocr-component.scss'
})
export class OcrComponent {
ocrResult: any;
ocrResults: string[] = [];
  constructor(private ocrService: OcrService, private http: HttpClient) {}

  /* onFileSelected(event: any) {
    const file = event.target.files[0];
    console.log(file)
    if (file) {
      this.ocrService.upload(file).subscribe(res => this.ocrResult = res);
    }
  } */

    onFilesSelected(event: any) {
    const files: File[] = Array.from(event.target.files);
    if (files.length > 0) {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('images', file));

      this.ocrService.uploadMultiple(files)
        .subscribe(res => {
          this.ocrResult = res.results;
          
          console.log(this.ocrResult)
        });
        
    }
}
}