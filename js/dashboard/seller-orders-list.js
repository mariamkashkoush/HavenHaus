import { Order } from "../modules/order.js";
import { Product } from "../modules/productModule.js";
import { Seller } from "../modules/seller.js";
import { fetchComponent ,convertToHtmlElement, redirect } from "../util.js";
import { User } from "../modules/userModule.js";
import { Auth } from "../modules/authModule.js";
import { OrderItem } from "../modules/OrderItem.js";
import { mapOrderStatus } from "../util.js";

var seller = User.getCurrentUser();
if(!seller || !seller.role)
    redirect("../../login.html")
else if(seller.role !=1 )
        redirect("../../pages/not-found.html")

//___________________________ Functions Section ___________________________\\
function alternateRowColors() {
    const rows = document.querySelectorAll("#myTable tbody tr");
    rows.forEach((row, index) => {
      row.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#ffffff";
    });
}
function closestTableBreakSibling(tr){
    let isTableBreak = false
    if(!tr)
        return
    while(!isTableBreak){
        if(tr.classList.contains("table-break"))
            isTableBreak = true
        else
            tr = tr.previousElementSibling
    }
    // console.log("from ClosestTableBreak ",tr)
    return tr
}



function getOrderTrs(tableBreak){
    let isTableBreak = false
    let trs = []
    let orderItemTr = tableBreak.nextElementSibling
    while(!isTableBreak){
        if(!orderItemTr || orderItemTr.classList.contains("table-break"))
            isTableBreak = true
        else{
            trs.push(orderItemTr)
            orderItemTr= orderItemTr.nextElementSibling
        }
    }
    return trs
}

function updateOrderItemTrStatus(orderItemTr,status){
    let statusObejct = mapOrderStatus(status)

    orderItemTr.querySelector(".order-status").innerHTML = ""
    orderItemTr.querySelector(".order-status").appendChild(statusObejct.statusIcon)
    orderItemTr.querySelector(".order-reject-btn").classList.add("d-none")
    orderItemTr.classList.remove(mapOrderStatus(0).bgColor);
    

}



function hideTableBreakBtn(tableBreak){
    tableBreak.querySelector(".order-accept-btn").classList.add("d-none");
    tableBreak.querySelector(".order-reject-btn").classList.add("d-none");
    // tableBreak.querySelector(".order-id-td").colSap = 6
}
function rejectOrderItem(event){
    
}
function rejectOrder(event){
    orderDeleteConfirmModal.hide()

    let orderId = event.target.dataset.id
    let orderItemTr =  document.querySelector(`.order-item[data-id="${CSS.escape(orderId)}"]`)
    let productId = event.target.dataset.productId
    let rejectAll= event.target.dataset.rejectAll
    
    
    let orderTableBreak = closestTableBreakSibling(orderItemTr)
    hideTableBreakBtn(orderTableBreak)


    let orderItemsTr = getOrderTrs(orderTableBreak)
    
    // reject order in Database
    OrderItem.suppressOrderById(orderId)
    Order.updateOrderStatus(orderId,REJECTED_ORDER)

    let orderItemStatus ;
    orderItemsTr.forEach((orderItemTr)=>{
        if(rejectAll== "true" || orderItemTr.dataset.productId == productId)
            orderItemStatus = REJECTED_ORDER
        else
            orderItemStatus = SUPPRESSED_ORDER

        updateOrderItemTrStatus(orderItemTr,orderItemStatus)
        OrderItem.setOrderItemStatus(orderId,orderItemTr.dataset.productId,orderItemStatus)
    })
    
    event.target.dataset.rejectAll = "d"

}
function acceptOrder(event){
    orderAcceptConfirmModal.hide()
    let orderId = event.target.dataset.id
    let randomOrderItemTr =  document.querySelector(`.order-item[data-id="${CSS.escape(orderId)}"]`)
    // let productId = event.target.dataset.productId
  
    
    let orderTableBreak = closestTableBreakSibling(randomOrderItemTr)
    hideTableBreakBtn(orderTableBreak)
    
    let orderItemsTr = getOrderTrs(orderTableBreak)
    
    orderItemsTr.forEach((orderItemTr)=>{
        updateOrderItemTrStatus(orderItemTr,1)
        let productId = orderItemTr.dataset.productId
        OrderItem.setOrderItemStatus(orderId,productId,1)
    })
    // Change Order State if all OrderItems are Accepted
    let notAcceptedOrderItems = OrderItem.getOrderItemsByOrderId(orderId).filter(orderItem=> orderItem.status != 1)
    if(notAcceptedOrderItems.length == 0)
        Order.updateOrderStatus(orderId,1)
    else
        {
            orderTableBreak.querySelector(".btn-td").innerText = "Waiting"
        }
    
}
function showOrderRejectModal(event){
    // Get The Button itself
    let btn = event.target.closest("button")
    // Extract order-id & product-id from the button 
    let orderId = btn.dataset.id
    let productId =  btn.dataset.productId
    let rejectAll =  btn.dataset.rejectAll
    // add them on the ConfirmDeleteBtn
    orderConfirmDeleteBtn.dataset.id = orderId
    orderConfirmDeleteBtn.dataset.productId = productId
    orderConfirmDeleteBtn.dataset.rejectAll = rejectAll 
    // Show Modal
    orderDeleteConfirmModal.show();
}
function rejectAllItems(event){
    event.target.closest("button").dataset.rejectAll = "true";
    showOrderRejectModal(event)
}

function showOrderAcceptModal(event){
    // Get The Button itself
    let btn = event.target.closest("button")
    // Extract order-id & product-id from the button 
    let orderId = btn.dataset.id
    let productId =  btn.dataset.productId
    // add them on the ConfirmBtn
    // console.log("from showAcceptModal ",btn)
    // console.log("from showAcceptModal ",orderId,productId)
    orderConfirmAcceptBtn.dataset.id = orderId
    orderConfirmAcceptBtn.dataset.productId = productId
    // show the modal
    orderAcceptConfirmModal.show()
}   

function createOrderTableRow(orderItem,order){
    let orderTableRow = convertToHtmlElement(orderTableRowString);
    orderTableRow.dataset.id = order.id
    orderTableRow.dataset.productId = orderItem.productID
    let product = Product.getFinalProductById(orderItem.productID)
    let nameElement = orderTableRow.querySelector(".order-product-name");
    nameElement.textContent = product.name
    if(product.isDeleted==true) 
        {
            nameElement.classList.add("text-danger")
            nameElement.title = "This product's been deleted"
        }
    orderTableRow.querySelector(".order-product-id").textContent = product.id
    
    let orderDate = new Date(order.date || order.createdAt).toISOString().split("T")
    let orderDMY = orderDate[0]
    let orderTime = orderDate[1].split(".")[0]
    orderTableRow.querySelector(".order-date").textContent = `${orderDMY}, ${orderTime}`
    orderTableRow.querySelector(".order-product-amount").textContent = orderItem.quantity
        

 
    let statusMap = mapOrderStatus(orderItem.status) 
    orderTableRow.querySelector(".order-status").appendChild(statusMap.statusIcon );
    // orderTableRow.classList.add(statusMap.bgColor)

    let rejectBtn = orderTableRow.querySelector(".order-reject-btn")
    if(orderItem.status == 0){
        rejectBtn.dataset.id = order.id
        rejectBtn.dataset.productId = product.id
        rejectBtn.addEventListener("click",showOrderRejectModal)
 
    }else{
        rejectBtn.classList.add("d-none")
    }
    orderTableRow.dataset.orderId = order.id
    return orderTableRow;
}

function showOrders(sellerOrders,sellerOrderItems){
    sellerOrders.forEach((order,index) => {
        let rowColor = index % 2 === 0 ? "#e8e8e8" : "#e8e8e8";
        let tableBreakElement = convertToHtmlElement(orderTableBreakString)
        let orderItems = sellerOrderItems.filter((orderItem=> orderItem.orderID == order.id))
        let orderPedningItems = orderItems.filter(orderItem=> orderItem.status == 0)

        tableBreakElement.style.backgroundColor= rowColor


        // add order id and AcceptBtn listner
        tableBreakElement.querySelector(".order-id").innerText = order.id
        let orderAcceptBnt = tableBreakElement.querySelector(".order-accept-btn")
        let rejectOrderBnt = tableBreakElement.querySelector(".order-reject-btn")

        if(order.status ==0 && orderPedningItems.length > 0){
            orderAcceptBnt.dataset.id = order.id;
            rejectOrderBnt.dataset.id = order.id;
            orderAcceptBnt.addEventListener("click",showOrderAcceptModal)
            rejectOrderBnt.addEventListener("click",rejectAllItems)
        }else if(order.status ==0 && orderPedningItems.length==0){
            tableBreakElement.querySelector(".btn-td").innerText= "Waiting"
            orderAcceptBnt.classList.add("d-none");
            rejectOrderBnt.classList.add("d-none");
        }else{
            orderAcceptBnt.classList.add("d-none");
            rejectOrderBnt.classList.add("d-none");
        }

        

        // add row to Table Body
        orderTableBody.insertAdjacentElement("beforeend",tableBreakElement)
        
        // add Orders List To The Table Body
        orderItems.forEach((orderItem)=>{
            let orderTableRow = createOrderTableRow(orderItem,order)
            orderTableBody.insertAdjacentElement("beforeend",orderTableRow)
        })
    });
}

function applyFilter(event){
    let filteredOrders = sellerOrders, filteredOrderItems = sellerOrderItems;
    let filterSelectValue = event.target.value.toLowerCase()
    
    if(!( filterSelectValue == "-1")){
                filteredOrderItems = sellerOrderItems.filter(orderItem=> orderItem.status == filterSelectValue )
                let filteredOrdersIds = filteredOrderItems.map(orderItem=> orderItem.orderID)

                filteredOrders = sellerOrders.filter(order=>
                                                        filteredOrdersIds.includes(order.id)
                                                    ) 
    }
    orderTableBody.innerHTML = "";
    showOrders(filteredOrders,filteredOrderItems);

}

//___________________________ End Functions Section ___________________________\\



//___________________________ Gloabal Variables ___________________________\\
let orderTableRowString = await fetchComponent("../../components/seller-order-row.html");
let orderTableBreakString = await fetchComponent("../../components/seller-order-table-break.html");
let sellerId = seller.id;
const PENDING_ORDER = 0
const ACCEPTED_ORDER = 1
const REJECTED_ORDER = 2
const SUPPRESSED_ORDER = 3

let sellerOrders = Seller.getFinalSortedSellerOrdersById(sellerId)
let sellerOrderItems = Seller.getFinalSellerOrderItemsById(sellerId);
let orderTableBody = document.getElementById("orders-table-body");
let orderFilterSelect = document.getElementById("filter-order-status");

// modals
var orderDeleteConfirmModal = new bootstrap.Modal(document.getElementById("orderDeleteConfirmModal"))
var orderAcceptConfirmModal = new bootstrap.Modal(document.getElementById("orderAcceptConfirmModal"))

// Buttons
var orderConfirmDeleteBtn = document.getElementById("orderConfirmDeleteBtn");
var orderConfirmAcceptBtn = document.getElementById("orderConfirmAcceptBtn");



//___________________________ End Of Gloabal Variables ___________________________\\


//------------------ Event Listeners ------------------\\
orderFilterSelect.addEventListener("change",applyFilter)
orderConfirmDeleteBtn.addEventListener("click",rejectOrder)
orderConfirmAcceptBtn.addEventListener("click",acceptOrder)
    //_____________________ End _________________//


showOrders(sellerOrders,sellerOrderItems)