import {Order} from "../modules/order.js";
import { OrderItem } from "../modules/OrderItem.js";
import { Product } from "../modules/productModule.js";
import {Seller} from "../modules/seller.js"
import {Auth} from "../modules/authModule.js"
import {redirect, fetchComponent, convertToHtmlElement, mapOrderStatus} from "../util.js"
import  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
import { User } from "../modules/userModule.js";

// Authintication
let seller = Auth.isLoggedIn()
if(!seller)
    redirect("../../login.html")
if(seller.id == 3)
    redirect("../../pages/not-found.html")
// End Of Authintication

// ____________________________ Start Of Functions Section ____________________________\\
        //_____________ Chart Functions _____________\\
function updateChart(data){
    chart.data.labels = Object.keys(data);
    chart.data.datasets[0].data = Object.values(data)
    chart.update();  // ← this redraws the chart with new data

}
function showDailySales(event){
    updateChart(dailySales)
}

function showMonthlySales(event){
    updateChart(monthlySales)
}

function showYearlySales(event){
    updateChart(yearlySales)
}
function sortData(data){
    return Object.keys(data)
        .sort() // Sort the keys alphabetically
        .reduce((acc, key) => {
            acc[key] = data[key]; // Rebuild a new object
            return acc;
        }, {});
}

        //_____________ RecentOrders & BestSelling Functions _____________\\

function prepareBestSellingElement(product){
    let bestSellingElement = convertToHtmlElement(BestSellingComponentString);
    bestSellingElement.querySelector(".units-sold").innerText = product.totalQuantity;
    bestSellingElement.querySelector(".product-name").innerText = product.name;
    return bestSellingElement
}


function prepareBestSelling(){
    let bestSellingContainer = document.getElementById("best-selling").querySelector(".list-group")
    let sellerProdcuts = Product.getProductsWithDeletedBySeller(sellerId);
    let sellerCompletedOrdersItems = Seller.getFinalSellerOrderItemsById(sellerId)
                        .filter(
                            (orderItem)=>{
                                if(orderItem.orderID == "3ssam_customer_6ek6wnr")
                                    return false    
                                let order = Order.getOrderById(orderItem.orderID)
                                return order.status == COMPLETED_ORDER;
                            }
                        );
    // console.log(sellerProdcuts)
    sellerProdcuts = sellerProdcuts.map(
                    (product)=>{
                            let productQuanity = 
                                    sellerCompletedOrdersItems.reduce(
                                        (totalQuantity,orderItem)=>{
                                            if(orderItem.productID == product.id)
                                            {
                                                return totalQuantity += orderItem.quantity;
                                            }
                                            return totalQuantity;  
                                        }
                                    ,0)

                            product.totalQuantity = productQuanity;
                            return product
                        }
                    )
    
    sellerProdcuts = sellerProdcuts.sort(
                            (prod1,prod2)=>{
                                return prod2.totalQuantity - prod1.totalQuantity
                            }
                        ).slice(0,3)

    // add to container
    bestSellingContainer.innerHTML = ""
    sellerProdcuts.forEach(
        (product,index)=>{
            let element = prepareBestSellingElement(product)
            element.querySelector(".number").innerText = index+1
            element.href = product.isDeleted? "#": `./product.html?prod-id=${product.id}`;
            bestSellingContainer.insertAdjacentElement("beforeend",element);

        }
    )
    
}

function prepareOrder(order){ 
    console.log("order",order)       
        let recentOrderElement = convertToHtmlElement(recentOrderComponentString)
        // set id & date
        recentOrderElement.querySelector(".order-id").innerText = order.id
        recentOrderElement.querySelector(".order-date").innerText = new Date(order.date|| order.createdAt).toDateString()
        
        // set status
        let status = order.status
        let sellerPedingItemsOnThisOrder = sellerOrderItems.filter(orderItem=>
                                            order.id == orderItem.orderID &&  orderItem.status == 0
                                    )
        let statusText = ""
        if(status ==0 &&  sellerPedingItemsOnThisOrder.length == 0)
            {
                status = 1
                statusText = "Waiting"
            }
        
        let statusMap = mapOrderStatus( status)
        let orderStatusElement = recentOrderElement.querySelector(".order-status")
        orderStatusElement.innerText = statusText || statusMap.statusElement.innerText;
        orderStatusElement.classList.add(statusMap.bgColor)
        //____________________________________\\

        
        //__________________Total Order Price & Order Items Count_________________//
        
        let orderItems = Seller.getFinalSellerOrderItemsById(sellerId)
        .filter(orderItem=> orderItem.orderID == order.id)
        // console.log(orderItems)
        let orderTotalPice = orderItems.map(
                    orderItem=> {
                        console.log("orderItem.quantity * orderItem.price",orderItem.quantity * orderItem.price)
                        return orderItem.quantity * orderItem.price
                    }
                    // Product.getProductById(orderItem.productID).price
                ).reduce(
                    (totalPrice,itemPrice)=>totalPrice+itemPrice
                ,0)
            
        recentOrderElement.querySelector(".order-cost").innerText = orderTotalPice  
        recentOrderElement.querySelector(".order-item-count").innerText = orderItems.length  
        return recentOrderElement
}

        //_______________________________________________\\
function prepareRecentOrders(){
    let recentOrdersContainer = document.getElementById("recent-orders")
                                    .querySelector(".list-group")
    let sellerSortedOrders = Seller.getFinalSortedSellerOrdersById(sellerId)
                                .filter(
                                    order=>{
                                        let orderDate = new Date(order.date || order.createdAt)
                                        let xDaysAgoDate = new Date();
                                        xDaysAgoDate.setMonth(new Date().getMonth()-1)
                                        // xDaysAgoDate = xDaysAgoDate.toISOString()

                                        return orderDate >= xDaysAgoDate  
                                    }
                                )
                                .slice(0,3)
    recentOrdersContainer.innerHTML = "";
    sellerSortedOrders.map(
        element => 
            prepareOrder(element)
    ).forEach(orderElement => {
        recentOrdersContainer.insertAdjacentElement("beforeend",orderElement);
    });       
    // console.log(sellerSortedOrders) ;
}



function animateCount(id, endValue, duration = 1000) {
    const element = document.getElementById(id);
    let startValue = 0;
    // endValue = Math.max(endValue,1)
    let stepTime = Math.abs(Math.floor(  duration/ endValue));
    let valueStep = Math.max(1,Math.floor(Math.min(10,endValue/100)))
    // stepTime = 0.1
    const counter = setInterval(() => {
        if (startValue >= endValue) {
            clearInterval(counter);
        }
        element.textContent = startValue;
        startValue = Math.min(startValue+valueStep,endValue);

    }, stepTime);
}



// ____________________________ End Of Functions Section ____________________________\\

// ____________________________ Global Variabls Section ____________________________\\
let recentOrderComponentString = await fetchComponent("../../components/seller-recent-order.html")
let BestSellingComponentString = await fetchComponent("../../components/seller-best-selling.html")
const COMPLETED_ORDER = 1;
var sellerId = User.getCurrentUser().id
// ____________________________ End Global Variabls Section ____________________________\\






// ____________________________ Starting ____________________________\\


    // Total products
let totalProductsCount = Product.getProductsBySeller(sellerId).length 
animateCount("total-products",totalProductsCount,500)


// getSellerOrders
let sellerFinalOrders = Seller.getFinalSellerOrdersById(sellerId);

// Get shipped orders Orders Only
let shippedOrders = sellerFinalOrders.filter(order=> order.status == 1);

// get zseller orders 
let sellerOrderItems = Seller.getFinalSellerOrderItemsById(sellerId)
console.log("sellerOrderItems",sellerOrderItems)

// Total orders, Pending Orders
animateCount("total-orders",shippedOrders.length,200)
let pendingOrdersCount = sellerFinalOrders.filter(order=> order.status == 0).length 
animateCount("pending-orders",pendingOrdersCount,500)


let sellerProductsIds = Product.getProductsWithDeletedBySeller(sellerId).map(product=> product.id)

// calculate the total revenue
let totalRevenue   = shippedOrders.reduce((ordersAcc,order)=> {
                            return ordersAcc + OrderItem.getOrderItemsByOrderId(order.id)
                                    .reduce((orderItemsAcc,orderItem)=>{
                                            if(sellerProductsIds.includes(orderItem.productID)){
                                                let productPrice //=
                                                // Product.getProductById(orderItem.productID).price   
                                                productPrice = orderItem.price || 0    
                                                return orderItemsAcc+(productPrice*orderItem.quantity)
                                            }else
                                                return orderItemsAcc;
                                        },0)
                                    }
                                    ,0).toFixed(2) 

animateCount("total-revenue",totalRevenue,10000)
// console.log(totalRevenue)    

// Total Sold Units
let shippedOrderIds = shippedOrders.map(order=> order.id)
let totalSoldUnits = sellerOrderItems.filter(  
                            orderItem=> shippedOrderIds.includes(orderItem.orderID)
                        )
                        .reduce((acc,orderItem)=> acc+orderItem.quantity,0)
animateCount("total-sold-units",totalSoldUnits,)





    // prepare sales                                                    
let allSales = Seller.calculateSales(sellerId);  
let dailySales = sortData(allSales.dailySales);
let monthlySales = sortData(allSales.monthlySales);
let yearlySales = sortData(allSales.yearlySales);

const labels = Object.keys(dailySales)
const salaries = Object.values(dailySales)

    // Creating the Chart  
let chart = new Chart(document.getElementById('salesChart'), {
        type: 'line',
        data: {
        labels: labels,
        datasets: [{
            label: 'Sales Over Time',
            data: salaries,
            borderColor: 'blue',
            backgroundColor: 'lightblue',
            fill: false,
            tension: 0.1,
        }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                  labels: {
                    font: {
                      size: 20 // <-- controls dataset label size in legend
                    }
                  }
                },
                tooltip: {
                  bodyFont: {
                    size: 16 // <-- controls font size inside tooltip
                  }
                }
              },
        scales: {
            x: {
            title: { display: true, text: 'Date', font:{size:20} }
            },
            y: {
                beginAtZero: true,
               title: { display: true, text: 'Salary ($)', font:{size:20} }
            }
        }
    }
});


// Listening To Chart Buttons
document.getElementById("yearly-sales").addEventListener("click",showYearlySales);
document.getElementById("monthly-sales").addEventListener("click",showMonthlySales);
document.getElementById("daily-sales").addEventListener("click",showDailySales);
    

// Loading Recent orders & Best selling
prepareRecentOrders()
prepareBestSelling()
