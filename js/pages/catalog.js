import { Product } from "../modules/productModule.js";
import { fetchComponent, observeElements } from "../util.js";
import { Component } from "../componentModules/components.js";
import { Auth} from "../modules/authModule.js";
import {LoadDB} from "../load_db.js"
await LoadDB();

Auth.enforcePageAuthorization();

await Component.renderNavbar();
await Component.renderFooter();
await Component.renderCartOffcanvas();

const priceChange = document.getElementById("priceFilter");
const chooseCategory = document.querySelector('.form-select');
const searchInput = document.querySelector('input[type="text"]');
const container = document.getElementById("cards-container");

const allProducts = Product.getAllProducts();

priceChange.addEventListener('change', filterAndRenderProducts);
chooseCategory.addEventListener('change', filterAndRenderProducts);
searchInput.addEventListener('input', filterAndRenderProducts);




async function productNotFound(count){
    if(count === 0){
        container.innerHTML = await fetchComponent("../../components/no-product-found.html");
        observeElements();
        return true;
    }
    return false
}

async function filterAndRenderProducts() {
    let filtered = [...allProducts];

   
    const selectedCategory = chooseCategory.value;
    if (selectedCategory !== 'all') {
        filtered = Product.getProductsByCatId(selectedCategory);

        // console.log(filtered);

    }

    if(await productNotFound(filtered.length)){
        return;
    }

    
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm !== "") {
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.desc.toLowerCase().includes(searchTerm)
        );
    }
    
    if(await productNotFound(filtered.length)){
        return;
    }

    
    const priceSort = priceChange.value;
    if (priceSort === 'price-low-high') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'price-high-low') {
        filtered.sort((a, b) => b.price - a.price);
    }else if (priceSort === 'featured'){
       filtered = filtered.filter(prod=>prod.featured == true);
    }
    
    if(await productNotFound(filtered.length)){
        return;
    }
    
    container.innerHTML = "";

    let filterdAfterDeletion = filtered.filter(p=>p.isDeleted == false)
    
    for (const product of filterdAfterDeletion ) {
        await Component.renderProductCard(product);
        observeElements();
    }

    
    observeElements();
}

// Initial load
await filterAndRenderProducts();
observeElements();