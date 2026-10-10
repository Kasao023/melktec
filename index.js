/* =====================================================
   melkTec — E-commerce
   ===================================================== */

// ============================================
// 🔧 FIREBASE — SUBSTITUA PELAS SUAS CHAVES
// ============================================
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "melktec-loja.firebaseapp.com",
    databaseURL: "https://melktec-loja-default-rtdb.firebaseio.com",
    projectId: "melktec-loja",
    storageBucket: "melktec-loja.firebasestorage.app",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:0000000000000000000000"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ============================================
// ESTADO
// ============================================
let PRODUCTS = [];
let cart = JSON.parse(localStorage.getItem("melktec_cart") || "[]");
let currentProduct = null;
let currentImageIndex = 0;

// ============================================
// PRODUTOS PADRÃO (só na primeira vez)
// ============================================
const PRODUTOS_PADRAO = [
    {
        name: "Monitor Gamer 27\" 165Hz", category: "monitor",
        price: 1299.00, oldPrice: 1699.00, desc: "Full HD, IPS, 1ms, FreeSync Premium",
        rating: 5,
        images: [
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
            "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&q=80",
            "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80"
        ]
    },
    {
        name: "Monitor 24\" Office", category: "monitor",
        price: 749.00, oldPrice: 999.00, desc: "Full HD, 75Hz, HDMI + VGA",
        rating: 4,
        images: [
            "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&q=80",
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"
        ]
    },
    {
        name: "PC Gamer melkTec RTX 4060", category: "computador",
        price: 5499.00, oldPrice: 6499.00, desc: "Ryzen 5, 16GB, SSD 1TB, RGB",
        rating: 5,
        images: [
            "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
            "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80"
        ]
    },
    {
        name: "Notebook Ultra 14\"", category: "notebook",
        price: 4299.00, oldPrice: 4999.00, desc: "i5 13ª geração, 16GB, SSD 512GB",
        rating: 5,
        images: [
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"
        ]
    },
    {
        name: "Caixa de Som Bluetooth 40W", category: "audio",
        price: 399.00, oldPrice: 549.00, desc: "IPX7, 20h de bateria, TWS",
        rating: 5,
        images: [
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
            "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80"
        ]
    },
    {
        name: "Headset Gamer 7.1", category: "audio",
        price: 349.00, oldPrice: 499.00, desc: "Surround, LED, microfone destacável",
        rating: 5,
        images: [
            "https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80"
        ]
    },
    {
        name: "Cabo HDMI 2.1 8K — 2m", category: "cabo",
        price: 79.00, oldPrice: 119.00, desc: "8K@60Hz, 4K@120Hz, 48Gbps",
        rating: 5,
        images: [
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80"
        ]
    },
    {
        name: "Teclado Mecânico RGB", category: "periferico",
        price: 379.00, oldPrice: 499.00, desc: "Switch blue, ABNT2, anti-ghosting",
        rating: 4,
        images: [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
            "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80"
        ]
    },
    {
        name: "Mouse Gamer 12.000 DPI", category: "periferico",
        price: 199.00, oldPrice: 279.00, desc: "7 botões, RGB, sensor óptico",
        rating: 5,
        images: [
            "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80"
        ]
    }
];

// ============================================
// HELPERS
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const formatBRL = (v) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const saveCart = () => localStorage.setItem("melktec_cart", JSON.stringify(cart));

const toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 2200);
};

// ============================================
// CARREGAR PRODUTOS DO FIREBASE
// ============================================
async function carregarProdutos() {
    try {
        const snap = await db.ref('produtos').once('value');

        // Primeira vez: popula com os padrão
        if (!snap.exists()) {
            console.log('📦 Populando Firebase com produtos padrão...');
            for (const p of PRODUTOS_PADRAO) {
                await db.ref('produtos').push({
                    ...p,
                    ativo: true,
                    criadoEm: Date.now()
                });
            }
            return; // O listener abaixo vai atualizar
        }
    } catch (err) {
        console.error('Erro ao carregar produtos:', err);
    }
}

// Listener em tempo real
db.ref('produtos').on('value', (snap) => {
    PRODUCTS = [];
    snap.forEach(child => {
        const val = child.val();
        if (val.ativo !== false) {
            PRODUCTS.push({ id: child.key, ...val });
        }
    });
    console.log('✅ Produtos carregados:', PRODUCTS.length);
    renderProducts();
    renderCart();
});

// ============================================
// CATEGORIAS
// ============================================
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

// ============================================
// PRODUTOS — RENDER
// ============================================
function renderProducts(filter = "all") {
    const grid = $("#productGrid");
    if (!grid) return;

    if (PRODUCTS.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#94a3b8;padding:40px;">Carregando produtos...</p>';
        return;
    }

    const list = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

    if (list.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#94a3b8;padding:40px;">Nenhum produto nesta categoria.</p>';
        return;
    }

    grid.innerHTML = list.map(p => {
        const desconto = p.oldPrice > p.price
            ? Math.round((1 - p.price / p.oldPrice) * 100)
            : 0;
        const img = (p.images && p.images[0]) || '';

        return `
            <div class="product-card" data-product-id="${p.id}">
                <div class="product-image">
                    ${desconto > 0 ? `<span class="product-badge">-${desconto}%</span>` : ''}
                    <img src="${img}" alt="${p.name}" loading="lazy">
                    <div class="product-image-overlay">
                        <span>👁️ Ver detalhes</span>
                    </div>
                </div>
                <div class="product-info">
                    <span class="product-category">${p.category}</span>
                    <h3 class="product-name">${p.name}</h3>
                    <p class="product-desc">${p.desc}</p>
                    <div class="product-rating">${"★".repeat(p.rating || 5)}${"☆".repeat(5 - (p.rating || 5))}</div>
                    <div class="product-price-row">
                        <div>
                            ${p.oldPrice && p.oldPrice > p.price ? `<div class="product-old">${formatBRL(p.oldPrice)}</div>` : ''}
                            <div class="product-price">${formatBRL(p.price)}</div>
                        </div>
                        <button class="add-btn" data-id="${p.id}" aria-label="Adicionar">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    // Click no card abre modal
    $$(".product-card").forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.closest(".add-btn")) return;
            const id = card.dataset.productId;
            openProductModal(id);
        });
    });

    // Botão +
    $$(".add-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            addToCart(btn.dataset.id);
        });
    });
}

// ============================================
// MODAL DE PRODUTO
// ============================================
function openProductModal(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;

    currentProduct = p;
    currentImageIndex = 0;

    $("#modalCategory").textContent = p.category;
    $("#modalName").textContent = p.name;
    $("#modalDesc").textContent = p.desc;
    $("#modalRating").innerHTML = "★".repeat(p.rating || 5) + "☆".repeat(5 - (p.rating || 5));
    $("#modalOldPrice").textContent = p.oldPrice && p.oldPrice > p.price ? formatBRL(p.oldPrice) : '';
    $("#modalPrice").textContent = formatBRL(p.price);
    $("#modalAddCart").dataset.id = p.id;

    renderGallery(p.images || []);

    $("#productModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeProductModal() {
    $("#productModal").classList.remove("active");
    document.body.style.overflow = "";
    currentProduct = null;
}

function renderGallery(images) {
    if (!images || images.length === 0) return;

    $("#galleryMainImage").src = images[currentImageIndex];
    $("#galleryMainImage").alt = currentProduct.name;
    $("#galleryCounter").textContent = `${currentImageIndex + 1} / ${images.length}`;

    const showNav = images.length > 1;
    $$(".gallery-nav").forEach(btn => {
        btn.style.display = showNav ? "flex" : "none";
    });

    $("#galleryThumbs").innerHTML = images.map((img, i) => `
        <button class="gallery-thumb ${i === currentImageIndex ? 'active' : ''}" data-index="${i}">
            <img src="${img}" alt="foto ${i+1}" loading="lazy">
        </button>
    `).join("");

    $$(".gallery-thumb").forEach(thumb => {
        thumb.addEventListener("click", () => {
            currentImageIndex = Number(thumb.dataset.index);
            renderGallery(images);
        });
    });
}

function nextImage() {
    if (!currentProduct || !currentProduct.images) return;
    const total = currentProduct.images.length;
    currentImageIndex = (currentImageIndex + 1) % total;
    renderGallery(currentProduct.images);
}

function prevImage() {
    if (!currentProduct || !currentProduct.images) return;
    const total = currentProduct.images.length;
    currentImageIndex = (currentImageIndex - 1 + total) % total;
    renderGallery(currentProduct.images);
}

// ============================================
// CARRINHO
// ============================================
function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

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
            const img = (p.images && p.images[0]) || '';
            return `
                <div class="cart-item">
                    <div class="cart-item-img">
                        <img src="${img}" alt="">
                    </div>
                    <div class="cart-item-info">
                        <h4>${p.name}</h4>
                        <span>${formatBRL(p.price * item.qty)}</span>
                    </div>
                    <div class="cart-item-qty">
                        <button data-action="dec" data-id="${p.id}">−</button>
                        <span>${item.qty}</span>
                        <button data-action="inc" data-id="${p.id}">+</button>
                    </div>
                    <button class="remove-btn" data-action="remove" data-id="${p.id}">🗑️</button>
                </div>
            `;
        }).join("");
    }

    $("#cartTotal").textContent = formatBRL(getCartTotal());

    container.querySelectorAll("button[data-action]").forEach(btn => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        btn.addEventListener("click", () => {
            if (action === "inc") changeQty(id, 1);
            if (action === "dec") changeQty(id, -1);
            if (action === "remove") removeItem(id);
        });
    });
}

// ============================================
// DRAWER / CHECKOUT
// ============================================
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

// ============================================
// CONFIRMAR PEDIDO
// ============================================
async function confirmOrder() {
    const method = document.querySelector('input[name="payment"]:checked').value;
    const btn = document.getElementById("confirmPayment");

    if (cart.length === 0) {
        toast("🛒 Adicione produtos primeiro!");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Processando...";

    const items = cart.map((item) => {
        const p = PRODUCTS.find((p) => p.id === item.id);
        return { name: p.name, qty: item.qty, price: p.price };
    });

    try {
        // Salva o pedido no Firebase PRIMEIRO (para o admin ver)
        const totalPedido = items.reduce((s, i) => s + i.price * i.qty, 0);
        let pedidoId = null;
        try {
            const ref = await db.ref('pedidos').push({
                clienteNome: localStorage.getItem('clienteNome') || 'Cliente',
                clienteTelefone: localStorage.getItem('clienteTelefone') || '-',
                metodo: method,
                items: items,
                total: totalPedido,
                status: 'pendente',
                criadoEm: Date.now()
            });
            pedidoId = ref.key;
        } catch (e) {
            console.warn('Erro ao salvar pedido:', e);
        }

        // Chama o Worker
        const response = await fetch(
            "https://melktec-worker.melktec-kasao.workers.dev",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, metodo: method }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao processar pagamento");
        }

        // Atualiza o pedido com o order_id do MP
        if (pedidoId && (data.order_id || data.id)) {
            try {
                await db.ref('pedidos/' + pedidoId + '/orderId').set(data.order_id || data.id);
            } catch (e) {}
        }

        window.location.href = data.checkout_url;
    } catch (err) {
        console.error(err);
        alert("❌ Erro ao iniciar pagamento: " + err.message);
        btn.disabled = false;
        btn.textContent = "Confirmar Pedido";
    }
}

// ============================================
// EVENTOS
// ============================================
function bindEvents() {
    $("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("open"));
    $$(".nav-link").forEach(l => l.addEventListener("click", () => $("#nav").classList.remove("open")));

    $("#cartBtn").addEventListener("click", openCart);
    $("#closeCart").addEventListener("click", closeCart);
    $("#overlay").addEventListener("click", closeCart);
    $("#checkoutBtn").addEventListener("click", openCheckout);

    $$(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            $$(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderProducts(btn.dataset.filter);
        });
    });

    $("#closeCheckout").addEventListener("click", () => $("#checkoutModal").classList.remove("active"));
    $$('input[name="payment"]').forEach(r => r.addEventListener("change", updateCheckoutSummary));
    $("#confirmPayment").addEventListener("click", confirmOrder);

    $("#checkoutModal").addEventListener("click", (e) => {
        if (e.target.id === "checkoutModal") e.currentTarget.classList.remove("active");
    });

    // Modal produto
    $("#closeProductModal").addEventListener("click", closeProductModal);
    $("#productModal").addEventListener("click", (e) => {
        if (e.target.id === "productModal") closeProductModal();
    });

    $(".gallery-nav.prev").addEventListener("click", prevImage);
    $(".gallery-nav.next").addEventListener("click", nextImage);

    $("#modalAddCart").addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        addToCart(id);
        closeProductModal();
        openCart();
    });

    document.addEventListener("keydown", (e) => {
        if (!$("#productModal").classList.contains("active")) return;
        if (e.key === "Escape") closeProductModal();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
    });
}

// ============================================
// INIT
// ============================================
function init() {
    renderCategories();
    renderCart();
    bindEvents();
    carregarProdutos();
}

document.addEventListener("DOMContentLoaded", init);