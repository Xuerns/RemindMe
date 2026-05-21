package com.remindMe.demo.User.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class loginRequest {
    private String email;
    private String password;
}
