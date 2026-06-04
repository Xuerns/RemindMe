package com.remindMe.demo.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class userController {

    @Autowired
    private userService userService;

    // GET PROFILE
    @GetMapping("/{id}")
    public userEntity getProfile(@PathVariable String id) {
        return userService.getUserProfile(id);
    }

    // GET PROFILE BY EMAIL
    @GetMapping("/by-email")
    public userEntity getProfileByEmail(@RequestParam String email) {
        return userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User dengan email " + email + " tidak ditemukan"));
    }

    // UPDATE PROFILE
    @PutMapping("/{id}")
    public userEntity updateProfile(
            @PathVariable String id,
            @RequestBody userEntity updatedUser) {

        return userService.updateUserProfile(id, updatedUser);
    }

    @GetMapping("/{id}/check")
    public ResponseEntity<?> checkVerifyPremium(@PathVariable String id) {
        try {
            boolean status = userService.checkVerifyPremium(id);
            return ResponseEntity.ok().body(status);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}