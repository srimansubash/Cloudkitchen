// --------- category.js ---------

// Sample data for each category
const categoryData = {
  indian: [
    { name: "Paneer Butter Masala", price: 180, image: "indian1.jpg", desc: "Creamy tomato-based gravy 🧈" },
    { name: "Roti with Curry", price: 120, image: "indian2.jpg", desc: "Soft roti with spicy curry 🍛" },
  ],
  gravy: [
    { name: "Chettinad Chicken Gravy", price: 200, image: "gravy1.jpg", desc: "Spicy South Indian flavor 🔥" },
    { name: "Mutton Pepper Gravy", price: 250, image: "gravy2.jpg", desc: "Rich peppery gravy 🍖" },
  ],
  biryani: [
    { name: "Hyderabadi Chicken Biryani", price: 230, image: "biryani1.jpg", desc: "Fragrant rice & tender chicken 🍗" },
    { name: "Veg Biryani", price: 180, image: "biryani2.jpg", desc: "Perfect for vegetarians 🥦" },
  ],
  pizza: [
    { name: "Cheese Burst Pizza", price: 299, image: "pizza1.jpg", desc: "Loaded with cheese 🧀" },
    { name: "Margherita Pizza", price: 249, image: "pizza2.jpg", desc: "Classic Italian delight 🍕" },
  ],
  burger: [
    { name: "Chicken Zinger Burger", price: 150, image: "burger1.jpg", desc: "Crispy & spicy 🍔" },
    { name: "Veg Supreme Burger", price: 120, image: "burger2.jpg", desc: "Loaded with veggies 🥬" },
  ],
  starters: [
    { name: "Chicken 65", price: 180, image: "starter1.jpg", desc: "Crispy and flavorful 🍗" },
    { name: "Paneer Tikka", price: 160, image: "starter2.jpg", desc: "Grilled cottage cheese 🔥" },
  ],
  beverages: [
    { name: "Cold Coffee", price: 100, image: "beverage1.jpg", desc: "Chilled & creamy ☕" },
    { name: "Mojito", price: 90, image: "beverage2.jpg", desc: "Refreshing minty drink 🍹" },
  ],
  desserts: [
    { name: "Gulab Jamun", price: 80, image: "dessert1.jpg", desc: "Sweet syrup balls 🍯" },
    { name: "Chocolate Brownie", price: 120, image: "dessert2.jpg", desc: "Rich chocolate treat 🍫" },
  ],
};

// Get category type from URL
const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get("type");
const title = document.getElementById("category-title");
const foodContainer = document.getElementById("food-container");

if (type && categoryData[type]) {
  title.innerText = `${type.charAt(0).toUpperCase() + type.slice(1)} Dishes 🍴`;

  categoryData[type].forEach(item => {
    const div = document.createElement("div");
    div.className = "bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition";

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover rounded-lg mb-3">
      <h3 class="text-xl font-semibold">${item.name}</h3>
      <p class="text-gray-600 mb-2">${item.desc}</p>
      <p class="font-bold text-red-500 mb-2">₹ ${item.price.toFixed(2)}</p>
      <button onclick="addToCart('${item.name}', ${item.price}, '${item.image}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg mt-2">Add to Cart</button>
    `;
    foodContainer.appendChild(div);
  });
} else {
  title.innerText = "Category Not Found 😕";
}

// ---- Add to Cart (localstorage connection) ----
function addToCart(name, price, image) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${name} added to cart!`);
}
