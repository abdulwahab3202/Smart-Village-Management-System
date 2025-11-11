package com.smartcity.worker_service.repository;

import com.smartcity.worker_service.entity.WorkAssignment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class WorkAssignmentRepository {

    @Autowired
    private MongoTemplate mongoTemplate;

    public WorkAssignment save(WorkAssignment assignment) {
        return mongoTemplate.save(assignment);
    }

    public WorkAssignment findById(String assignmentId) {
        return mongoTemplate.findById(assignmentId, WorkAssignment.class);
    }

    public List<WorkAssignment> findAll() {
        return mongoTemplate.findAll(WorkAssignment.class);
    }

    public void deleteById(String assignmentId) {
        Query query = new Query(Criteria.where("assignmentId").is(assignmentId));
        mongoTemplate.remove(query, WorkAssignment.class);
    }

    public List<WorkAssignment> findAssignmentsByWorkerId(String workerId) {
        Query query = new Query(Criteria.where("workerId").is(workerId));
        return mongoTemplate.find(query, WorkAssignment.class);
    }

    public WorkAssignment findByComplaintId(String complaintId) {
        Query query = new Query(Criteria.where("complaintId").is(complaintId));
        return mongoTemplate.findOne(query, WorkAssignment.class);
    }

//    public List<WorkAssignment> findByStatus(String status) {
//        Query query = new Query(Criteria.where("status").is(status));
//        return mongoTemplate.find(query, WorkAssignment.class);
//    }

//    public List<WorkAssignment> findUnassignedTasks() {
//        Query query = new Query(Criteria.where("status").is("UNASSIGNED"));
//        return mongoTemplate.find(query, WorkAssignment.class);
//    }
}
