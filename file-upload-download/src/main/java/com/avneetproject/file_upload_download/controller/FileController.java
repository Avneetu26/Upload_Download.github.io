package com.avneetproject.file_upload_download.controller;


import com.avneetproject.file_upload_download.entity.FileEntity;
import com.avneetproject.file_upload_download.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class FileController {

    @Autowired
    private FileRepository fileRepository;

    @PostMapping("upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file")MultipartFile file) {
        try {
            System.out.println(file.getOriginalFilename());
            FileEntity fileEntity = new FileEntity();
            fileEntity.setFileName(file.getOriginalFilename());
            fileEntity.setContentType(file.getContentType());
            fileEntity.setData(file.getBytes());
            fileRepository.save(fileEntity);

            // String message = "File Uploaded successfully!";
            // HttpStatus status = HttpStatus.CREATED;
            // return new ResponseEntity<>(message, status);

            Map<String, String> response = new HashMap<>();
            response.put("message", "File Uploaded successfully!");
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadFile(@PathVariable Long id) {
        FileEntity fileEntity = fileRepository.findById(id).orElse(null);
        if(fileEntity != null) {
            HttpHeaders headers = new HttpHeaders(); // to control how the browser handles the response
            headers.setContentType(MediaType.parseMediaType(fileEntity.getContentType())); // let browser know what type of file it is
            // attachment will force the browser to download the file, and inline will display the content in browser
            headers.setContentDisposition(ContentDisposition.attachment().filename(fileEntity.getFileName()).build()); // let browser know how to present the file
            ByteArrayResource resource = new ByteArrayResource(fileEntity.getData());
            return ResponseEntity.ok().headers(headers).body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/files")
    public ResponseEntity<List<Map<String, Object>>> getAllFiles() {
        List<FileEntity> files = fileRepository.findAll();
        List<Map<String, Object>> response = files.stream().map(file -> {
            System.out.println(file.getFileName());
            Map<String, Object> fileData = new HashMap<>();
            fileData.put("id", file.getId());
            fileData.put("fileName", file.getFileName());
            fileData.put("contentType", file.getContentType());
            return fileData;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
}
