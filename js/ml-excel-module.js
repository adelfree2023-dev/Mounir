// Basic Machine Learning - Anomaly Detection - Add to analytics.js

performMLAnalysis: function() {
    // 1. Anomaly Detection (Z-Score on Sales)
    const salesValues = this.filteredData.map(d => parseFloat(d.netSales || 0));
    const mean = salesValues.reduce((a, b) => a + b, 0) / salesValues.length;
    const stdDev = Math.sqrt(salesValues.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / salesValues.length);

    // Threshold for anomaly: > 2 standard deviations (Z-Score > 2)
    const anomalies = this.filteredData.filter(d => {
        const val = parseFloat(d.netSales || 0);
        const zScore = (val - mean) / stdDev;
        return Math.abs(zScore) > 2;
    });

    console.log(`ML: Found ${anomalies.length} anomalies in sales data.`);

    // We can expose this to UI later, for now we log it or add a simple card if UI exists.
    // Let's add a "Data Insights" section or alert if anomalies are high.
},

// Actual Excel Export (CSV)
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
            const escaped = ('' + (row[header] || '')).replace(/"/g, '\\"');
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
