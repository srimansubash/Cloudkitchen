// ---------- Persistence keys ----------
const CART_KEY = "ck.cart.v1";
const ORDER_ID_KEY = "ck.lastOrderId.v1";
const ORDERS_KEY = "ck.orders.v1";

// ---------- State ----------
let cart = [];
let orderSummaryVisible = false;
let orderId = null;
let closeTimer = null;

// ---------- Elements ----------
const cartToggle = document.getElementById("cart-toggle");
const cartSidebar = document.getElementById("cart-sidebar");
const placeOrderBtn = document.getElementById('place-order');
const orderPopup = document.getElementById("order-popup");
const orderPopupContent = document.getElementById("order-popup-content");
const orderPopupClose = document.getElementById("order-popup-close");
const downloadPdfBtn = document.getElementById("download-pdf");
const viewMoreBtn = document.getElementById("view-more-btn");

// ---------- Load cart from localStorage ----------
window.addEventListener("load", () => {
    const storedCart = localStorage.getItem(CART_KEY);
    if (storedCart) {
        cart = JSON.parse(storedCart);
    } else {
        cart = [];
    }
    updateCart();
});

// ---------- Listen for localStorage changes (sync between pages) ----------
window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY) {
        try {
            cart = JSON.parse(e.newValue) || [];
            updateCart();
        } catch {
            cart = [];
            updateCart();
        }
    }
});

// ---------- Sidebar toggle ----------
if (cartToggle && cartSidebar) {
    cartToggle.addEventListener("click", () => {
        const isOpen = cartSidebar.style.right === "0px" || cartSidebar.style.right === "0";
        cartSidebar.style.right = isOpen ? "-400px" : "0";
    });
}

// ---------- Save to localStorage ----------
function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ---------- Cart operations ----------
function addToCart(name, price, image) {
    const existing = cart.find((item) => item.name === name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name, price: Number(price), image, quantity: 1 });
    }
    saveCart();
    updateCart();
}

function removeItem(name) {
    cart = cart.filter((item) => item.name !== name);
    saveCart();
    updateCart();
}

function changeQuantity(name, amount) {
    const item = cart.find((i) => i.name === name);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) removeItem(name);
        saveCart();
        updateCart();
    }
}

// ---------- Totals ----------
function computeTotals(list) {
    const subtotal = list.reduce((s, it) => s + it.price * it.quantity, 0);
    const gst = subtotal * 0.18;
    const delivery = list.length > 0 ? 45 : 0;
    const total = subtotal + gst + delivery;
    return { subtotal, gst, delivery, total };
}

// ---------- UI updates ----------
function updateCart() {
    const cartContainer = document.getElementById("cart-items");
    if (cartContainer) {
        cartContainer.innerHTML = "";
        cart.forEach((item) => {
            const safeName = item.name.replace(/'/g, "\\'");
            cartContainer.innerHTML += `
                <div class="flex items-center justify-between border-b py-2">
                    <img src="${item.image}" class="w-12 h-12 object-cover rounded">
                    <div class="flex-1 px-2">
                        <p class="font-semibold">${item.name}</p>
                        <p class="text-sm">₹${Number(item.price).toFixed(2)}</p>
                    </div>
                    <div class="flex items-center">
                        <button class="bg-gray-200 px-2 rounded" onclick="changeQuantity('${safeName}', -1)">-</button>
                        <span class="px-2">${item.quantity}</span>
                        <button class="bg-gray-200 px-2 rounded" onclick="changeQuantity('${safeName}', 1)">+</button>
                    </div>
                    <button onclick="removeItem('${safeName}')" class="text-red-600 ml-2"><i class="fas fa-trash"></i></button>
                </div>
            `;
        });
    }

    const { subtotal, gst, delivery, total } = computeTotals(cart);
    const subEl = document.getElementById("subtotal");
    const gstEl = document.getElementById("gst");
    const delEl = document.getElementById("delivery");
    const totEl = document.getElementById("total");
    const cntEl = document.getElementById("cart-count");

    if (subEl) subEl.innerText = subtotal.toFixed(2);
    if (gstEl) gstEl.innerText = gst.toFixed(2);
    if (delEl) delEl.innerText = delivery.toFixed(2);
    if (totEl) totEl.innerText = total.toFixed(2);
    if (cntEl) cntEl.innerText = cart.reduce((n, it) => n + it.quantity, 0);

    if (orderSummaryVisible) {
        renderOrderSummary();
    }
}

// ---------- Order summary rendering ----------
function renderOrderSummary() {
    const { subtotal, gst, delivery, total } = computeTotals(cart);
    if (!orderId) {
        orderId = Math.floor(100000 + Math.random() * 900000);
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
            <tbody>
    `;

    cart.forEach((item) => {
        html += `
            <tr>
                <td class="p-1 text-left">${item.name}</td>
                <td class="p-1 text-center">${item.quantity}</td>
                <td class="p-1 text-right">₹${Number(item.price).toFixed(2)}</td>
                <td class="p-1 text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <table class="w-full mt-2 text-sm">
            <tr><td class="font-semibold">Subtotal:</td><td class="text-right">₹${subtotal.toFixed(2)}</td></tr>
            <tr><td class="font-semibold">GST (18%):</td><td class="text-right">₹${gst.toFixed(2)}</td></tr>
            <tr><td class="font-semibold">Delivery:</td><td class="text-right">₹${delivery.toFixed(2)}</td></tr>
            <tr><td class="font-bold">Total:</td><td class="font-bold text-right">₹${total.toFixed(2)}</td></tr>
        </table>
    `;

    if (orderPopupContent) orderPopupContent.innerHTML = html;
}

// ---------- Save order to history ----------
function saveOrderToHistory() {
    const { subtotal, gst, delivery, total } = computeTotals(cart);
    
    const order = {
        orderId: orderId,
        timestamp: Date.now(),
        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        })),
        subtotal: subtotal,
        gst: gst,
        delivery: delivery,
        total: total
    };
    
    // Get existing orders
    const ordersData = localStorage.getItem(ORDERS_KEY);
    const orders = ordersData ? JSON.parse(ordersData) : [];
    
    // Add new order
    orders.push(order);
    
    // Save back to localStorage
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
function closeAndClearOrder() {
    if (orderPopup) orderPopup.classList.add("hidden");
    orderSummaryVisible = false;
    orderId = null;
    cart = [];
    saveCart();
    updateCart();
}

function scheduleAutoClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(closeAndClearOrder, 30000); // 30 seconds
}

// ---------- Place order ----------
if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        
        // Generate order ID if not exists
        if (!orderId) {
            orderId = Math.floor(100000 + Math.random() * 900000);
        }
        
        // Save order to history
        saveOrderToHistory();
        
        orderSummaryVisible = true;
        renderOrderSummary();
        if (orderPopup) orderPopup.classList.remove("hidden");
        scheduleAutoClose();
    });
}

// ---------- Close popup ----------
if (orderPopupClose) {
    orderPopupClose.addEventListener("click", () => {
        if (closeTimer) clearTimeout(closeTimer);
        closeAndClearOrder();
    });
}

// ---------- Download PDF ----------
if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener("click", () => {
        const target = orderPopupContent || document.body;
        html2canvas(target).then((canvas) => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("p", "pt", "a4");
            const imgData = canvas.toDataURL("image/png");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * pageWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
            pdf.save(`OrderSummary_${new Date().getTime()}.pdf`);

            // After PDF is downloaded, reset everything
            alert("PDF downloaded! Order completed. Cart has been reset.");
            closeAndClearOrder();
        });
    });
}

// ---------- View More Foods Navigation ----------
if (viewMoreBtn) {
    viewMoreBtn.addEventListener("click", () => {
        window.location.href = "menu-categories.html";
    });
}

// ---------- Initial render ----------
updateCart();

// ---------- Expose functions ----------
window.addToCart = addToCart;
window.removeItem = removeItem;
window.changeQuantity = changeQuantity;