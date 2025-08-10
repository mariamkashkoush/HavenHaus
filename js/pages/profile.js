import { User } from "../modules/userModule.js";
import { Component } from "../componentModules/components.js";
import { createAlert, redirect, mapOrderStatus} from "../util.js";
import {Validation} from "../modules/validation.js";
import { Order } from "../modules/order.js";
import { Auth } from "../modules/authModule.js";
import { OrderItem } from "../modules/OrderItem.js";
import { GetProductByID } from "../modules/db.js";
const CANCELED_ORDER = 5;
Auth.enforcePageAuthorization();


await Component.renderNavbar();
await Component.renderFooter();

await Component.renderCartOffcanvas();

const modal = document.getElementById('confirmModal');
const cancelBtn = document.getElementById('cancelDelete');
const confirmBtn = document.getElementById('confirmDelete');

let currentUser = User.getCurrentUser();
let ususername = document.getElementById("username");

let userOrders = Order.getOrdersByUser(currentUser.id);

const fields = {
    noorders: document.getElementById("noorders"),
    exorders: document.getElementById("exorders"),
    editIcon: document.getElementById("edit_icon"),
    fullName: document.getElementById("fullname"),
    profileEmail: document.getElementById("profile_email"),
    editProfile: document.getElementById("editProfile"),
    cancel: document.getElementById("cancel"),
    saveChanges: document.getElementById("saveChanges"), 
    profileInfo: document.getElementById("profileInfo"),
    profileForm: document.getElementById("profileForm"),
    fName: document.getElementById("fName"),
    lName: document.getElementById("lName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    fNameInput: document.getElementById("fNameInput"),
    lNameInput: document.getElementById("lNameInput"),
    emailInput: document.getElementById("emailInput"),
    phoneInput: document.getElementById("phoneInput")
};

const sellerbutton =document.getElementById("sellerdashboard");
sellerbutton.addEventListener('click',function(){
    redirect('../../pages/dashboard-seller.html');
})
if (currentUser.role !=1) {
    sellerbutton.classList.add('d-none');
    
}
if(currentUser.role !=2){
    document.getElementById("my-order-button").classList.add('d-none');
    document.getElementById("profile-whishlist-btn").classList.add('d-none');

}

if (userOrders.length > 0){
    console.log("userOrders",userOrders)
    fields.noorders.style.setProperty("display", "none", "important");
    for (let i = 0; i < userOrders.length; i++) {
        let user_order = userOrders[i];
        let order_items = OrderItem.getOrderItemsByOrderId(user_order.id);
        let divOrder = document.createElement("div");
        divOrder.classList.add("order");
        divOrder.innerHTML = "";
        divOrder.innerHTML += appendOrderHeader(user_order.id, user_order.createdAt || user_order.date, mapOrderStatus(user_order.status));
        console.log("user_order.status",user_order.status)
        for (let j = 0; j < order_items.length; j++) {
            divOrder.innerHTML += appendOrderBody(GetProductByID(order_items[j].productID)[0].name, order_items[j].quantity, order_items[j].price,GetProductByID(order_items[j].productID)[0].imageUrl);
        }
        // divOrder.innerHTML = appendOrder(user_order.id, "islam", order_items[i].quantity, order_items[i].price);
        divOrder.innerHTML += appendOrderFooter(user_order.total, user_order.status)
    if(userOrders[i].status == 0 )
        divOrder.querySelector("#cancelOrder").addEventListener("click", ()=>{
            modal.style.display = "block";
            confirmBtn.onclick = () => {
                modal.style.display = 'none';
                createAlert("Order Canceled!", "success");
                // alert('Item deleted successfully!');
                OrderItem.cancelOrderItemsByOrderId(user_order.id);
                Order.cancelOrderById(user_order.id);
                // divOrder.remove();

                let orderStatusElement = divOrder.querySelector(".order-status")
                let orderStatus = mapOrderStatus(CANCELED_ORDER);
                orderStatusElement.innerText = orderStatus.statusElement.innerText
                orderStatusElement.classList.add(orderStatus.bgColor)
                divOrder.querySelector("#cancelOrder").classList.add("d-none")
                userOrders = Order.getOrdersByUser(currentUser.id);
                if(userOrders.length == 0){
                    fields.noorders.style.setProperty("display", "flex", "important");
                } 
              };
        })
        fields.exorders.appendChild(divOrder);
    }
    // userOrders.forEach(()=>{
    //     fields.exorders.innerHTML = appendOrder();
    // });
    
    // fields.noorders.style.display = "none";
    // fields.noorders.classList.add("d-none");
}

fields.editIcon.addEventListener("click", ()=>{
    console.log(userOrders)
})


UpdateChanges(currentUser);

fields.editProfile.addEventListener('click', (e) => {
    // e.target.style.display = "none";
    fields.saveChanges.style.display = "inline";
    DisplayEdit(e.target);
    SetFormData();
});

fields.cancel.addEventListener('click', (e) => {
    // e.target.style.display = "none";
    DisplayInfo(e.target);
});

fields.saveChanges.addEventListener('click', (e) =>{
    let fname = fields.fNameInput.value.trim();
    let lname = fields.lNameInput.value.trim();
    let email = fields.emailInput.value.trim();
    let phone = fields.phoneInput.value.trim();
    if (IsDataChanged(fname, lname, email, phone)){
        let u = UpdateUser(fname, lname, email, phone);
        if(ValidateEditProfile()){
            User.updateUser(u);
            DisplayInfo(e.target);
            fields.cancel.style.display = "none";
            fields.editProfile.style.display = "inline";
            currentUser = User.getCurrentUser();
            UpdateChanges(currentUser);
            ususername.innerText = fname + " " + lname;
            createAlert("Account information has been successfully updated.", "success");
        }
    }else{
        createAlert("You did not make any changes.", "secondary");
    }
});

function SetFormData(){
    fields.fNameInput.value = currentUser.firstName;
    fields.lNameInput.value = currentUser.lastName;
    fields.emailInput.value = currentUser.email;
    fields.phoneInput.value = currentUser.phone;
}

function IsDataChanged(fn, ln, em, ph){
    if (fn == currentUser.firstName && ln == currentUser.lastName && em == currentUser.email && ph == currentUser.phone){
        return false;
    }else{
        return true;
    }
}

function UpdateUser(fn, ln, em, ph){
    if (User.isEmailUsedByAnotherUser(em,currentUser.id )) {
        createAlert("Email Already Exists.", "warning", "This email is already used by another user.");
        return;
    }
    let user = Object.assign({}, currentUser);
    user.firstName = fn;
    user.lastName = ln;
    user.email = em;
    user.phone = ph;
    return user;
}

function ValidateEditProfile(){
    let isValid = true;
    let firstInvalidField = null;

    const validations = [
        { field: fields.fNameInput, method: Validation.validateName, message: "Enter a valid first name." },
        { field: fields.lNameInput, method: Validation.validateName, message: "Enter a valid last name." },
        { field: fields.emailInput, method: Validation.validateEmail, message: "Enter a valid email address." },
        { field: fields.phoneInput, method: Validation.validatePhone, message: "Enter a valid phone number." },
    ];

    validations.forEach(({field, method, message})=>{
        if(!method(field.value.trim())){
            Validation.showError(field, message);
            isValid = false;
            firstInvalidField = field;
        }else{
            Validation.clearError(field, message);
        }
    });

    if(!isValid && firstInvalidField){
        firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalidField.focus();
    }

    return isValid;
}

function DisplayInfo(target){
    target.style.display = "none";
    fields.profileInfo.style.display = "block";
    fields.profileForm.style.display = "none";
    fields.editProfile.style.display= "inline";
}

function DisplayEdit(target){
    target.style.display = "none";
    fields.profileInfo.style.display = "none";
    fields.profileForm.style.display = "block";
    fields.cancel.style.display= "inline";
}

function UpdateChanges(current_user){
   
    fields.fullName.innerText = current_user.firstName + " " + currentUser.lastName;
    fields.profileEmail.innerText = current_user.email;
    fields.fName.innerText = current_user.firstName;
    fields.lName.innerText = current_user.lastName;
    fields.email.innerText = current_user.email;
    fields.phone.innerText = current_user.phone;
}

function appendOrder(productName, quantity, price){
    // return `<div class="order">
    //                             return `<hr>
    //                             <div class="order-header d-flex justify-content-between ">
    //                                 <div class="d-flex">
    //                                     <h4 class="" style="font-size: 17px;">Order #${orderID}</h4>
    //                                     <p class="ms-3">4/29/2025</p>
    //                                 </div>
    //                                 <div>
    //                                     <span class="px-3 py-1 rounded-5" style="font-size: 14px; display: inline-block; background-color: #dbeafe; color: #1e5aca;">Processing</span>
    //                                     <span class="px-3 py-1 rounded-5" style="font-size: 14px; display: inline-block; background-color: #fef9c3; color: #854d0e;">Shipping: Pending</span>
    //                                 </div>
    //                             </div>
    //                            return `<hr> <div class="order-body">
    //                                 <div class="d-flex justify-content-between align-items-center">
    //                                     <div class="d-flex align-items-center">
    //                                         <div style="width: 80px; height: 90px;">
    //                                             <img src="../assets/images/1.jpg" alt="" width="100%" height="100%">
    //                                         </div>
    //                                         <div class="ms-2" style="line-height: 5px;">
    //                                             <p>${productName} × ${quantity}</p>
    //                                             <p style="font-size: 14px;">${productName}</p>
    //                                         </div>
    //                                     </div>
    //                                     <h5 class="h6">$${price * quantity}</h5>
    //                                 </div>
    //                              return   `<hr>
    //                                 <div class="d-flex align-items-center justify-content-between">
    //                                     <button id="viewOrder" class="btn">View Order Details</button>
    //                                     <button id="cancelOrder" class="btn">Cancel Order</button>
    //                                     <p>Total: <span style="font-weight: bold;">$4449.96</span></p>
    //                                 </div>`;
    //                             </div>`;
    //                         </div>`;
}

function appendOrderHeader(orderID, orderDate, status){
    return `<hr>
                                <div class="order-header d-flex justify-content-between flex-wrap">
                                    <div class="d-flex">
                                        <h4 class="" style="font-size: 17px;">Order #${orderID}</h4>
                                        <p class="ms-3">${new Date(orderDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span class="px-3 py-1 rounded-5" style="font-size: 14px; display: inline-block; background-color: #dbeafe; color: #1e5aca;">Processing</span>
                                        <span class="px-3 py-1 rounded-5 ${status.bgColor} order-status" style="font-size: 14px; display: inline-block; color:rgb(0, 0, 0);">${status.statusElement.innerText}</span>
                                    </div>
                                </div>`;
}

function appendOrderBody(productName, quantity, price,imageUrl){
    return `<div class="order-body">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="d-flex align-items-center">
                                            <div style="width: 80px; height: 90px;">
                                                <img src="../../assets/images/Products/${imageUrl}.png" alt="" width="100%" height="100%">
                                            </div>
                                            <div class="ms-2" style="line-height: 5px;">
                                                <p>${productName} × ${quantity}</p>
                                                <p style="font-size: 14px;">${productName}</p>
                                            </div>
                                        </div>
                                        <h5 class="h6">$${price * quantity}</h5>
                                    </div>
                                    </div>`;
}

function appendOrderFooter(totalPrice, status){
    return   `<hr>
                                    <div class="d-flex align-items-center justify-content-between">
                                        <button id="viewOrder" class="btn">View Order Details</button>
                                        ${(status == 0)?`<button id="cancelOrder" class="btn">Cancel Order</button>`:``}
                                        <p>Total: <span style="font-weight: bold;">$${totalPrice}</span></p>
                                    </div>`;
}

function getStatus(status){
    if (status == 0){
        return {title:"Pending",bgColor:""};
    }else if(status == 1){
        return "Completed";
    }else if(status == 2){
        return "Rejected";
    }else {
        return "";
    }
}
  
cancelBtn.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
