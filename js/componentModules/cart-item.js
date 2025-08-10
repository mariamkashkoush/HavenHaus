import { fetchComponent, convertToHtmlElement, IncreaseQuantity as IncQ, DecreaseQuantity as DecQ} from "../util.js";
import { GetProductByID, ChangeCartItemQuantity,RemoveCartItem, ChangeSessionCartItemQuantity, RemoveSessionCartItem} from "../modules/db.js";
import { User } from "../modules/userModule.js"; 
import { Auth } from "../modules/authModule.js";
import { Cart } from "../modules/cartModule.js"; 


let cartID;
if(Auth.isLoggedIn())
    cartID = User.getCurrentUser().id;
let cartItemString = await fetchComponent("../../components/cart-item.html")

export function CreateDisplyCartItem(cartItem){
            let product = GetProductByID(cartItem.productID)[0];
            let cartElement = convertToHtmlElement(cartItemString);
            cartElement.dataset.prodId = product.id;
            cartElement.dataset.prodPrice = product.price;
            
            // product name, description, price, quantity, stock and stock-display
            cartElement.querySelector("img").src =`../../assets/images/Products/${product.imageUrl}.png`
            cartElement.querySelector("img").parentElement.href =`../../pages/product.html?prod-id=${product.id}`
            cartElement.querySelector(".prod-name").parentElement.href = `../../pages/product.html?prod-id=${product.id}`
            cartElement.querySelector(".prod-name").innerText = product.name;
            cartElement.querySelector(".prod-desc").innerText = product.desc;
            cartElement.querySelector("#prod-price").innerText = product.price;
            //----
            cartElement.querySelector(".quantity-container").dataset.cardProdId = product.id;
            cartElement.querySelector(".quantity").innerText = Math.min(cartItem.quantity,product.stock);
            cartElement.querySelector(".stock").innerText = product.stock;
            cartElement.querySelector(".stock-display").innerText = product.stock;
            // addEventListener on buttons
            cartElement.querySelector(".increaseQuantityBtn").addEventListener("click",IncreaseQuantity)
            cartElement.querySelector(".decreaseQuantityBtn").addEventListener("click",DecreaseQuantity)
            cartElement.querySelector(".delete-card-btn").addEventListener("click",DeleteCard)



            if(cartItem.quantity > product.stock)
                ChangeCartItemQuantity(User.getCurrentUser().id,product.id,product.stock)
            return cartElement
        }



function DecreaseQuantity(event){
    let card = event.target.closest(".card")
    let prodID = card.dataset.prodId
    let prodPrice =  card.dataset.prodPrice
    // console.log(cartID,prodID)
    if(!card || !prodID || !prodPrice){
        console.log(card, prodID, prodPrice);
        return
    }   
    
    DecQ(event)
    let quantity = Number(event.target.nextElementSibling.innerText.trim())
    // ChangeCartItemQuantity(cartID, prodID, quantity)
    if(Auth.isLoggedIn() && User.getCurrentUser().id){

        ChangeCartItemQuantity(cartID, prodID, quantity)
    }
    else
        ChangeSessionCartItemQuantity(prodID,quantity)
    Cart.UpdateItemTotalPrice(prodID,prodPrice,quantity)
}

function IncreaseQuantity(event){
    let card = event.target.closest(".card")
    let prodID = card.dataset.prodId
    let prodPrice =  card.dataset.prodPrice
    if(!card || !prodID || !prodPrice){
        console.log("card:",card,"prodID", prodID, "prodPrice", prodPrice);
        return
    }   
    IncQ(event)
    let quantity = Number(event.target.previousElementSibling.innerText.trim())
    if(Auth.isLoggedIn() && User.getCurrentUser().id){

        ChangeCartItemQuantity(cartID, prodID, quantity)
    }
    else
        ChangeSessionCartItemQuantity(prodID,quantity)
    Cart.UpdateItemTotalPrice(prodID,prodPrice,quantity)
}
function DeleteCard(event){
    let card= event.target.closest(".card")
    let prodID = card.dataset.prodId;
    let prodPrice = card.dataset.prodPrice;
    document.querySelector(`[data-prod-id="${prodID}"]`).remove()
    
    // remove item form database then update total price 
    if(Auth.isLoggedIn() && User.getCurrentUser().id){
        
        RemoveCartItem(cartID, prodID)
    }
    else
        RemoveSessionCartItem(prodID)
    Cart.UpdateItemTotalPrice(prodID,prodPrice,0)
    
    let cartItemsContainer = document.getElementById("cart-items-container");
    if (cartItemsContainer) {
        document.querySelectorAll("#cart-badge").forEach(badge=>badge.innerText = cartItemsContainer.children.length);
        if(document.getElementById("cart-items-container").children.length ==0)
        Cart.showEmpty("main-container");
    }
    // show empty cart if now items
}
