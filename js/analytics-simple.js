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

    // NEW: Smart Field Mapping for all schemas
    getFieldMap() {
        const maps = {
            // Core Business
            sales: { value: 'netSales', value2: 'profit', date: 'orderDate', category: 'productCategory', name: 'productName' },
            employees: { value: 'salary', value2: 'bonusAmount', date: 'joinDate', category: 'department', name: 'employeeName' },
            attendance: { value: 'hoursWorked', value2: 'overtimeHours', date: 'attendanceDate', category: 'shift', name: 'employeeName' },
            customers: { value: 'totalSpent', value2: 'loyaltyPoints', date: 'registrationDate', category: 'customerSegment', name: 'customerName' },
            purchasing: { value: 'totalCost', value2: 'taxAmount', date: 'purchaseDate', category: 'category', name: 'itemName' },
            suppliers: { value: 'contractValue', value2: 'discountAmount', date: 'contractDate', category: 'supplierType', name: 'supplierName' },
            inventory: { value: 'totalValue', value2: 'unitPrice', date: 'lastUpdated', category: 'category', name: 'itemName' },
            finance: { value: 'amount', value2: 'balance', date: 'transactionDate', category: 'transactionType', name: 'description' },
            support: { value: 'resolutionTime', value2: 'satisfactionScore', date: 'createdDate', category: 'priority', name: 'ticketID' },
            operations: { value: 'duration', value2: 'cost', date: 'operationDate', category: 'operationType', name: 'operationName' },

            // Marketing
            campaigns: { value: 'budget', value2: 'conversions', date: 'startDate', category: 'campaignType', name: 'campaignName' },
            ads: { value: 'cost', value2: 'clicks', date: 'startDate', category: 'platform', name: 'adName' },
            leads: { value: 'estimatedValue', value2: 'score', date: 'createdDate', category: 'leadSource', name: 'leadName' },
            social_media: { value: 'engagementRate', value2: 'reach', date: 'postDate', category: 'platform', name: 'postTitle' },
            analytics: { value: 'pageviews', value2: 'bounceRate', date: 'date', category: 'source', name: 'pagePath' },

            // IT & Tech
            it_inventory: { value: 'purchasePrice', value2: 'currentValue', date: 'purchaseDate', category: 'deviceType', name: 'deviceName' },
            software_licenses: { value: 'cost', value2: 'userCount', date: 'purchaseDate', category: 'softwareType', name: 'softwareName' },
            it_tickets: { value: 'resolutionTime', value2: 'severity', date: 'createdDate', category: 'category', name: 'ticketID' },
            server_status: { value: 'cpuUsage', value2: 'memoryUsage', date: 'checkDate', category: 'serverType', name: 'serverName' },
            access_logs: { value: 'requestCount', value2: 'responseTime', date: 'accessDate', category: 'method', name: 'endpoint' },

            // Education
            students: { value: 'GPA', value2: 'attendanceRate', date: 'enrollmentDate', category: 'major', name: 'studentName' },
            teachers: { value: 'experienceYears', value2: 'coursesCount', date: 'hireDate', category: 'department', name: 'teacherName' },
            courses: { value: 'enrolledStudents', value2: 'completionRate', date: 'startDate', category: 'courseLevel', name: 'courseName' },
            exams: { value: 'averageScore', value2: 'passRate', date: 'examDate', category: 'examType', name: 'examName' },
            library: { value: 'borrowCount', value2: 'availableCopies', date: 'publishDate', category: 'category', name: 'bookTitle' },

            // Services
            real_estate: { value: 'price', value2: 'area', date: 'listingDate', category: 'propertyType', name: 'propertyTitle' },
            hotel_booking: { value: 'totalPrice', value2: 'nightsCount', date: 'checkInDate', category: 'roomType', name: 'guestName' },
            travel_flights: { value: 'ticketPrice', value2: 'distance', date: 'flightDate', category: 'class', name: 'flightNumber' },
            medical_records: { value: 'treatmentCost', value2: 'visitDuration', date: 'visitDate', category: 'diagnosis', name: 'patientName' },
            events: { value: 'budget', value2: 'attendeesCount', date: 'eventDate', category: 'eventType', name: 'eventName' }
        };

        return maps[this.currentSchema] || maps.sales;
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
        const fields = this.getFieldMap();

        this.filteredData = this.allData.filter(record => {
            const date = record[fields.date] || record.date || record.orderDate;
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
        const fields = this.getFieldMap();

        const totalValue = data.reduce((sum, r) => sum + (parseFloat(r[fields.value]) || 0), 0);
        const totalValue2 = data.reduce((sum, r) => sum + (parseFloat(r[fields.value2]) || 0), 0);
        const totalRecords = data.length;
        const avgValue = totalRecords > 0 ? totalValue / totalRecords : 0;
        const ratio = totalValue > 0 ? (totalValue2 / totalValue) * 100 : 0;
        const avgValue2 = totalRecords > 0 ? totalValue2 / totalRecords : 0;

        return { totalValue, totalValue2, totalRecords, avgValue, ratio, avgValue2 };
    },

    updateKPIs() {
        const kpis = this.calculateKPIs();
        const fields = this.getFieldMap();

        // Update with currency format for financial schemas
        const isFinancial = ['sales', 'finance', 'purchasing', 'suppliers', 'inventory', 'real_estate', 'hotel_booking', 'travel_flights', 'medical_records', 'events', 'campaigns', 'ads'].includes(this.currentSchema);
        const prefix = isFinancial ? '$' : '';

        document.getElementById('totalSales').textContent = `${prefix}${kpis.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('totalProfit').textContent = `${prefix}${kpis.totalValue2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('totalOrders').textContent = kpis.totalRecords.toLocaleString();
        document.getElementById('avgOrder').textContent = `${prefix}${kpis.avgValue.toFixed(2)}`;
        document.getElementById('profitMargin').textContent = `${kpis.ratio.toFixed(1)}%`;
        document.getElementById('avgDiscount').textContent = `${kpis.avgValue2.toFixed(1)}`;
    },

    // ========================================
    // 4. CHART: SALES TREND
    // ========================================
    renderSalesTrend() {
        const monthlyData = {};
        const fields = this.getFieldMap();

        this.filteredData.forEach(record => {
            const month = (record[fields.date] || '').substring(0, 7);
            if (!month) return;

            if (!monthlyData[month]) {
                monthlyData[month] = { value1: 0, value2: 0 };
            }
            monthlyData[month].value1 += parseFloat(record[fields.value]) || 0;
            monthlyData[month].value2 += parseFloat(record[fields.value2]) || 0;
        });

        const months = Object.keys(monthlyData).sort();
        const data1 = months.map(m => monthlyData[m].value1);
        const data2 = months.map(m => monthlyData[m].value2);

        if (this.charts.salesTrend) this.charts.salesTrend.destroy();

        this.charts.salesTrend = new Chart(document.getElementById('salesTrendChart'), {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Primary',
                        data: data1,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Secondary',
                        data: data2,
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
        const fields = this.getFieldMap();

        this.filteredData.forEach(record => {
            const category = record[fields.category] || 'Unknown';
            productData[category] = (productData[category] || 0) + (parseFloat(record[fields.value]) || 0);
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
        const fields = this.getFieldMap();

        this.filteredData.forEach(record => {
            const item = record[fields.name] || 'Unknown';
            productMap[item] = (productMap[item] || 0) + (parseFloat(record[fields.value]) || 0);
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
        const fields = this.getFieldMap();
        const categoryMap = {};

        this.filteredData.forEach(record => {
            // Try country first, then fall back to category
            const key = record.country || record[fields.category] || 'Unknown';
            categoryMap[key] = (categoryMap[key] || 0) + (parseFloat(record[fields.value]) || 0);
        });

        const sorted = Object.entries(categoryMap)
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
        const fields = this.getFieldMap();

        this.filteredData.forEach(record => {
            const product = record[fields.name] || 'Unknown';
            productData[product] = (productData[product] || 0) + (parseFloat(record[fields.value]) || 0);
        });

        const sorted = Object.entries(productData)
            .sort((a, b) => b[1] - a[1]);

        const totalSales = sorted.reduce((sum, item) => sum + item[1], 0);
        let cumulative = 0;

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
        const fields = this.getFieldMap();

        this.filteredData.forEach(record => {
            const customer = record.salesRepName || record.customerName || record[fields.name] || 'Unknown';
            if (!customers[customer]) {
                customers[customer] = {
                    recency: 0,
                    frequency: 0,
                    monetary: 0,
                    lastDate: null
                };
            }

            const date = new Date(record[fields.date] || today);
            if (!customers[customer].lastDate || date > customers[customer].lastDate) {
                customers[customer].lastDate = date;
            }

            customers[customer].frequency++;
            customers[customer].monetary += parseFloat(record[fields.value]) || 0;
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
        const fields = this.getFieldMap();
        const values = this.filteredData.map(r => parseFloat(r[fields.value]) || 0);
        if (values.length === 0) return;

        // Growth Rate
        const half = Math.floor(values.length / 2);
        const firstHalf = values.slice(0, half);
        const secondHalf = values.slice(half);
        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const growthRate = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;

        // Standard Deviation
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        // Median
        const sorted = [...values].sort((a, b) => a - b);
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

        const fields = this.getFieldMap();
        const values = data.map(r => parseFloat(r[fields.value]) || 0);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        // Find anomalies (Z-Score > 2)
        const anomalies = [];
        data.forEach((record, i) => {
            const value = parseFloat(record[fields.value]) || 0;
            const zScore = stdDev === 0 ? 0 : (value - mean) / stdDev;

            if (Math.abs(zScore) > 2) {
                anomalies.push({
                    date: record[fields.date] || record.date || '-',
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
