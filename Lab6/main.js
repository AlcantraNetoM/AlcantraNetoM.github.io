document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o cesto no localStorage, se ainda não existir
    if (!localStorage.getItem('produtos-selecionados')) {
        localStorage.setItem('produtos-selecionados', JSON.stringify([]));
    }

    // Renderiza os produtos se estiver na página de produtos
    const listaProdutosEl = document.getElementById('lista-produtos');
    if (listaProdutosEl) {
        carregarProdutos(produtos);
    }

    // Atualiza o cesto (para cesto.html ou contador no header)
    atualizarCesto();
    atualizarContador();
});

// Renderiza a lista de produtos na página principal
function carregarProdutos(listaProdutos) {
    const container = document.getElementById('lista-produtos');
    listaProdutos.forEach(produto => container.appendChild(criarProduto(produto)));
}

// Cria um produto individual (article) com botão de adicionar
function criarProduto(produto) {
    const article = document.createElement('article');

    const h3 = document.createElement('h3'); h3.textContent = produto.title;
    const img = document.createElement('img'); img.src = produto.image; img.alt = produto.title;
    const descricao = document.createElement('p'); descricao.textContent = produto.description;
    const preco = document.createElement('p'); preco.textContent = produto.price + ' €';

    const btn = document.createElement('button');
    btn.textContent = '+ Adicionar ao Cesto';

    // Evento para adicionar ao cesto
    btn.addEventListener('click', () => {
        const cesto = JSON.parse(localStorage.getItem('produtos-selecionados'));
        cesto.push(produto);
        localStorage.setItem('produtos-selecionados', JSON.stringify(cesto));
        mostrarToast(`✔ "${produto.title}" adicionado ao cesto!`);
        atualizarCesto();
        atualizarContador();
    });

    article.append(h3, img, descricao, preco, btn);
    return article;
}

// Atualiza o cesto (cesto.html)
function atualizarCesto() {
    const container = document.getElementById('lista-cesto');
    if (!container) return; // se não tiver container, não faz nada

    container.innerHTML = '';
    const cesto = JSON.parse(localStorage.getItem('produtos-selecionados'));
    let total = 0;

    cesto.forEach((prod, index) => {
        const article = document.createElement('article');

        const h3 = document.createElement('h3'); h3.textContent = prod.title;
        const img = document.createElement('img'); img.src = prod.image; img.alt = prod.title;
        const preco = document.createElement('p'); preco.textContent = prod.price + ' €';

        const btnRemover = document.createElement('button');
        btnRemover.textContent = 'Remover';

        btnRemover.addEventListener('click', () => {
            cesto.splice(index, 1); // remove o produto da lista
            localStorage.setItem('produtos-selecionados', JSON.stringify(cesto));
            atualizarCesto();
            atualizarContador();
        });

        article.append(h3, img, preco, btnRemover);
        container.appendChild(article);

        total += prod.price;
    });

    // Atualiza o total somente se existir o elemento na página
    const totalEl = document.getElementById('total-cesto');
    if (totalEl) totalEl.textContent = total.toFixed(2);
}

// Atualiza o contador do cesto no header
function atualizarContador() {
    const contador = document.getElementById('contador-cesto');
    if (!contador) return;

    const cesto = JSON.parse(localStorage.getItem('produtos-selecionados'));
    contador.textContent = cesto.length;
}

// Pequeno toast de feedback visual
function mostrarToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    // Aplica animação simples
    toast.style.opacity = 0;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#0074d9';
    toast.style.color = 'white';
    toast.style.padding = '10px 15px';
    toast.style.borderRadius = '5px';
    toast.style.transition = 'opacity 0.4s ease';

    setTimeout(() => toast.style.opacity = 1, 10);
    setTimeout(() => { toast.style.opacity = 0; setTimeout(() => toast.remove(), 400); }, 1500);
}