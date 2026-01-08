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
