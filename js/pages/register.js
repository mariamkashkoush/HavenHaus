import { redirect, createAlert, getFormFields, getFormInputs } from "../util.js";
import { Auth } from "../modules/authModule.js";
import { Validation } from "../modules/validation.js";
import { LoadDB } from "../load_db.js";

await LoadDB();

Auth.enforcePageAuthorization( "/")
const form = document.getElementById('registerform');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = getFormFields("registerform");

  let formInputs = getFormInputs(form);
  const ValidationRules = Validation.registerRules(formInputs);

  if (!(Validation.validateForm(form, ValidationRules))) return;

  if (Auth.register(data)) {
    const alert = createAlert(
      "You have been registered successfully!",
      "success",
      "You will be redirected to the login page in 5 seconds."
    );

    Array.from(form.elements).forEach(element => element.disabled = true);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      redirect(form.getAttribute('action'));
    }, 5000);
  } else {
    const alert = createAlert("Account already exists!", "warning");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => alert.remove(), 5000);
  }
});


const togglePassword = document.getElementById('togglePassword');
const passwordField = document.getElementById('password');

togglePassword.addEventListener('click', function () {
  const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordField.setAttribute('type', type);
  this.classList.toggle('bi-eye');
  this.classList.toggle('bi-eye-slash');
});


