package com.smartcity.worker_service.service;

import com.smartcity.worker_service.model.CommonResponse;
import com.smartcity.worker_service.request.WorkAssignmentRequest;

public interface IWorkAssignmentService {

    CommonResponse assignComplaintToWorker(WorkAssignmentRequest workAssignmentRequest);

    CommonResponse updateStatus(String assignmentId, String status);

    CommonResponse getAssignmentsByWorker(String workerId);

    CommonResponse getAllAssignments();

    CommonResponse getAssignmentById(String assignmentId);

    CommonResponse deleteAssignment(String assignmentId);

    CommonResponse applyPenalty(String assignmentId, int penaltyPoints);

}