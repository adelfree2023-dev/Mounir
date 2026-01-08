// Analytics Engine - Data Analysis & Visualization with Advanced Filtering
const AnalyticsEngine = {
    data: [],
    filteredData: [], // NEW: Filtered dataset
    charts: {},
    currentFilter: null, // NEW: Track active filter

    // Initialize the dashboard
    init: function () {
        this.loadData();

        if (this.data.length === 0) {
            // New: More explicit user guidance
            const confirmGen = confirm('⚠️ لا توجد بيانات مسجلة في النظام!\n\nهل تريد العودة لصفحة الإدخال لتوليد بيانات (Generate Bulk)؟');
            if (confirmGen) {
                window.location.href = 'index.html';
            }
            this.showEmptyState();
            return;
        }

        this.filteredData = [...this.data]; // Start with all data
        this.setDefaultDateRange(); // NEW
        this.calculateKPIs();
        this.calculateAdvancedStats(); // NEW
        this.performABCAnalysis(); // NEW - ABC Analysis
        this.performRFMAnalysis(); // NEW - RFM
        this.performParetoAnalysis(); // NEW - Pareto
        this.performMLAnalysis(); // NEW - ML Analytics
        this.renderCharts();
        this.renderTables();
        this.updateDataStatus();
    },

    // Load data from localStorage
    loadData: function () {
        const rawData = localStorage.getItem('data_sales');
        if (rawData) {
            try {
                this.data = JSON.parse(rawData);
                console.log(`✅ Loaded ${this.data.length} records`);
            } catch (e) {
                console.error('Error parsing data:', e);
                this.data = [];
            }
        }
    },

    // NEW: Set default date range smartly based on data
    setDefaultDateRange: function () {
        const dates = this.data.map(d => new Date(d.orderDate)).filter(d => !isNaN(d.getTime()));

        let minDate, maxDate;

        if (dates.length > 0) {
            minDate = new Date(Math.min(...dates));
            maxDate = new Date(Math.max(...dates));
            // Add buffer
            minDate.setDate(minDate.getDate() - 7);
            maxDate.setDate(maxDate.getDate() + 7);
        } else {
            // Fallback: Last 365 days
            maxDate = new Date();
            minDate = new Date();
            minDate.setDate(maxDate.getDate() - 365);
        }

        const startInput = document.getElementById('startDate');
        const endInput = document.getElementById('endDate');

        if (startInput && endInput) {
            const startStr = minDate.toISOString().split('T')[0];
            const endStr = maxDate.toISOString().split('T')[0];

            startInput.value = startStr;
            endInput.value = endStr;

            // Also update the current filter object explicitly
            this.currentFilter = { start: minDate, end: maxDate };
        }

        // Initially show ALL data to be safe, then apply filters
        this.filteredData = [...this.data];
        this.applyFilters();
    },

    // NEW: Apply date range filter
    applyFilters: function () {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            alert('⚠️ الرجاء اختيار تاريخ البداية والنهاية');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59); // Include entire end day

        this.filteredData = this.data.filter(d => {
            const orderDate = new Date(d.orderDate);
            return orderDate >= start && orderDate <= end;
        });

        this.currentFilter = { start: startDate, end: endDate };
        this.updateActiveFilterDisplay();
        this.refreshAnalytics();
    },

    // NEW: Quick filter presets
    setQuickFilter: function (preset) {
        const endDate = new Date();
        let startDate = new Date();

        switch (preset) {
            case 'last30':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case 'last90':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case 'thisYear':
                startDate = new Date(endDate.getFullYear(), 0, 1);
                break;
            case 'lastYear':
                startDate = new Date(endDate.getFullYear() - 1, 0, 1);
                endDate.setFullYear(endDate.getFullYear() - 1, 11, 31);
                break;
        }

        document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = endDate.toISOString().split('T')[0];

        this.applyFilters();
    },

    // NEW: Reset filters
    resetFilters: function () {
        this.filteredData = [...this.data];
        this.currentFilter = null;
        this.setDefaultDateRange();
        this.refreshAnalytics();
    },

    // NEW: Update filter display
    updateActiveFilterDisplay: function () {
        const display = document.getElementById('activeFilterDisplay');
        if (!display) return;

        if (this.currentFilter) {
            const start = new Date(this.currentFilter.start).toLocaleDateString('ar-EG');
            const end = new Date(this.currentFilter.end).toLocaleDateString('ar-EG');
            display.textContent = `📅 من ${start} إلى ${end} (${this.filteredData.length} سجل)`;
        } else {
            display.textContent = `عرض جميع البيانات (${this.data.length} سجل)`;
        }
    },

    // NEW: Refresh all analytics
    refreshAnalytics: function () {
        this.calculateKPIs();
        this.calculateAdvancedStats();

        // Destroy old charts
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};

        this.renderCharts();
        this.renderTables();
        this.updateDataStatus();
    },

    // Helper to format large numbers - NEW
    formatLargeNumber: function (num) {
        if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
        if (num >= 10000) return `$${(num / 1000).toFixed(1)}K`;
        return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    // Calculate Key Performance Indicators
    calculateKPIs: function () {
        const totalSales = this.filteredData.reduce((sum, d) => sum + parseFloat(d.netSales || 0), 0);
        const totalProfit = this.filteredData.reduce((sum, d) => sum + parseFloat(d.profit || 0), 0);
        const totalOrders = this.filteredData.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        const profitMargins = this.filteredData
            .map(d => parseFloat(d.profitMargin || 0))
            .filter(v => v > 0);
        const avgProfitMargin = profitMargins.length > 0
            ? profitMargins.reduce((a, b) => a + b, 0) / profitMargins.length
            : 0;

        const discounts = this.filteredData.map(d => parseFloat(d.discountPercent || 0));
        const avgDiscount = discounts.length > 0
            ? discounts.reduce((a, b) => a + b, 0) / discounts.length
            : 0;

        // Update DOM with smart formatting - FIXED
        document.getElementById('totalSales').textContent = this.formatLargeNumber(totalSales);
        document.getElementById('totalProfit').textContent = this.formatLargeNumber(totalProfit);
        document.getElementById('totalOrders').textContent = totalOrders.toLocaleString();
        document.getElementById('avgOrderValue').textContent = this.formatLargeNumber(avgOrderValue);
        document.getElementById('avgProfitMargin').textContent = `${avgProfitMargin.toFixed(1)}%`;
        document.getElementById('avgDiscount').textContent = `${avgDiscount.toFixed(1)}%`;
    },

    // NEW: Calculate advanced statistics
    calculateAdvancedStats: function () {
        const salesData = this.filteredData
            .map(d => parseFloat(d.netSales || 0))
            .filter(v => v > 0)
            .sort((a, b) => a - b);

        if (salesData.length === 0) {
            document.getElementById('growthRate').textContent = '-';
            document.getElementById('stdDeviation').textContent = '-';
            document.getElementById('medianSales').textContent = '-';
            document.getElementById('trendDirection').textContent = '-';
            return;
        }

        // Mean
        const mean = salesData.reduce((a, b) => a + b, 0) / salesData.length;

        // Median
        const mid = Math.floor(salesData.length / 2);
        const median = salesData.length % 2 === 0
            ? (salesData[mid - 1] + salesData[mid]) / 2
            : salesData[mid];

        // Standard Deviation
        const variance = salesData.reduce((sum, val) =>
            sum + Math.pow(val - mean, 2), 0) / salesData.length;
        const stdDev = Math.sqrt(variance);

        // Growth Rate (first half vs second half)
        const halfPoint = Math.floor(this.filteredData.length / 2);
        const firstHalf = this.filteredData.slice(0, halfPoint);
        const secondHalf = this.filteredData.slice(halfPoint);

        const avgFirst = firstHalf.reduce((sum, d) =>
            sum + parseFloat(d.netSales || 0), 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((sum, d) =>
            sum + parseFloat(d.netSales || 0), 0) / secondHalf.length;

        const growthRate = avgFirst > 0
            ? ((avgSecond - avgFirst) / avgFirst) * 100
            : 0;

        // Trend Direction
        let trendDirection = '→ ثابت';
        let trendColor = '#94a3b8';
        if (growthRate > 5) {
            trendDirection = '↗ صاعد';
            trendColor = '#10b981';
        } else if (growthRate < -5) {
            trendDirection = '↘ هابط';
            trendColor = '#ef4444';
        }

        // Update DOM
        document.getElementById('growthRate').textContent = `${growthRate.toFixed(1)}%`;
        document.getElementById('growthRate').style.color = growthRate > 0 ? '#10b981' : growthRate < 0 ? '#ef4444' : '#94a3b8';

        document.getElementById('stdDeviation').textContent = `$${stdDev.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        document.getElementById('medianSales').textContent = `$${median.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        const trendEl = document.getElementById('trendDirection');
        trendEl.textContent = trendDirection;
        trendEl.style.color = trendColor;
    },

    // Render all charts
    renderCharts: function () {
        this.renderSalesTrendChart();
        this.renderProductChart();
        this.renderRegionChart();
        this.renderSegmentChart();
        this.renderChannelChart();
    },

    // 1. Sales Trend Chart (Line Chart)
    renderSalesTrendChart: function () {
        const monthlyData = this.groupByMonth(this.filteredData);

        const ctx = document.getElementById('salesTrendChart');
        this.charts.salesTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'صافي المبيعات (Net Sales)',
                    data: monthlyData.sales,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }, {
                    label: 'الأرباح (Profit)',
                    data: monthlyData.profit,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#f1f5f9',
                            font: { size: 12 },
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '$' + context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 });
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            callback: function (value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },

    // 2. Product Category Chart (Bar Chart)
    renderProductChart: function () {
        const productData = this.groupByField('productCategory', 'netSales');

        const ctx = document.getElementById('productChart');
        this.charts.product = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: productData.labels,
                datasets: [{
                    label: 'المبيعات ($)',
                    data: productData.values,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: [
                        'rgba(99, 102, 241, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(139, 92, 246, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function (context) {
                                return 'المبيعات: $' + context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 });
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            callback: function (value) {
                                return '$' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    }
                }
            }
        });
    },

    // 3. Regional Sales Chart (Pie Chart)
    renderRegionChart: function () {
        const regionData = this.groupByField('region', 'netSales');

        const ctx = document.getElementById('regionChart');
        this.charts.region = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: regionData.labels,
                datasets: [{
                    data: regionData.values,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: '#1e293b',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#f1f5f9',
                            font: { size: 11 },
                            padding: 10,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    // 4. Customer Segment Chart (Doughnut Chart)
    renderSegmentChart: function () {
        const segmentData = this.groupByField('customerSegment', 'netSales');

        const ctx = document.getElementById('segmentChart');
        this.charts.segment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: segmentData.labels,
                datasets: [{
                    data: segmentData.values,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: '#1e293b',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#f1f5f9',
                            font: { size: 11 },
                            padding: 10,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    // 5. Sales Channel Chart (Bar Chart)
    renderChannelChart: function () {
        const channelData = this.groupByField('salesChannel', 'netSales');

        const ctx = document.getElementById('channelChart');
        this.charts.channel = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: channelData.labels,
                datasets: [{
                    label: 'المبيعات ($)',
                    data: channelData.values,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        callbacks: {
                            label: function (context) {
                                return 'المبيعات: $' + context.parsed.x.toLocaleString('en-US', { minimumFractionDigits: 2 });
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            callback: function (value) {
                                return '$' + (value / 1000).toFixed(0) + 'K';
                            }
                        }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    }
                }
            }
        });
    },

    // Render Top 10 Tables
    renderTables: function () {
        this.renderTopProductsTable();
        this.renderTopCountriesTable();
    },

    // Top 10 Products Table
    renderTopProductsTable: function () {
        const productSales = {};
        const productProfit = {};

        this.filteredData.forEach(d => {
            const product = d.productName || 'Unknown';
            const sales = parseFloat(d.netSales || 0);
            const profit = parseFloat(d.profit || 0);

            productSales[product] = (productSales[product] || 0) + sales;
            productProfit[product] = (productProfit[product] || 0) + profit;
        });

        const sorted = Object.keys(productSales)
            .map(product => ({
                name: product,
                sales: productSales[product],
                profit: productProfit[product]
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10);

        const tbody = document.querySelector('#topProductsTable tbody');
        tbody.innerHTML = sorted.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>$${item.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td>$${item.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
        `).join('');
    },

    // Top 10 Countries Table
    renderTopCountriesTable: function () {
        const countrySales = {};
        const countryProfit = {};

        this.filteredData.forEach(d => {
            const country = d.country || 'Unknown';
            const sales = parseFloat(d.netSales || 0);
            const profit = parseFloat(d.profit || 0);

            countrySales[country] = (countrySales[country] || 0) + sales;
            countryProfit[country] = (countryProfit[country] || 0) + profit;
        });

        const sorted = Object.keys(countrySales)
            .map(country => ({
                name: country,
                sales: countrySales[country],
                profit: countryProfit[country]
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10);

        const tbody = document.querySelector('#topCountriesTable tbody');
        tbody.innerHTML = sorted.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>$${item.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td>$${item.profit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
        `).join('');
    },

    // Helper: Group data by month
    groupByMonth: function (data) {
        const monthly = {};

        data.forEach(d => {
            if (!d.orderDate) return;

            const date = new Date(d.orderDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthly[monthKey]) {
                monthly[monthKey] = { sales: 0, profit: 0 };
            }

            monthly[monthKey].sales += parseFloat(d.netSales || 0);
            monthly[monthKey].profit += parseFloat(d.profit || 0);
        });

        const sorted = Object.keys(monthly).sort();

        return {
            labels: sorted.map(key => {
                const [year, month] = key.split('-');
                const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                return `${monthNames[parseInt(month) - 1]} ${year}`;
            }),
            sales: sorted.map(key => monthly[key].sales),
            profit: sorted.map(key => monthly[key].profit)
        };
    },

    // Helper: Group data by field
    groupByField: function (field, sumField) {
        const grouped = {};

        this.filteredData.forEach(d => {
            const key = d[field] || 'Unknown';
            const value = parseFloat(d[sumField] || 0);

            grouped[key] = (grouped[key] || 0) + value;
        });

        return {
            labels: Object.keys(grouped),
            values: Object.values(grouped)
        };
    },

    // Update data status
    updateDataStatus: function () {
        document.getElementById('recordCount').textContent = this.filteredData.length.toLocaleString();
    },

    // Show empty state
    showEmptyState: function () {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="empty-state">
                <h2>📭 لا توجد بيانات</h2>
                <p>لم يتم العثور على أي بيانات في localStorage</p>
                <p>قم بإنشاء بعض البيانات أولاً من صفحة الإدخال</p>
                <a href="index.html">← الذهاب لصفحة الإدخال</a>
            </div>
        `;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Analytics Dashboard Loading...');
    AnalyticsEngine.init();
});

// === ABC ANALYSIS ===
performABCAnalysis: function() {
    const productRevenue = {};
    this.filteredData.forEach(d => {
        const product = d.productName || "Unknown";
        const revenue = parseFloat(d.netSales || 0);
        productRevenue[product] = (productRevenue[product] || 0) + revenue;
    });

    const products = Object.keys(productRevenue)
        .map(p => ({ name: p, revenue: productRevenue[p] }))
        .sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    let cumulative = 0;

    products.forEach((product, index) => {
        const revenuePercent = (product.revenue / totalRevenue) * 100;
        cumulative += revenuePercent;
        product.revenuePercent = revenuePercent;
        product.cumulativePercent = cumulative;
        product.rank = index + 1;

        if (cumulative <= 80) {
            product.category = "A";
            product.categoryColor = "#10b981";
        } else if (cumulative <= 95) {
            product.category = "B";
            product.categoryColor = "#f59e0b";
        } else {
            product.category = "C";
            product.categoryColor = "#ef4444";
        }
    });

    this.updateABCSummary(products, totalRevenue);
    this.renderParetoChart(products);
},

updateABCSummary: function(products, totalRevenue) {
    const catA = products.filter(p => p.category === "A");
    const catB = products.filter(p => p.category === "B");
    const catC = products.filter(p => p.category === "C");

    const revA = catA.reduce((sum, p) => sum + p.revenue, 0);
    const revB = catB.reduce((sum, p) => sum + p.revenue, 0);
    const revC = catC.reduce((sum, p) => sum + p.revenue, 0);

    document.getElementById("abc-a-count").textContent = catA.length;
    document.getElementById("abc-a-revenue").textContent = this.formatLargeNumber(revA);
    document.getElementById("abc-a-percent").textContent = ((revA / totalRevenue) * 100).toFixed(1) + "%";

    document.getElementById("abc-b-count").textContent = catB.length;
    document.getElementById("abc-b-revenue").textContent = this.formatLargeNumber(revB);
    document.getElementById("abc-b-percent").textContent = ((revB / totalRevenue) * 100).toFixed(1) + "%";

    document.getElementById("abc-c-count").textContent = catC.length;
    document.getElementById("abc-c-revenue").textContent = this.formatLargeNumber(revC);
    document.getElementById("abc-c-percent").textContent = ((revC / totalRevenue) * 100).toFixed(1) + "%";
},

renderParetoChart: function(products) {
    const ctx = document.getElementById("paretoChart");
    if (!ctx) return;

    const top20 = products.slice(0, 20);
    const labels = top20.map(p => p.name.substring(0, 25));
    const revenues = top20.map(p => p.revenue);
    const cumulatives = top20.map(p => p.cumulativePercent);
    const colors = top20.map(p => p.categoryColor);

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                type: "bar",
                label: "الإيرادات",
                data: revenues,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2,
                yAxisID: "y"
            }, {
                type: "line",
                label: "النسبة التراكمية",
                data: cumulatives,
                borderColor: "#6366f1",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                borderWidth: 3,
                tension: 0.3,
                yAxisID: "y1",
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "#f1f5f9", font: { size: 12 } }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#94a3b8", maxRotation: 45, minRotation: 45 }
                },
                y: {
                    position: "left",
                    ticks: {
                        color: "#94a3b8",
                        callback: v => "$" + (v / 1000).toFixed(0) + "K"
                    }
                },
                y1: {
                    position: "right",
                    min: 0,
                    max: 100,
                    ticks: {
                        color: "#6366f1",
                        callback: v => v + "%"
                    }
                }
            }
        }
    });
},

performRFMAnalysis: function() {
    const customers = {};
    const today = new Date();

    this.filteredData.forEach(d => {
        const custId = d.customerId || d.customerSegment;
        if (!customers[custId]) {
            customers[custId] = { id: custId, orders: [], totalSpent: 0 };
        }
        customers[custId].orders.push(new Date(d.orderDate));
        customers[custId].totalSpent += parseFloat(d.netSales || 0);
    });

    const customerArray = Object.values(customers).map(c => {
        const sortedOrders = c.orders.sort((a, b) => b - a);
        const lastOrder = sortedOrders[0];
        const daysSinceLastOrder = Math.floor((today - lastOrder) / (1000 * 60 * 60 * 24));

        return {
            id: c.id,
            recency: daysSinceLastOrder,
            frequency: c.orders.length,
            monetary: c.totalSpent
        };
    });

    const recencyScore = this.calculateRFMScore(customerArray, 'recency', true);
    const frequencyScore = this.calculateRFMScore(customerArray, 'frequency', false);
    const monetaryScore = this.calculateRFMScore(customerArray, 'monetary', false);

    customerArray.forEach((c, i) => {
        c.R = recencyScore[i];
        c.F = frequencyScore[i];
        c.M = monetaryScore[i];
        c.segment = this.assignRFMSegment(c.R, c.F, c.M);
    });

    this.updateRFMCards(customerArray);
    this.renderRFMChart(customerArray);
},

calculateRFMScore: function(customers, field, reverse) {
    const sorted = [...customers].sort((a, b) => reverse ? a[field] - b[field] : b[field] - a[field]);
    const quintile = Math.ceil(customers.length / 5);
    const scores = {};

    sorted.forEach((c, i) => {
        const score = Math.min(Math.floor(i / quintile) + 1, 5);
        scores[c.id] = reverse ? (6 - score) : score;
    });

    return customers.map(c => scores[c.id]);
},

assignRFMSegment: function(R, F, M) {
    if (R >= 4 && F >= 4 && M >= 4) return 'champions';
    if (R >= 3 && F >= 3 && M >= 3) return 'loyal';
    if (R >= 3 && F <= 2) return 'potential';
    if (R <= 2 && F >= 3) return 'at-risk';
    return 'lost';
},

updateRFMCards: function(customers) {
    const segments = {
        champions: customers.filter(c => c.segment === 'champions'),
        loyal: customers.filter(c => c.segment === 'loyal'),
        potential: customers.filter(c => c.segment === 'potential'),
        'at-risk': customers.filter(c => c.segment === 'at-risk'),
        lost: customers.filter(c => c.segment === 'lost')
    };

    Object.keys(segments).forEach(seg => {
        const revenue = segments[seg].reduce((sum, c) => sum + c.monetary, 0);
        const dashSeg = seg.replace('-', '-');
        document.getElementById(`rfm-${dashSeg}-count`).textContent = segments[seg].length;
        document.getElementById(`rfm-${dashSeg}-revenue`).textContent = this.formatLargeNumber(revenue);
    });
},

renderRFMChart: function(customers) {
    const ctx = document.getElementById('rfmChart');
    if (!ctx) return;

    const segments = ['champions', 'loyal', 'potential', 'at-risk', 'lost'];
    const counts = segments.map(s => customers.filter(c => c.segment === s).length);
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Champions', 'Loyal', 'Potential', 'At Risk', 'Lost'],
            datasets: [{
                data: counts,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#f1f5f9', font: { size: 13 } } }
            }
        }
    });
},

// === PARETO ANALYSIS ===
performParetoAnalysis: function() {
    const customerRevenue = {};
    this.filteredData.forEach(d => {
        const cust = d.customerSegment || 'Unknown';
        customerRevenue[cust] = (customerRevenue[cust] || 0) + parseFloat(d.netSales || 0);
    });

    const customers = Object.entries(customerRevenue)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

    const totalCustRevenue = customers.reduce((sum, c) => sum + c.revenue, 0);
    const top20CustCount = Math.ceil(customers.length * 0.2) || 1;
    const top20Customers = customers.slice(0, top20CustCount);
    const top20CustRevenue = top20Customers.reduce((sum, c) => sum + c.revenue, 0);
    const top20CustPercent = totalCustRevenue > 0 ? (top20CustRevenue / totalCustRevenue * 100).toFixed(1) : '0';

    if (document.getElementById('top-customers-count')) {
        document.getElementById('top-customers-count').textContent = top20CustCount;
        document.getElementById('top-customers-revenue').textContent = this.formatLargeNumber(top20CustRevenue);
        document.getElementById('top-customers-percent').textContent = top20CustPercent + '%';
    }

    const regionRevenue = {};
    this.filteredData.forEach(d => {
        const region = d.region || 'Unknown';
        regionRevenue[region] = (regionRevenue[region] || 0) + parseFloat(d.netSales || 0);
    });

    const regions = Object.entries(regionRevenue)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

    const totalRegRevenue = regions.reduce((sum, r) => sum + r.revenue, 0);
    const top20RegCount = Math.max(1, Math.ceil(regions.length * 0.2));
    const top20Regions = regions.slice(0, top20RegCount);
    const top20RegRevenue = top20Regions.reduce((sum, r) => sum + r.revenue, 0);
    const top20RegPercent = totalRegRevenue > 0 ? (top20RegRevenue / totalRegRevenue * 100).toFixed(1) : '0';

    if (document.getElementById('top-regions-count')) {
        document.getElementById('top-regions-count').textContent = top20RegCount;
        document.getElementById('top-regions-revenue').textContent = this.formatLargeNumber(top20RegRevenue);
        document.getElementById('top-regions-percent').textContent = top20RegPercent + '%';
    }
},

// === ML ANALYSIS ===
performMLAnalysis: function() {
    // 1. Anomaly Detection (Z-Score on Sales)
    const salesValues = this.filteredData.map(d => parseFloat(d.netSales || 0));
    if (salesValues.length === 0) return;

    const mean = salesValues.reduce((a, b) => a + b, 0) / salesValues.length;
    const stdDev = Math.sqrt(salesValues.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / salesValues.length);

    // Threshold for anomaly: > 2 standard deviations (Z-Score > 2)
    const anomalies = this.filteredData.filter(d => {
        const val = parseFloat(d.netSales || 0);
        const zScore = stdDev === 0 ? 0 : (val - mean) / stdDev;
        return Math.abs(zScore) > 2;
    });

    if (document.getElementById('ml-anomalies-count')) {
        document.getElementById('ml-anomalies-count').textContent = anomalies.length;
    }

    // 2. Simple Growth Forecast (Linear Trend)
    // Compare last month vs previous month for simple forecast
    // (This is a basic placeholder for checking trend)
    if (document.getElementById('ml-forecast-value')) {
        const growthRate = document.getElementById('growthRate') ? document.getElementById('growthRate').textContent : '0%';
        document.getElementById('ml-forecast-value').textContent = growthRate;
    }
},

exportToExcel: function() {
    if (!this.filteredData || this.filteredData.length === 0) {
        alert('لا توجد بيانات للتصدير');
        return;
    }

    // Determine headers from the first record
    const headers = Object.keys(this.filteredData[0]);

    // Create CSV content
    const csvRows = [];
    csvRows.push(headers.join(',')); // Header row

    for (const row of this.filteredData) {
        const values = headers.map(header => {
            const val = row[header] || '';
            const escaped = ('' + val).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'analytics_data_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    AnalyticsEngine.init();
});
// Pareto Analysis for Customers and Regions - Add to analytics.js

performParetoAnalysis: function() {
    // === CUSTOMERS PARETO ===
    const customerRevenue = {};
    this.filteredData.forEach(d => {
        const cust = d.customerSegment || 'Unknown';
        customerRevenue[cust] = (customerRevenue[cust] || 0) + parseFloat(d.netSales || 0);
    });

    const customers = Object.entries(customerRevenue)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

    const totalCustRevenue = customers.reduce((sum, c) => sum + c.revenue, 0);
    const top20CustCount = Math.ceil(customers.length * 0.2);
    const top20Customers = customers.slice(0, top20CustCount);
    const top20CustRevenue = top20Customers.reduce((sum, c) => sum + c.revenue, 0);
    const top20CustPercent = (top20CustRevenue / totalCustRevenue * 100).toFixed(1);

    document.getElementById('top-customers-count').textContent = top20CustCount;
    document.getElementById('top-customers-revenue').textContent = this.formatLargeNumber(top20CustRevenue);
    document.getElementById('top-customers-percent').textContent = top20CustPercent + '%';

    if (parseFloat(top20CustPercent) >= 70) {
        document.getElementById('customers-insight').textContent = '✅ قاعدة 80/20 تعمل! ركز على هؤلاء';
    } else {
        document.getElementById('customers-insight').textContent = '📊 التوزيع متوازن - جيد للتنويع';
    }

    // === REGIONS PARETO ===
    const regionRevenue = {};
    this.filteredData.forEach(d => {
        const region = d.region || 'Unknown';
        regionRevenue[region] = (regionRevenue[region] || 0) + parseFloat(d.netSales || 0);
    });

    const regions = Object.entries(regionRevenue)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue);

    const totalRegRevenue = regions.reduce((sum, r) => sum + r.revenue, 0);
    const top20RegCount = Math.max(1, Math.ceil(regions.length * 0.2));
    const top20Regions = regions.slice(0, top20RegCount);
    const top20RegRevenue = top20Regions.reduce((sum, r) => sum + r.revenue, 0);
    const top20RegPercent = (top20RegRevenue / totalRegRevenue * 100).toFixed(1);

    document.getElementById('top-regions-count').textContent = top20RegCount;
    document.getElementById('top-regions-revenue').textContent = this.formatLargeNumber(top20RegRevenue);
    document.getElementById('top-regions-percent').textContent = top20RegPercent + '%';

    if (parseFloat(top20RegPercent) >= 60) {
        document.getElementById('regions-insight').textContent = '🎯 وسّع في: ' + top20Regions.map(r => r.name).join(', ');
    }

    // Render Charts
    this.renderCustomersParetoChart(customers);
    this.renderRegionsParetoChart(regions);
},

renderCustomersParetoChart: function(customers) {
    const ctx = document.getElementById('customersParetoChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: customers.map(c => c.name),
            datasets: [{
                data: customers.map(c => c.revenue),
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
                borderWidth: 2,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#f1f5f9' } }
            }
        }
    });
},

renderRegionsParetoChart: function(regions) {
    const ctx = document.getElementById('regionsParetoChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: regions.map(r => r.name),
            datasets: [{
                data: regions.map(r => r.revenue),
                backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4'],
                borderWidth: 2,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#f1f5f9' } }
            }
        }
    });
}
