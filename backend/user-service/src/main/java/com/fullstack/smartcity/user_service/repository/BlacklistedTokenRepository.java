package com.fullstack.smartcity.user_service.repository;

import com.fullstack.smartcity.user_service.entity.BlacklistedToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public class BlacklistedTokenRepository {

    @Autowired
    private MongoTemplate mongoTemplate;

    public void save(BlacklistedToken token) {
        mongoTemplate.save(token);
    }

    public boolean existsByToken(String token) {
        Query query = new Query(Criteria.where("token").is(token));
        return mongoTemplate.exists(query, BlacklistedToken.class);
    }
}
