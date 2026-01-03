const API_URL = "https://deisishop.pythonanywhere.com";

let produtos = [];
let cesto = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarCategorias();
    carregarProdutos();
    carregarDoLocalStorage();

    document.getElementById("filtro").addEventListener("change", aplicarFiltros);
    document.getElementById("ordenar").addEventListener("change", aplicarFiltros);
    document.getElementById("pesquisa").addEventListener("input", aplicarFiltros);

    document.getElementById("btn-comprar").addEventListener("click", comprar);
});

function carregarProdutos() {
    fetch(`${API_URL}/products`)
        .then(r => r.json())
        .then(data => {
            produtos = data;
            aplicarFiltros();
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

    let lista = produtos.filter(p => p.title.toLowerCase().includes(pesquisa));

    if (categoria !== "all") {
        lista = lista.filter(p => p.category === categoria);
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

        article.innerHTML = `
            <img src="${produto.image}" alt="${produto.title}">
            <h3>${produto.title}</h3>
            <p>${desc}${produto.description && produto.description.length > 100 ? "..." : ""}</p>
            <p><strong>${Number(produto.price).toFixed(2)} €</strong></p>
            <button type="button">+ Adicionar ao Cesto</button>
        `;

        article.querySelector("button").addEventListener("click", () => adicionarAoCesto(produto));
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
    salvarNoLocalStorage();
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
    salvarNoLocalStorage();
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

function salvarNoLocalStorage() {
    localStorage.setItem("cesto", JSON.stringify(cesto));
}

function carregarDoLocalStorage() {
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
                <h3>✅ Compra efetuada com sucesso!</h3>
                <p><strong>Valor final a pagar:</strong> ${Number(data.total).toFixed(2)} €</p>
                <p><strong>Referência de pagamento:</strong> ${data.reference}</p>
            `;

            cesto = [];
            salvarNoLocalStorage();
            renderizarCesto();
        })
        .catch(() => {
            resultadoCompra.innerHTML = `<p style="color:red;">Ocorreu um erro ao processar a compra.</p>`;
        });
}
