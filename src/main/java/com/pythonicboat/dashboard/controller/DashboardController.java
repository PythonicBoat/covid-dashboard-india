package com.pythonicboat.dashboard.controller;

import com.pythonicboat.dashboard.service.MetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
public class DashboardController {

    @Autowired
    private MetricsService metricsService;

    @GetMapping("/")
    public String dashboard(Model model) {
        var metrics = metricsService.getCurrentMetrics();
        
        model.addAttribute("metrics", metrics);
        model.addAttribute("lastUpdated", 
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        model.addAttribute("title", "India COVID19 Live Dashboard");
        model.addAttribute("currentUser", "India COVID19 Live Dashboard");
        
        return "dashboard";
    }

    @GetMapping("/health")
    public String health() {
        return "redirect:/actuator/health";
    }
}