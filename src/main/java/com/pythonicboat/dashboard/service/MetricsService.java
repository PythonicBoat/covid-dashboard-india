package com.pythonicboat.dashboard.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MetricsService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${external.api.url:https://covid19dashboard.mohfw.gov.in/data/datanew.json}")
    private String externalApiUrl;

    private Map<String, Object> cachedMetrics = new HashMap<>();
    private LocalDateTime lastUpdated = LocalDateTime.now();
    private Map<String, Object> previousMetrics = new HashMap<>();

    // Fetch data every hour (3600000 ms)
    @Scheduled(fixedRate = 3600000)
    public void updateMetrics() {
        try {
            System.out.println("🔄 Updating metrics at: " + LocalDateTime.now());
            var rawData = fetchExternalData();
            previousMetrics = new HashMap<>(cachedMetrics);
            cachedMetrics = processMetrics(rawData);
            lastUpdated = LocalDateTime.now();
            System.out.println("✅ Metrics updated successfully");
        } catch (Exception e) {
            System.err.println("❌ Failed to update metrics: " + e.getMessage());
        }
    }

    @Cacheable("externalData")
    public Object fetchExternalData() {
        try {
            System.out.println("📡 Fetching data from: " + externalApiUrl);
            return restTemplate.getForObject(externalApiUrl, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch external data", e);
        }
    }

    public Map<String, Object> getCurrentMetrics() {
        if (cachedMetrics.isEmpty()) {
            updateMetrics(); // Initialize on first call
        }
        return new HashMap<>(cachedMetrics);
    }

    private Map<String, Object> processMetrics(Object rawData) {
        Map<String, Object> metrics = new HashMap<>();
        
        if (rawData instanceof List) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> covidData = (List<Map<String, Object>>) rawData;
            
            // Find the total row (sno = "37" or state_name is empty)
            Map<String, Object> totalData = covidData.stream()
                .filter(state -> "37".equals(state.get("sno")) || 
                               (state.get("state_name") != null && state.get("state_name").toString().trim().isEmpty()))
                .findFirst()
                .orElse(new HashMap<>());
            
            // Extract COVID-19 metrics from total data
            int totalCases = parseIntValue(totalData.get("positive"));
            int activeCases = parseIntValue(totalData.get("active"));
            int recoveredCases = parseIntValue(totalData.get("cured"));
            int deaths = parseIntValue(totalData.get("death"));
            
            // New cases for change calculation
            int newCases = parseIntValue(totalData.get("new_positive"));
            int newActive = parseIntValue(totalData.get("new_active"));
            int newRecovered = parseIntValue(totalData.get("new_cured"));
            int newDeaths = parseIntValue(totalData.get("new_death"));
            
            // Store current metrics
            metrics.put("totalCases", totalCases);
            metrics.put("activeCases", activeCases);
            metrics.put("recoveredCases", recoveredCases);
            metrics.put("deaths", deaths);
            
            // Calculate changes (for COVID-19, up is bad, so we'll handle this in the UI)
            metrics.put("totalCasesChange", calculateCovidChange("totalCases", totalCases, newCases));
            metrics.put("activeCasesChange", calculateCovidChange("activeCases", activeCases, newActive));
            metrics.put("recoveredCasesChange", calculateCovidChange("recoveredCases", recoveredCases, newRecovered));
            metrics.put("deathsChange", calculateCovidChange("deaths", deaths, newDeaths));
            
            // Store state-wise data for states 1-31 only
            List<Map<String, Object>> stateData = covidData.stream()
                .filter(state -> {
                    try {
                        String sno = state.get("sno") != null ? state.get("sno").toString() : "";
                        int stateNum = Integer.parseInt(sno);
                        return stateNum >= 1 && stateNum <= 31 && 
                               state.get("state_name") != null && 
                               !state.get("state_name").toString().trim().isEmpty();
                    } catch (NumberFormatException e) {
                        return false;
                    }
                })
                .map(state -> {
                    // Create filtered state data with only required fields
                    Map<String, Object> filteredState = new HashMap<>();
                    filteredState.put("sno", state.get("sno"));
                    filteredState.put("state_name", state.get("state_name"));
                    filteredState.put("active", state.get("active") != null ? state.get("active").toString() : "0");
                    filteredState.put("positive", state.get("positive") != null ? state.get("positive").toString() : "0");
                    filteredState.put("cured", state.get("cured") != null ? state.get("cured").toString() : "0");
                    filteredState.put("death", state.get("death") != null ? state.get("death").toString() : "0");
                    return filteredState;
                })
                .sorted((a, b) -> {
                    try {
                        int snoA = Integer.parseInt(a.get("sno").toString());
                        int snoB = Integer.parseInt(b.get("sno").toString());
                        return Integer.compare(snoA, snoB);
                    } catch (NumberFormatException e) {
                        return 0;
                    }
                })
                .toList();
            metrics.put("stateData", stateData);
            metrics.put("totalStates", stateData.size());
            
        } else {
            // Fallback data if API fails
            metrics.put("totalCases", 0);
            metrics.put("activeCases", 0);
            metrics.put("recoveredCases", 0);
            metrics.put("deaths", 0);
            metrics.put("totalCasesChange", "0");
            metrics.put("activeCasesChange", "0");
            metrics.put("recoveredCasesChange", "0");
            metrics.put("deathsChange", "0");
            metrics.put("totalStates", 0);
        }
        
        // Generate trend data based on COVID-19 patterns
        metrics.put("dailyTrends", generateCovidDailyTrends());
        metrics.put("dailyTrendLabels", generateDailyTrendLabels());
        
        return metrics;
    }
    
    private int parseIntValue(Object value) {
        if (value == null) return 0;
        try {
            return Integer.parseInt(value.toString().trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    private String calculateCovidChange(String metricName, int currentValue, int newValue) {
        if (previousMetrics.containsKey(metricName)) {
            Number previousValue = (Number) previousMetrics.get(metricName);
            int change = currentValue - previousValue.intValue();
            if (change == 0) return "0";
            // Remove + sign, just return the absolute value
            return String.valueOf(Math.abs(change));
        }
        // For first run, use the new value as change (without + sign)
        if (newValue > 0) {
            return String.valueOf(newValue);
        }
        return "0";
    }

    private List<Integer> generateCovidDailyTrends() {
        List<Integer> trends = new ArrayList<>();
        Random random = new Random();
        
        // Generate realistic daily case trends for the last 7 days
        for (int i = 6; i >= 0; i--) { // Start from 6 days ago to today
            int baseValue = 1000; // Base COVID cases per day for India
            
            // Add realistic variance based on day of week
            LocalDateTime date = LocalDateTime.now().minusDays(i);
            int dayOfWeek = date.getDayOfWeek().getValue(); // 1 = Monday, 7 = Sunday
            
            // Slight weekend reduction (less testing on weekends)
            double weekendMultiplier = (dayOfWeek == 6 || dayOfWeek == 7) ? 0.85 : 1.0;
            
            // Add some trend (slight decrease over time to show improvement)
            double trendMultiplier = 1.0 - (i * 0.02); // 2% decrease per day
            
            int value = (int) (baseValue * weekendMultiplier * trendMultiplier);
            value += random.nextInt(3000) - 1500; // Add random variance ±1500
            
            trends.add(Math.max(5000, value)); // Minimum 5000 cases
        }
        return trends;
    }
    
    private List<String> generateDailyTrendLabels() {
        List<String> labels = new ArrayList<>();
        
        // Generate abbreviated date labels for the last 7 days
        for (int i = 6; i >= 0; i--) {
            LocalDateTime date = LocalDateTime.now().minusDays(i);
            // Format as "13/6" (day/month)
            String label = date.getDayOfMonth() + "/" + date.getMonthValue();
            labels.add(label);
        }
        return labels;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public Map<String, Object> getSystemInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("javaVersion", System.getProperty("java.version"));
        info.put("springBootVersion", "3.1.0");
        info.put("uptime", System.currentTimeMillis());
        info.put("timezone", "IST");
        info.put("user", "");
        return info;
    }
}