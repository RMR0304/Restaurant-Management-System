class KitchenServices {
    static getOrders() {
        return Storage.get('orders').filter(o => o.status === 'Pending' || o.status === 'Preparing').sort((a, b) => a.timestamp - b.timestamp);
    }

    static updateOrderStatus(orderId, newStatus) {
        const orders = Storage.get('orders');
        const index = orders.findIndex(o => o.id === orderId);
        if (index > -1) {
            orders[index].status = newStatus;

            // If completed/ready, reduce inventory
            if (newStatus === 'Preparing') {
                const menu = Storage.get('menu');
                orders[index].items.forEach(item => {
                    const mIndex = menu.findIndex(m => m.id === item.menuItem.id);
                    if (mIndex > -1) {
                        menu[mIndex].stock -= item.quantity;
                        if (menu[mIndex].stock < 0) menu[mIndex].stock = 0;
                    }
                });
                Storage.set('menu', menu);
            }

            Storage.set('orders', orders);
            UI.showToast(`Order marked as ${newStatus}`, 'success');
        } else {
            UI.showToast('Order not found', 'error');
        }
    }
}
