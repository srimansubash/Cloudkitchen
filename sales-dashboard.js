// ========================================
// SALES DASHBOARD JAVASCRIPT
// ========================================

const ORDERS_KEY = "ck.orders.v1";

// Get all orders from localStorage
function getAllOrders() {
    const ordersData = localStorage.getItem(ORDERS_KEY);
    return ordersData ? JSON.parse(ordersData) : [];
}

// Save orders to localStorage
function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// Filter orders by date range
function filterOrdersByDateRange(orders, startDate, endDate) {
    return orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= startDate && orderDate <= endDate;
    });
}

// Get date range based on period
function getDateRange(period) {
    const now = new Date();
    let startDate, endDate = new Date();

    switch(period) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(0); // All time
    }

    return { startDate, endDate };
}

// Calculate summary statistics
function calculateSummary(orders) {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalGST = orders.reduce((sum, order) => sum + order.gst, 0);
    const totalDelivery = orders.reduce((sum, order) => sum + order.delivery, 0);
    const totalItems = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    return {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalGST,
        totalDelivery,
        totalItems
    };
}

// Update dashboard display
function updateDashboard(orders) {
    const summary = calculateSummary(orders);

    // Update summary cards
    document.getElementById('totalRevenue').textContent = `₹${summary.totalRevenue.toFixed(2)}`;
    document.getElementById('totalOrders').textContent = summary.totalOrders;
    document.getElementById('avgOrderValue').textContent = `₹${summary.avgOrderValue.toFixed(2)}`;
    document.getElementById('totalGST').textContent = `₹${summary.totalGST.toFixed(2)}`;
    document.getElementById('totalDelivery').textContent = `₹${summary.totalDelivery.toFixed(2)}`;
    document.getElementById('totalItems').textContent = summary.totalItems;

    // Update sales list
    const saleList = document.getElementById('saleList');
    
    if (orders.length === 0) {
        saleList.innerHTML = `
            <div class="no-data">
                <p>No orders yet</p>
                <small>Orders will appear here once customers place them</small>
            </div>
        `;
        return;
    }

    // Sort orders by timestamp (newest first)
    const sortedOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);

    saleList.innerHTML = sortedOrders.map(order => {
        const orderDate = new Date(order.timestamp);
        const dateStr = orderDate.toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        const timeStr = orderDate.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const itemsList = order.items.map(item => 
            `${item.name} (x${item.quantity})`
        ).join(', ');

        return `
            <div class="sale-entry">
                <div class="sale-entry-left">
                    <strong>Order #${order.orderId}</strong>
                    <small>${dateStr} at ${timeStr}</small>
                    <small class="order-items">📦 ${itemsList}</small>
                </div>
                <div class="sale-entry-right">
                    <span class="sale-amount-green">₹${order.total.toFixed(2)}</span>
                    <small>${order.items.reduce((sum, item) => sum + item.quantity, 0)} items</small>
                </div>
            </div>
        `;
    }).join('');
}

// Handle period change
document.getElementById('salesPeriod').addEventListener('change', (e) => {
    const period = e.target.value;
    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');
    const applyBtn = document.getElementById('applyFilterBtn');

    if (period === 'custom') {
        fromDate.style.display = 'block';
        toDate.style.display = 'block';
        applyBtn.style.display = 'block';
    } else {
        fromDate.style.display = 'none';
        toDate.style.display = 'none';
        applyBtn.style.display = 'none';
        
        // Apply filter immediately for non-custom periods
        applyFilter(period);
    }
});

// Apply filter function
function applyFilter(period = null) {
    const selectedPeriod = period || document.getElementById('salesPeriod').value;
    const allOrders = getAllOrders();
    
    let filteredOrders;
    
    if (selectedPeriod === 'custom') {
        const fromDateValue = document.getElementById('fromDate').value;
        const toDateValue = document.getElementById('toDate').value;
        
        if (!fromDateValue || !toDateValue) {
            alert('Please select both start and end dates');
            return;
        }
        
        const startDate = new Date(fromDateValue);
        const endDate = new Date(toDateValue);
        endDate.setHours(23, 59, 59, 999); // End of day
        
        filteredOrders = filterOrdersByDateRange(allOrders, startDate, endDate);
    } else {
        const { startDate, endDate } = getDateRange(selectedPeriod);
        filteredOrders = filterOrdersByDateRange(allOrders, startDate, endDate);
    }
    
    updateDashboard(filteredOrders);
}

// Apply filter button
document.getElementById('applyFilterBtn').addEventListener('click', () => {
    applyFilter('custom');
});

// Export to PDF
document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const element = document.getElementById('salesReportSection');
    
    html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
    }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const imgData = canvas.toDataURL('image/png');
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Sales_Report_${new Date().getTime()}.pdf`);
        
        alert('PDF downloaded successfully!');
    });
});

// Clear all data
document.getElementById('clearAllBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all sales data? This action cannot be undone.')) {
        localStorage.removeItem(ORDERS_KEY);
        updateDashboard([]);
        alert('All sales data has been cleared.');
    }
});

// Listen for new orders (from other pages)
window.addEventListener('storage', (e) => {
    if (e.key === ORDERS_KEY) {
        applyFilter();
    }
});

// Initialize dashboard on page load
window.addEventListener('load', () => {
    applyFilter('today'); // Default to today's orders
});