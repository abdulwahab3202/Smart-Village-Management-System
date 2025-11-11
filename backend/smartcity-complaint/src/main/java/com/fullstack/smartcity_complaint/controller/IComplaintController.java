package com.fullstack.smartcity_complaint.controller;

import com.fullstack.smartcity_complaint.model.CommonResponse;
import com.fullstack.smartcity_complaint.request.UpdateComplaintRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

public interface IComplaintController {

    @PostMapping("/create")
    ResponseEntity<CommonResponse> createComplaint(HttpServletRequest request,
                                                   @RequestPart(value = "title") String title,
                                                   @RequestPart(value = "description") String description,
                                                   @RequestPart(value = "image") MultipartFile image);

    @GetMapping("/get-all")
    ResponseEntity<CommonResponse> getAllComplaints();

    @GetMapping("/get/{complaintId}")
    ResponseEntity<CommonResponse> getComplaintById(@PathVariable String complaintId);

    @GetMapping("/user/{userId}")
    ResponseEntity<CommonResponse> getComplaintsByUserId(@PathVariable String userId);

    @PutMapping("/update/{complaintId}")
    ResponseEntity<CommonResponse> updateComplaint(@PathVariable String complaintId, @RequestBody UpdateComplaintRequest complaintRequest);

    @PutMapping("/update-status/{complaintId}")
    ResponseEntity<CommonResponse> updateComplaintStatus(@PathVariable String complaintId, @RequestParam String status);

    @DeleteMapping("/delete/{complaintId}")
    ResponseEntity<CommonResponse> deleteComplaint(@PathVariable String complaintId);
}
