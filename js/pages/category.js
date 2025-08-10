import {GetUrlField,observeElements} from '../util.js';
import {Component} from '../componentModules/components.js';
import { Product } from '../modules/productModule.js';
import { Auth } from '../modules/authModule.js';
import { LoadDB } from '../load_db.js';

await LoadDB()
Auth.enforcePageAuthorization();
await Component.renderNavbar();
await Component.renderFooter();
if(Auth.isLoggedIn())
    await Component.renderCartOffcanvas();

let categoryId = GetUrlField("categoryId");
let productsByCategory = Product.getProductsByCatId(categoryId);
document.getElementById("category-name").innerText = Product.getCategoryById(categoryId).name;

 for (const prod of productsByCategory) {
         await Component.renderProductCard(prod);
         observeElements();
}

observeElements();