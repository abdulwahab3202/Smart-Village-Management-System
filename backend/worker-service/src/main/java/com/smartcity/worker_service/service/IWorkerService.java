package com.smartcity.worker_service.service;

import com.smartcity.worker_service.model.CommonResponse;
import com.smartcity.worker_service.request.WorkerRequest;
import jakarta.servlet.http.HttpServletRequest;

public interface IWorkerService {

    CommonResponse createWorkerProfile(WorkerRequest workerRequest);

    CommonResponse getAllWorkers();

    CommonResponse getWorkerById(String workerId);

    CommonResponse getAssignedComplaint(HttpServletRequest request);

    CommonResponse updateWorker(String workerId, WorkerRequest request);

    CommonResponse deleteWorker(String workerId);

    CommonResponse findAvailableWorkers();

    CommonResponse getAllComplaints(HttpServletRequest request);

}