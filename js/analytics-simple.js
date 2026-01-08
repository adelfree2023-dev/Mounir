// ============================================
// 📊 SIMPLE ANALYTICS ENGINE
// Clean, organized, < 300 lines
// ============================================

const Analytics = {
    allData: [],
    filteredData: [],
    charts: {},

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
        this.allData = JSON.parse(localStorage.getItem('data_sales')) || [];
        this.filteredData = [...this.allData];
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
    }
};

// ============================================
// AUTO-INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    Analytics.init();
});
