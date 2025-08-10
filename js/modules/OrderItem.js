import { GetProductByID, getTable, add } from "./db.js";
import {Product } from "./productModule.js";

import { setTable } from "./db.js";
const CANCELED_ORDER = 5

export class OrderItem {
    constructor({orderID, productID, quantity, price, status = 0 }) {
        this.orderID = orderID;
        this.productID = productID;
        this.quantity = quantity;
        this.price = price;
        this.status = status;
    }

    static addOrderItem(orderItem) {
        add("orderItem", orderItem);
    }
    #generateId() {
        return 'item_' + Math.random().toString(36).substring(2, 10);
    }
    static getAllOrderItems() {
            return getTable("orderItem") || [];
    }
    static getOrderItemsBySellerId(sellerId) {
        return this.getAllOrderItems().filter(item => item.sellerID == sellerId );
    }
    static getOrderItemsByOrderId(orderId) {
        return this.getAllOrderItems().filter(item => item.orderID == orderId );
    }
    static getOrderItemsByProductId(productId) {
        // this.getAllOrderItems().filter(item => item.productID == productId )
        return this.getAllOrderItems().filter(item => item.productID == productId );
    }
    // static getProductQuantityByProductId(productId) {
    //     let product = Product.getProductById();
    //     return this.getOrderItemsByProductId()
    //                 .map(item => item.quantity )
    //                 .map(quantity => product.price * quantity);
    // }
    static getProductSellsById(productId) {
        let product = Product.getProductById(productId);
        return this.getOrderItemsByProductId(productId)
                    .map(item => item.quantity )
                    .map(quantity => product.price * quantity);
    }
    // static getTotalProductSellsById(productId) {
    //     return this.getProductSellsById(productId).reduce((prev,curr)=> prev+curr);
    // }
    static getTotalProductSellsById(productId) {
        return this.getProductSellsById(productId).reduce((prev,curr)=> prev+curr , 0);
    }
    
    static removeOrderItemByOrderId(orderId) {
        const orderItems = this.getAllOrderItems().filter(orderItem => orderItem.orderID != orderId);
        setTable("orderItem", orderItems);
    }
    static getOrderItemsByProductId(productId) {
        const orderItems = this.getAllOrderItems().filter(orderItem => orderItem.productID == productId);
        return orderItems;
    }

    static setOrderItemStatus(orderId,productId,status){
        let orderItems = this.getAllOrderItems()
        let index = orderItems.findIndex(orderItem=> orderItem.orderID==orderId && orderItem.productID==productId)
        // console.log(orderId)
        // console.log(index)
        if(index > -1){
            orderItems[index].status = status;
            setTable("orderItem",orderItems)
        }
    }
    static suppressOrderById(orderId){
        let orderItems = this.getAllOrderItems().map(orderItem=>{
            if(orderItem.orderID == orderId)
                orderItem.status = 3 
            return orderItem
        })
        setTable("orderItem",orderItems)
    }
    // static acceptOrderById(orderId){
    //     let orderItems = this.getAllOrderItems().map(orderItem=>{
    //         if(orderItem.orderID == orderId)
    //             orderItem.status = 1 
    //         return orderItem
    //     })
    //     setTable("orderItem",orderItems)
    // }
    static cancelOrderItemsByOrderId(orderId){
        let orderItems = this.getAllOrderItems().map(orderItem=>{
            if(orderItem.orderID == orderId)
                orderItem.status = CANCELED_ORDER;

            return orderItem
        })
        console.log("orderItems",orderItems)
        setTable("orderItem",orderItems)
    }

}
