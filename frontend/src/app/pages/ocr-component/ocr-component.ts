import { Component } from '@angular/core';
import { OcrService } from '../ocr-service';
import { JsonPipe } from '@angular/common';


@Component({
  selector: 'app-ocr-component',
  imports: [JsonPipe],
  templateUrl: './ocr-component.html',
  styleUrl: './ocr-component.scss'
})
export class OcrComponent {
ocrResult: any;
  constructor(private ocrService: OcrService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.ocrService.upload(file).subscribe(res => this.ocrResult = res);
    }
  }
}
