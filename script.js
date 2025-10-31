let cart = [];

// Sidebar toggle
const cartToggle = document.getElementById("cart-toggle");
const cartSidebar = document.getElementById("cart-sidebar");
const closeCart = document.getElementById("close-cart");

cartToggle.addEventListener("click", () => {
  cartSidebar.style.right = "0"; // Slide in
});

closeCart.addEventListener("click", () => {
  cartSidebar.style.right = "-400px"; // Slide out
});

// Add to Cart
function addToCart(name, price, image) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }
  updateCart();
}

// Remove Item
function removeItem(name) {
  cart = cart.filter(item => item.name !== name);
  updateCart();
}

// Change Quantity
function changeQuantity(name, amount) {
  const item = cart.find(i => i.name === name);
  if (item) {
    item.quantity += amount;
    if (item.quantity <= 0) removeItem(name);
  }
  updateCart();
}

// Update Cart Display
function updateCart() {
  const cartContainer = document.getElementById("cart-items");
  cartContainer.innerHTML = "";

  let subtotal = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    cartContainer.innerHTML += `
      <div class="flex items-center justify-between border-b py-2">
        <img src="${item.image}" class="w-12 h-12 object-cover rounded">
        <div class="flex-1 px-2">
          <p class="font-semibold">${item.name}</p>
          <p class="text-sm">₹${item.price.toFixed(2)}</p>
        </div>
        <div class="flex items-center">
          <button class="bg-gray-200 px-2 rounded" onclick="changeQuantity('${item.name}', -1)">-</button>
          <span class="px-2">${item.quantity}</span>
          <button class="bg-gray-200 px-2 rounded" onclick="changeQuantity('${item.name}', 1)">+</button>
        </div>
        <button onclick="removeItem('${item.name}')" class="text-red-600 ml-2"><i class="fas fa-trash"></i></button>
      </div>`;
  });

  const gst = subtotal * 0.18;
  const delivery = cart.length > 0 ? 45 : 0;
  const total = subtotal + gst + delivery;

  document.getElementById("subtotal").innerText = subtotal.toFixed(2);
  document.getElementById("gst").innerText = gst.toFixed(2);
  document.getElementById("delivery").innerText = delivery.toFixed(2);
  document.getElementById("total").innerText = total.toFixed(2);
  document.getElementById("cart-count").innerText = cart.length;
}
