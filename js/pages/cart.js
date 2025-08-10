
import { Auth } from "../modules/authModule.js";
import {GetCartByID, GetProductByID, ChangeCartItemQuantity,RemoveCartItem,GetSessionCart, GetCartItem} from "../modules/db.js"
import {IncreaseQuantity as IncQ, DecreaseQuantity as DecQ, redirect, fetchComponent, convertToHtmlElement} from "../util.js"
import { User } from "../modules/userModule.js";

Auth.enforcePageAuthorization();


import { Component } from "../componentModules/components.js";
import { Cart } from "../modules/cartModule.js";
import { Product } from "../modules/productModule.js";
await Component.renderNavbar();
await Component.renderFooter();
document.querySelectorAll(".fa-cart-shopping").forEach(element=>{
    element.parentElement.classList.add("d-none")
})


document.getElementById("cart-items-container").dataset.totalPrice = "{}"

function getCurrentUserCart(){
    if(Auth.isLoggedIn()){
        let user = User.getCurrentUser()
        if(!user || !user.id)
            return [];
        checkDeletedProductsInCart(user.id)
        return GetCartByID(user.id)
    }else{
        return GetSessionCart();
    }

}
function checkDeletedProductsInCart(cartID){
    let allProductsIds = Product.getAllProducts().map(p=>p.id)
    let deletedProdcutsCartItems = GetCartByID(cartID).filter(cartItem=>!allProductsIds.includes(cartItem.productID))
    deletedProdcutsCartItems.forEach(cartItem=>{
        RemoveCartItem(cartID,cartItem.productID)
    })
}

// if not logged in redirect to login
    



let cart = getCurrentUserCart()
function showEmptyCart(){
    emtpyElement.classList.remove("d-none")
    emtpyElement.classList.add("d-flex");  
    mainContainer.classList.add("d-none")
}
function showCart(){
    emtpyElement.classList.remove("d-flex");  
    emtpyElement.classList.add("d-none")
    mainContainer.classList.remove("d-none")
    
}
let emtpyElement = document.getElementById("empty");
let mainContainer = document.getElementById("main-container");
if(cart.length == 0)
    Cart.showEmpty("main-container")
else{
    
    Cart.showCartContainer("main-container")
    mainContainer.classList.remove("d-none");
    let itemsContainer;
    itemsContainer = document.getElementById("cart-items-container");
    Cart.DispalyCartItems(itemsContainer,cart);
    // Cart.UpdateItemTotalPrice(cart.prodID,)
    
}


