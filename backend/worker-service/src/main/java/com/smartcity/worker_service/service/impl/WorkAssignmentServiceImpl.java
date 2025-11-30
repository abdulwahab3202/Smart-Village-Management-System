package com.smartcity.worker_service.service.impl;

import com.smartcity.worker_service.client.ComplaintClient;
import com.smartcity.worker_service.entity.WorkAssignment;
import com.smartcity.worker_service.entity.Worker;
import com.smartcity.worker_service.model.CommonResponse;
import com.smartcity.worker_service.model.ResponseStatus;
import com.smartcity.worker_service.repository.WorkAssignmentRepository;
import com.smartcity.worker_service.repository.WorkerRepository;
import com.smartcity.worker_service.request.WorkAssignmentRequest;
import com.smartcity.worker_service.response.WorkAssignmentResponse;
import com.smartcity.worker_service.service.IWorkAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkAssignmentServiceImpl implements IWorkAssignmentService {

    @Autowired
    private WorkAssignmentRepository workAssignmentRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private ComplaintClient complaintClient;

    private WorkAssignmentResponse toResponse(WorkAssignment assignment){
        WorkAssignmentResponse response = new WorkAssignmentResponse();
        response.setAssignmentId(assignment.getAssignmentId());
        response.setWorkerId(assignment.getWorkerId());
        response.setComplaintId(assignment.getComplaintId());
        response.setStatus(assignment.getStatus());
        response.setCreditPoints(assignment.getCreditPoints());
        response.setAssignedOn(assignment.getAssignedOn());
        response.setCompletedOn(assignment.getCompletedOn());
        return response;
    }

    @Override
    public CommonResponse assignComplaintToWorker(WorkAssignmentRequest workAssignmentRequest) {
        CommonResponse response = new CommonResponse();
        WorkAssignment existing = workAssignmentRepository.findByComplaintId(workAssignmentRequest.getComplaintId());
        if(existing != null){
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Complaint already assigned");
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }
        Worker worker = workerRepository.getWorkerById(workAssignmentRequest.getWorkerId());
        String assignedComplaint = worker.getAssignedComplaint();
        if(assignedComplaint != null){
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Cannot assign more than one complaint");
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }
        worker.setAssignedComplaint(workAssignmentRequest.getComplaintId());
        worker.setAvailable(false);
        workerRepository.save(worker);
        WorkAssignment assignment = new WorkAssignment();
        assignment.setWorkerId(workAssignmentRequest.getWorkerId());
        assignment.setComplaintId(workAssignmentRequest.getComplaintId());
        assignment.setStatus("ASSIGNED");
        complaintClient.updateComplaintStatus(workAssignmentRequest.getComplaintId(),"ASSIGNED");
        assignment.setCreditPoints(workAssignmentRequest.getCreditPoints());
        assignment.setAssignedOn(new Date());
        workAssignmentRepository.save(assignment);
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Complaint assigned successfully");
        response.setStatus(HttpStatus.CREATED);
        response.setStatusCode(HttpStatus.CREATED.value());
        response.setData(toResponse(assignment));
        return response;
    }

    @Override
    public CommonResponse updateStatus(String assignmentId, String status) {
        CommonResponse response = new CommonResponse();
        WorkAssignment assignment = workAssignmentRepository.findById(assignmentId);
        if(assignment == null){
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Assignment not found");
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        String currStatus = assignment.getStatus();
        if(currStatus.equalsIgnoreCase(status)){
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Status Already Updated");
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }
        assignment.setStatus(status);
        complaintClient.updateComplaintStatus(assignment.getComplaintId(),status);
        if("COMPLETED".equalsIgnoreCase(status)){
            assignment.setCompletedOn(new Date());
            assignment.setStatus("COMPLETED");
            Worker worker = workerRepository.getWorkerById(assignment.getWorkerId());
            worker.setTotalCredits(worker.getTotalCredits() + assignment.getCreditPoints());
            workerRepository.save(worker);
            Worker w = workerRepository.getWorkerById(assignment.getWorkerId());
            w.setAssignedComplaint(null);
            w.setAvailable(true);
            workerRepository.save(w);
        }
        workAssignmentRepository.save(assignment);
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Assignment status updated successfully");
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        response.setData(toResponse(assignment));
        return response;
    }

    @Override
    public CommonResponse getAssignmentsByWorker(String workerId) {
        CommonResponse response = new CommonResponse();
        List<WorkAssignment> assignments = workAssignmentRepository.findAssignmentsByWorkerId(workerId);
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Assignments retrieved successfully");
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        response.setData(assignments.stream().map(this::toResponse).collect(Collectors.toList()));
        return response;
    }

    @Override
    public CommonResponse getAllAssignments() {
        CommonResponse response = new CommonResponse();
        List<WorkAssignment> assignments = workAssignmentRepository.findAll();
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("All assignments retrieved successfully");
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        response.setData(assignments.stream().map(this::toResponse).collect(Collectors.toList()));
        return response;
    }

    @Override
    public CommonResponse getAssignmentById(String assignmentId) {
        CommonResponse response = new CommonResponse();
        WorkAssignment assignment = workAssignmentRepository.findById(assignmentId);
        if(assignment == null){
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Assignment not found");
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Assignment retrieved successfully");
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        response.setData(toResponse(assignment));
        return response;
    }

    @Override
    public CommonResponse deleteAssignment(String assignmentId) {
        CommonResponse response = new CommonResponse();
        WorkAssignment assignment = workAssignmentRepository.findById(assignmentId);
        if(assignment == null){
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Assignment not found");
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        workAssignmentRepository.deleteById(assignmentId);
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Assignment deleted successfully");
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    @Override
    public CommonResponse applyPenalty(String assignmentId) {
        CommonResponse response = new CommonResponse();
        WorkAssignment assignment = workAssignmentRepository.findById(assignmentId);
        if(assignment == null){
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Assignment not found");
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        assignment.setStatus("PENALIZED");
        complaintClient.updateComplaintStatus(assignment.getComplaintId(),"PENALIZED");
        assignment.setCreditPoints(assignment.getCreditPoints() - 100);
        Worker worker = workerRepository.getWorkerById(assignment.getWorkerId());
        worker.setTotalCredits(Math.max(worker.getTotalCredits() - 50, 0));
        workerRepository.save(worker);
        workAssignmentRepository.save(assignment);
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Penalty applied successfully");
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        response.setData(toResponse(assignment));
        return response;
    }
}
