/* =====================================================
   MELKOTEC — Painel Admin
   ===================================================== */

// ============================================
// 🔧 CONFIGURAÇÃO FIREBASE
// ============================================
// ⚠️ SUBSTITUA pelas chaves do SEU projeto Firebase
// Crie um projeto novo em: https://console.firebase.google.com
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
const auth = firebase.auth();
const db = firebase.database();

// ============================================
// ESTADO
// ============================================
let produtos = [];
let pedidos = [];
let usuarioLogado = null;
let imageInputCount = 0;

// ============================================
// HELPERS
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const formatBRL = (v) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const toast = (msg, tipo = '') => {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show ' + tipo;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.className = 'toast ' + tipo, 3000);
};

const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

// ============================================
// AUTH
// ============================================
window.fazerLogin = async function() {
    const email = $('#emailInput').value.trim();
    const senha = $('#senhaInput').value;
    const erroEl = $('#loginError');
    const btn = $('#btnEntrar');

    erroEl.classList.remove('show');

    if (!email || !senha) {
        erroEl.textContent = 'Preencha email e senha.';
        erroEl.classList.add('show');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
        await auth.signInWithEmailAndPassword(email, senha);
    } catch (err) {
        console.error('Erro login:', err);
        btn.disabled = false;
        btn.textContent = '🔐 Entrar';

        const msgs = {
            'auth/user-not-found': '❌ Email não encontrado.',
            'auth/wrong-password': '❌ Senha incorreta.',
            'auth/invalid-email': '❌ Email inválido.',
            'auth/invalid-credential': '❌ Email ou senha incorretos.',
            'auth/too-many-requests': '⚠️ Muitas tentativas. Aguarde 1 minuto.',
            'auth/network-request-failed': '🌐 Sem conexão. Verifique sua internet.'
        };
        erroEl.textContent = msgs[err.code] || '❌ Erro: ' + err.message;
        erroEl.classList.add('show');
    }
};

window.fazerLogout = async function() {
    if (!confirm('Deseja sair do painel?')) return;
    try {
        await auth.signOut();
        location.reload();
    } catch (err) {
        console.error('Erro logout:', err);
    }
};

window.esqueceuSenha = async function() {
    let email = $('#emailInput').value.trim();
    if (!email && usuarioLogado) email = usuarioLogado.email;
    if (!email) {
        email = prompt('Digite o email da conta admin:');
        if (!email) return;
    }
    if (!confirm(`Enviar link de redefinição para:\n\n${email}?\n\nConfirma?`)) return;

    try {
        await auth.sendPasswordResetEmail(email);
        toast('✅ Link enviado! Verifique seu email e o spam.', 'success');
    } catch (err) {
        toast('❌ Erro: ' + err.message, 'error');
    }
};

auth.onAuthStateChanged((user) => {
    if (user) {
        usuarioLogado = user;
        $('#loginScreen').style.display = 'none';
        $('#painelScreen').style.display = 'block';
        $('#adminEmail').textContent = user.email;
        carregarTudo();
    } else {
        usuarioLogado = null;
        $('#loginScreen').style.display = 'flex';
        $('#painelScreen').style.display = 'none';
    }
});

// ============================================
// NAVEGAÇÃO ENTRE TABS
// ============================================
window.abrirTab = function(nome) {
    $$('.admin-tab').forEach(t => t.classList.remove('active'));
    $$('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelector(`.admin-tab[data-tab="${nome}"]`)?.classList.add('active');
    document.getElementById('tab-' + nome)?.classList.add('active');
    window.scrollTo(0, 0);
};

// ============================================
// CARREGAR DADOS
// ============================================
function carregarTudo() {
    // Produtos
    db.ref('produtos').on('value', (snap) => {
        produtos = [];
        snap.forEach(child => {
            produtos.push({ id: child.key, ...child.val() });
        });
        renderizarProdutos();
        atualizarStats();
    }, (err) => {
        console.error('Erro produtos:', err);
        toast('Erro ao carregar produtos', 'error');
    });

    // Pedidos
    db.ref('pedidos').on('value', (snap) => {
        pedidos = [];
        snap.forEach(child => {
            pedidos.push({ id: child.key, ...child.val() });
        });
        pedidos.sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0));
        renderizarPedidos();
        atualizarStats();
    }, (err) => {
        console.error('Erro pedidos:', err);
    });
}

// ============================================
// STATS
// ============================================
function atualizarStats() {
    const ativos = produtos.filter(p => p.ativo !== false).length;
    const pendentes = pedidos.filter(p => (p.status || 'pendente') === 'pendente').length;
    const faturamento = pedidos
        .filter(p => p.status === 'pago' || p.status === 'enviado')
        .reduce((sum, p) => sum + (Number(p.total) || 0), 0);

    $('#statProdutos').textContent = produtos.length;
    $('#statAtivos').textContent = ativos;
    $('#statPedidos').textContent = pedidos.length;
    $('#statFaturamento').textContent = formatBRL(faturamento);

    const badge = $('#badgePedidos');
    if (pendentes > 0) {
        badge.textContent = pendentes;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// ============================================
// PRODUTOS — RENDER
// ============================================
function renderizarProdutos() {
    const container = $('#listaProdutos');
    const busca = $('#buscaProduto')?.value.toLowerCase().trim() || '';

    let lista = [...produtos];
    if (busca) {
        lista = lista.filter(p =>
            (p.name || '').toLowerCase().includes(busca) ||
            (p.category || '').toLowerCase().includes(busca)
        );
    }

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h4>${busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</h4>
                <p style="font-size:.9rem;">
                    ${busca ? 'Tente outra busca' : 'Clique em "Novo produto" para começar'}
                </p>
            </div>
        `;
        return;
    }

    lista.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    container.innerHTML = lista.map(p => {
        const img = (p.images && p.images[0]) || '';
        const categoria = p.category || '-';
        const ativo = p.ativo !== false;
        const badge = ativo
            ? '<span class="badge badge-success">Ativo</span>'
            : '<span class="badge badge-muted">Inativo</span>';

        return `
            <div class="admin-product-item">
                <div class="admin-product-img">
                    ${img ? `<img src="${escapeHtml(img)}" alt="">` : '<div style="display:grid;place-items:center;height:100%;color:#94a3b8;font-size:1.5rem;">📦</div>'}
                </div>
                <div class="admin-product-info">
                    <div class="admin-product-name">${escapeHtml(p.name || 'Sem nome')}</div>
                    <div class="admin-product-meta">
                        <span>📁 ${escapeHtml(categoria)}</span>
                        <span>💰 <strong>${formatBRL(p.price || 0)}</strong></span>
                        ${p.oldPrice ? `<span>De ${formatBRL(p.oldPrice)}</span>` : ''}
                    </div>
                    <div style="margin-top:6px;">${badge}</div>
                </div>
                <div class="admin-product-actions">
                    <button class="icon-btn" onclick="editarProduto('${p.id}')" title="Editar">✏️</button>
                    <button class="icon-btn ${ativo ? 'danger' : 'success'}" onclick="toggleAtivo('${p.id}', ${!ativo})" title="${ativo ? 'Desativar' : 'Ativar'}">
                        ${ativo ? '🚫' : '✅'}
                    </button>
                    <button class="icon-btn danger" onclick="excluirProduto('${p.id}', '${escapeHtml(p.name).replace(/'/g, "\\'")}')" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

window.filtrarProdutos = function() {
    renderizarProdutos();
};

// ============================================
// PRODUTOS — MODAL
// ============================================
window.abrirModalProduto = function() {
    $('#produtoId').value = '';
    $('#produtoNome').value = '';
    $('#produtoCategoria').value = 'monitor';
    $('#produtoRating').value = 5;
    $('#produtoPreco').value = '';
    $('#produtoOldPrice').value = '';
    $('#produtoDesc').value = '';
    $('#produtoAtivo').checked = true;
    $('#modalProdutoTitle').textContent = 'Novo Produto';

    // Limpa imagens
    $('#imagesList').innerHTML = '';
    imageInputCount = 0;
    adicionarImageInput();
    adicionarImageInput();

    $('#modalProduto').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.fecharModalProduto = function() {
    $('#modalProduto').classList.remove('active');
    document.body.style.overflow = '';
};

window.editarProduto = function(id) {
    const p = produtos.find(x => x.id === id);
    if (!p) return;

    $('#produtoId').value = id;
    $('#produtoNome').value = p.name || '';
    $('#produtoCategoria').value = p.category || 'monitor';
    $('#produtoRating').value = p.rating || 5;
    $('#produtoPreco').value = p.price || '';
    $('#produtoOldPrice').value = p.oldPrice || '';
    $('#produtoDesc').value = p.desc || '';
    $('#produtoAtivo').checked = p.ativo !== false;
    $('#modalProdutoTitle').textContent = 'Editar Produto';

    // Preenche imagens
    $('#imagesList').innerHTML = '';
    imageInputCount = 0;
    const imgs = p.images && p.images.length ? p.images : [''];
    imgs.forEach(url => adicionarImageInput(url));

    $('#modalProduto').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.adicionarImageInput = function(valor = '') {
    imageInputCount++;
    const id = 'img_' + imageInputCount;
    const row = document.createElement('div');
    row.className = 'image-input-row';
    row.innerHTML = `
        <div class="image-preview" id="preview_${id}">
            ${valor ? `<img src="${escapeHtml(valor)}" onerror="this.style.display='none'">` : ''}
        </div>
        <input type="text" class="form-input image-url-input" id="${id}" value="${escapeHtml(valor)}" placeholder="https://..." oninput="atualizarPreview('${id}')">
        <button type="button" class="icon-btn danger" onclick="this.parentElement.remove()" title="Remover">✕</button>
    `;
    $('#imagesList').appendChild(row);
};

window.atualizarPreview = function(id) {
    const input = document.getElementById(id);
    const preview = document.getElementById('preview_' + id);
    const url = input.value.trim();
    if (url) {
        preview.innerHTML = `<img src="${escapeHtml(url)}" onerror="this.parentNode.innerHTML='❌'">`;
    } else {
        preview.innerHTML = '';
    }
};

// ============================================
// PRODUTOS — SALVAR
// ============================================
window.salvarProduto = async function() {
    const id = $('#produtoId').value;
    const nome = $('#produtoNome').value.trim();
    const categoria = $('#produtoCategoria').value;
    const rating = parseInt($('#produtoRating').value) || 5;
    const preco = parseFloat($('#produtoPreco').value);
    const oldPrice = parseFloat($('#produtoOldPrice').value) || 0;
    const desc = $('#produtoDesc').value.trim();
    const ativo = $('#produtoAtivo').checked;

    // Pega imagens (remove vazias)
    const images = Array.from(document.querySelectorAll('.image-url-input'))
        .map(i => i.value.trim())
        .filter(url => url);

    // Validações
    if (!nome) { toast('⚠️ Digite o nome do produto', 'error'); return; }
    if (!preco || preco <= 0) { toast('⚠️ Digite um preço válido', 'error'); return; }
    if (!desc) { toast('⚠️ Digite uma descrição', 'error'); return; }
    if (images.length === 0) { toast('⚠️ Adicione pelo menos 1 imagem', 'error'); return; }

    const dados = {
        name: nome,
        category: categoria,
        rating: rating,
        price: preco,
        oldPrice: oldPrice || preco,
        desc: desc,
        images: images,
        ativo: ativo,
        atualizadoEm: Date.now()
    };

    try {
        if (id) {
            await db.ref('produtos/' + id).update(dados);
            toast('✅ Produto atualizado!', 'success');
        } else {
            dados.criadoEm = Date.now();
            await db.ref('produtos').push(dados);
            toast('✅ Produto criado!', 'success');
        }
        fecharModalProduto();
    } catch (err) {
        console.error(err);
        toast('❌ Erro ao salvar: ' + err.message, 'error');
    }
};

window.toggleAtivo = async function(id, novoStatus) {
    try {
        await db.ref('produtos/' + id + '/ativo').set(novoStatus);
        toast(novoStatus ? '✅ Produto ativado' : '🚫 Produto desativado', 'success');
    } catch (err) {
        toast('❌ Erro: ' + err.message, 'error');
    }
};

window.excluirProduto = async function(id, nome) {
    if (!confirm(`Excluir "${nome}"?\n\nEssa ação não pode ser desfeita.`)) return;

    try {
        await db.ref('produtos/' + id).remove();
        toast('🗑️ Produto excluído', 'success');
    } catch (err) {
        toast('❌ Erro: ' + err.message, 'error');
    }
};

// ============================================
// PEDIDOS
// ============================================
function renderizarPedidos() {
    const container = $('#listaPedidos');

    if (pedidos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <h4>Nenhum pedido ainda</h4>
                <p style="font-size:.9rem;">Os pedidos aparecerão aqui quando os clientes comprarem.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = pedidos.map(p => {
        const status = p.status || 'pendente';
        const badgeClass = {
            'pendente': 'badge-warning',
            'pago': 'badge-success',
            'enviado': 'badge-info',
            'cancelado': 'badge-danger'
        }[status] || 'badge-muted';

        const dataFmt = p.criadoEm
            ? new Date(p.criadoEm).toLocaleString('pt-BR')
            : '-';

        const items = (p.items || []).map(i => `
            <li>
                <span>${escapeHtml(i.name)} × ${i.qty}</span>
                <span>${formatBRL((i.price || 0) * (i.qty || 1))}</span>
            </li>
        `).join('');

        return `
            <div class="admin-order-item">
                <div style="flex:1;">
                    <div class="admin-order-header">
                        <div>
                            <strong style="font-size:1rem;">${escapeHtml(p.clienteNome || 'Cliente')}</strong>
                            <div style="font-size:.82rem;color:var(--text-muted);">
                                ${escapeHtml(p.clienteTelefone || '-')} • ${dataFmt}
                            </div>
                        </div>
                        <span class="badge ${badgeClass}">${status}</span>
                    </div>
                    <div style="font-size:.85rem;color:var(--text-muted);">
                        Método: <strong>${escapeHtml(p.metodo || '-')}</strong>
                        ${p.orderId ? ` • ID: ${escapeHtml(p.orderId.substring(0, 20))}...` : ''}
                    </div>
                    <div class="admin-order-items">
                        <ul>${items}</ul>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                        <button class="btn btn-sm btn-primary" onclick="mudarStatusPedido('${p.id}', 'pago')">✅ Marcar pago</button>
                        <button class="btn btn-sm btn-ghost" onclick="mudarStatusPedido('${p.id}', 'enviado')">📦 Enviado</button>
                        <button class="btn btn-sm btn-danger" onclick="mudarStatusPedido('${p.id}', 'cancelado')">❌ Cancelar</button>
                        <button class="btn btn-sm btn-ghost" onclick="excluirPedido('${p.id}')">🗑️ Excluir</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.mudarStatusPedido = async function(id, status) {
    try {
        await db.ref('pedidos/' + id + '/status').set(status);
        toast('✅ Status atualizado', 'success');
    } catch (err) {
        toast('❌ Erro: ' + err.message, 'error');
    }
};

window.excluirPedido = async function(id) {
    if (!confirm('Excluir este pedido permanentemente?')) return;
    try {
        await db.ref('pedidos/' + id).remove();
        toast('🗑️ Pedido excluído', 'success');
    } catch (err) {
        toast('❌ Erro: ' + err.message, 'error');
    }
};

// ============================================
// FECHAR MODAL COM ESC
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModalProduto();
});

document.addEventListener('click', (e) => {
    if (e.target.id === 'modalProduto') fecharModalProduto();
});