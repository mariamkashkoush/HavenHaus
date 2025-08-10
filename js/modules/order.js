import { getTable, setTable, add } from "./db.js";
const CANCELED_ORDER = 5

export class Order {
    constructor({ userId, items, status = 0, createdAt = new Date().toISOString()}) {
        this.userId = userId;
        this.items = items; 
        this.status = status; 
        
        this.total = this.#calculateTotal();
        this.id = this.#generateUniqueId(userId);
        
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        this.createdAt = `${day}/${month}/${year}`;
    }

    #generateId(userId) {
        return userId + '_' + Math.random().toString(36).substring(2, 9);
    }

    #generateUniqueId(userId) {
        const existing = Order.getAllExistingOrderIds();
        let id;
        do {
            id = this.#generateId(userId);
        } while (existing.includes(id));
        return id;
    }

    #calculateTotal() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    static getAllOrders() {
        return getTable("order") || [];
    }

    static getAllExistingOrderIds() {
        return this.getAllOrders().map(order => order.id);
    }

    static getOrdersByUser(userId) {
       return this.getAllOrders().filter(order => order.userId == userId);
    }

    static getOrderById(orderId) {
        return this.getAllOrders().find(order => order.id == orderId);
    }

    static addOrder(order) {
        add("order", order);
    }

    static removeOrder(orderId) {
        const orders = this.getAllOrders().filter(order => order.id != orderId);
        setTable("order", orders);
    
    }

    static updateOrderStatus(orderId, newStatus) {
        const orders = this.getAllOrders().map(order =>
            order.id == orderId ? { ...order, status: newStatus } : order
        );
        setTable("order", orders);
    }
    static cancelOrderById(orderId){
        let allOrders = this.getAllOrders();
        let orderIndex = allOrders.findIndex(order=> order.id == orderId)
        if(orderIndex > -1){
            allOrders[orderIndex].status = CANCELED_ORDER
        }
        setTable("order",allOrders)
        console.log("allOrders[orderIndex]",allOrders)
    }

}
