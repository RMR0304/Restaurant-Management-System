class KitchenServices {
    static getOrders() {
        return Storage.get('orders').filter(o => o.status === 'Pending' || o.status === 'Preparing').sort((a, b) => a.timestamp - b.timestamp);
    }

    static updateOrderStatus(orderId, newStatus) {
        const orders = Storage.get('orders');
        const index = orders.findIndex(o => o.id === orderId);
        if (index > -1) {
            orders[index].status = newStatus;

            // Inventory is now reduced at the time of order placement in order.html

            Storage.set('orders', orders);
            UI.showToast(`Order marked as ${newStatus}`, 'success');
        } else {
            UI.showToast('Order not found', 'error');
        }
    }
}
