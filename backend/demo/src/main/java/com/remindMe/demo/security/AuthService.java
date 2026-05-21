package com.remindMe.demo.security;

import com.remindMe.demo.User.dto.loginRequest;
import com.remindMe.demo.User.dto.registerRequest;

public interface AuthService {
    public boolean register(registerRequest request);
    public String login(loginRequest request);
    public void logout();
    public boolean validateToken(String token);
} 
