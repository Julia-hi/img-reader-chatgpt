import { Routes } from '@angular/router';
import { OcrComponent } from './pages/ocr-component/ocr-component';

export const routes: Routes = [
   {
    path: '',
    redirectTo: '/ocr/upload',
    pathMatch: 'full'
  },
 {path: 'ocr/upload', component: OcrComponent}
];
