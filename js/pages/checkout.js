// Import Modules
import { add, GetCartByID, GetProductByID } from "../modules/db.js";
import { createAlert, getFormFields, GetUrlField, redirect, fetchComponent, convertToHtmlElement, getFormInputs } from "../util.js";
import { User } from "../modules/userModule.js";
import { Component } from "../componentModules/components.js";
import { Auth } from "../modules/authModule.js";
import { Validation } from "../modules/validation.js";
import { LoadDB } from "../load_db.js";
import { Order } from "../modules/order.js";
import { Product } from "../modules/productModule.js";
import { OrderItem } from "../modules/OrderItem.js";
import { Cart } from "../modules/cartModule.js";

await LoadDB()
Auth.enforcePageAuthorization();


await Component.renderNavbar();
await Component.renderFooter();




const currentUser = User.getCurrentUser();
const cart = GetCartByID(currentUser.id);

const cart_ = cart.map(item =>{
  item.price = Product.getProductById(item.productID).price;
  return item;
});

const placeOrder = document.getElementById("placeOrder");


function PlaceOrder(){
  let orderData = {};
  orderData.userId = currentUser.id;
  orderData.items = cart_;
  let order = new Order(orderData);
   delete order.items;
   Order.addOrder(order);
   console.log(cart_)
   cart_.forEach(item =>{
      let orderItem = new OrderItem({orderID:order.id, productID:item.productID, quantity:item.quantity,price:item.price});
      let orderItemProduct = Product.getProductById(orderItem.productID)
      orderItemProduct.stock =  Number(orderItemProduct.stock) - Number(orderItem.quantity)
      if(!Number(orderItemProduct.stock)&&Number(orderItemProduct.stock)!=0)
        throw new Error(`Stock Format Should Be Number.`);
      Product.updateProduct(orderItemProduct)
      OrderItem.addOrderItem(orderItem);

   })

}





// Utility Functions
function GoToCart(event){
  redirect("../../pages/cart.html")
}

let creditCardRadio = document.getElementById('pmethod-ccard');
let cashRadio = document.getElementById('cash');
let creditCardDetails = document.getElementById('credit-card-fields');


function toggleCreditCardDetails() {
  creditCardDetails.style.display = creditCardRadio.checked ? 'block' : 'none';
}

function createSummaryItem(cartItem, summaryItemTemplate) {
  const product = GetProductByID(cartItem.productID)[0];
  const summaryItemElement = convertToHtmlElement(summaryItemTemplate);

  summaryItemElement.querySelector("#price").innerText = (product.price * cartItem.quantity).toFixed(2);
  summaryItemElement.querySelector("#quantity").innerText = cartItem.quantity;
  summaryItemElement.querySelector("#prod-name").innerText = product.name;
  summaryItemElement.querySelector("#desc").innerText = product.desc;

  return summaryItemElement;
}

async function renderCartSummary() {
  const summaryItemTemplate = await fetchComponent("../components/checkout-summary-item.html");

  const emptyElement = document.getElementById("empty");
  const container = document.getElementById("inner-container");

  if (cart.length === 0) {
    emptyElement.classList.replace("d-none", "d-flex");
    return;
  }

  container.classList.remove("d-none");

  let totalPrice = 0;
  const summaryContainer = document.getElementById("ordersummary");

  cart.forEach(item => {
    const summaryItem = createSummaryItem(item, summaryItemTemplate);
    summaryContainer.appendChild(summaryItem);
    totalPrice += parseFloat(summaryItem.querySelector("#price").innerText);
  });

  const formattedTotal = totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById("subtotal").innerText = formattedTotal;
  document.getElementById("total-price").innerText = formattedTotal;
}


creditCardRadio.addEventListener('change', toggleCreditCardDetails);
cashRadio.addEventListener('change', toggleCreditCardDetails);

const checkoutForm = document.getElementById("checkoutform");


checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let formInputs = getFormInputs(checkoutForm);
  const validationRules = Validation.checkoutRuls(formInputs,creditCardRadio.checked)
  if (!(Validation.validateForm(checkoutForm, validationRules))){
    return;
  };
  
  let outOfStockProducts = cart_.filter(orderItem=> {
    return Product.getProductById(orderItem.productID).stock < 1
  })
  
  if(outOfStockProducts.length > 0){
    createAlert("Remove Out Of Stock Product First","danger")
    return
  }
   PlaceOrder();
   Cart.emptyCartByUserID(currentUser.id)
  
    createAlert("Successfully ordered", "success");
    checkoutForm.submit();

});

const backToCartBtn= document.getElementById("back-to-cart");
backToCartBtn.addEventListener('click', GoToCart);

await renderCartSummary();
toggleCreditCardDetails();


