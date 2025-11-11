package com.fullstack.smartcity_complaint.service.impl;

import com.fullstack.smartcity_complaint.entity.Complaint;
import com.fullstack.smartcity_complaint.model.CommonResponse;
import com.fullstack.smartcity_complaint.model.ResponseStatus;
import com.fullstack.smartcity_complaint.repository.ComplaintRepository;
import com.fullstack.smartcity_complaint.request.CreateComplaintRequest;
import com.fullstack.smartcity_complaint.request.UpdateComplaintRequest;
import com.fullstack.smartcity_complaint.response.CreateComplaintResponse;
import com.fullstack.smartcity_complaint.service.IComplaintService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class ComplaintServiceImpl implements IComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Override
    public CommonResponse createComplaint(HttpServletRequest request, CreateComplaintRequest complaintRequest) {
        CommonResponse response = new CommonResponse();
        if (complaintRequest.getTitle() == null || complaintRequest.getTitle().trim().isEmpty()) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Title is required");
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }
        if (complaintRequest.getDescription() == null || complaintRequest.getDescription().trim().isEmpty()) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Description is required");
            response.setStatusCode(HttpStatus.BAD_REQUEST.value());
            return response;
        }
        String imageBase64 = null;
        if (complaintRequest.getImage() != null && !complaintRequest.getImage().isEmpty()) {
            try {
                String extension = StringUtils.getFilenameExtension(complaintRequest.getImage().getOriginalFilename());
                imageBase64 = "data:image/" + extension + ";base64," + Base64.getEncoder().encodeToString(complaintRequest.getImage().getBytes());
            } catch (Exception e) {
                System.out.println(e);
            }
        }
        Claims claims = (Claims) request.getAttribute("userClaims");
        Complaint complaint = toEntity(complaintRequest);
        complaint.setUserId(claims.get("userId", String.class));
        complaint.setImageBase64(imageBase64);
        complaint.setStatus("NOT ASSIGNED");
        complaint.setCreatedOn(new Date());
        complaintRepository.save(complaint);
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Complaint Created Successfully");
        response.setData(toDTO(complaint));
        response.setStatus(HttpStatus.CREATED);
        response.setStatusCode(HttpStatus.CREATED.value());
        return response;
    }

    @Override
    public CommonResponse getAllComplaints() {
        CommonResponse response = new CommonResponse();
        List<Complaint> complaints = complaintRepository.getAllComplaints();
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Complaints Retrieved Successfully");
        List<CreateComplaintResponse> dtos =complaints.stream().map(this::toDTO).toList();
        response.setData(dtos);
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    @Override
    public CommonResponse getComplaintById(String complaintId) {
        CommonResponse response = new CommonResponse();
        Optional<Complaint> complaintOpt = Optional.ofNullable(complaintRepository.getComplaintById(complaintId));
        if (complaintOpt.isEmpty()) {
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Complaint not found");
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Complaint retrieved successfully");
        response.setData(toDTO(complaintOpt.get()));
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    @Override
    public CommonResponse updateComplaint(String complaintId, UpdateComplaintRequest complaintRequest) {
        CommonResponse response = new CommonResponse();
        Optional<Complaint> optionalComplaint = Optional.ofNullable(complaintRepository.getComplaintById(complaintId));
        if (optionalComplaint.isEmpty()) {
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Complaint not found");
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        Complaint complaint = optionalComplaint.get();
        if (complaintRequest.getTitle() != null && !complaintRequest.getTitle().trim().isEmpty()) {
            complaint.setTitle(complaintRequest.getTitle());
        }
        if (complaintRequest.getDescription() != null && !complaintRequest.getDescription().trim().isEmpty()) {
            complaint.setDescription(complaintRequest.getDescription());
        }
        complaintRepository.save(complaint);
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Complaint Updated Successfully");
        response.setData(toDTO(complaint));
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    @Override
    public CommonResponse updateComplaintStatus(String complaintId, String status){
        CommonResponse response = new CommonResponse();
        Optional<Complaint> optionalComplaint = Optional.ofNullable(complaintRepository.getComplaintById(complaintId));
        if (optionalComplaint.isEmpty()) {
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Complaint not found");
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        Complaint complaint = optionalComplaint.get();
        complaint.setStatus(status);
        complaintRepository.save(complaint);
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Complaint Updated Successfully");
        response.setData(toDTO(complaint));
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    @Override
    public CommonResponse deleteComplaint(String complaintId) {
        CommonResponse response = new CommonResponse();
        Optional<Complaint> optionalComplaint = Optional.ofNullable(complaintRepository.getComplaintById(complaintId));
        if (optionalComplaint.isEmpty()) {
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Complaint not found");
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        complaintRepository.deleteComplaintById(complaintId);
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Complaint Deleted Successfully");
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    public CommonResponse getComplaintsByUserId(String userId){
        CommonResponse response = new CommonResponse();
        List<Complaint> optionalComplaint = complaintRepository.findByUserId(userId);
        if (optionalComplaint.isEmpty()) {
            response.setStatus(HttpStatus.NOT_FOUND);
            response.setResponseStatus(ResponseStatus.FAILED);
            response.setMessage("Complaint not found");
            response.setStatusCode(HttpStatus.NOT_FOUND.value());
            return response;
        }
        response.setResponseStatus(ResponseStatus.SUCCESS);
        response.setMessage("Complaints Retrieved Successfully");
        List<CreateComplaintResponse> dtos = optionalComplaint.stream().map(this::toDTO).toList();
        response.setData(dtos);
        response.setStatus(HttpStatus.OK);
        response.setStatusCode(HttpStatus.OK.value());
        return response;
    }

    private Complaint toEntity(CreateComplaintRequest complaintRequest){
        Complaint complaint = new Complaint();
        complaint.setTitle(complaintRequest.getTitle());
        complaint.setDescription(complaintRequest.getDescription());
        return complaint;
    }

    private CreateComplaintResponse toDTO(Complaint complaint){
        CreateComplaintResponse complaintResponse = new CreateComplaintResponse();
        complaintResponse.setId(complaint.getId());
        complaintResponse.setUserId(complaint.getUserId());
        complaintResponse.setImageBase64(complaint.getImageBase64());
        complaintResponse.setTitle(complaint.getTitle());
        complaintResponse.setDescription(complaint.getDescription());
        complaintResponse.setStatus(complaint.getStatus());
        complaintResponse.setCreateOn(complaint.getCreatedOn());
        return complaintResponse;
    }
}
