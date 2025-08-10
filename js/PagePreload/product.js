import { Product } from "../modules/productModule.js";
import { User } from "../modules/userModule.js";
import { GetUrlField, redirect } from "../util.js";

console.log("hello1")
let productId = GetUrlField("prod-id")
// redirect if prod-id is not set properly in url (id is wrong)
if(!productId) redirect("../../pages/not-found.html")   
    
let product = Product.getProductById(productId);
if(!product) redirect("../../pages/not-found.html")