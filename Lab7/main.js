const produtosContainer = document.getElementById('produtos');
const listaCesto = document.getElementById('lista-cesto');
const totalDisplay = document.getElementById('total');
const btnLimpar = document.getElementById('btn-limpar');

let cesto = [];
let total = 0;

function renderProdutos() {
    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.classList.add('produto');

        card.innerHTML = `
      <img src="${produto.image}" alt="${produto.title}">
      <h3>${produto.title}</h3>
      <p>${produto.description.substring(0, 100)}...</p>
      <p><strong>${produto.price.toFixed(2)} €</strong></p>
      <button data-id="${produto.id}">+ Adicionar ao Cesto</button>
    `;

        produtosContainer.appendChild(card);
    });
}

function renderCesto() {
    listaCesto.innerHTML = '';

    cesto.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('produto');

        card.innerHTML = `
      <h4>${item.title}</h4>
      <img src="${item.image}" alt="${item.title}">
      <p>Custo total: ${item.price.toFixed(2)} €</p>
      <button class="btn-remover" data-id="${item.id}">- Remover do Cesto</button>
    `;

        listaCesto.appendChild(card);
    });

    totalDisplay.textContent = `Custo total: ${total.toFixed(2)} €`;
}

// Adiciona produto ao cesto
function adicionarAoCesto(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;

    cesto.push(produto);
    total += produto.price;

    salvarNoLocalStorage();
    renderCesto();
}

// Remove produto do cesto
function removerDoCesto(id) {
    const index = cesto.findIndex(item => item.id === id);
    if (index !== -1) {
        total -= cesto[index].price;
        cesto.splice(index, 1);
        salvarNoLocalStorage();
        renderCesto();
    }
}

// Esvaziar o cesto completamente
function limparCesto() {
    cesto = [];
    total = 0;
    salvarNoLocalStorage();
    renderCesto();
}

function configurarEventos() {
    // Adicionar produto
    produtosContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const id = parseInt(e.target.dataset.id);
            adicionarAoCesto(id);
        }
    });

    // Remover produto
    listaCesto.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remover')) {
            const id = parseInt(e.target.dataset.id);
            removerDoCesto(id);
        }
    });

    // Esvaziar cesto
    btnLimpar.addEventListener('click', limparCesto);
}

// LocalStorage
function salvarNoLocalStorage() {
    localStorage.setItem('cesto', JSON.stringify(cesto));
    localStorage.setItem('total', total);
}

function carregarDoLocalStorage() {
    cesto = JSON.parse(localStorage.getItem('cesto')) || [];
    total = parseFloat(localStorage.getItem('total')) || 0;
    renderCesto();
}

// Inicialização
renderProdutos();
configurarEventos();
carregarDoLocalStorage();
