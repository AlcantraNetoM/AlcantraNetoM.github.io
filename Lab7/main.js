const API_URL = "https://deisishop.pythonanywhere.com";

let produtos = [];
let cesto = [];
let favoritos = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarCategorias();
    carregarProdutos();
    carregarCestoDoLocalStorage();
    carregarFavoritosDoLocalStorage();

    document.getElementById("filtro").addEventListener("change", aplicarFiltros);
    document.getElementById("ordenar").addEventListener("change", aplicarFiltros);
    document.getElementById("pesquisa").addEventListener("input", aplicarFiltros);

    const soFav = document.getElementById("so-favoritos");
    if (soFav) soFav.addEventListener("change", aplicarFiltros);

    document.getElementById("btn-comprar").addEventListener("click", comprar);
});

function carregarProdutos() {
    fetch(`${API_URL}/products`)
        .then(r => r.json())
        .then(data => {
            produtos = data;
            aplicarFiltros();
            renderizarFavoritos();
        })
        .catch(e => console.error("Erro ao carregar produtos:", e));
}

function carregarCategorias() {
    fetch(`${API_URL}/categories`)
        .then(r => r.json())
        .then(data => {
            const select = document.getElementById("filtro");
            data.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });
        })
        .catch(e => console.error("Erro ao carregar categorias:", e));
}

function aplicarFiltros() {
    const categoria = document.getElementById("filtro").value;
    const ordem = document.getElementById("ordenar").value;
    const pesquisa = document.getElementById("pesquisa").value.toLowerCase().trim();

    const soFavEl = document.getElementById("so-favoritos");
    const soFavoritos = soFavEl ? soFavEl.checked : false;

    let lista = produtos.filter(p => (p.title || "").toLowerCase().includes(pesquisa));

    if (categoria !== "all") {
        lista = lista.filter(p => p.category === categoria);
    }

    if (soFavoritos) {
        lista = lista.filter(p => favoritos.includes(p.id));
    }

    if (ordem === "asc") lista.sort((a, b) => a.price - b.price);
    if (ordem === "desc") lista.sort((a, b) => b.price - a.price);

    renderizarProdutos(lista);
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = "";

    lista.forEach(produto => {
        const article = document.createElement("article");
        article.classList.add("produto");

        const desc = (produto.description || "").slice(0, 100);
        const favAtivo = favoritos.includes(produto.id);

        article.innerHTML = `
            <img src="${produto.image}" alt="${produto.title}">
            <h3>${produto.title}</h3>
            <p>${desc}${produto.description && produto.description.length > 100 ? "..." : ""}</p>
            <p><strong>${Number(produto.price).toFixed(2)} €</strong></p>
            <button type="button" class="btn-add">+ Adicionar ao Cesto</button>
            <button type="button" class="btn-favorito ${favAtivo ? "ativo" : ""}">
                ${favAtivo ? "⭐ Nos Favoritos" : "☆ Adicionar aos Favoritos"}
            </button>
        `;

        article.querySelector(".btn-add").addEventListener("click", () => adicionarAoCesto(produto));
        article.querySelector(".btn-favorito").addEventListener("click", () => alternarFavorito(produto.id));

        container.appendChild(article);
    });
}

function alternarFavorito(idProduto) {
    if (favoritos.includes(idProduto)) {
        favoritos = favoritos.filter(id => id !== idProduto);
    } else {
        favoritos.push(idProduto);
    }
    salvarFavoritosNoLocalStorage();
    aplicarFiltros();        
    renderizarFavoritos();   //atualiza os favoritos
}

function salvarFavoritosNoLocalStorage() {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function carregarFavoritosDoLocalStorage() {
    favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    favoritos = favoritos.map(x => Number(x)).filter(x => Number.isFinite(x));
}

function renderizarFavoritos() {
    const container = document.getElementById("lista-favoritos");
    if (!container) return;

    container.innerHTML = "";

    const listaFav = produtos.filter(p => favoritos.includes(p.id));

    if (listaFav.length === 0) {
        container.innerHTML = `<p>Ainda não tens favoritos.</p>`;
        return;
    }

    listaFav.forEach(produto => {
        const article = document.createElement("article");
        article.classList.add("produto");

        const desc = (produto.description || "").slice(0, 90);

        article.innerHTML = `
            <img src="${produto.image}" alt="${produto.title}">
            <h3>${produto.title}</h3>
            <p>${desc}${produto.description && produto.description.length > 90 ? "..." : ""}</p>
            <p><strong>${Number(produto.price).toFixed(2)} €</strong></p>
            <button type="button" class="btn-add">+ Adicionar ao Cesto</button>
            <button type="button" class="btn-remover-fav">Remover ⭐</button>
        `;

        article.querySelector(".btn-add").addEventListener("click", () => adicionarAoCesto(produto));
        article.querySelector(".btn-remover-fav").addEventListener("click", () => alternarFavorito(produto.id));

        container.appendChild(article);
    });
}

function adicionarAoCesto(produto) {
    const existente = cesto.find(i => i.id === produto.id);
    if (existente) {
        existente.qtd += 1;
    } else {
        cesto.push({
            id: produto.id,
            title: produto.title,
            image: produto.image,
            price: Number(produto.price),
            qtd: 1
        });
    }
    renderizarCesto();
    salvarCestoNoLocalStorage();
}

function removerDoCesto(id) {
    const item = cesto.find(i => i.id === id);
    if (!item) return;

    if (item.qtd > 1) {
        item.qtd -= 1;
    } else {
        cesto = cesto.filter(i => i.id !== id);
    }

    renderizarCesto();
    salvarCestoNoLocalStorage();
}

function calcularTotal() {
    return cesto.reduce((acc, i) => acc + (i.price * i.qtd), 0);
}

function renderizarCesto() {
    const lista = document.getElementById("lista-cesto");
    const totalDisplay = document.getElementById("total");

    lista.innerHTML = "";

    cesto.forEach(item => {
        const artigo = document.createElement("article");
        artigo.classList.add("produto");

        artigo.innerHTML = `
            <h4>${item.title}</h4>
            <img src="${item.image}" alt="${item.title}">
            <p>Preço: ${item.price.toFixed(2)} €</p>
            <p>Quantidade: <strong>${item.qtd}</strong></p>
            <button type="button" class="btn-remover">- Remover</button>
        `;

        artigo.querySelector(".btn-remover").addEventListener("click", () => removerDoCesto(item.id));
        lista.appendChild(artigo);
    });

    totalDisplay.textContent = `Custo total: ${calcularTotal().toFixed(2)} €`;
}

function salvarCestoNoLocalStorage() {
    localStorage.setItem("cesto", JSON.stringify(cesto));
}

function carregarCestoDoLocalStorage() {
    cesto = JSON.parse(localStorage.getItem("cesto")) || [];
    cesto = cesto.map(i => ({
        id: i.id,
        title: i.title,
        image: i.image,
        price: Number(i.price),
        qtd: Number(i.qtd) || 1
    }));
    renderizarCesto();
}

function comprar() {
    const resultadoCompra = document.getElementById("resultado-compra");
    const inputEstudante = document.getElementById("estudante");
    const inputCupao = document.getElementById("cupao");

    if (cesto.length === 0) {
        alert("O cesto está vazio!");
        return;
    }

    const idsProdutos = cesto.flatMap(item => Array(item.qtd).fill(item.id));

    const dadosCompra = {
        products: idsProdutos,
        student: inputEstudante.checked,
        discount: inputCupao.value.trim() || null
    };

    fetch(`${API_URL}/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosCompra)
    })
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                resultadoCompra.innerHTML = `<p style="color:red;">Erro: ${data.error}</p>`;
                return;
            }

            resultadoCompra.innerHTML = `
                <h3>Compra efetuada com sucesso!</h3>
                <p><strong>Valor final a pagar:</strong> ${Number(data.total).toFixed(2)} €</p>
                <p><strong>Referência de pagamento:</strong> ${data.reference}</p>
            `;

            cesto = [];
            salvarCestoNoLocalStorage();
            renderizarCesto();
        })
        .catch(() => {
            resultadoCompra.innerHTML = `<p style="color:red;">Ocorreu um erro ao processar a compra.</p>`;
        });
}
