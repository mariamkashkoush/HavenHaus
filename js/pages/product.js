import {ChangeCartItemQuantity, GetCartItem, GetProductByID,AddSessionCartItem, ChangeSessionCartItemQuantity, GetSessionCart, GetSessionCartItem} from "../modules/db.js"
import {IncreaseQuantity, DecreaseQuantity, GetUrlField, redirect, getFormFields, createAlert} from "../util.js"
import { User } from "../modules/userModule.js";
import { Component } from "../componentModules/components.js";
import { Product } from "../modules/productModule.js";
import { Auth } from "../modules/authModule.js";
import { LoadDB } from "../load_db.js";


await LoadDB();
// redirect if prod-id is not set properly in url (id is wrong)
let productId = GetUrlField("prod-id")
if(!productId) redirect("../../pages/not-found.html")   

let product = Product.getProductById(productId);
if(product.isDeleted == true){
    redirect("../../pages/not-found.html");
}

if(!product) redirect("../../pages/not-found.html")


Auth.enforcePageAuthorization();
await Component.renderNavbar();
await Component.renderFooter();
await Component.renderCartOffcanvas();


let user = User.getCurrentUser();
if(user.role ==0 || user.role ==1 ){
    document.getElementById("addToCartBtn").classList.add("d-none")
    document.getElementById("review-submit-container").classList.add("d-none")
    document.getElementById("quantity-control-container").classList.add("d-none")

}
//-------------------------- Functions Section --------------------------\\
function AddToCart(event){
    let quantityElement = document.querySelector(".quantity");
    if(!user || user.length == 0){
        // createAlert("Please Log In", "primary", "You must be logged in to add items to your cart. Please log in to continue.");
        
        ChangeSessionCartItemQuantity(product.id, Number(quantityElement.innerText.trim()));
    }else
        ChangeCartItemQuantity(user.id, product.id, Number(quantityElement.innerText.trim()));
    redirect("../../pages/cart.html");    
}
function submitReview(e){
        e.preventDefault();
        if(!Auth.isLoggedIn() && !currUser){
            createAlert("Please Log In to Submit a Review","primary","You must be logged in to leave a review. Please log in to share your thoughts.");
            return;
        }
        const review = getFormFields("addReviewForm");
        review.customerName = [currUser.firstName,currUser.lastName].join(' ');
        review.date = new Date().toLocaleDateString('en-GB');
        Product.addReview(productId,review);
        redirect(`../../pages/product.html?prod-id=${productId}`);
}
function addDescription(product){
    let descP = `<p>No Description For this Product</p>`
    if(product.desc)
        descP = `<p>${product.desc}</p>`
    document.getElementById("description-container").innerHTML = descP

}
function addInstruction(product){
    let instrucP = `<p>No Instruction For this Product</p>`
    if(product.instructions)
        instrucP= `<p>${product.desc}</p>`
    document.getElementById("instructions-container").innerHTML = instrucP

}


function addHighlights(product){
    let ul = document.createElement("ul")
    let li;
    if(!product.highlights || product.highlights.length == 0){
        ul.innerHTML+= "<p>No Highlights.</p>"
    }
    else if(typeof product.highlights === "string")
    {
        ul.innerHTML+= `<li>${product.highlights}</li>`

    }
     else   {
        product.highlights.forEach(item => {
            
            ul.innerHTML+= `<li>${item}</li>`
        });
    }
    document.getElementById("highlights-container").appendChild(ul)

}
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
//___________________________ End Of Functions Section _______________________\\

let currUser = User.getCurrentUser();
let cartItem, quantity=1 ;

if(Auth.isLoggedIn() && currUser.id) {
    cartItem = GetCartItem(currUser.id,product.id)
    if(cartItem.length > 0 )
        quantity = cartItem[0].quantity;
    if(quantity>product.stock)
        ChangeCartItemQuantity(currUser.id,product.id,product.stock)
}else{
    cartItem = GetSessionCartItem(product.id)
    if(cartItem.length > 0 )
        quantity = cartItem[0].quantity;
    if(quantity>product.stock)
        ChangeSessionCartItemQuantity(product.id,product.stock)
}






let seller = User.getUserById(product.sellerID)
// redirect if product not found (id is wrong)

    
// add product details to page
document.querySelector("#product-name").innerText = product.name
document.querySelector("#product-price").innerText = product.price
// document.querySelector("#product-description").innerText = product.desc
document.querySelector("#stock-count").innerText = product.stock
document.querySelector(".stock").innerText = product.stock
if(seller)
    document.querySelector("strong").innerText= `${seller.firstName} ${seller.lastName}`
document.querySelector("img").src=`../../assets/images/Products/${product.imageUrl}.png`;


quantity = Math.min(product.stock,quantity)
document.querySelector(".quantity").innerText = quantity
document.getElementById("increaseQuantityBtn").addEventListener("click",IncreaseQuantity)
document.getElementById("decreaseQuantityBtn").addEventListener("click",DecreaseQuantity)
document.getElementById("addToCartBtn").addEventListener("click",AddToCart)

if(product.stock < 1){
    document.querySelector("#stock-label").classList.remove("text-success")
    document.querySelector("#stock-label").classList.add("text-danger")
}

if(product.reviews && product.reviews.length !== 0){
    let reviewCountSpan = document.querySelectorAll(".review-count");
    for(let i=0;i<reviewCountSpan.length;i++)
        reviewCountSpan[i].innerText = product.reviews.length
    for (const review of product.reviews) {
        await Component.renderReviews(review);
    }
}

let reviewForm = document.getElementById("addReviewForm");
reviewForm.addEventListener("submit",submitReview)


addDescription(product)
addHighlights(product)
addInstruction(product)