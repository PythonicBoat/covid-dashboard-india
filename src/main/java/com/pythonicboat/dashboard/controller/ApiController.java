package com.pythonicboat.dashboard.controller;

import com.pythonicboat.dashboard.service.MetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    @Autowired
    private MetricsService metricsService;

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        try {
            var metrics = metricsService.getCurrentMetrics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("metrics", metrics);
            response.put("lastUpdated", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            response.put("status", "success");
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/raw-data")
    public ResponseEntity<?> getRawData() {
        try {
            var rawData = metricsService.fetchExternalData();
            return ResponseEntity.ok(rawData);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to fetch external data", "message", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "online");
        status.put("uptime", System.currentTimeMillis());
        status.put("version", "1.0.0");
        status.put("user", "India COVID19 Live Dashboard");
        return ResponseEntity.ok(status);
    }
}