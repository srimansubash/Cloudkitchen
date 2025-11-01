// ---------- State ----------
let cart = [];
let orderSummaryVisible = false;
let orderId = null;
let closeTimer = null;

// ---------- Elements ----------
const cartToggle = document.getElementById("cart-toggle");
const cartSidebar = document.getElementById("cart-sidebar");
const placeOrderBtn = document.getElementById("place-order");
const orderPopup = document.getElementById("order-popup");
const orderPopupContent = document.getElementById("order-popup-content");
const orderPopupClose = document.getElementById("order-popup-close");
const downloadPdfBtn = document.getElementById("download-pdf");

// ---------- Sidebar toggle (icon is the only toggle) ----------
cartToggle.addEventListener("click", () => {
  const isOpen = cartSidebar.style.right === "0px" || cartSidebar.style.right === "0";
  cartSidebar.style.right = isOpen ? "-400px" : "0";
});

// ---------- Cart operations ----------
function addToCart(name, price, image) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }
  updateCart();
}

function removeItem(name) {
  cart = cart.filter(item => item.name !== name);
  updateCart();
}

function changeQuantity(name, amount) {
  const item = cart.find(i => i.name === name);
  if (item) {
    item.quantity += amount;
    if (item.quantity <= 0) removeItem(name);
  }
  updateCart();
}

// ---------- UI updates ----------
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

  // Live update the popup summary while visible
  if (orderSummaryVisible) {
    renderOrderSummary();
  }
}

// ---------- Order summary rendering ----------
function renderOrderSummary() {
  let subtotal = 0;
  cart.forEach(item => { subtotal += item.price * item.quantity; });
  const gst = subtotal * 0.18;
  const delivery = cart.length > 0 ? 45 : 0;
  const total = subtotal + gst + delivery;

  if (!orderId) {
    orderId = Math.floor(100000 + Math.random() * 900000); // persist for this popup session
  }

  let html = `
    <h2 class="text-center font-bold mb-2">Order Summary</h2>
    <p class="mb-2"><strong>Order ID:</strong> #${orderId}</p>
    <table class="w-full border mb-3 text-sm">
      <thead>
        <tr class="bg-gray-200">
          <th class="p-1 text-left">Product</th>
          <th class="p-1 text-center">Qty</th>
          <th class="p-1 text-right">Price</th>
          <th class="p-1 text-right">Total</th>
        </tr>
      </thead>
      <tbody>`;

  cart.forEach(item => {
    html += `
      <tr>
        <td class="p-1 text-left">${item.name}</td>
        <td class="p-1 text-center">${item.quantity}</td>
        <td class="p-1 text-right">₹${item.price.toFixed(2)}</td>
        <td class="p-1 text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`;
  });

  html += `
      </tbody>
    </table>
    <table class="w-full mt-2 text-sm">
      <tr>
        <td class="font-semibold">Subtotal:</td>
        <td class="text-right">₹${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td class="font-semibold">GST (18%):</td>
        <td class="text-right">₹${gst.toFixed(2)}</td>
      </tr>
      <tr>
        <td class="font-semibold">Delivery:</td>
        <td class="text-right">₹${delivery.toFixed(2)}</td>
      </tr>
      <tr>
        <td class="font-bold">Total:</td>
        <td class="font-bold text-right">₹${total.toFixed(2)}</td>
      </tr>
    </table>
  `;

  orderPopupContent.innerHTML = html;
}

// ---------- Auto-close helpers ----------
function closeAndClearOrder() {
  orderPopup.classList.add("hidden");
  orderSummaryVisible = false;
  orderId = null;
  cart = [];
  updateCart();
}

function scheduleAutoClose() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = setTimeout(closeAndClearOrder, 25000); // 25 seconds
}

// ---------- Place order ----------
placeOrderBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  orderSummaryVisible = true;
  renderOrderSummary();
  orderPopup.classList.remove("hidden");
  scheduleAutoClose();
});

// ---------- Close popup ----------
orderPopupClose.addEventListener("click", () => {
  if (closeTimer) clearTimeout(closeTimer);
  closeAndClearOrder();
});

// ---------- Download PDF ----------
downloadPdfBtn.addEventListener("click", () => {
  html2canvas(orderPopupContent).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf || { jsPDF: null };
    const pdf = new jsPDF(); // defaults to portrait A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`OrderSummary_${new Date().getTime()}.pdf`);
  });
});
