package com.fullstack.smartcity_complaint.service;

import com.fullstack.smartcity_complaint.model.CommonResponse;
import com.fullstack.smartcity_complaint.request.CreateComplaintRequest;
import com.fullstack.smartcity_complaint.request.UpdateComplaintRequest;
import jakarta.servlet.http.HttpServletRequest;

public interface IComplaintService {

    CommonResponse createComplaint(HttpServletRequest request, CreateComplaintRequest complaintRequest);

    CommonResponse getAllComplaints();

    CommonResponse getComplaintsByCategory(String workerCategory);

    CommonResponse getComplaintById(String complaintId);

    CommonResponse getComplaintsByUserId(String userId);

    CommonResponse updateComplaint(String complaintId, UpdateComplaintRequest complaintRequest);

    CommonResponse updateComplaintStatus(String complaintId, String status);

    CommonResponse deleteComplaint(String complaintId);

}
