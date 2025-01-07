import { Component, OnInit } from '@angular/core';
import { FileInfo, FileService } from '../../services/file.service';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  selectedFile: File | null = null;
  message: string = '';
  files: FileInfo[] = [];
  isLoading = false;

  constructor(private fileService: FileService) { }

  ngOnInit() {
    this.loadFiles();
  }

  loadFiles() {
    this.isLoading = true;
    this.fileService.getAllFiles().subscribe({
      next: (files) => {
        console.log('Received files:', files); // Debug log
        this.files = files;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading files:', error); // Debug log
        this.message = 'Error loading files';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
      console.log(this.selectedFile);
    }
  }

  onUpload(): void {
    if (this.selectedFile) {
      this.fileService.upload(this.selectedFile).subscribe({
        next: (response) => {
          this.message = 'File uploaded successfully';
          this.loadFiles(); // Refresh the list
          this.selectedFile = null;
        },
        error: (error) => {
          this.message = 'Error uploading file';
          console.error(error);
          this.handleError(error);
        }
      });
    } else {
      // console.log("Please push a file first");
      this.message = 'Please push a file first';
    }
  }

  onDownload(id: number): void {
    console.log("On Download is called");
    this.fileService.download(id).subscribe(
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `file-${id}`; // You might want to store and use actual file names
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error => {
        this.message = 'Error downloading file';
        console.error(error);
      }
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 413:
          errorMessage = 'File too large!';
          break;
        case 415:
          errorMessage = 'Unsupported file type!';
          break;
        case 401:
          errorMessage = 'Please login to continue';
          break;
      }
    }
    return throwError(() => errorMessage);
  }
}
