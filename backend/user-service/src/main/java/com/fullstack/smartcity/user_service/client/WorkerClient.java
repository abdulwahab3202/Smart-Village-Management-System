package com.fullstack.smartcity.user_service.client;

import com.fullstack.smartcity.user_service.model.CommonResponse;
import com.fullstack.smartcity.user_service.request.WorkerRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "worker-service")
public interface WorkerClient {

    @PostMapping("/api/worker/create")
    CommonResponse createWorkerProfile(@RequestBody WorkerRequest workerRequest);

    @GetMapping("/api/worker/get/{workerId}")
    CommonResponse getWorkerById(@PathVariable String workerId);

    @PutMapping("/api/worker/update/{workerId}")
    CommonResponse updateWorkerProfile(@PathVariable String workerId, @RequestBody WorkerRequest workerRequest);

    @DeleteMapping("/api/worker/delete/{workerId}")
    CommonResponse deleteWorkerProfile(@PathVariable String workerId);
}