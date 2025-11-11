package com.fullstack.smartcity_complaint.repository;

import com.fullstack.smartcity_complaint.entity.Complaint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ComplaintRepository {

    @Autowired
    private MongoTemplate mongoTemplate;

    public void save(Complaint complaint){
        mongoTemplate.save(complaint);
    }

    public List<Complaint> getAllComplaints(){
        return mongoTemplate.findAll(Complaint.class);
    }

    public Complaint getComplaintById(String id){
        return mongoTemplate.findById(id,Complaint.class);
    }

    public void deleteComplaintById(String id){
        Query query = new Query(Criteria.where("id").is(id));
        mongoTemplate.remove(query,Complaint.class);
    }

    public List<Complaint> findByUserId(String userId) {
        Query query = new Query(Criteria.where("userId").is(userId));
        return mongoTemplate.find(query, Complaint.class);
    }


}
