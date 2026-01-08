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
            this.showEmptyState();
            return;
        }

        this.filteredData = [...this.data]; // Start with all data
        this.setDefaultDateRange(); // NEW
        this.calculateKPIs();
        this.calculateAdvancedStats(); // NEW
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

    // NEW: Set default date range on load
    setDefaultDateRange: function () {
        const dates = this.data.map(d => new Date(d.orderDate)).filter(d => !isNaN(d));
        if (dates.length === 0) return;

        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        const startInput = document.getElementById('startDate');
        const endInput = document.getElementById('endDate');

        if (startInput && endInput) {
            startInput.value = minDate.toISOString().split('T')[0];
            endInput.value = maxDate.toISOString().split('T')[0];
            startInput.min = minDate.toISOString().split('T')[0];
            startInput.max = maxDate.toISOString().split('T')[0];
            endInput.min = minDate.toISOString().split('T')[0];
            endInput.max = maxDate.toISOString().split('T')[0];
        }

        this.updateActiveFilterDisplay();
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

        // Update DOM
        document.getElementById('totalSales').textContent = `$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('totalProfit').textContent = `$${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('totalOrders').textContent = totalOrders.toLocaleString();
        document.getElementById('avgOrderValue').textContent = `$${avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
