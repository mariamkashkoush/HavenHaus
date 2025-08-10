import { createAlert,observeElements } from "../util.js";
import { Component } from "../componentModules/components.js";
import { Product } from "../modules/productModule.js";
import { Auth } from "../modules/authModule.js";
import { LoadDB } from "../load_db.js";
import { User } from "../modules/userModule.js";

   await LoadDB();
   Auth.enforcePageAuthorization();
   await Component.renderNavbar();
   await Component.renderFooter();

  //  if(Auth.isLoggedIn())
        await Component.renderCartOffcanvas();
   const flashData = sessionStorage.getItem("flashAlert");

    if (flashData) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const { title, type, message } = JSON.parse(flashData);
        const alertEl = createAlert(title, type, message);

        
        setTimeout(() => {
            alertEl.remove();
        }, 5000);

        
        sessionStorage.removeItem("flashAlert");
    }


    let categories = Product.getAllProductsCategories();
    console.log(categories)

    for (const cat of categories) {
        await Component.renderCategoryCard(cat);
    }
    

   

    let featuredProducts = Product.getFeaturedProducs();
    let featuredProductsAfterDeletion = featuredProducts.filter(p=>p.isDeleted == false)
    

    for (const prod of featuredProductsAfterDeletion) {
        await Component.renderProductCard(prod);
    }
    



if(User.getCurrentUser() && User.getCurrentUser().role==2){

    const adContainer = document.getElementById('ad-container') || document.createElement('div');
if (!adContainer.id) {
  adContainer.id = 'ad-container';
  document.body.appendChild(adContainer);
  
  
    adContainer.style.position = 'fixed';
    adContainer.style.bottom = '20px';
    adContainer.style.right = '20px';
    adContainer.style.width = '300px';
    adContainer.style.padding = '15px';
    adContainer.style.backgroundColor = '#f8f9fa';
    adContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    adContainer.style.borderRadius = '8px';
    adContainer.style.zIndex = '1000';
    adContainer.style.fontFamily = 'Arial, sans-serif';
}


const adContents = [
  {
    title: "FLASH SALE! 50% OFF TODAY ONLY!",
    description: "Don't miss our biggest discount of the season on all premium products!",
    cta: "SHOP NOW",
    color: "#ff4136"
  },
  {
    title: "Buy One Get One FREE!",
    description: "Purchase any item from our new collection and get another one absolutely free.",
    cta: "CLAIM OFFER",
    color: "#0074d9"
  },
  {
    title: "Limited Time Offer: Free Shipping!",
    description: "Enjoy free shipping on all orders over $25. No code needed!",
    cta: "START SHOPPING",
    color: "#2ecc40"
  },
  {
    title: "Exclusive Members-Only Deal",
    description: "Sign up now and receive 20% off your first purchase plus special perks!",
    cta: "JOIN NOW",
    color: "#b10dc9"
  }
];


let currentAdIndex = 0;


function updateAd() {
  const ad = adContents[currentAdIndex];
  
  
  adContainer.innerHTML = `
    <div style="position: relative;">
      <span style="position: absolute; top: 5px; right: 5px; cursor: pointer; font-size: 18px;" 
        onclick="document.getElementById('ad-container').style.display='none'">×</span>
      <h3 style="color: ${ad.color}; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
        ${ad.title}
      </h3>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.4;">
        ${ad.description}
      </p>
      <button style="background-color: ${ad.color}; color: white; border: none; padding: 8px 15px; 
        border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">
        ${ad.cta}
      </button>
    </div>
  `;
  
  
  currentAdIndex = (currentAdIndex + 1) % adContents.length;
  if(adContainer.style.display=='none'){
    adContainer.style.display='block';
  }
}


updateAd();


const adInterval = setInterval(updateAd, 5000);

// Optional: Function to stop the ad rotation
function stopAdRotation() {
  clearInterval(adInterval);
  console.log("Ad rotation stopped");
}
}



    observeElements();



    
