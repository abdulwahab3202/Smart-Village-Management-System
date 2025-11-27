package com.smartcity.worker_service.controller;

import com.smartcity.worker_service.model.CommonResponse;
import com.smartcity.worker_service.request.WorkAssignmentRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

public interface IWorkAssignmentController {

    @PostMapping("/assign")
    ResponseEntity<CommonResponse> assignComplaintToWorker(@RequestBody WorkAssignmentRequest workAssignmentRequest);

    @PutMapping("/status/{assignmentId}")
    ResponseEntity<CommonResponse> updateStatus(@PathVariable String assignmentId, @RequestParam String status);

    @GetMapping("/worker/{workerId}")
    ResponseEntity<CommonResponse> getAssignmentsByWorker(@PathVariable String workerId);

    @GetMapping("/get-all-assignments")
    ResponseEntity<CommonResponse> getAllAssignments();

    @GetMapping("/get/{assignmentId}")
    ResponseEntity<CommonResponse> getAssignmentById(@PathVariable String assignmentId);

    @DeleteMapping("/delete/{assignmentId}")
    ResponseEntity<CommonResponse> deleteAssignment(@PathVariable String assignmentId);

    @PutMapping("/penalty/{assignmentId}")
    ResponseEntity<CommonResponse> applyPenalty(@PathVariable String assignmentId);

}