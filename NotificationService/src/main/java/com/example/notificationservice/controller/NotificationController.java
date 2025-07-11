package com.example.notificationservice.controller;

import com.example.notificationservice.dto.NotificationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody NotificationRequest request) {
        log.info("Sending notification to: {}", request.getEmail());
        log.debug("Notification message: {}", request.getMessage());

        return ResponseEntity.ok("Notification sent to " + request.getEmail());
    }
}
