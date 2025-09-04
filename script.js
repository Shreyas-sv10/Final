/* =========================
   KEERANA SHOP - SCRIPT.JS
   ========================= */

// Default admin credentials
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

// Store data in localStorage
let products = JSON.parse(localStorage.getItem("products")) || [
  { id: 1, name: "Rice", price: 50, weight: "1kg" },
  { id: 2, name: "Wheat", price: 40, weight: "1kg" },
  { id: 3, name: "Sugar", price: 45, weight: "1kg" },
];

let cart = [];
let currentCustomer = "";
let history = JSON.parse(localStorage.getItem("history")) || [];

// =========================
// LOGIN SYSTEM
// =========================
function login() {
  let user = document.getElementById("userid").value.trim();
  let pass = document.getElementById("password").value.trim();

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    document.getElementById("login-page").classList.remove("active");
    document.getElementById("login-page").classList.add("hidden");
    document.getElementById("shop-page").classList.remove("hidden");
    document.getElementById("shop-page").classList.add("active");
    renderProducts();
    renderHistory();
  } else {
    document.getElementById("login-error").innerText = "❌ Invalid credentials!";
  }
}

function logout() {
  document.getElementById("shop-page").classList.add("hidden");
  document.getElementById("login-page").classList.remove("hidden");
  document.getElementById("userid").value = "";
  document.getElementById("password").value = "";
}

// =========================
// NAVIGATION TABS
// =========================
function showTab(tab) {
  let tabs = document.querySelectorAll(".tab");
  tabs.forEach(t => t.classList.add("hidden"));

  document.getElementById(`tab-${tab}`).classList.remove("hidden");

  let buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach(btn => btn.classList.remove("active"));

  event.target.classList.add("active");
}

// =========================
// PRODUCT MANAGEMENT
// =========================
function renderProducts() {
  let list = document.getElementById("products-list");
  list.innerHTML = "";

  products.forEach(p => {
    let div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <h4>${p.name}</h4>
      <p>Price: ₹${p.price}</p>
      <p>Weight: ${p.weight}</p>
      <button class="btn btn-success" onclick="addToCart(${p.id})">Add to Cart</button>
      <button class="btn btn-warning" onclick="openModal(${p.id})">Edit</button>
      <button class="btn btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
    `;
    list.appendChild(div);
  });

  localStorage.setItem("products", JSON.stringify(products));
}

function addProduct() {
  let name = document.getElementById("new-name").value.trim();
  let price = parseFloat(document.getElementById("new-price").value);
  let weight = document.getElementById("new-weight").value.trim();

  if (!name || !price || !weight) {
    alert("⚠️ Please enter all fields!");
    return;
  }

  let newProduct = {
    id: Date.now(),
    name,
    price,
    weight,
  };

  products.push(newProduct);
  document.getElementById("new-name").value = "";
  document.getElementById("new-price").value = "";
  document.getElementById("new-weight").value = "";
  renderProducts();
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    products = products.filter(p => p.id !== id);
    renderProducts();
  }
}

// =========================
// EDIT PRODUCT MODAL
// =========================
let editingId = null;

function openModal(id) {
  let modal = document.getElementById("product-modal");
  modal.classList.remove("hidden");

  let product = products.find(p => p.id === id);
  document.getElementById("edit-name").value = product.name;
  document.getElementById("edit-price").value = product.price;
  document.getElementById("edit-weight").value = product.weight;

  editingId = id;
}

function closeModal() {
  document.getElementById("product-modal").classList.add("hidden");
}

function saveProduct() {
  let name = document.getElementById("edit-name").value.trim();
  let price = parseFloat(document.getElementById("edit-price").value);
  let weight = document.getElementById("edit-weight").value.trim();

  let product = products.find(p => p.id === editingId);
  product.name = name;
  product.price = price;
  product.weight = weight;

  renderProducts();
  closeModal();
}

// =========================
// CART SYSTEM
// =========================
function addToCart(id) {
  let product = products.find(p => p.id === id);
  let existing = cart.find(c => c.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  renderCart();
}

function renderCart() {
  let list = document.getElementById("cart-list");
  list.innerHTML = "";

  cart.forEach(item => {
    let div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.name} (${item.weight}) × ${item.qty}</span>
      <span>₹${item.price * item.qty}</span>
    `;
    list.appendChild(div);
  });
}

function clearCart() {
  cart = [];
  renderCart();
}

// =========================
// CUSTOMER HANDLING
// =========================
function setCustomer() {
  currentCustomer = document.getElementById("customer-name").value.trim();
  document.getElementById("customer-display").innerText = 
    `Current Customer: ${currentCustomer}`;
}

// =========================
/* BILL GENERATION */
// =========================
function generateBill() {
  if (!currentCustomer) {
    alert("⚠️ Please enter customer name first!");
    return;
  }
  if (cart.length === 0) {
    alert("⚠️ Cart is empty!");
    return;
  }

  let output = document.getElementById("bill-output");
  output.innerHTML = "<h3>🧾 Bill</h3>";

  let total = 0;
  cart.forEach(item => {
    output.innerHTML += `<p>${item.name} (${item.weight}) × ${item.qty} = ₹${item.price * item.qty}</p>`;
    total += item.price * item.qty;
  });

  output.innerHTML += `<h4>Total: ₹${total}</h4>`;
  output.innerHTML += `<p>Customer: ${currentCustomer}</p>`;
  output.innerHTML += `<p>Date: ${new Date().toLocaleString()}</p>`;

  // Save to history
  history.push({
    customer: currentCustomer,
    items: [...cart],
    total,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();

  clearCart();
  document.getElementById("customer-name").value = "";
  currentCustomer = "";
  document.getElementById("customer-display").innerText = "";
}

// =========================
// PURCHASE HISTORY
// =========================
function renderHistory() {
  let list = document.getElementById("history-list");
  list.innerHTML = "";

  history.forEach(h => {
    let div = document.createElement("div");
    div.className = "history-entry";
    div.innerHTML = `
      <strong>${h.customer}</strong> - ${h.date}<br>
      Total: ₹${h.total}<br>
      <small>Items: ${h.items.map(i => `${i.name} x${i.qty}`).join(", ")}</small>
    `;
    list.appendChild(div);
  });
                                     }
