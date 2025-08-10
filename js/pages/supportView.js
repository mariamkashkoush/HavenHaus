import { Component } from "../componentModules/components.js"
import { Inquiry } from "../modules/inquiryModule.js";
import { User } from "../modules/userModule.js";
import { convertToHtmlElement, createAlert, fetchComponent, getFormInputs, observeElements, redirect } from "../util.js";
import { Auth } from "../modules/authModule.js";
import { LoadDB } from "../load_db.js";
import { Validation } from "../modules/validation.js";

await LoadDB();
Auth.enforcePageAuthorization();
await Component.renderNavbar();
await Component.renderFooter();
await Component.renderCartOffcanvas();

const newInquiry1 = document.getElementById("new-inquiry-button");
const newInquiry2 = document.getElementById("new-inquiry-button2");

newInquiry2.addEventListener("click", () => {
    createAlert(
        "Please Log In",
        "primary",
        "You must be logged in to submit an inquiry. Please log in to continue."
    );
});


async function loadInquires(filterStatus = "all") {
    document.getElementById('inquireis-container').innerHTML = "";
    document.getElementById("not-found-element").innerHTML = "";

    const inquiries = Inquiry.getInquiriesByUser(User.getCurrentUser().id || []);

    newInquiry1.classList.remove("d-none");
    newInquiry2.classList.add("d-none");

    const filteredInquiries = inquiries.filter(inquiry =>
        filterStatus == "all" || inquiry.details.status.toLowerCase() == filterStatus.toLowerCase()
    );

    if (filteredInquiries.length !== 0) {
        for (const inquiry of filteredInquiries) {
            console.log(inquiry.details.status);
            await Component.renderInquiryCard(inquiry);
            observeElements();
        }
    } else {
        let notfound = await fetchComponent("../../components/no-product-found.html");
        notfound = convertToHtmlElement(notfound);
        notfound.querySelector("h2").innerText = "No Inquiries Available!";
        notfound.querySelector("p").innerText = "We couldn’t find any inquiries at the moment. Please check back later or submit a new inquiry if you need assistance.";
        notfound.removeChild(notfound.querySelector("a"));
        document.getElementById("not-found-element").appendChild(notfound);
    }

    observeElements();
}


function setupFilterButtons() {
    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const status = button.getAttribute("data-filter");
            await loadInquires(status);

            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
}

if (Auth.isLoggedIn()) {
    await loadInquires();        
    setupFilterButtons();       
}


const form = document.getElementById('submit-inquiry-form');
form.addEventListener('submit', async function (event) {
    if (!Auth.isLoggedIn()) redirect("../../login.html");

    event.preventDefault();

    const formInputs = getFormInputs(form);
    const validationRules = Validation.userInquiryForm(formInputs);
    if (!Validation.validateForm(form, validationRules)) return;
    const user = User.getCurrentUser()
    const userId = user.id;
    const inquiryData = {
        id: userId,
        title: document.getElementById('title').value.trim(),
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        message: document.getElementById('message').value.trim()
    };

    const inquiry = new Inquiry(...Object.values(inquiryData));
    Inquiry.addInquiry(inquiry);

    await loadInquires("pending"); 
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    buttons[2].classList.add("active");
        
   
    

    const modalElement = document.getElementById('newInquiryModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
    createAlert(
        `Thank you for your inquiry ${user.firstName} ${user.lastName}`,
        "success",
        "Your inquiry has been successfully submitted. We'll get back to you shortly!"
    );
});

observeElements();
