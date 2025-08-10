import { getFormInputs } from "../util.js";

export class Validation {
  static validateName(firstName) {
    const regex = /^[A-Za-z\s'-]{3,50}$/;
    return typeof firstName === 'string' && firstName.trim().length > 0 && regex.test(firstName);
  }

  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && regex.test(email);
  }

  static validatePassword(password, minLength = 6) {
    return typeof password === 'string' && password.length >= minLength;
  }

  static validatePhone(phone) {
    const regex = /^\d{10,15}$/;
    return typeof phone === 'string' && regex.test(phone);
  }

  static validateAddress(address) {
    const regex = /^[A-Za-z0-9\s,'-.]{5,100}$/;
    return typeof address === 'string' && regex.test(address.trim());
  }

  static validateCity(city) {
    const regex = /^[A-Za-z\s'-]{2,50}$/;
    return typeof city === 'string' && regex.test(city.trim());
  }

  static validateCountry(country) {
    const regex = /^[A-Za-z\s'-]{2,50}$/;
    return typeof country === 'string' && regex.test(country.trim());
  }

  static validateZipCode(zip) {
    const regex = /^(\d{5}(-\d{4})?|[A-Za-z0-9\s]{4,10})$/;
    return typeof zip === 'string' && regex.test(zip.trim());
  }

  static validateCreditCard(cardNumber) {
    const regex = /^\d{16}$/;
    if (typeof cardNumber !== 'string' || !regex.test(cardNumber.trim())) return false;
    return Validation.luhnCheck(cardNumber);
  }

  static luhnCheck(cardNumber) {
    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  static validateExpiryDate(expiry) {

   

    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (typeof expiry !== 'string' || !regex.test(expiry.trim())) return false;

    const [monthStr, yearStr] = expiry.split('/');
    const month = parseInt(monthStr, 10);
    let year = parseInt(yearStr, 10);
    year = year < 100 ? 2000 + year : year;

    const now = new Date();
    const expiryDate = new Date(year, month);

    return expiryDate > now;
  }

  static validateCVV(cvv) {
    const regex = /^\d{3,4}$/;
    return typeof cvv === 'string' && regex.test(cvv.trim());
  }


  static validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    const maxSizeInBytes = 5 * 1024 * 1024;
  
    return (
      file instanceof File &&
      allowedTypes.includes(file.type) &&
      file.size > 0 &&
      file.size <= maxSizeInBytes
    );
  }

  static showError(input, message) {
    input.classList.add("is-invalid");

    let error = input.nextElementSibling;
    if (!error || !error.classList.contains("invalid-feedback")) {
      error = document.createElement("div");
      error.className = "invalid-feedback";
      input.parentNode.appendChild(error);
    }

    error.textContent = message;
  }

  static clearError(input) {
    input.classList.remove("is-invalid");

    let error = input.nextElementSibling;
    if (error && error.classList.contains("invalid-feedback")) {
      error.textContent = "";
    }
  }



  static editUserRules(inputs) {
    return [
      { field: inputs.firstName, method: Validation.validateName, message: "Enter a valid first name." },
      { field: inputs.lastName, method: Validation.validateName, message: "Enter a valid last name." },
      { field: inputs.email, method: Validation.validateEmail, message: "Enter a valid email address." },
      { field: inputs.phone, method: Validation.validatePhone, message: "Enter a valid phone number." },
      { field: inputs.password, method: Validation.validatePassword, message: "Enter a valid password." }
    ];
  }


  static registerRules(inputs) {
    return [
      { field: inputs.firstName, method: Validation.validateName, message: "Enter a valid first name." },
      { field: inputs.lastName, method: Validation.validateName, message: "Enter a valid last name." },
      { field: inputs.email, method: Validation.validateEmail, message: "Enter a valid email address." },
      { field: inputs.phone, method: Validation.validatePhone, message: "Enter a valid phone number." },
      { field: inputs.password, method: Validation.validatePassword, message: "Enter a valid password." }
    ]
  }

  static loginRules(inputs) {

    return [
      { field: inputs.email, method: Validation.validateEmail, message: "Enter a valid email address." },
      { field: inputs.password, method: Validation.validatePassword, message: "Enter a valid password." }
    ]
  }
  
    static validatePrice(price) {
      const regex = /^\d+(\.\d{1,2})?$/; // Matches whole numbers or decimal numbers with up to two decimal places
      return typeof price === 'string' && regex.test(price);
  }
  static validateNumber(number) {
    const regex = /^-?\d+(\.\d+)?$/;  // Matches integers or decimal numbers, including optional negative sign
    return typeof number === 'string' && regex.test(number);
  }
  static productRules(inputs) {

    return [
      { field: inputs.productName, method: Validation.validateName, message: "Enter a valid Name." },
      { field: inputs.productPrice, method: Validation.validatePrice, message: "Enter a valid price." },
      { field: inputs.stockQuantity, method: Validation.validateNumber, message: "Enter a valid price." }
    ]
  }


static checkoutRuls(inputs,paymentCC){
   let rules = [
      { field: inputs.firstName, method: Validation.validateName, message: "Enter a valid first name." },
      { field: inputs.lastName, method: Validation.validateName, message: "Enter a valid last name." },
      { field: inputs.email, method: Validation.validateEmail, message: "Enter a valid email address." },
      { field: inputs.phone, method: Validation.validatePhone, message: "Enter a valid phone number." },
      { field: inputs.address, method: Validation.validateAddress, message: "Address is too short." },
      { field: inputs.city, method: Validation.validateCity, message: "Enter a valid city." },
      { field: inputs.country, method: Validation.validateCountry, message: "Enter a valid country." },
      { field: inputs.zip, method: Validation.validateZipCode, message: "Enter a valid zip code." }
    ]
    if(paymentCC){
      rules.push( 
            { field: inputs.cnumber, method: Validation.validateCreditCard, message: "Enter a valid credit card number." },
            { field: inputs.cname, method: Validation.validateName, message: "Enter a valid cardholder name." },
            { field: inputs.expiryDate, method: Validation.validateExpiryDate, message: "Enter a valid expiry date." },
            { field: inputs.ccv, method: Validation.validateCVV, message: "Enter a valid CVV." })
    }

    return rules;

}

static userInquiryForm(inputs){
  return[
    { field: inputs.title, method: Validation.validateName, message: "Enter a valid Title." },
    { field: inputs.name, method: Validation.validateName, message: "Enter a valid name." },
    { field: inputs.email, method: Validation.validateEmail, message: "Enter a valid email address." },
  ]
}




  static validateForm(form, validationRules) {
    let isValid = true;
    let firstInvalidField = null;

    validationRules.forEach(({ field, method, message }) => {
      if (!method(field.value)) {
        Validation.showError(field, message);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = field;
      } else {
        Validation.clearError(field);
      }
    });

    if (!isValid && firstInvalidField) {
      firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalidField.focus();
    }

    return isValid;
  }


}

