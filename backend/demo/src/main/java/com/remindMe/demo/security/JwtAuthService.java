package com.remindMe.demo.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.remindMe.demo.User.userEntity;
import com.remindMe.demo.User.userRepository;
import com.remindMe.demo.User.dto.loginRequest;
import com.remindMe.demo.User.dto.loginResponse;
import com.remindMe.demo.User.dto.registerRequest;
import com.remindMe.demo.User.regularUser;

import io.jsonwebtoken.Jwts;


@Service
public class JwtAuthService implements AuthService {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private userRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private loginResponse  response;
    
    @Override
    public boolean register(registerRequest request) {
        // Implementasi pendaftaran pengguna baru
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
          throw new RuntimeException("Email sudah terdaftar");
        }

         regularUser newUser = new regularUser();
         newUser.setUsername(request.getUsername());
         newUser.setEmail(request.getEmail());
         newUser.setPassword(passwordEncoder.encode(request.getPassword()));

         userRepository.save(newUser);
         return true;
    }

    @Override
    public loginResponse login(loginRequest request) {
        // Ambil user berdasakan email, jika tidak ada maka kirim message user tidak ditemukan
        userEntity user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User tidak ditemukan"));
        // Cocokkan password yang dimasukkan dengan password yang disimpan di database, jika tidak cocok maka kirim message password salah
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Password salah, silahkan coba lagi");
        }

        String token = jwtUtils.generateToken(user.getEmail());

        response = new loginResponse();
        response.setToken(token);
        response.setId(user.getId());

        return response;
    }

    @Override
    public String logout() {
        // Jujur bingung mau apa, jadi kirim message aja
        return "Logout berhasil";
    }

    @Override
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(jwtUtils.getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
