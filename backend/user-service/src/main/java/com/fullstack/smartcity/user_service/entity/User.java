package com.fullstack.smartcity.user_service.entity;

import com.fullstack.smartcity.user_service.model.UserRole;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String password;
    private UserRole role;
    private Date createdOn;
    private Date updatedOn;
}