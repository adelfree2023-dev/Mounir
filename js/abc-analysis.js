// ABC Analysis Module - appended to analytics.js
const ABCAnalysis = {
    calculateABC: function (data) {
        const productRevenue = {};
        data.forEach(d => {
            const product = d.productName || 'Unknown';
            const revenue = parseFloat(d.netSales || 0);
            productRevenue[product] = (productRevenue[product] || 0) + revenue;
        });

        const products = Object.keys(productRevenue)
            .map(product => ({ name: product, revenue: productRevenue[product] }))
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
                product.category = 'A';
                product.categoryColor = '#10b981';
            } else if (cumulative <= 95) {
                product.category = 'B';
                product.categoryColor = '#f59e0b';
            } else {
                product.category = 'C';
                product.categoryColor = '#ef4444';
            }
        });

        return products;
    }
};
