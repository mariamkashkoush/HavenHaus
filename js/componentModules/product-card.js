export function loadProductCard() {
    fetch('../product-card.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load product card");
            }
            return response.text();
        })
        .then(data => {
            document.getElementById("product-card").innerHTML = data;
        })
        .catch(error => {
            console.error("Error loading product card:", error);
        });
}