package com.smartcity.worker_service.service.impl;

import com.smartcity.worker_service.client.ComplaintClient;
import com.smartcity.worker_service.entity.Worker;
import com.smartcity.worker_service.model.CommonResponse;
import com.smartcity.worker_service.model.ResponseStatus;
import com.smartcity.worker_service.repository.WorkerRepository;
import com.smartcity.worker_service.request.WorkerRequest;
import com.smartcity.worker_service.response.WorkerResponse;
import com.smartcity.worker_service.service.IWorkerService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class WorkerServiceImpl implements IWorkerService {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private ComplaintClient complaintClient;

    @Override
    public CommonResponse createWorkerProfile(WorkerRequest workerRequest){
        CommonResponse response = new CommonResponse();
        Worker worker = toEntity(workerRequest);
        worker.setCreatedOn(new Date());
        worker.setUpdatedOn(new Date());
        worker.setAvailable(true);
        worker.setTotalCredits(0);
        workerRepository.save(worker);
        response.setMessage("Worker Profile Created Successfully");
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setData(toDTO(worker));
        response.setStatus(HttpStatus.CREATED);
        response.setStatusCode(HttpStatus.CREATED.value());
        return response;
    }

    @Override
    public CommonResponse getAllWorkers() {
        CommonResponse response = new CommonResponse();
        List<Worker> workers = workerRepository.getAllWorkers();
        List<WorkerResponse> dtos = workers.stream().map(this::toDTO).toList();
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Workers Retrieved Successfully");
        response.setData(dtos);
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    @Override
    public CommonResponse getWorkerById(String workerId) {
        CommonResponse response = new CommonResponse();
        Optional<Worker> workerOpt = Optional.ofNullable(workerRepository.getWorkerById(workerId));
        if (workerOpt.isEmpty()) {
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Worker not found");
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Worker retrieved successfully");
        response.setData(toDTO(workerOpt.get()));
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    @Override
    public CommonResponse updateWorker(String workerId, WorkerRequest request) {
        CommonResponse response = new CommonResponse();
        Optional<Worker> workerOpt = Optional.ofNullable(workerRepository.getWorkerById(workerId));

        if (workerOpt.isEmpty()) {
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Worker not found");
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }

        Worker worker = workerOpt.get();

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            worker.setName(request.getName());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            worker.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getSpecialization() != null && !request.getSpecialization().trim().isEmpty()) {
            worker.setSpecialization(request.getSpecialization());
        }

        workerRepository.save(worker);

        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Worker Updated Successfully");
        response.setData(toDTO(worker));
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }


    @Override
    public CommonResponse deleteWorker(String workerId) {
        CommonResponse response = new CommonResponse();
        Optional<Worker> workerOpt = Optional.ofNullable(workerRepository.getWorkerById(workerId));
        if (workerOpt.isEmpty()) {
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Worker not found");
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        workerRepository.deleteWorkerById(workerId);
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Worker Deleted Successfully");
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    @Override
    public CommonResponse findAvailableWorkers() {
        CommonResponse response = new CommonResponse();
        try {
            List<Worker> workers = workerRepository.findAvailableWorkers();
            List<WorkerResponse> dtos = workers.stream().map(this::toDTO).toList();
            response.setResponseStatus(ResponseStatus.SUCCESS);
            response.setMessage("Available workers retrieved successfully");
            response.setData(dtos);
            response.setStatus(HttpStatus.OK);
            response.setStatusCode(HttpStatus.OK.value());
        } catch (Exception e) {
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Failed to fetch available workers: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
        return response;
    }

    @Override
    public CommonResponse getAllComplaints(HttpServletRequest request){
        Claims claims = (Claims) request.getAttribute("userClaims");
        String workerId = claims.get("userId", String.class);
        Worker worker = workerRepository.getWorkerById(workerId);
        String workerCategory = worker.getSpecialization();
        ResponseEntity<CommonResponse> response = complaintClient.getAllComplaints(workerCategory);
        return response.getBody();
    }

    private Worker toEntity(WorkerRequest request) {
        Worker worker = new Worker();
        worker.setWorkerId(request.getUserId());
        worker.setName(request.getName());
        worker.setEmail(request.getEmail());
        worker.setPhoneNumber(request.getPhoneNumber());
        worker.setSpecialization(request.getSpecialization());
        return worker;
    }

    private WorkerResponse toDTO(Worker worker) {
        WorkerResponse response = new WorkerResponse();
        response.setWorkerId(worker.getWorkerId());
        response.setName(worker.getName());
        response.setEmail(worker.getEmail());
        response.setPhoneNumber(worker.getPhoneNumber());
        response.setSpecialization(worker.getSpecialization());
        response.setTotalCredits(worker.getTotalCredits());
        response.setAvailable(worker.isAvailable());
        response.setAssignedComplaints(worker.getAssignedComplaints());
        response.setCreatedOn(worker.getCreatedOn());
        response.setUpdateOn(worker.getUpdatedOn());
        return response;
    }
}