class ServerServices {
    static getOrders() {
        return Storage.get('orders').sort((a, b) => b.timestamp - a.timestamp);
    }

    static getTables() {
        return Storage.get('tables') || [];
    }

    static updateOrderStatus(orderId, newStatus) {
        const orders = Storage.get('orders');
        const index = orders.findIndex(o => o.id === orderId);
        if (index > -1) {
            orders[index].status = newStatus;

            // If completed, check if table should be cleared
            if (newStatus === 'Completed') {
                const order = orders[index];
                if (order.tableNumber) {
                    ServerServices.clearTable(order.tableNumber);
                }
            }

            Storage.set('orders', orders);
            UI.showToast(`Order updated to ${newStatus}`, 'success');
        } else {
            UI.showToast('Order not found', 'error');
        }
    }

    static assignTable(tableNumber, customerId) {
        const tables = Storage.get('tables');
        const index = tables.findIndex(t => t.number === parseInt(tableNumber));
        if (index > -1) {
            tables[index].status = 'Occupied';
            tables[index].currentCustomerId = customerId;
            Storage.set('tables', tables);
            UI.showToast(`Table ${tableNumber} assigned`, 'success');
        }
    }

    static clearTable(tableNumber) {
        const tables = Storage.get('tables');
        const index = tables.findIndex(t => t.number === parseInt(tableNumber));
        if (index > -1) {
            tables[index].status = 'Available';
            tables[index].currentCustomerId = null;
            Storage.set('tables', tables);
        }
    }
}
