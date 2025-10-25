import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  constructor(private http: HttpClient) { }

  upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    console.log(formData)
    return this.http.post<any>('http://localhost:3000/ocr/upload', formData);
  }

  /**
  * reader for multiple files
  * @param files
  * @returns
  */
  uploadMultiple(files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file); // un solo key para todos
    });
    return this.http.post<any>('http://localhost:3000/ocr/upload', formData);
  }
}
