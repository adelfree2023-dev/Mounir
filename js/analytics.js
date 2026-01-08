// ============================================
// 📊 UNIVERSAL ANALYTICS ENGINE - REBUILT
// ============================================

const UniversalAnalytics = {
    currentSchema: 'sales', // Default
    rawData: [],
    filteredData: [],
    startDate: null,
    endDate: null,

    // ========================================
    // 1. INITIALIZATION
    // ========================================
    init: function () {
        console.log('🚀 Initializing Universal Analytics...');
        this.loadSchemaData();
        this.setupEventListeners();
        this.setDefaultDateRange();
        this.renderAll();
    },

    loadSchemaData: function () {
        const key = `data_${this.currentSchema}`;
        this.rawData = JSON.parse(localStorage.getItem(key)) || [];
        this.filteredData = [...this.rawData];

        console.log(`📂 Loaded ${this.rawData.length} records from ${key}`);

        // Update record count display
        const badge = document.getElementById('recordCount');
        if (badge) badge.textContent = this.rawData.length;
    },

    // ========================================
    // 2. DATE FILTERING
    // ========================================
    setDefaultDateRange: function () {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        this.startDate = oneYearAgo.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];

        document.getElementById('startDate').value = this.startDate;
        document.getElementById('endDate').value = this.endDate;
    },

    setQuickFilter: function (period) {
        const today = new Date();
        const start = new Date();

        switch (period) {
            case 'last30':
                start.setDate(today.getDate() - 30);
                break;
            case 'last90':
                start.setDate(today.getDate() - 90);
                break;
            case 'thisYear':
                start.setMonth(0, 1);
                break;
            case 'lastYear':
                start.setFullYear(today.getFullYear() - 1, 0, 1);
                today.setFullYear(today.getFullYear() - 1, 11, 31);
                break;
        }

        this.startDate = start.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];

        document.getElementById('startDate').value = this.startDate;
        document.getElementById('endDate').value = this.endDate;

        this.applyFilters();
    },

    applyFilters: function () {
        this.startDate = document.getElementById('startDate').value;
        this.endDate = document.getElementById('endDate').value;

        this.filteredData = this.rawData.filter(record => {
            const recordDate = record.orderDate || record.date || record.createdAt;
            if (!recordDate) return true; // Include if no date

            return recordDate >= this.startDate && recordDate <= this.endDate;
        });

        console.log(`✅ Filtered to ${this.filteredData.length} records`);

        this.renderAll();
        this.updateFilterDisplay();
    },

    resetFilters: function () {
        this.setDefaultDateRange();
        this.applyFilters();
    },

    updateFilterDisplay: function () {
        const display = document.getElementById('activeFilterDisplay');
        if (display) {
            display.textContent = `عرض ${this.filteredData.length} سجل من ${this.startDate} إلى ${this.endDate}`;
        }
    },

    // ========================================
    // 3. KPI CALCULATIONS
    // ========================================
    calculateKPIs: function () {
        const data = this.filteredData;

        const totalSales = data.reduce((sum, r) => sum + (parseFloat(r.netSales) || 0), 0);
        const totalProfit = data.reduce((sum, r) => sum + (parseFloat(r.profit) || 0), 0);
        const totalOrders = data.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        const avgProfitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

        const discounts = data.map(r => parseFloat(r.discountPercent) || 0);
        const avgDiscount = discounts.length > 0
            ? discounts.reduce((a, b) => a + b, 0) / discounts.length
            : 0;

        return {
            totalSales,
            totalProfit,
            totalOrders,
            avgOrderValue,
            avgProfitMargin,
            avgDiscount
        };
    },

    updateKPIs: function () {
        const kpis = this.calculateKPIs();

        document.getElementById('totalSales').textContent = `$${kpis.totalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        document.getElementById('totalProfit').textContent = `$${kpis.totalProfit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        document.getElementById('totalOrders').textContent = kpis.totalOrders.toLocaleString();
        document.getElementById('avgOrderValue').textContent = `$${kpis.avgOrderValue.toFixed(2)}`;
        document.getElementById('avgProfitMargin').textContent = `${kpis.avgProfitMargin.toFixed(2)}%`;
        document.getElementById('avgDiscount').textContent = `${kpis.avgDiscount.toFixed(2)}%`;
    },

    // ========================================
    // 4. ADVANCED STATISTICS
    // ========================================
    calculateAdvancedStats: function () {
        const data = this.filteredData;
        if (data.length === 0) return;

        const sales = data.map(r => parseFloat(r.netSales) || 0);

        // Growth Rate
        const firstHalf = sales.slice(0, Math.floor(sales.length / 2));
        const secondHalf = sales.slice(Math.floor(sales.length / 2));
        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const growthRate = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;

        // Standard Deviation
        const mean = sales.reduce((a, b) => a + b, 0) / sales.length;
        const variance = sales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sales.length;
        const stdDev = Math.sqrt(variance);

        // Median
        const sorted = [...sales].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];

        // Trend
        const trend = growthRate > 5 ? '📈 صاعد' : growthRate < -5 ? '📉 هابط' : '➡️ مستقر';

        document.getElementById('growthRate').textContent = `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(2)}%`;
        document.getElementById('stdDeviation').textContent = `$${stdDev.toFixed(2)}`;
        document.getElementById('medianSales').textContent = `$${median.toFixed(2)}`;
        document.getElementById('trendDirection').textContent = trend;
    },

    // ========================================
    // 5. CHART: SALES TREND
    // ========================================
    renderSalesTrend: function () {
        const ctx = document.getElementById('salesTrendChart');
        if (!ctx) return;

        // Group by month
        const monthlyData = {};
        this.filteredData.forEach(record => {
            const date = record.orderDate || record.date;
            if (!date) return;

            const month = date.substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = { sales: 0, profit: 0 };
            }
            monthlyData[month].sales += parseFloat(record.netSales) || 0;
            monthlyData[month].profit += parseFloat(record.profit) || 0;
        });

        const months = Object.keys(monthlyData).sort();
        const salesData = months.map(m => monthlyData[m].sales);
        const profitData = months.map(m => monthlyData[m].profit);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'المبيعات',
                        data: salesData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'الأرباح',
                        data: profitData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                }
            }
        });
    },

    // ========================================
    // 6. CHART: PRODUCT BREAKDOWN
    // ========================================
    renderProductChart: function () {
        const ctx = document.getElementById('productChart');
        if (!ctx) return;

        const productData = {};
        this.filteredData.forEach(record => {
            const product = record.productCategory || record.productName || 'Unknown';
            productData[product] = (productData[product] || 0) + (parseFloat(record.netSales) || 0);
        });

        const products = Object.keys(productData);
        const sales = Object.values(productData);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: products,
                datasets: [{
                    data: sales,
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                        '#ec4899', '#14b8a6', '#f97316'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
    },

    // ========================================
    // 7. CHART: REGION BREAKDOWN
    // ========================================
    renderRegionChart: function () {
        const ctx = document.getElementById('regionChart');
        if (!ctx) return;

        const regionData = {};
        this.filteredData.forEach(record => {
            const region = record.region || 'Unknown';
            regionData[region] = (regionData[region] || 0) + (parseFloat(record.netSales) || 0);
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(regionData),
                datasets: [{
                    label: 'المبيعات',
                    data: Object.values(regionData),
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y'
            }
        });
    },

    // ========================================
    // 8. CHART: CUSTOMER SEGMENTS
    // ========================================
    renderSegmentChart: function () {
        const ctx = document.getElementById('segmentChart');
        if (!ctx) return;

        const segmentData = {};
        this.filteredData.forEach(record => {
            const segment = record.customerSegment || 'Unknown';
            segmentData[segment] = (segmentData[segment] || 0) + (parseFloat(record.netSales) || 0);
        });

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(segmentData),
                datasets: [{
                    data: Object.values(segmentData),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },

    // ========================================
    // 9. CHART: SALES CHANNELS
    // ========================================
    renderChannelChart: function () {
        const ctx = document.getElementById('channelChart');
        if (!ctx) return;

        const channelData = {};
        this.filteredData.forEach(record => {
            const channel = record.salesChannel || 'Unknown';
            channelData[channel] = (channelData[channel] || 0) + (parseFloat(record.netSales) || 0);
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(channelData),
                datasets: [{
                    label: 'المبيعات',
                    data: Object.values(channelData),
                    backgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },

    // ========================================
    // 10. TOP PRODUCTS TABLE
    // ========================================
    renderTopProducts: function () {
        const productMap = {};

        this.filteredData.forEach(record => {
            const product = record.productName || 'Unknown';
            if (!productMap[product]) {
                productMap[product] = { sales: 0, profit: 0 };
            }
            productMap[product].sales += parseFloat(record.netSales) || 0;
            productMap[product].profit += parseFloat(record.profit) || 0;
        });

        const sorted = Object.entries(productMap)
            .sort((a, b) => b[1].sales - a[1].sales)
            .slice(0, 10);

        const tbody = document.querySelector('#topProductsTable tbody');
        if (!tbody) return;

        tbody.innerHTML = sorted.map((item, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${item[0]}</td>
                <td>$${item[1].sales.toFixed(2)}</td>
                <td>$${item[1].profit.toFixed(2)}</td>
            </tr>
        `).join('');
    },

    // ========================================
    // 11. TOP COUNTRIES TABLE
    // ========================================
    renderTopCountries: function () {
        const countryMap = {};

        this.filteredData.forEach(record => {
            const country = record.country || 'Unknown';
            if (!countryMap[country]) {
                countryMap[country] = { sales: 0, profit: 0 };
            }
            countryMap[country].sales += parseFloat(record.netSales) || 0;
            countryMap[country].profit += parseFloat(record.profit) || 0;
        });

        const sorted = Object.entries(countryMap)
            .sort((a, b) => b[1].sales - a[1].sales)
            .slice(0, 10);

        const tbody = document.querySelector('#topCountriesTable tbody');
        if (!tbody) return;

        tbody.innerHTML = sorted.map((item, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${item[0]}</td>
                <td>$${item[1].sales.toFixed(2)}</td>
                <td>$${item[1].profit.toFixed(2)}</td>
            </tr>
        `).join('');
    },

    // ========================================
    // 12. EVENT LISTENERS
    // ========================================
    setupEventListeners: function () {
        // Filter buttons are inline onclick in HTML
        console.log('✅ Event listeners ready');
    },

    // ========================================
    // 13. MASTER RENDER
    // ========================================
    renderAll: function () {
        console.log('🎨 Rendering all components...');

        // Destroy existing charts if any
        Chart.helpers.each(Chart.instances, function (instance) {
            instance.destroy();
        });

        this.updateKPIs();
        this.calculateAdvancedStats();
        this.renderSalesTrend();
        this.renderProductChart();
        this.renderRegionChart();
        this.renderSegmentChart();
        this.renderChannelChart();
        this.renderTopProducts();
        this.renderTopCountries();

        console.log('✅ All components rendered');
    }
};

// ============================================
// AUTO-INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    UniversalAnalytics.init();
});
