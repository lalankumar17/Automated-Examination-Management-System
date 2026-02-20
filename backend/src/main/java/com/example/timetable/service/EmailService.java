package com.example.timetable.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:your-email@gmail.com}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        if (mailSender == null) {
            logger.warn("⚠ MailSender not configured. Email to {} suppressed.", to);
            logger.info("Subject: {}", subject);
            logger.info("Body: {}", body);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
            logger.info("✓ Password reset email sent to: {}", to);

            // In production, we should not log the link, but for dev it helps.
            // Using debug level so it can be turned off.
            logger.debug("\n--- DEVELOPMENT MODE: Reset Link Found Below ---");
            logger.debug("Subject: {}", subject);
            logger.debug("Body: {}", body);
            logger.debug("-----------------------------------------------\n");
        } catch (Exception e) {
            logger.warn("⚠ Failed to send real email: {}", e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String email, String otp) {
        String subject = "Password Reset OTP - AEMS";
        String body = "You requested a password reset. Your 6-digit OTP is:\n\n" +
                otp + "\n\n" +
                "This OTP will expire in 10 minutes.";
        sendEmail(email, subject, body);
    }
}
