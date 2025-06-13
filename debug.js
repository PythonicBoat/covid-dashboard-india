// Debug script to test COVID Dashboard API
console.log('🚀 Debug script starting...');

const API_BASE_URL = 'https://pythonicboat.github.io/covid-dashboard-india';

async function debugLoadMetrics() {
    try {
        console.log('📊 Testing metrics load...');
        console.log('🌐 API Base URL:', API_BASE_URL);
        
        const url = `${API_BASE_URL}/metrics.json`;
        console.log('📡 Fetching from:', url);
        
        const response = await fetch(url);
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Data received:', data);
        
        if (data.status === 'success') {
            console.log('✅ Data is valid');
            console.log('📈 Total Cases:', data.metrics.totalCases);
            console.log('⚠️ Active Cases:', data.metrics.activeCases);
            console.log('🕒 Last Updated:', data.lastUpdated);
        } else {
            console.log('❌ Data status not success:', data.status);
        }
        
        return data;
        
    } catch (error) {
        console.error('❌ Error in debugLoadMetrics:', error);
        throw error;
    }
}

// Test the hostname detection
console.log('🌐 Current hostname:', window.location.hostname);
console.log('🔍 Is GitHub Pages?', window.location.hostname.includes('github.io'));

// Run the test
debugLoadMetrics()
    .then(data => {
        console.log('🎉 Test completed successfully!');
        
        // Try to update a metric element if it exists
        const testElement = document.getElementById('totalCasesChange');
        if (testElement) {
            testElement.textContent = data.metrics.totalCasesChange || 'No data';
            console.log('📝 Updated test element');
        } else {
            console.log('⚠️ Test element not found');
        }
    })
    .catch(error => {
        console.error('💥 Test failed:', error);
    });
