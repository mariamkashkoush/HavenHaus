import { CreateDisplyCartItem } from "../componentModules/cart-item.js";
import { User } from "./userModule.js";
import { ChangeCartItemQuantity, AddCartItem,GetCartByID, getTable, setTable, AddSessionCartItem, GetSessionCart } from "./db.js";
import { redirect } from "../util.js";
import { Auth } from "./authModule.js";
import { Product } from "./productModule.js";

export class Cart{

    static UpdateItemTotalPrice(prodID,price,quantity){
        // get totalPrice object from container
        let totalPrice = JSON.parse(document.getElementById("total-price-holder").dataset.totalPrice); 
        // update prices
        totalPrice[prodID] = price * quantity;
        // calc the totat price and set them
        let newTotalPrice = Object.values(totalPrice).reduce((acc, val) => acc + val, 0).toFixed(2);
        document.querySelectorAll("#subtotal").forEach(item=>item.innerText = newTotalPrice)
        document.querySelectorAll("#total-price").forEach(item=>item.innerText = newTotalPrice)

        // save new totalPrice object on container
        document.getElementById("total-price-holder").dataset.totalPrice = JSON.stringify(totalPrice); 
    }

    static DispalyCartItems(itemsContainer,cart){

        cart.forEach(cartItem => {
            let product = Product.getProductById(cartItem.productID)
            let displayItem = CreateDisplyCartItem(cartItem);
            itemsContainer.appendChild(displayItem)
            // console.log("prodPrice dataset",)
            let prodPrice = displayItem.dataset.prodPrice;
                Cart.UpdateItemTotalPrice(cartItem.productID,prodPrice,Math.min(cartItem.quantity,product.stock))

            // totalPrice[cartItem.id] =  cartItem.quantity * displayItem.dataset.prodPrice;
        });
    }

    static addToCart(productId){
            let user = User.getCurrentUser();
            if(!user) redirect("../../login.html");    
            
            ChangeCartItemQuantity(user.id, productId);
                
        }

    static cartUi(productId){
        // console.log(productId);
        // if(!Auth.isLoggedIn()) redirect("../../login.html");
        let cart ;

        if(Auth.isLoggedIn()){
            const userId =User.getCurrentUser().id;
            if(!userId || !productId){
                console.log(userId,productId);
                return
            }   
            AddCartItem(userId, productId);
            cart = GetCartByID(userId);
        }else{
            AddSessionCartItem(productId);
            cart = GetSessionCart();
        }
            document.querySelectorAll("#cart-badge").forEach(badge=>badge.innerText = cart.length);
            if(!cart.length){
                this.showEmpty();
            }else{
                this.showCartContainer("main-container");
                const cartItemsContainer = document.getElementById("cart-items-container");
                cartItemsContainer.innerHTML = "";
                this.DispalyCartItems(cartItemsContainer,cart);
            }

    }

    static emptyCartByUserID(userID){
        let cartTable = getTable("cartItem").filter((item)=>{
            return userID != item.userID;
        });
        setTable("cartItem", cartTable);
    }


    static showEmpty(containerToHide = "cart-items-container") {
       
        document.getElementById(containerToHide).classList.add("d-none")
        
        const emptyElement = document.getElementById("empty")
        emptyElement.classList.remove("d-none")
        emptyElement.classList.add("d-flex")
        emptyElement.querySelector("#empty a").addEventListener("click", (event) => {
            event.preventDefault();
            window.location.assign(`../../pages/catalog.html`)
        })
    }
    static showCartContainer(containerToHide = "cart-items-container"){
        document.getElementById(containerToHide).classList.remove("d-none")
        
        const emptyElement = document.getElementById("empty")
        emptyElement.classList.add("d-none")
        emptyElement.classList.remove("d-flex")
        
    }
}