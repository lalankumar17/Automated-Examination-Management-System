package com.example.timetable.controller;

import com.example.timetable.model.User;
import com.example.timetable.repository.UserRepository;
import com.example.timetable.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("error", "Email already registered"));
        }
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("error", "Username already taken"));
        }

        // Hash the password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {

            User user = userOpt.get();
            // Generate 6-digit OTP
            String otp = String.format("%06d", new java.util.Random().nextInt(999999));
            user.setResetToken(otp);
            user.setTokenExpiry(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);

            emailService.sendPasswordResetEmail(email, otp);
        } else {

        }

        // Always return success to prevent email enumeration
        return ResponseEntity.ok(Map.of("message", "If an account exists, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String token = request.get("token");
        if (token != null) {
            token = token.replaceAll("\\s+", ""); // Strip any spaces from OTP
        }
        String newPassword = request.get("newPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (user.getResetToken() != null && user.getResetToken().equals(token)) {
                if (user.getTokenExpiry().isAfter(LocalDateTime.now())) {
                    // Hash new password
                    user.setPassword(passwordEncoder.encode(newPassword));
                    user.setResetToken(null);
                    user.setTokenExpiry(null);
                    userRepository.save(user);

                    return ResponseEntity.ok(Map.of("message", "Password reset successful."));
                } else {

                    return ResponseEntity.status(400)
                            .body(Map.of("error", "The code has expired. Please request a new one."));
                }
            } else {

                return ResponseEntity.status(400).body(Map.of("error", "Invalid verification code."));
            }
        } else {

            return ResponseEntity.status(400).body(Map.of("error", "No user found with this email."));
        }
    }

    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@RequestBody User updatedUser) {

        if (updatedUser.getId() == null) {

            return ResponseEntity.status(400).body(Map.of("error", "User ID is missing"));
        }

        Optional<User> userOpt = userRepository.findById(updatedUser.getId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Update allowed fields
            user.setName(updatedUser.getName());
            user.setDesignation(updatedUser.getDesignation());
            user.setDepartment(updatedUser.getDepartment());
            user.setPhoneNumber(updatedUser.getPhoneNumber());
            user.setUsername(updatedUser.getUsername());
            user.setProfilePicture(updatedUser.getProfilePicture());
            if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
                user.setEmail(updatedUser.getEmail());
            }
            user.setBio(updatedUser.getBio());
            user.setCoverPhoto(updatedUser.getCoverPhoto());

            userRepository.save(user);

            return ResponseEntity.ok(user);
        } else {

            return ResponseEntity.status(404).body(Map.of("error", "User not found in database"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByUsernameOrEmail(username, username);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.ok(userOpt.get());
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }
}
