import { GetProductByID } from "./db.js"
import { Order } from "./order.js"
import {OrderItem} from "./OrderItem.js"
import { Product } from "./productModule.js"

export class Seller{
    
    static getTotalSells(sellerId)
    {
        // console.log(products.map(prod=>prod.id))
        
        return Product.getProductsBySeller(sellerId).map(
            product=>
                OrderItem.getTotalProductSellsById(product.id)
        )
                        
    }

    static getSellerOrderItemsById(sellerId)
    {        
        let sellerProductIds = Product.getProductsBySeller(sellerId).map(product=> product.id)
        return  OrderItem.getAllOrderItems().filter(orderItem=> sellerProductIds.includes(orderItem.productID))
    }
    static getSellerOrdersById(sellerId)
    {        
        let sellerOrderItems = this.getSellerOrderItemsById(sellerId);
        let sellerOrderItemsIds = sellerOrderItems.map(orderItem=> orderItem.orderID)
        return  Order.getAllOrders().filter(order=> sellerOrderItemsIds.includes(order.id))
    }
    static getFinalSellerOrderItemsById(sellerId)
    {        
        let sellerProductIds = Product.getProductsWithDeletedBySeller(sellerId).map(product=> product.id)
        return  OrderItem.getAllOrderItems().filter(orderItem=> sellerProductIds.includes(orderItem.productID))
    }
    
    static getFinalSellerOrdersById(sellerId)
    {        
        let sellerOrderItems = this.getFinalSellerOrderItemsById(sellerId);
        let sellerOrderItemsIds = sellerOrderItems.map(orderItem=> orderItem.orderID)
        return  Order.getAllOrders().filter(order=> sellerOrderItemsIds.includes(order.id))
    }
    static getSortedSellerOrdersById(sellerId)
    {   
        return this.getSellerOrdersById(sellerId)
                    .sort(
                        (order1,order2)=> {
                            let order1Date = new Date(order1.date||order1.createdAt) 
                            let order2Date = new Date(order2.date||order2.createdAt)
                            if(order1Date <order2Date)return 1;
                            else if(order1Date > order2Date)return -1;
                            else return 0;
                        } )         
    
    }
    static getFinalSortedSellerOrdersById(sellerId)
    {   
        return this.getFinalSellerOrdersById(sellerId)
                .sort(
                    (order1,order2)=> {
                        let order1Date = new Date(order1.date||order1.createdAt) 
                        let order2Date = new Date(order2.date||order2.createdAt)
                        if(order1Date <order2Date)return 1;
                        else if(order1Date > order2Date)return -1;
                        else return 0;
                    } )         
    }

    static calculateSales(sellerID) {
        // Step 1: Filter only seller's order items
        const sellerOrderItems = this.getFinalSellerOrderItemsById(sellerID)
        // Step 2: Map each orderItem to its matching order
        const salesData = sellerOrderItems.map(item => {
          // Find matching order
          const order = this.getFinalSortedSellerOrdersById(sellerID)
                            .filter(order=> {
                                let orderDate = new Date(order.date || order.createdAt) 
                                return order.status == 1 && orderDate >  new Date(`${new Date().getFullYear()-1}`)
                            })
                            .find(order =>  order.id == item.orderID);
          if (!order) return null; // If no matching order, skip
      
          const date = new Date(order.date||order.createdAt);
          const dailyKey = date.toISOString().split('T')[0]; // e.g. '2025-04-28'
          const monthlyKey = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0'); // e.g. '2025-04'
          const yearlyKey = date.getFullYear().toString(); // e.g. '2025'
      
          const totalCost = item.quantity * GetProductByID(item.productID)[0].price; // quantity from orderItem, cost from order
          return { dailyKey, monthlyKey, yearlyKey, totalCost };
        }).filter(x => x !== null);
      
        // Step 3: Group sales
        const dailySales = {};
        const monthlySales = {};
        const yearlySales = {};
      
        for (const sale of salesData) {
          dailySales[sale.dailyKey] = (dailySales[sale.dailyKey] || 0) + sale.totalCost;
          monthlySales[sale.monthlyKey] = (monthlySales[sale.monthlyKey] || 0) + sale.totalCost;
          yearlySales[sale.yearlyKey] = (yearlySales[sale.yearlyKey] || 0) + sale.totalCost;
        }
      
        return { dailySales, monthlySales, yearlySales };
      }

      
}