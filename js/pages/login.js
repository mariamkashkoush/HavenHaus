import { redirect , createAlert, getFormFields } from "../util.js";
import { Auth } from "../modules/authModule.js";
import { LoadDB } from "../load_db.js";
import { ChangeCartItemQuantity, DeleteSessionCart, GetSessionCart, RemoveSessionCartItem } from "../modules/db.js";
import { User } from "../modules/userModule.js";
await LoadDB();
Auth.enforcePageAuthorization( "/")
document.addEventListener('DOMContentLoaded',()=>{
    const form = document.getElementById('loginform');

    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const data = getFormFields('loginform');
        const success = Auth.login(data); 

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (success) {
            

            sessionStorage.setItem("flashAlert", JSON.stringify({
                title: "Login Successful",
                type: "success",
                message: "Welcome back!"
            }));
            let user= User.getCurrentUser()
            if(user.role == "2"){ 
                transferGuestCartToLocal(user.id)
            }else{
                DeleteSessionCart()
            }
            redirect(form.getAttribute('action'));

        } else {
            const createdAlert = createAlert("Login Failed", "danger", "Invalid Email or Password");

            
            setTimeout(() => {
                createdAlert.remove();
            }, 10000);
        }
    });
});



function transferGuestCartToLocal(userId){
    let guestCart = GetSessionCart();
    guestCart.forEach(cartItem=>{
        cartItem.userID = userId
        ChangeCartItemQuantity(userId,cartItem.productID,cartItem.quantity)
        RemoveSessionCartItem(cartItem.productID)
    })
}