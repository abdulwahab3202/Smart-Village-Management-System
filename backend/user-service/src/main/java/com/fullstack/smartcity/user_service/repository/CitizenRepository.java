package com.fullstack.smartcity.user_service.repository;

import com.fullstack.smartcity.user_service.entity.Citizen;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CitizenRepository {

    @Autowired
    private MongoTemplate mongoTemplate;

    public void save(Citizen citizen) {
        mongoTemplate.save(citizen);
    }

    public List<Citizen> getAllCitizens(){return mongoTemplate.findAll(Citizen.class);}

    public Citizen findByUserId(String userId) {
        Query query = new Query(Criteria.where("userId").is(userId));
        return mongoTemplate.findOne(query,Citizen.class);
    }

    public void deleteByUserId(String userId) {
        Citizen citizen = findByUserId(userId);
        if(citizen != null){
            mongoTemplate.remove(citizen);
        }
    }
}