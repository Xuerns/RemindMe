package com.remindMe.demo.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {
    @Value("${JWT_SECRET}")
    private String secretKey;
    
    @Value("${JWT_EXPIRATION}")
    private long tokenExpiration;

    protected Key getSigningKey() {
        // Implementasi untuk mendapatkan signing key dari secretKey
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(String email) {
        return Jwts.builder()
            // set subject nya email, ini sebagai penanda tokennya punya siapa
            .setSubject(email)
            // set waktu kapan token dibuat
            .setIssuedAt(new Date())
            // Set kapan token akan expired
            .setExpiration(new Date(System.currentTimeMillis() + tokenExpiration))
            // Sign token dengan ini maka token tidak bisa dipalsukan
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            // Build tokennya
            .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}
