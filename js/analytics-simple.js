// ============================================
// 📊 SIMPLE ANALYTICS ENGINE
// Clean, organized, < 300 lines
// ============================================

const Analytics = {
    allData: [],
    filteredData: [],
    charts: {},
    currentSchema: 'sales', // NEW: Track current schema

    // ========================================
    // 1. INITIALIZATION
    // ========================================
    init() {
        console.log('🚀 Analytics Loading...');
        this.loadData();
        this.setDefaultDates();
        this.renderAll();
        console.log(`✅ Loaded ${this.allData.length} records`);
    },

    loadData() {
        const key = `data_${this.currentSchema}`;
        this.allData = JSON.parse(localStorage.getItem(key)) || [];
        this.filteredData = [...this.allData];

        // Update record count
        const countEl = document.getElementById('recordCount');
        if (countEl) countEl.textContent = this.allData.length;
    },

    // NEW: Switch Schema
    switchSchema(schemaId) {
        this.currentSchema = schemaId;
        console.log(`🔄 Switching to ${schemaId}`);
        this.loadData();
        this.setDefaultDates();
        this.renderAll();
    },

    setDefaultDates() {
        const today = new Date();
        const monthAgo = new Date();
        monthAgo.setDate(today.getDate() - 30);

        document.getElementById('startDate').value = monthAgo.toISOString().split('T')[0];
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
    },

    // ========================================
    // 2. FILTERING
    // ========================================
    applyFilter() {
        const start = document.getElementById('startDate').value;
        const end = document.getElementById('endDate').value;

        this.filteredData = this.allData.filter(record => {
            const date = record.orderDate || record.date;
            return date >= start && date <= end;
        });

        console.log(`📊 Filtered to ${this.filteredData.length} records`);
        this.renderAll();
    },

    resetFilter() {
        this.setDefaultDates();
        this.applyFilter();
    },

    quickFilter(days) {
        const today = new Date();
        const past = new Date();
        past.setDate(today.getDate() - days);

        document.getElementById('startDate').value = past.toISOString().split('T')[0];
        document.getElementById('endDate').value = today.toISOString().split('T')[0];

        this.applyFilter();
    },

    // ========================================
    // 3. KPI CALCULATIONS
    // ========================================
    calculateKPIs() {
        const data = this.filteredData;

        const totalSales = data.reduce((sum, r) => sum + (parseFloat(r.netSales) || 0), 0);
        const totalProfit = data.reduce((sum, r) => sum + (parseFloat(r.profit) || 0), 0);
        const totalOrders = data.length;
        const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
        const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
        const avgDiscount = data.length > 0
            ? data.reduce((sum, r) => sum + (parseFloat(r.discountPercent) || 0), 0) / data.length
            : 0;

        return { totalSales, totalProfit, totalOrders, avgOrder, profitMargin, avgDiscount };
    },

    updateKPIs() {
        const kpis = this.calculateKPIs();

        document.getElementById('totalSales').textContent = `$${kpis.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('totalProfit').textContent = `$${kpis.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('totalOrders').textContent = kpis.totalOrders.toLocaleString();
        document.getElementById('avgOrder').textContent = `$${kpis.avgOrder.toFixed(2)}`;
        document.getElementById('profitMargin').textContent = `${kpis.profitMargin.toFixed(1)}%`;
        document.getElementById('avgDiscount').textContent = `${kpis.avgDiscount.toFixed(1)}%`;
    },

    // ========================================
    // 4. CHART: SALES TREND
    // ========================================
    renderSalesTrend() {
        const monthlyData = {};

        this.filteredData.forEach(record => {
            const month = (record.orderDate || '').substring(0, 7);
            if (!month) return;

            if (!monthlyData[month]) {
                monthlyData[month] = { sales: 0, profit: 0 };
            }
            monthlyData[month].sales += parseFloat(record.netSales) || 0;
            monthlyData[month].profit += parseFloat(record.profit) || 0;
        });

        const months = Object.keys(monthlyData).sort();
        const salesData = months.map(m => monthlyData[m].sales);
        const profitData = months.map(m => monthlyData[m].profit);

        if (this.charts.salesTrend) this.charts.salesTrend.destroy();

        this.charts.salesTrend = new Chart(document.getElementById('salesTrendChart'), {
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
                plugins: { legend: { display: true } }
            }
        });
    },

    // ========================================
    // 5. CHART: PRODUCTS
    // ========================================
    renderProductsChart() {
        const productData = {};

        this.filteredData.forEach(record => {
            const product = record.productCategory || 'Unknown';
            productData[product] = (productData[product] || 0) + (parseFloat(record.netSales) || 0);
        });

        if (this.charts.products) this.charts.products.destroy();

        this.charts.products = new Chart(document.getElementById('productsChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(productData),
                datasets: [{
                    data: Object.values(productData),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    // ========================================
    // 6. CHART: REGIONS
    // ========================================
    renderRegionsChart() {
        const regionData = {};

        this.filteredData.forEach(record => {
            const region = record.region || 'Unknown';
            regionData[region] = (regionData[region] || 0) + (parseFloat(record.netSales) || 0);
        });

        if (this.charts.regions) this.charts.regions.destroy();

        this.charts.regions = new Chart(document.getElementById('regionsChart'), {
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
    // 7. CHART: CHANNELS
    // ========================================
    renderChannelsChart() {
        const channelData = {};

        this.filteredData.forEach(record => {
            const channel = record.salesChannel || 'Unknown';
            channelData[channel] = (channelData[channel] || 0) + (parseFloat(record.netSales) || 0);
        });

        if (this.charts.channels) this.charts.channels.destroy();

        this.charts.channels = new Chart(document.getElementById('channelsChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(channelData),
                datasets: [{
                    data: Object.values(channelData),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    // ========================================
    // 8. TABLE: TOP PRODUCTS
    // ========================================
    renderTopProducts() {
        const productMap = {};

        this.filteredData.forEach(record => {
            const product = record.productName || 'Unknown';
            productMap[product] = (productMap[product] || 0) + (parseFloat(record.netSales) || 0);
        });

        const sorted = Object.entries(productMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const html = sorted.map((item, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${item[0]}</td>
                <td>$${item[1].toFixed(2)}</td>
            </tr>
        `).join('');

        document.getElementById('topProductsTable').innerHTML = html || '<tr><td colspan="3">لا توجد بيانات</td></tr>';
    },

    // ========================================
    // 9. TABLE: TOP COUNTRIES
    // ========================================
    renderTopCountries() {
        const countryMap = {};

        this.filteredData.forEach(record => {
            const country = record.country || 'Unknown';
            countryMap[country] = (countryMap[country] || 0) + (parseFloat(record.netSales) || 0);
        });

        const sorted = Object.entries(countryMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const html = sorted.map((item, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${item[0]}</td>
                <td>$${item[1].toFixed(2)}</td>
            </tr>
        `).join('');

        document.getElementById('topCountriesTable').innerHTML = html || '<tr><td colspan="3">لا توجد بيانات</td></tr>';
    },

    // ========================================
    // 10. MASTER RENDER
    // ========================================
    renderAll() {
        this.updateKPIs();
        this.renderSalesTrend();
        this.renderProductsChart();
        this.renderRegionsChart();
        this.renderChannelsChart();
        this.renderTopProducts();
        this.renderTopCountries();

        // Advanced Analytics
        this.renderABCAnalysis();
        this.renderRFMSegmentation();
        this.renderAdvancedStats();

        // ML Analytics
        this.renderCorrelationAnalysis();
        this.renderAnomalyDetection();
    },

    // ========================================
    // 11. ABC ANALYSIS
    // ========================================
    renderABCAnalysis() {
        const productData = {};

        this.filteredData.forEach(record => {
            const product = record.productName || 'Unknown';
            productData[product] = (productData[product] || 0) + (parseFloat(record.netSales) || 0);
        });

        const sorted = Object.entries(productData)
            .sort((a, b) => b[1] - a[1]);

        const totalSales = sorted.reduce((sum, item) => sum + item[1], 0);
        let cumulative = 0;
        const abc = { A: [], B: [], C: [] };

        sorted.forEach(([product, sales]) => {
            cumulative += sales;
            const percent = (cumulative / totalSales) * 100;

            if (percent <= 80) {
                abc.A.push([product, sales]);
            } else if (percent <= 95) {
                abc.B.push([product, sales]);
            } else {
                abc.C.push([product, sales]);
            }
        });

        // Update UI
        const aPercent = (abc.A.reduce((s, i) => s + i[1], 0) / totalSales) * 100;
        const bPercent = (abc.B.reduce((s, i) => s + i[1], 0) / totalSales) * 100;
        const cPercent = (abc.C.reduce((s, i) => s + i[1], 0) / totalSales) * 100;

        document.getElementById('abc-a-percent').textContent = `${aPercent.toFixed(1)}%`;
        document.getElementById('abc-a-count').textContent = `${abc.A.length} منتج`;
        document.getElementById('abc-b-percent').textContent = `${bPercent.toFixed(1)}%`;
        document.getElementById('abc-b-count').textContent = `${abc.B.length} منتج`;
        document.getElementById('abc-c-percent').textContent = `${cPercent.toFixed(1)}%`;
        document.getElementById('abc-c-count').textContent = `${abc.C.length} منتج`;

        // ABC Chart
        if (this.charts.abc) this.charts.abc.destroy();

        this.charts.abc = new Chart(document.getElementById('abcChart'), {
            type: 'bar',
            data: {
                labels: ['A (High)', 'B (Medium)', 'C (Low)'],
                datasets: [{
                    label: 'Number of Products',
                    data: [abc.A.length, abc.B.length, abc.C.length],
                    backgroundColor: ['#10b981', '#f59e0b', '#6b7280']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },

    // ========================================
    // 12. RFM SEGMENTATION
    // ========================================
    renderRFMSegmentation() {
        const customers = {};
        const today = new Date();

        this.filteredData.forEach(record => {
            const customer = record.salesRepName || record.customerName || 'Unknown';
            if (!customers[customer]) {
                customers[customer] = {
                    recency: 0,
                    frequency: 0,
                    monetary: 0,
                    lastDate: null
                };
            }

            const date = new Date(record.orderDate || today);
            if (!customers[customer].lastDate || date > customers[customer].lastDate) {
                customers[customer].lastDate = date;
            }

            customers[customer].frequency++;
            customers[customer].monetary += parseFloat(record.netSales) || 0;
        });

        // Calculate recency
        Object.values(customers).forEach(c => {
            if (c.lastDate) {
                const daysSince = Math.floor((today - c.lastDate) / (1000 * 60 * 60 * 24));
                c.recency = daysSince;
            }
        });

        // Segment customers
        const segments = { champions: 0, loyal: 0, potential: 0, atRisk: 0, lost: 0 };

        Object.values(customers).forEach(c => {
            if (c.recency < 30 && c.frequency >= 5 && c.monetary > 1000) {
                segments.champions++;
            } else if (c.recency < 60 && c.frequency >= 3) {
                segments.loyal++;
            } else if (c.recency < 90 && c.frequency >= 2) {
                segments.potential++;
            } else if (c.recency < 180) {
                segments.atRisk++;
            } else {
                segments.lost++;
            }
        });

        // Update UI
        document.getElementById('rfm-champions').textContent = segments.champions;
        document.getElementById('rfm-loyal').textContent = segments.loyal;
        document.getElementById('rfm-potential').textContent = segments.potential;
        document.getElementById('rfm-at-risk').textContent = segments.atRisk;
        document.getElementById('rfm-lost').textContent = segments.lost;

        // RFM Chart
        if (this.charts.rfm) this.charts.rfm.destroy();

        this.charts.rfm = new Chart(document.getElementById('rfmChart'), {
            type: 'pie',
            data: {
                labels: ['Champions', 'Loyal', 'Potential', 'At Risk', 'Lost'],
                datasets: [{
                    data: [segments.champions, segments.loyal, segments.potential, segments.atRisk, segments.lost],
                    backgroundColor: ['#fbbf24', '#3b82f6', '#10b981', '#f59e0b', '#6b7280']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    // ========================================
    // 13. ADVANCED STATISTICS
    // ========================================
    renderAdvancedStats() {
        const sales = this.filteredData.map(r => parseFloat(r.netSales) || 0);
        if (sales.length === 0) return;

        // Growth Rate
        const half = Math.floor(sales.length / 2);
        const firstHalf = sales.slice(0, half);
        const secondHalf = sales.slice(half);
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
        const trend = growthRate > 5 ? '📈 صاعد' : growthRate < -5 ? '📉 هابط' : '→️ مستقر';

        // Update UI
        document.getElementById('growth-rate').textContent = `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`;
        document.getElementById('std-deviation').textContent = `$${stdDev.toFixed(2)}`;
        document.getElementById('median').textContent = `$${median.toFixed(2)}`;
        document.getElementById('trend').textContent = trend;
    },

    // ========================================
    // 14. CORRELATION ANALYSIS - NEW
    // ========================================
    renderCorrelationAnalysis() {
        const data = this.filteredData;
        if (data.length < 2) return;

        // Extract numeric fields
        const fields = ['netSales', 'profit', 'quantity', 'unitPrice', 'discountPercent'];
        const values = {};

        fields.forEach(field => {
            values[field] = data.map(r => parseFloat(r[field]) || 0);
        });

        // Calculate correlations
        const correlations = [];
        for (let i = 0; i < fields.length; i++) {
            for (let j = i + 1; j < fields.length; j++) {
                const corr = this.pearsonCorrelation(values[fields[i]], values[fields[j]]);
                correlations.push({
                    x: fields[i],
                    y: fields[j],
                    value: corr
                });
            }
        }

        // Sort by absolute correlation
        correlations.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

        // Render chart (Bar)
        if (this.charts.correlation) this.charts.correlation.destroy();

        this.charts.correlation = new Chart(document.getElementById('correlationChart'), {
            type: 'bar',
            data: {
                labels: correlations.map(c => `${c.x} × ${c.y}`),
                datasets: [{
                    label: 'Correlation',
                    data: correlations.map(c => c.value),
                    backgroundColor: correlations.map(c =>
                        c.value > 0.5 ? '#10b981' :
                            c.value < -0.5 ? '#ef4444' : '#6b7280'
                    )
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: { min: -1, max: 1 }
                }
            }
        });

        // Update insights
        const strongest = correlations[0];
        const text = `
            • أقوى علاقة: <strong>${strongest.x}</strong> و <strong>${strongest.y}</strong> (${(strongest.value * 100).toFixed(0)}%)<br>
            • ${strongest.value > 0.7 ? 'علاقة طردية قوية 📈' : strongest.value < -0.7 ? 'علاقة عكسية قوية 📉' : 'علاقة متوسطة'}
        `;
        document.getElementById('correlationText').innerHTML = text;
    },

    pearsonCorrelation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    },

    // ========================================
    // 15. ANOMALY DETECTION - NEW
    // ========================================
    renderAnomalyDetection() {
        const data = this.filteredData;
        if (data.length < 3) return;

        const sales = data.map(r => parseFloat(r.netSales) || 0);
        const mean = sales.reduce((a, b) => a + b, 0) / sales.length;
        const variance = sales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sales.length;
        const stdDev = Math.sqrt(variance);

        // Find anomalies (Z-Score > 2)
        const anomalies = [];
        data.forEach((record, i) => {
            const value = parseFloat(record.netSales) || 0;
            const zScore = stdDev === 0 ? 0 : (value - mean) / stdDev;

            if (Math.abs(zScore) > 2) {
                anomalies.push({
                    date: record.orderDate || record.date || '-',
                    value: value,
                    zScore: zScore
                });
            }
        });

        // Update UI
        document.getElementById('anomaly-count').textContent = anomalies.length;

        if (anomalies.length > 0) {
            const maxAnomaly = anomalies.reduce((max, a) => a.value > max.value ? a : max);
            const minAnomaly = anomalies.reduce((min, a) => a.value < min.value ? a : min);

            document.getElementById('anomaly-max').textContent = `$${maxAnomaly.value.toFixed(2)}`;
            document.getElementById('anomaly-min').textContent = `$${minAnomaly.value.toFixed(2)}`;

            // Render table
            const html = anomalies.slice(0, 10).map((a, i) => `
                <tr style="background: ${a.zScore > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}">
                    <td>${i + 1}</td>
                    <td>${a.date}</td>
                    <td>$${a.value.toFixed(2)}</td>
                    <td>${a.zScore.toFixed(2)}</td>
                </tr>
            `).join('');
            document.getElementById('anomalyTable').innerHTML = html;
        } else {
            document.getElementById('anomaly-max').textContent = '-';
            document.getElementById('anomaly-min').textContent = '-';
            document.getElementById('anomalyTable').innerHTML = '<tr><td colspan="4">لا توجد شواذ</td></tr>';
        }
    }
};

// ============================================
// AUTO-INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    Analytics.init();
});
