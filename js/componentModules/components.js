import { Auth } from "../modules/authModule.js";
import { User } from "../modules/userModule.js";
import { fetchComponent, convertToHtmlElement, redirect, createAlert, getFormFields, getFormInputs } from "../util.js";
import { CreateDisplyCartItem } from "./cart-item.js";
import { AddSessionCartItem, GetCartByID, GetSessionCart, RemoveCartItem} from "../modules/db.js";
import { Cart } from "../modules/cartModule.js";
import {Order} from "../../js/modules/order.js";

import { Validation } from "../modules/validation.js";
import { Inquiry } from "../modules/inquiryModule.js";
import { Product } from "../../js/modules/productModule.js";

export class Component {

    static async renderFooter() {
        let footer = await fetchComponent("../../components/footer.html")
        footer = convertToHtmlElement(footer)
        document.body.insertAdjacentElement("beforeend", footer);

    }

    static async renderCartOffcanvas() {
        let cartItems
        let cartOffcanvas = await fetchComponent("../../components/cart-offcanvas.html")
        cartOffcanvas = convertToHtmlElement(cartOffcanvas)
        document.body.insertAdjacentElement("beforeend", cartOffcanvas);
        cartOffcanvas.querySelector(".btn-go-to-cart").addEventListener("click", () => {
            redirect("../../pages/cart.html")
        })
        if (Auth.isLoggedIn()){
            cartItems = GetCartByID(User.getCurrentUser().id)
            let cartID = User.getCurrentUser().id
            let allProductsIds = Product.getAllProducts().map(p=>p.id)
            let deletedProdcutsCartItems = GetCartByID(cartID).filter(cartItem=>!allProductsIds.includes(cartItem.productID))
            deletedProdcutsCartItems.forEach(cartItem=>{
                RemoveCartItem(cartID,cartItem.productID)
            })

            cartItems = GetCartByID(User.getCurrentUser().id)
    }else{
        cartItems=GetSessionCart()
    }
    document.querySelectorAll("#cart-badge").forEach(badge => badge.innerText = cartItems.length)
    if (cartItems.length == 0) {
        Cart.showEmpty("main-container");
        return;
    }
    cartItems.forEach((item) => {
            let dispalyItem = CreateDisplyCartItem(item);
            let prodID = dispalyItem.dataset.prodId
            let prodPrice = dispalyItem.dataset.prodPrice

            cartOffcanvas.querySelector("#cart-items-container").insertAdjacentElement("beforeend", dispalyItem);
            Cart.UpdateItemTotalPrice(prodID, prodPrice, item.quantity)
        })


    }

    static async renderNavbar() {


        const body = document.body;

        if (Auth.isLoggedIn()) {
            const user = User.getCurrentUser();
            const cart = GetCartByID(user.id);
            body.insertAdjacentElement("afterbegin", await this.#getAuthNavbar());

            document.querySelectorAll("#cart-badge").forEach(badge => badge.innerText = cart.length)
            const userName = `${user.firstName} ${user.lastName}`.trim() || "User";
            if (User.getCurrentUser() !== null && User.getCurrentUser().role != 2) {
                document.querySelectorAll('[title="Cart"]').forEach(c => c.remove());
            }
            if (User.getCurrentUser() !== null && User.getCurrentUser().role == 0) {
                document.querySelectorAll('#admin-dash').forEach(item=>item.classList.remove('d-none'));
                document.querySelectorAll('#support-link').forEach(elem=>elem.classList.add('d-none'))
                body.querySelectorAll(".profile-link").forEach(elem=>elem.classList.add('d-none'))
            }

            body.querySelectorAll(".username-placeholder").forEach(el => {
                el.textContent = userName;
            });
            const logoutLinks = body.querySelectorAll(".logout-link");
            logoutLinks.forEach(link => {
                link.addEventListener('click', () => {
                    Auth.logout();
                });
            });
            const profileLinks = body.querySelectorAll(".profile-link");
            profileLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.target.href = "../../pages/profile.html";
                });
            });
        } else {
            body.insertAdjacentElement("afterbegin", await this.#getGuestNavbar());
        }
    }

    static async  #getGuestNavbar() {
        const nav = await fetchComponent("../../components/guestNavbar.html")

        return convertToHtmlElement(nav);

    }

    static async #getAuthNavbar() {
        const nav = await fetchComponent("../../components/navbar.html");
        return convertToHtmlElement(nav);

    }

    static async renderCategoryCard(category) {
        const classArr = ["from-left-animation", "from-right-animation", "from-z-animation", "from-top-animation", "from-bottom-animation"];
        let categoryCard = await fetchComponent("../../components/category-card.html");
        categoryCard = convertToHtmlElement(categoryCard);
        categoryCard.id = category.id;
        categoryCard.querySelector("h5").innerText = category.name;
        categoryCard.querySelector("p").innerText = category.description;
        categoryCard.querySelector("img").src = `../../assets/images/category/${category.name}.png`;
        categoryCard.querySelector("a").href = `../../pages/category.html?categoryId=${category.id}`;
        categoryCard.classList.add(classArr[Math.floor(Math.random() * classArr.length)])
        const categoryContainer = document.getElementById("category-cards-container");
        categoryContainer.appendChild(categoryCard);
    }

    static async renderProductCard(product) {
        const classArr = ["from-left-animation", "from-right-animation", "from-z-animation", "from-top-animation", "from-bottom-animation"];
        let productCard = await fetchComponent("../../components/product-card.html");
        productCard = convertToHtmlElement(productCard);
        const seller = User.getUserById(product.sellerID);
        
        productCard.id = product.id;

        const prodductName = productCard.querySelector("h5");
        prodductName.innerText = product.name;
        prodductName.addEventListener('click', () => redirect(`../../pages/product.html?prod-id=${product.id}`))

        const productImg = productCard.querySelector("img");
        productImg.src=`../../assets/images/Products/${product.imageUrl}.png`
        productImg.addEventListener('click', () => redirect(`../../pages/product.html?prod-id=${product.id}`))
        if(seller)
            productCard.querySelector("strong").innerText= `${seller.firstName} ${seller.lastName}`
        productCard.querySelector("p").innerText = product.desc;
        productCard.querySelector("span").innerText = "$ " + product.price;

        const productButton = productCard.querySelector("button");
        productButton.addEventListener("click", () => {
                createAlert("Added to Cart", "success");
            // if (!Auth.isLoggedIn()) {
            //     AddSessionCartItem(productCard.id)
            //     let cart =GetSessionCart()
            //     document.querySelectorAll("#cart-badge").forEach(badge=>badge.innerText = cart.length);
            //     // return;
            // }else
                Cart.cartUi(productCard.id)
            

        }
        );

        if (User.getCurrentUser() !== null &&( User.getCurrentUser().role == 0 ||User.getCurrentUser().role == 1)) {

            productCard.querySelector("button").remove();
        }
        productCard.classList.add(classArr[Math.floor(Math.random() * classArr.length)])
        const productContainer = document.getElementById("cards-container");
        productContainer.appendChild(productCard);

    }
    
    
    static async renderInquiryCard(inquiry) {
        const inquiryContainer = document.getElementById("inquireis-container");
        const inquirybodyContainer = document.getElementById('inquiries-card-body-container');
        
        const inquiryHeader = await fetchComponent("../../components/inquiry-card.html");
        const inquiryHeaderElement = convertToHtmlElement(inquiryHeader);
        inquiryHeaderElement.querySelector("h5").innerText = inquiry.title;
        inquiryHeaderElement.querySelectorAll("p")[1].innerText = inquiry.date;
        inquiryHeaderElement.querySelectorAll("p")[2].innerText = inquiry.summary;
        
        inquiryHeaderElement.querySelector("span").className = `badge ${inquiry.details.statusClass}`
        inquiryHeaderElement.querySelector("span").innerText = inquiry.details.status;
        
        inquiryHeaderElement.querySelector("button").setAttribute('data-bs-target', `#inquiryModal${inquiry.id}`);
        
        const inquiryBody = await fetchComponent("../../components/inquiry-information-popup.html");
        const inquiryBodyElement = convertToHtmlElement(inquiryBody);
        inquiryBodyElement.id = `inquiryModal${inquiry.id}`;
        inquiryBodyElement.querySelector("h5").innerText = inquiry.title;
        
        const pArr = inquiryBodyElement.querySelectorAll("p");
        
        pArr[0].querySelector("strong").nextSibling.nodeValue = ` ${inquiry.name}`;
        pArr[1].querySelector("strong").nextSibling.nodeValue = ` ${inquiry.email}`;
        pArr[2].querySelector("strong").nextSibling.nodeValue = ` ${inquiry.date}`;
        
        
        const statusSpan = pArr[3].querySelector("span");
        statusSpan.textContent = inquiry.details.status;
        statusSpan.className = `badge ${inquiry.details.statusClass}`;
        
        
        pArr[4].innerText = inquiry.message;
        
        
        const replyMessageCard = inquiryBodyElement.querySelector('.conversation-container-parent');
        if (!inquiry.reply) {
            replyMessageCard.classList.add("d-none");
        } else {
            replyMessageCard.classList.remove("d-none");
            replyMessageCard.querySelector('.message-text').innerText = inquiry.reply;
        }
        
        inquiryContainer.insertAdjacentElement("beforeend", inquiryHeaderElement);
        inquirybodyContainer.insertAdjacentElement("beforeend", inquiryBodyElement);
    }
    
    static async renderSupport(inquiries) {
        document.getElementById("inquireis-container").innerHTML = ""
        
        for (const inquiry of inquiries) {
            await this.renderAdminInquires(inquiry)
        }
    }

    static async renderAdminInquires(inquiry) {
     
        const container = document.getElementById("inquireis-container");

        const inquiryCard = await fetchComponent("../../components/inquiry-card.html");
        const inquiryCardElement = convertToHtmlElement(inquiryCard);
        inquiryCardElement.querySelector("h5").innerText = inquiry.title;
        inquiryCardElement.querySelectorAll("p")[1].innerText = inquiry.date;
        inquiryCardElement.querySelectorAll("p")[2].innerText = inquiry.summary;
        
        inquiryCardElement.querySelector("span").className = `badge ${inquiry.details.statusClass}`
        inquiryCardElement.querySelector("span").innerText = inquiry.details.status;
        const buttonView = inquiryCardElement.querySelector("button");
        buttonView.setAttribute('data-bs-target', `#inquiryModal${inquiry.id}`);
        const buttonResolve = inquiryCardElement.querySelector("#mark-resolved");
        buttonResolve.addEventListener('click',async()=>{
            inquiry.details.status='resolved';
            inquiry.details.statusClass='bg-success'
            Inquiry.updateinquiry(inquiry);
            inquiryCardElement.querySelector("span").className = `badge ${inquiry.details.statusClass}`
            inquiryCardElement.querySelector("span").innerText = inquiry.details.status;
            buttonResolve.classList.add('d-none');
            
        })
        if(inquiry.details.status == 'in progress'){
           
            buttonResolve.classList.remove('d-none');
        }


        buttonView.addEventListener("click", async () => {
            let modalElement = document.getElementById(`inquiryModal${inquiry.id}`);

            if (!modalElement) {
                await this.renderInquiryModal(inquiry.id);
                modalElement = document.getElementById(`inquiryModal${inquiry.id}`);
                modalElement.querySelector("h5").innerText = inquiry.title;
                const pArr = modalElement.querySelectorAll("p");
                pArr[0].querySelector("strong").nextSibling.nodeValue = ` ${inquiry.name}`;
                pArr[1].querySelector("strong").nextSibling.nodeValue = ` ${inquiry.email}`;
                pArr[2].querySelector("strong").nextSibling.nodeValue = ` ${inquiry.date}`;

                const statusSpan = pArr[3].querySelector("span");
                statusSpan.textContent = inquiry.details.status;
                statusSpan.className = `badge ${inquiry.details.statusClass}`;
                pArr[4].innerText = inquiry.message;
                const replyMessageCard = document.querySelector(".conversation-container-parent");
                if (!inquiry.reply.trim()) {
                    replyMessageCard.classList.add("d-none")
                    const form = modalElement.querySelector("form");
                    form.classList.remove("d-none");
                    form.addEventListener("submit", async (e) => {
                        e.preventDefault();
                        const formData = getFormFields("inquiry-form-id");
                        const data = {
                            id: inquiry.id,
                            reply: formData.reply,
                            details: {
                                status: formData.status,
                                statusClass: formData.status == "pending" ? "bg-warning" :
                                    formData.status == "in progress" ? "bg-primary" :
                                    formData.status == "resolved" ? "bg-success" : "bg-secondary"
                            }
                        }

                        Inquiry.replyToInquiry(data);
                        if(data.details.status !='pending'||data.details.status !='resolved')
                        {
                            statusSpan.textContent = data.details.status;
                            statusSpan.className = `badge ${data.details.statusClass}`;
                            buttonResolve.classList.remove('d-none');

                        }


                        const modalInstance = bootstrap.Modal.getInstance(modalElement);
                        modalInstance.hide();


                    });
                } else {
                    replyMessageCard.classList.remove("d-none");
                    replyMessageCard.querySelector('.message-text').innerText = inquiry.reply;

                }


                
                modalElement.addEventListener("hide.bs.modal", () => {
                    if (document.activeElement && modalElement.contains(document.activeElement)) {
                        document.activeElement.blur();
                    }
                });

                


                
                modalElement.addEventListener("hidden.bs.modal", () => {
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) modalInstance.dispose();
                    modalElement.remove();
                }, { once: true });
            }

            
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        });
        
        
        container.insertAdjacentElement("beforeend", inquiryCardElement);
    }
    
    static async renderInquiryModal(inquiryId) {
        const inquiryForm = await fetchComponent("../../components/inquiry-information-popup.html");
        const inquiryFormElement = convertToHtmlElement(inquiryForm);
        inquiryFormElement.setAttribute('id', `inquiryModal${inquiryId}`);
        document.getElementById("inquireis-container").insertAdjacentElement("beforeend", inquiryFormElement);
        
    }
    
    static #setEditFormInputs(form, user) {
        const formInputs = getFormInputs(form)
        
        formInputs.firstName.value = user.firstName;
        formInputs.lastName.value = user.lastName;
        formInputs.email.value = user.email;
        formInputs.phone.value = user.phone;
        formInputs.password.value = user.password;
        
    }

    static async renderSellerProduct(product) {

    }

    static async renderReviews(review) {

        const reviewCard = await fetchComponent("../../components/reviewCard.html");
        const reviewCardElemnt = convertToHtmlElement(reviewCard);
        const reviewContainer = document.getElementById("reviews-container").querySelector("div");
        reviewCardElemnt.querySelector("h5").innerText = review.customerName;
        reviewCardElemnt.querySelector("small").innerText = review.date;
        reviewCardElemnt.querySelector("p").innerText = review.text;

        reviewContainer.insertAdjacentElement("beforeend", reviewCardElemnt);
    }



    static users = [];
    static pageSize = 5;
    static currentPage = 1;

    static async renderTable() {
        const usertable = await fetchComponent("../../components/userTable.html");
        const userTable = convertToHtmlElement(usertable);
        const container = document.getElementById("content");
        container.innerHTML = "";
        container.appendChild(userTable);


        this.users = await User.getAllUsers();

        this.renderPage(1);
        this.renderPaginationControls();
    }

    static async renderPage(pageNumber) {
        const userTableBody = document.getElementById("userTableBody");
        userTableBody.innerHTML = "";

        const startIndex = (pageNumber - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const usersToRender = this.users.slice(startIndex, endIndex);

        for (const user of usersToRender) {
            await this.renderUserRow(user);
        }
        this.currentPage = pageNumber;
    }

    static async renderUserRow(user) {
        const userrow = await fetchComponent("../../components/userRows.html");
        const userrowElement = convertToHtmlElement(userrow);
        const cols = userrowElement.querySelectorAll("td");

        cols[0].innerText = user.id;
        cols[1].innerText = `${user.firstName} ${user.lastName}`;
        cols[2].innerText = user.email;
        cols[3].innerText = user.role == 1 ? "Seller" : "Customer";

        userrowElement.querySelector(".delete-button").addEventListener("click", (e) => {
            if(user.role==1){
                let allProducts = Product.getAllProductsWithDeleted().filter(p=>p.sellerID != user.id);
                let products = Product.getProductsBySeller(user.id)
                products.forEach(p=>p.isDeleted = true)
                console.log(products)
                let updatedAllProducts = allProducts.concat(products);
                console.log(updatedAllProducts)
                setTable('product',updatedAllProducts);
            }
            User.removeUser(user.id);
            e.target.closest("tr").remove();
            this.users = User.getAllUsers();
            this.renderPage(1);
            this.renderPaginationControls();
        });

        const editButton = userrowElement.querySelector(".edit-button");
        editButton.setAttribute('data-bs-toggle', `#editUserModal${user.id}`);
        editButton.addEventListener('click', async () => {
            await this.handleEditUser(user, userrowElement);
        });

        document.getElementById("userTableBody").appendChild(userrowElement);
    }

    static async handleEditUser(user, userrowElement) {
        let modalElement = document.getElementById(`editUserModal${user.id}`);

        if (!modalElement) {
            await this.renderEditUserForm(user.id);
            modalElement = document.getElementById(`editUserModal${user.id}`);

            modalElement.addEventListener('hide.bs.modal', () => {
                if (document.activeElement && modalElement.contains(document.activeElement)) {
                    document.activeElement.blur();
                }
            });

            modalElement.addEventListener('hidden.bs.modal', () => {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.dispose();
                }
                modalElement.remove();
            }, { once: true });

            const form = modalElement.querySelector("form");
            this.#setEditFormInputs(form, user);

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = getFormFields('editUserForm');
                const formInputs = getFormInputs(form);
                const validationRules = Validation.editUserRules(formInputs);
                if (!(Validation.validateForm(form, validationRules))) {
                    return;
                }

                if (User.isEmailUsedByAnotherUser(formData.email, user.id)) {
                    createAlert("Email Already Exists.", "warning", "This email is already used by another user.");
                    return;
                }

                formData.id = user.id;
                User.updateUser(formData);

                const cols = userrowElement.querySelectorAll("td");
                cols[1].innerText = `${formData.firstName} ${formData.lastName}`;
                cols[2].innerText = formData.email;

                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
            });
        }

        let modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (!modalInstance) {
            modalInstance = new bootstrap.Modal(modalElement);
        }
        modalInstance.show();
    }

    static renderPaginationControls() {


        let paginationContainer = document.getElementById("paginationControls");

        if (!paginationContainer) {
            paginationContainer = document.createElement("div");
            paginationContainer.id = "paginationControls";
            paginationContainer.classList.add("pagination-controls");
            document.getElementById("content").appendChild(paginationContainer);
        }

        paginationContainer.innerHTML = "";

        const totalPages = Math.ceil(this.users.length / this.pageSize);

        const prevButton = document.createElement("button");
        prevButton.innerText = "Previous";
        prevButton.disabled = this.currentPage === 1;
        prevButton.addEventListener("click", () => {
            if (this.currentPage > 1) {
                this.currentPage -= 1;
                this.renderPage(this.currentPage);
                this.renderPaginationControls();
            }
        });
        paginationContainer.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.innerText = i;
            if (i === this.currentPage) {
                pageButton.classList.add("active");
            }
            pageButton.addEventListener("click", () => {
                this.currentPage = i;
                this.renderPage(this.currentPage);
                this.renderPaginationControls();
            });
            paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement("button");
        nextButton.innerText = "Next";
        nextButton.disabled = this.currentPage === totalPages;
        nextButton.addEventListener("click", () => {
            if (this.currentPage < totalPages) {
                this.currentPage += 1;
                this.renderPage(this.currentPage);
                this.renderPaginationControls();
            }
        });
        paginationContainer.appendChild(nextButton);

    }

    static async renderEditUserForm(userId) {
        const editForm = await fetchComponent("../../components/edit-user-form.html");
        const editFormElement = convertToHtmlElement(editForm);
        editFormElement.setAttribute('id', `editUserModal${userId}`);
        document.getElementById("FormModal").appendChild(editFormElement);

    }

    updateTableRow(userId, updatedData) {
        const userRow = document.querySelector(`#userRow${userId}`);

        if (userRow) {

            userRow.querySelector(".user-name").innerText = `${updatedData.firstName} ${updatedData.lastName}`;
            userRow.querySelector(".user-email").innerText = updatedData.email;
            userRow.querySelector(".user-role").innerText = updatedData.role;
        }

    }

    
    
    
    static async renderOrders() {
        const order = await fetchComponent("../../components/order-dashboard.html");
        const orders_content = convertToHtmlElement(order);
        const container = document.getElementById("content");
        container.innerHTML = "";
        container.appendChild(orders_content);
    }
    
    
    
    static async renderCharts() {

        const dashboard = await fetchComponent("../../components/dashboard.html");
        const chart = convertToHtmlElement(dashboard);
        const container = document.getElementById("content");
        container.innerHTML = "";
        container.appendChild(chart);
    }


    static async renderCharts(){

        const dashboard = await fetchComponent("../../components/dashboard.html");
        const chart = convertToHtmlElement(dashboard);
        const container = document.getElementById("content");
        container.innerHTML = "";
        container.appendChild(chart);
    }

    static async renderProducts(){

        const product = await fetchComponent("../../components/products-dashboard.html");
        const product_chart = convertToHtmlElement(product);
        const container = document.getElementById("content");
        container.innerHTML = "";
        container.appendChild(product_chart);
    }

    static async renderProductsTable(){
        const producttable = await fetchComponent("../../components/productTable.html");
        const productTable = convertToHtmlElement(producttable);
        const container = document.getElementById("content");
        // container.innerHTML = "";
        container.appendChild(productTable);
    }
    
    static async renderProductRow(){
        const products = Product.getAllProducts();
        for (const product of products){
            const productrow = await fetchComponent("../../components/productTableRows.html");
            const productrowElement = convertToHtmlElement(productrow);
            const cols = productrowElement.querySelectorAll("td");
            const seller = User.getUserById(product.sellerID);
            if(!seller) {continue;}
            const sellerName = `${seller.firstName} ${seller.lastName}`;
            // cols[0].innerText = product.imageUrl;
            // cols[0].innerHTML = `<img src="${product.imageUrl}" width="50" height="50" style="object-fit: cover; border-radius: 4px;">`;
            productrowElement.querySelector(".delete-button").addEventListener("click", (e) => {
                Product.removeProduct(product.id);
                e.target.closest("tr").remove();
            });
            cols[1].innerText = product.name;
            cols[2].innerText = `$${product.price.toFixed(2)}`;
            cols[3].innerText = sellerName;
            cols[4].innerText = product.stock;
            cols[5].innerHTML = `
            <span class="badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}">
                ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
        `;
        
            document.getElementById("productsTableBody").appendChild(productrowElement);    
    
        }
    }

    static async renderOrderTable() {
        const ordertable = await fetchComponent("../../components/orderTable.html");
        const orderTable = convertToHtmlElement(ordertable);
        const container = document.getElementById("content");
        // container.innerHTML = "";
        container.appendChild(orderTable);
    }

    static async renderOrderRow() {
    const orders = Order.getAllOrders();
    
    for (const order of orders) {
        const orderrow = await fetchComponent("../../components/orderTablesRows.html");
        const orderrowElement = convertToHtmlElement(orderrow);
        const cols = orderrowElement.querySelectorAll("td");
        
        const customer = User.getUserById(order.userId);
        
        if(!customer) {continue;}
        const customerName = `${customer.firstName} ${customer.lastName}`;
        cols[0].innerText = customerName;
        cols[1].innerText = order.createdAt;
        cols[2].innerText = getStatusLabel(order.status);
        cols[3].innerText = `$${order.total.toFixed(2)}`;

            orderrowElement.querySelector(".delete-button").addEventListener("click", (e) => {
                Order.removeOrder(order.id);
                e.target.closest("tr").remove();
            });

            document.getElementById("orderTableBody").appendChild(orderrowElement);

            function getStatusLabel(status) {
                return status == 0 ? "Pending" : "completed";
            }
        }
    }




}