/* =====================================================
   melkTec — E-commerce demo
   Estrutura: dados → render → carrinho → checkout
   ===================================================== */

// ===== 1. DADOS DOS PRODUTOS =====
// Em produção, isso viria do Firebase ou de uma API.
const PRODUCTS = [
  // ---------- MONITORES ----------
  { id: 1,  name: "Monitor Gamer 27\" 165Hz",   category: "monitor",    icon: "🖥️", price: 1299.00, oldPrice: 1699.00, desc: "Full HD, IPS, 1ms, FreeSync",             rating: 5 },
  { id: 2,  name: "Monitor 24\" Office",         category: "monitor",    icon: "🖥️", price: 749.00,  oldPrice: 999.00,  desc: "Full HD, 75Hz, HDMI + VGA",               rating: 4 },
  { id: 3,  name: "Monitor Ultrawide 34\"",     category: "monitor",    icon: "🖥️", price: 2499.00, oldPrice: 2999.00, desc: "WQHD, 100Hz, curvado, USB-C",             rating: 5 },
  { id: 4,  name: "Monitor 4K 32\" Pro",        category: "monitor",    icon: "🖥️", price: 3199.00, oldPrice: 3899.00, desc: "UHD, HDR10, IPS, ideal para design",      rating: 5 },

  // ---------- COMPUTADORES ----------
  { id: 5,  name: "PC Gamer melkTec RTX 4060",  category: "computador", icon: "🖲️", price: 5499.00, oldPrice: 6499.00, desc: "Ryzen 5, 16GB, SSD 1TB, RGB",             rating: 5 },
  { id: 6,  name: "PC Home Office i5",          category: "computador", icon: "🖲️", price: 2799.00, oldPrice: 3299.00, desc: "Intel i5, 8GB, SSD 480GB",                rating: 4 },
  { id: 7,  name: "Workstation i7 32GB",        category: "computador", icon: "🖲️", price: 6899.00, oldPrice: 7999.00, desc: "i7, 32GB RAM, RTX A2000, SSD 1TB",        rating: 5 },
  { id: 8,  name: "Mini PC Compacto",           category: "computador", icon: "🖲️", price: 1899.00, oldPrice: 2299.00, desc: "Celeron N100, 8GB, SSD 256GB, WiFi 6",    rating: 4 },

  // ---------- NOTEBOOKS ----------
  { id: 9,  name: "Notebook Ultra 14\"",        category: "notebook",   icon: "💻", price: 4299.00, oldPrice: 4999.00, desc: "i5 13ª geração, 16GB, SSD 512GB",         rating: 5 },
  { id: 10, name: "Notebook Gamer RTX 3050",    category: "notebook",   icon: "💻", price: 5499.00, oldPrice: 6499.00, desc: "i7, 16GB, SSD 512GB, tela 144Hz",         rating: 4 },
  { id: 11, name: "Notebook Estudante 15\"",    category: "notebook",   icon: "💻", price: 2299.00, oldPrice: 2799.00, desc: "Celeron, 8GB, SSD 256GB, W11",            rating: 4 },
  { id: 12, name: "MacBook-like Slim 13\"",     category: "notebook",   icon: "💻", price: 6799.00, oldPrice: 7999.00, desc: "i7, 16GB, SSD 1TB, tela IPS",             rating: 5 },

  // ---------- ÁUDIO ----------
  { id: 13, name: "Caixa de Som Bluetooth 40W", category: "audio",      icon: "🔊", price: 399.00,  oldPrice: 549.00,  desc: "IPX7, 20h de bateria, TWS",               rating: 5 },
  { id: 14, name: "Caixa de Som Tower 120W",    category: "audio",      icon: "🔊", price: 899.00,  oldPrice: 1199.00, desc: "Bluetooth, USB, rádio FM, LED RGB",       rating: 4 },
  { id: 15, name: "Headset Gamer 7.1",          category: "audio",      icon: "🎧", price: 349.00,  oldPrice: 499.00,  desc: "Surround, LED, microfone destacável",     rating: 5 },
  { id: 16, name: "Fone Bluetooth ANC",         category: "audio",      icon: "🎧", price: 299.00,  oldPrice: 449.00,  desc: "Cancelamento ativo, 30h, USB-C",          rating: 4 },
  { id: 17, name: "Soundbar 2.1 80W",           category: "audio",      icon: "🔊", price: 749.00,  oldPrice: 999.00,  desc: "Subwoofer incluso, HDMI ARC, Bluetooth",  rating: 5 },

  // ---------- CABOS ----------
  { id: 18, name: "Cabo HDMI 2.1 8K — 2m",      category: "cabo",       icon: "🔗", price: 79.00,   oldPrice: 119.00,  desc: "Suporta 8K@60Hz, 4K@120Hz, 48Gbps",       rating: 5 },
  { id: 19, name: "Cabo USB-C 100W — 2m",       category: "cabo",       icon: "🔗", price: 59.00,   oldPrice: 89.00,   desc: "Carga rápida PD, trançado, nylon",        rating: 5 },
  { id: 20, name: "Cabo DisplayPort 1.4 — 3m",  category: "cabo",       icon: "🔗", price: 89.00,   oldPrice: 129.00,  desc: "4K@144Hz, 8K@60Hz, HDR",                  rating: 4 },
  { id: 21, name: "Kit Cabos Sortidos (10un)",  category: "cabo",       icon: "🔗", price: 149.00,  oldPrice: 219.00,  desc: "HDMI, USB, P2, RJ45, VGA — variedade",    rating: 4 },
  { id: 22, name: "Cabo de Rede Cat6 — 5m",     category: "cabo",       icon: "🔗", price: 39.00,   oldPrice: 59.00,   desc: "10Gbps, blindado, RJ45",                  rating: 5 },

  // ---------- PERIFÉRICOS ----------
  { id: 23, name: "Teclado Mecânico RGB",       category: "periferico", icon: "⌨️", price: 379.00,  oldPrice: 499.00,  desc: "Switch blue, ABNT2, anti-ghosting",       rating: 4 },
  { id: 24, name: "Mouse Gamer 12.000 DPI",     category: "periferico", icon: "🖱️", price: 199.00,  oldPrice: 279.00,  desc: "7 botões, RGB, sensor óptico",            rating: 5 },
];

// ===== 2. ESTADO DO CARRINHO =====
let cart = JSON.parse(localStorage.getItem("melktec_cart") || "[]");

// ===== 3. HELPERS =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const formatBRL = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const saveCart = () => localStorage.setItem("melktec_cart", JSON.stringify(cart));

const toast = (msg) => {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2200);
};

// ===== 4. RENDER: CATEGORIAS =====
const CATEGORIES = [
  { id: "monitor",    icon: "🖥️", name: "Monitores",     desc: "Gamer, office, 4K" },
  { id: "computador", icon: "🖲️", name: "Computadores",  desc: "PC Gamer, workstation" },
  { id: "notebook",   icon: "💻", name: "Notebooks",     desc: "Estudo, trabalho, gamer" },
  { id: "audio",      icon: "🔊", name: "Áudio",         desc: "Caixas, fones, soundbar" },
  { id: "cabo",       icon: "🔗", name: "Cabos",         desc: "HDMI, USB-C, rede e mais" },
  { id: "periferico", icon: "⌨️", name: "Periféricos",   desc: "Teclado, mouse e kit" },
];

function renderCategories() {
  $("#categoryGrid").innerHTML = CATEGORIES.map(c => `
    <div class="category-card" data-cat="${c.id}">
      <div class="category-icon">${c.icon}</div>
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
    </div>
  `).join("");

  $$(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      const cat = card.dataset.cat;
      document.querySelector(`.filter-btn[data-filter="${cat}"]`)?.click();
      document.getElementById("produtos").scrollIntoView({ behavior: "smooth" });
    });
  });
}

// ===== 5. RENDER: PRODUTOS =====
function renderProducts(filter = "all") {
  const list = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  $("#productGrid").innerHTML = list.map(p => {
    const discount = Math.round((1 - p.price / p.oldPrice) * 100);
    return `
      <div class="product-card">
        <div class="product-image">
          <span class="product-badge">-${discount}%</span>
          ${p.icon}
        </div>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-rating">${"★".repeat(p.rating)}${"☆".repeat(5 - p.rating)}</div>
          <div class="product-price-row">
            <div>
              <div class="product-old">${formatBRL(p.oldPrice)}</div>
              <div class="product-price">${formatBRL(p.price)}</div>
            </div>
            <button class="add-btn" data-id="${p.id}" aria-label="Adicionar">+</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  $$(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
  });
}

// ===== 6. CARRINHO =====
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(i => i.id === id);

  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });

  saveCart();
  renderCart();
  toast(`✅ ${product.name} adicionado!`);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const p = PRODUCTS.find(p => p.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $("#cartCount").textContent = count;

  const container = $("#cartItems");

  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty">🛒<br><br>Seu carrinho está vazio.<br>Adicione produtos para começar.</div>`;
  } else {
    container.innerHTML = cart.map(item => {
      const p = PRODUCTS.find(p => p.id === item.id);
      if (!p) return "";
      return `
        <div class="cart-item">
          <div class="cart-item-img">${p.icon}</div>
          <div class="cart-item-info">
            <h4>${p.name}</h4>
            <span>${formatBRL(p.price * item.qty)}</span>
          </div>
          <div class="cart-item-qty">
            <button data-action="dec" data-id="${p.id}">−</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-id="${p.id}">+</button>
          </div>
          <button class="remove-btn" data-action="remove" data-id="${p.id}" aria-label="Remover">🗑️</button>
        </div>
      `;
    }).join("");
  }

  $("#cartTotal").textContent = formatBRL(getCartTotal());

  container.querySelectorAll("button[data-action]").forEach(btn => {
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    btn.addEventListener("click", () => {
      if (action === "inc") changeQty(id, 1);
      if (action === "dec") changeQty(id, -1);
      if (action === "remove") removeItem(id);
    });
  });
}

// ===== 7. DRAWER / MODAL =====
function openCart()  { $("#cartDrawer").classList.add("open"); $("#overlay").classList.add("active"); }
function closeCart() { $("#cartDrawer").classList.remove("open"); $("#overlay").classList.remove("active"); }

function openCheckout() {
  if (cart.length === 0) { toast("🛒 Adicione produtos primeiro!"); return; }
  closeCart();
  updateCheckoutSummary();
  $("#checkoutModal").classList.add("active");
}

function updateCheckoutSummary() {
  const subtotal = getCartTotal();
  const method = document.querySelector('input[name="payment"]:checked').value;

  let fee = 0, feeLabel = "";
  if (method === "pix")    { fee = subtotal * 0.0099; feeLabel = "Pix (0,99%)"; }
  if (method === "card")   { fee = subtotal * 0.0399; feeLabel = "Cartão (3,99%)"; }
  if (method === "boleto") { fee = 3.49;              feeLabel = "Boleto (taxa fixa)"; }

  const total = subtotal + fee;

  $("#checkoutSummary").innerHTML = `
    <div class="row"><span>Subtotal</span><span>${formatBRL(subtotal)}</span></div>
    <div class="row"><span>Taxa — ${feeLabel}</span><span>${formatBRL(fee)}</span></div>
    <div class="row total"><span>Total</span><span>${formatBRL(total)}</span></div>
  `;
}

// ===== 8. CONFIRMAR PEDIDO =====
function confirmOrder() {
  const method = document.querySelector('input[name="payment"]:checked').value;
  const total = getCartTotal();
  const orderId = "MLK" + Date.now().toString().slice(-6);

  let msg = "";
  if (method === "pix")    msg = `💠 Pedido ${orderId} gerado!\nQR Code Pix: R$ ${(total * 1.0099).toFixed(2)}`;
  if (method === "card")   msg = `💳 Pedido ${orderId} aprovado!\nCobrado: R$ ${(total * 1.0399).toFixed(2)}`;
  if (method === "boleto") msg = `🧾 Pedido ${orderId} gerado!\nBoleto: R$ ${(total + 3.49).toFixed(2)}`;

  // Aqui você chamaria o backend / Mercado Pago.
  console.log("Pedido melkTec:", { orderId, method, cart, total });

  alert(msg + "\n\n(Em produção, aqui abriria o checkout do Mercado Pago.)");

  cart = [];
  saveCart();
  renderCart();
  $("#checkoutModal").classList.remove("active");
  toast("🎉 Pedido realizado com sucesso!");
}

// ===== 9. EVENTOS =====
function bindEvents() {
  // Menu mobile
  $("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("open"));
  $$(".nav-link").forEach(l => l.addEventListener("click", () => $("#nav").classList.remove("open")));

  // Carrinho
  $("#cartBtn").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);
  $("#checkoutBtn").addEventListener("click", openCheckout);

  // Filtros
  $$(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProducts(btn.dataset.filter);
    });
  });

  // Checkout
  $("#closeCheckout").addEventListener("click", () => $("#checkoutModal").classList.remove("active"));
  $$('input[name="payment"]').forEach(r => r.addEventListener("change", updateCheckoutSummary));
  $("#confirmPayment").addEventListener("click", confirmOrder);

  // Fechar modal clicando fora
  $("#checkoutModal").addEventListener("click", (e) => {
    if (e.target.id === "checkoutModal") e.currentTarget.classList.remove("active");
  });
}

// ===== 10. INIT =====
function init() {
  renderCategories();
  renderProducts();
  renderCart();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);