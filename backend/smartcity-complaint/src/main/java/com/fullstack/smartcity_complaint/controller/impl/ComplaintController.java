package com.fullstack.smartcity_complaint.controller.impl;

import com.fullstack.smartcity_complaint.controller.IComplaintController;
import com.fullstack.smartcity_complaint.model.CommonResponse;
import com.fullstack.smartcity_complaint.model.ResponseStatus;
import com.fullstack.smartcity_complaint.request.CreateComplaintRequest;
import com.fullstack.smartcity_complaint.request.UpdateComplaintRequest;
import com.fullstack.smartcity_complaint.service.IComplaintService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("complaint")
@RestController
public class ComplaintController implements IComplaintController {

    @Autowired
    private IComplaintService complaintService;

    @Override
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<CommonResponse> createComplaint(HttpServletRequest request,
                                                          String title,
                                                          String description,
                                                          MultipartFile image) {
        try {
            // We create a request object here to keep the service layer clean
            CreateComplaintRequest complaintRequest = new CreateComplaintRequest(title, description, image);
            CommonResponse response = complaintService.createComplaint(request, complaintRequest);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Create Complaint");
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('CITIZEN','WORKER','ADMIN')")
    public ResponseEntity<CommonResponse> getAllComplaints() {
        try {
            CommonResponse response = complaintService.getAllComplaints();
            return ResponseEntity.status(response.getStatusCode()).body(response);
        } catch (Exception e) {
            return exceptionHandler(e, "Get Complaints");
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('CITIZEN','WORKER','ADMIN')")
    public ResponseEntity<CommonResponse> getComplaintById(String complaintId) {
        try{
            CommonResponse response = complaintService.getComplaintById(complaintId);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }catch (Exception e){
            return exceptionHandler(e, "Get Complaints By Id");
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('CITIZEN','ADMIN')")
    public ResponseEntity<CommonResponse> getComplaintsByUserId(String userId) {
        try{
            CommonResponse response = complaintService.getComplaintsByUserId(userId);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }catch (Exception e){
            return exceptionHandler(e, "Get Complaints By User Id");
        }
    }

    @Override
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<CommonResponse> updateComplaint(String complaintId, UpdateComplaintRequest complaintRequest) {
        try{
            CommonResponse response = complaintService.updateComplaint(complaintId,complaintRequest);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }catch (Exception e){
            return exceptionHandler(e, "Update Complaint");
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('WORKER','ADMIN')")
    public ResponseEntity<CommonResponse> updateComplaintStatus(String complaintId, String status) {
        try{
            CommonResponse response = complaintService.updateComplaintStatus(complaintId,status);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }catch (Exception e){
            return exceptionHandler(e, "Update Complaint Status");
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('CITIZEN','ADMIN')")
    public ResponseEntity<CommonResponse> deleteComplaint(String complaintId) {
        try{
            CommonResponse response = complaintService.deleteComplaint(complaintId);
            return ResponseEntity.status(response.getStatusCode()).body(response);
        }catch (Exception e){
            return exceptionHandler(e, "Delete Complaint");
        }
    }

    public ResponseEntity<CommonResponse> exceptionHandler(Exception ex, String contextMessage) {
        CommonResponse response = new CommonResponse();
        response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.setResponseStatus(ResponseStatus.FAILED);
        response.setMessage("Internal Server Error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
