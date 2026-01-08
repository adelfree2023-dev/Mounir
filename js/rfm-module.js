// RFM Segmentation Logic - Add to analytics.js

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

exportToExcel: function() {
    alert('Excel export feature - coming soon!');
    // Will be implemented with SheetJS library
}
