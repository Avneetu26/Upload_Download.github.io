import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';// Define the FileInfo interface
export interface FileInfo {
  id: string;
  fileName: string;
  type: string;
}


@Injectable({
  providedIn: 'root'
})
export class FileService {
  private baseUrl = 'http://localhost:8080/api';  // adjust port as needed

  constructor(private http: HttpClient) { }

  upload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${id}`, {
      responseType: 'blob'
    });
  }

  getAllFiles(): Observable<FileInfo[]> {
    return this.http.get<FileInfo[]>(`${this.baseUrl}/files`);
  }
}
