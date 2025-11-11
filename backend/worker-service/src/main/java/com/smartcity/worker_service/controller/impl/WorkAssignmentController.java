package com.smartcity.worker_service.controller.impl;

import com.smartcity.worker_service.controller.IWorkAssignmentController;
import com.smartcity.worker_service.model.ResponseStatus;
import com.smartcity.worker_service.model.CommonResponse;
import com.smartcity.worker_service.request.WorkAssignmentRequest;
import com.smartcity.worker_service.service.IWorkAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("work-assignment")
public class WorkAssignmentController implements IWorkAssignmentController {

    @Autowired
    private IWorkAssignmentService workAssignmentService;

    @Override
    @PreAuthorize("hasAnyRole('WORKER','ADMIN')")
    public ResponseEntity<CommonResponse> assignComplaintToWorker(@RequestBody WorkAssignmentRequest workAssignmentRequest) {
        try {
            CommonResponse response = workAssignmentService.assignComplaintToWorker(workAssignmentRequest);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Assign Complaint");
        }
    }

    @Override
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<CommonResponse> updateStatus(@PathVariable String assignmentId, @RequestParam String status) {
        try {
            CommonResponse response = workAssignmentService.updateStatus(assignmentId,status);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Update Progress");
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','WORKER')")
    public ResponseEntity<CommonResponse> getAssignmentsByWorker(@PathVariable String workerId) {
        try {
            CommonResponse response = workAssignmentService.getAssignmentsByWorker(workerId);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Get Assignments By Worker");
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','WORKER','CITIZEN')")
    public ResponseEntity<CommonResponse> getAllAssignments() {
        try {
            CommonResponse response = workAssignmentService.getAllAssignments();
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Get All Assignments");
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponse> getAssignmentById(@PathVariable String assignmentId) {
        try {
            CommonResponse response = workAssignmentService.getAssignmentById(assignmentId);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Get Assignment By Id");
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponse> deleteAssignment(@PathVariable String assignmentId) {
        try {
            CommonResponse response = workAssignmentService.deleteAssignment(assignmentId);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Delete Assignment");
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommonResponse> applyPenalty(@PathVariable String assignmentId, @RequestParam int penaltyPoints){
        try {
            CommonResponse response = workAssignmentService.applyPenalty(assignmentId, penaltyPoints);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Apply Penalty");
        }
    }

    private ResponseEntity<CommonResponse> exceptionHandler(Exception e, String action) {
        CommonResponse response = new CommonResponse();
        response.setResponseStatus(ResponseStatus.FAILED);
        response.setMessage(action + " failed: " + e.getMessage());
        response.setStatus(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        response.setStatusCode(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
