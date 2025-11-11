package com.smartcity.worker_service.client;

import com.smartcity.worker_service.model.CommonResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "complaint-service")
public interface ComplaintClient {

    @GetMapping("api/complaint/get-all")
    ResponseEntity<CommonResponse> getAllComplaints();

    @PutMapping("api/complaint/update-status/{complaintId}")
    void updateComplaintStatus(@PathVariable("complaintId") String complaintId, @RequestParam("status") String status);
}