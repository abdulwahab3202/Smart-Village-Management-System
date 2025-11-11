package com.smartcity.worker_service.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "work_assignments")
public class WorkAssignment {
    @Id
    private String assignmentId;
    private String complaintId;
    private String workerId;
    private String status;
    private int creditPoints;
    private Date assignedOn;
    private Date completedOn;
}
