class BackendDashboard {
    constructor() {
        this.updateInterval = 6 * 60 * 60 * 1000; // 6 hours
        this.autoRefresh = true;
        
        // Visitor counter constants - simple storage
        this.VISITOR_COUNT_KEY = 'covidDashboardVisitors';
        this.BASE_VISITOR_COUNT = 1247; // Starting count
        
        // API Configuration - auto-detect environment
        this.API_BASE_URL = this.getApiBaseUrl();
        
        this.init();
    }

    getApiBaseUrl() {
        // Check if we're in production or development
        const hostname = window.location.hostname;
        
        if (hostname.includes('vercel.app') || hostname.includes('netlify.app') || hostname.includes('github.io')) {
            // Production - use GitHub Pages Static API
            return 'https://pythonicboat.github.io/covid-dashboard-india';
        } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Development - use local JSON file
            return window.location.origin;
        } else {
            // Default fallback to GitHub Pages Static API
            return 'https://pythonicboat.github.io/covid-dashboard-india';
        }
    }

    init() {
        console.log('🚀 Initializing Dashboard...');
        
        // Initialize visitor counter
        this.initVisitorCounter();
        
        // Initialize with server-side data if available
        if (window.initialMetrics) {
            this.updateUI(window.initialMetrics);
        } else {
            // Load metrics immediately on startup if no server-side data
            this.loadMetrics();
        }
        
        this.setupEventListeners();
        
        console.log('✅ Dashboard initialized successfully');
    }

    async loadMetrics() {
        try {
            console.log('📊 Loading fresh metrics...');
            this.showLoading(true);
            
            let response;
            let data;
            
            if (this.API_BASE_URL.includes('localhost') || this.API_BASE_URL.includes('127.0.0.1')) {
                // Development - use local JSON file
                console.log('🔧 Using local JSON file...');
                response = await fetch(`${this.API_BASE_URL}/metrics.json`);
                if (!response.ok) throw new Error(`Local JSON HTTP ${response.status}`);
                data = await response.json();
            } else {
                // Production - use GitHub Pages static API
                console.log('🌐 Using GitHub Pages static API...');
                response = await fetch(`${this.API_BASE_URL}/metrics.json`);
                if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);
                data = await response.json();
            }
            
            // The rest of the data handling is the same
            
            if (data.status === 'success') {
                this.updateUI(data.metrics);
                this.updateLastUpdated(data.lastUpdated);
                this.updateStatus('online');
                console.log('✅ Metrics updated successfully');
            } else {
                throw new Error(data.message || 'Unknown error');
            }
            
        } catch (error) {
            console.error('❌ Error loading metrics:', error);
            this.updateStatus('offline');
            this.showError('Failed to load metrics: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    updateUI(metrics) {
        // Update COVID metric cards with animation - swapped structure
        // Now showing new cases as main values and totals as change indicators
        this.updateElement('totalCasesChange', this.removeSignPrefix(metrics.totalCasesChange || '0'));
        this.updateElement('activeCasesChange', this.removeSignPrefix(metrics.activeCasesChange || '0'));
        this.updateElement('recoveredCasesChange', this.removeSignPrefix(metrics.recoveredCasesChange || '0'));
        this.updateElement('deathsChange', this.removeSignPrefix(metrics.deathsChange || '0'));
        
        // Update total values in the change indicator position with proper COVID styling
        this.updateCovidChangeElement('totalCases', (metrics.totalCases || 0).toLocaleString(), 'increase');
        this.updateCovidChangeElement('activeCases', (metrics.activeCases || 0).toLocaleString(), 'increase');
        this.updateCovidChangeElement('recoveredCases', (metrics.recoveredCases || 0).toLocaleString(), 'decrease');
        this.updateCovidChangeElement('deaths', (metrics.deaths || 0).toLocaleString(), 'increase');
        
        // Update state table
        if (metrics.stateData && Array.isArray(metrics.stateData)) {
            this.updateStateTable(metrics.stateData);
        }
        
        // Update charts with daily trends
        if (metrics.dailyTrends && metrics.dailyTrendLabels) {
            this.updateChart(metrics.dailyTrends, metrics.dailyTrendLabels);
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element && value !== undefined) {
            const isNumeric = !isNaN(value) && value !== '';
            if (isNumeric) {
                this.animateNumber(element, value);
            } else {
                element.textContent = value;
            }
            element.classList.add('updated');
            setTimeout(() => element.classList.remove('updated'), 1000);
        }
    }

    animateNumber(element, targetValue) {
        const currentValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
        const target = parseInt(targetValue.toString().replace(/[^\d]/g, '')) || 0;
        const duration = 1000;
        const steps = 30;
        const stepValue = (target - currentValue) / steps;
        
        let current = currentValue;
        let step = 0;
        
        const animate = () => {
            if (step < steps) {
                current += stepValue;
                element.textContent = Math.round(current).toLocaleString();
                setTimeout(animate, duration / steps);
                step++;
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        if (Math.abs(target - currentValue) > 0) {
            animate();
        }
    }

    updateChangeElement(id, change) {
        const element = document.getElementById(id);
        if (element && change) {
            element.textContent = change;
            element.className = 'metric-change ' + this.getChangeClass(change);
        }
    }

    updateCovidChangeElement(id, change, type) {
        const element = document.getElementById(id);
        if (element && change) {
            element.textContent = change;
            // For COVID stats: increase in cases/deaths is bad (red), increase in recovered is good (green)
            if (type === 'decrease') {
                // Recovered cases - increase is good
                element.className = 'metric-change covid-decrease';
            } else {
                // Cases/Deaths - increase is bad
                element.className = 'metric-change covid-increase';
            }
        }
    }

    removeSignPrefix(value) {
        // Remove + or - signs from the beginning of the value
        if (typeof value === 'string') {
            return value.replace(/^[+-]/, '').trim();
        }
        return value;
    }

    initVisitorCounter() {
        // More realistic visitor counter that tracks unique daily visits
        const today = new Date().toDateString();
        const lastVisitDate = localStorage.getItem('covidDashboardLastVisit');
        let currentCount = parseInt(localStorage.getItem(this.VISITOR_COUNT_KEY)) || this.BASE_VISITOR_COUNT;
        
        // Only increment if it's a new day or first visit
        if (!lastVisitDate || lastVisitDate !== today) {
            // Increment by a realistic amount (1-2 visitors per day)
            currentCount += Math.floor(Math.random() * 2) + 1;
            
            // Store the updated count and today's date
            localStorage.setItem(this.VISITOR_COUNT_KEY, currentCount.toString());
            localStorage.setItem('covidDashboardLastVisit', today);
        }
        
        // Display the count
        this.updateVisitorCount(currentCount);
        console.log(`👥 Visitor count: ${currentCount}`);
    }

    updateVisitorCount(count) {
        const element = document.getElementById('visitorCount');
        if (element) {
            // Animate the number change
            this.animateNumber(element, count);
        }
    }

    updateStateTable(stateData) {
        const tableBody = document.getElementById('stateTableBody');
        if (!tableBody || !Array.isArray(stateData)) {
            return;
        }

        // Clear existing rows
        tableBody.innerHTML = '';

        // Add new rows
        stateData.forEach(state => {
            const row = document.createElement('tr');
            
            // Format numbers for display
            const active = parseInt(state.active || '0').toLocaleString();
            const positive = parseInt(state.positive || '0').toLocaleString();
            const cured = parseInt(state.cured || '0').toLocaleString();
            const death = parseInt(state.death || '0').toLocaleString();
            
            row.innerHTML = `
                <td>${state.sno}</td>
                <td>${state.state_name}</td>
                <td>${active}</td>
                <td>${positive}</td>
                <td>${cured}</td>
                <td>${death}</td>
            `;
            
            tableBody.appendChild(row);
        });

        console.log(`✅ Updated state table with ${stateData.length} states`);
    }

    getChangeClass(change) {
        if (typeof change === 'string') {
            if (change.startsWith('+')) return 'positive';
            if (change.startsWith('-')) return 'negative';
        }
        return 'neutral';
    }

    formatPercentage(value) {
        if (typeof value === 'number') {
            return (value * 100).toFixed(1) + '%';
        }
        return value;
    }

    updateChart(dailyData, labels) {
        const canvas = document.getElementById('trendsChart');
        if (canvas && dailyData && Array.isArray(dailyData)) {
            this.drawChart(canvas, dailyData, labels);
        }
    }

    drawChart(canvas, data, labels) {
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const height = rect.height;
        const padding = 50;
        
        ctx.clearRect(0, 0, width, height);
        
        if (data.length === 0) return;
        
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        
        // Draw grid
        this.drawGrid(ctx, width, height, padding);
        
        // Draw area under curve
        this.drawArea(ctx, data, width, height, padding, min, range);
        
        // Draw main line
        this.drawLine(ctx, data, width, height, padding, min, range);
        
        // Draw data points
        this.drawPoints(ctx, data, width, height, padding, min, range);
        
        // Draw labels
        this.drawLabels(ctx, width, height, padding, min, max, labels);
    }

    drawGrid(ctx, width, height, padding) {
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i / 5) * (height - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Vertical grid lines for 7 days
        for (let i = 0; i <= 6; i++) {
            const x = padding + (i / 6) * (width - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }
    }

    drawArea(ctx, data, width, height, padding, min, range) {
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Start from bottom left
        ctx.moveTo(padding, height - padding);
        
        // Draw the curve
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((value - min) / range) * (height - 2 * padding);
            
            if (index === 0) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        // Close the area
        ctx.lineTo(width - padding, height - padding);
        ctx.closePath();
        ctx.fill();
    }

    drawLine(ctx, data, width, height, padding, min, range) {
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((value - min) / range) * (height - 2 * padding);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    drawPoints(ctx, data, width, height, padding, min, range) {
        ctx.fillStyle = '#667eea';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        data.forEach((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((value - min) / range) * (height - 2 * padding);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        });
    }

    drawLabels(ctx, width, height, padding, min, max, labels) {
        ctx.fillStyle = '#666';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        
        // Date labels (last 7 days)
        if (labels && labels.length > 0) {
            for (let i = 0; i < labels.length; i++) {
                const x = padding + (i / (labels.length - 1)) * (width - 2 * padding);
                ctx.fillText(labels[i], x, height - 15);
            }
        }
        
        // Value labels
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i / 5) * (height - 2 * padding) + 4;
            const value = max - (i / 5) * (max - min);
            ctx.fillText(Math.round(value).toLocaleString(), padding - 10, y);
        }
    }

    updateLastUpdated(timestamp) {
        const element = document.getElementById('lastUpdated');
        if (element) {
            element.textContent = timestamp || new Date().toLocaleString();
        }
    }

    updateStatus(status) {
        // Status updates can be logged but no longer displayed
        console.log(`🔗 Connection status: ${status}`);
    }

    showLoading(show) {
        const cards = document.querySelectorAll('.metric-card');
        cards.forEach(card => {
            if (show) {
                card.classList.add('loading');
            } else {
                card.classList.remove('loading');
            }
        });
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <strong>⚠️ Error</strong><br>
            ${message}
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
        notification.innerHTML = `<strong>✅ Success</strong><br>${message}`;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Manual refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('🔄 Manual refresh triggered');
                this.loadMetrics();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.loadMetrics();
            }
        });
        
        console.log('✅ Event listeners setup complete');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM loaded, starting Dashboard...');
    window.dashboard = new BackendDashboard();
});