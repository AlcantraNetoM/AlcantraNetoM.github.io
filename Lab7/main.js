document.addEventListener("DOMContentLoaded", () => {
    carregarCategorias();
    carregarProdutos();
    carregarDoLocalStorage();

    document.getElementById("filtro").addEventListener("change", aplicarFiltros);
    document.getElementById("ordenar").addEventListener("change", aplicarFiltros);
    document.getElementById("pesquisa").addEventListener("input", aplicarFiltros);
});

const API_URL = "https://deisishop.pythonanywhere.com";
let produtos = [];
let cesto = [];
let total = 0;

//Fetch de produtos
function carregarProdutos(categoria = "") {
    let url = `${API_URL}/products`;
    if (categoria && categoria !== "all") url += `/category/${categoria}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            produtos = data;
            renderizarProdutos(produtos);
        })
        .catch(error => console.error("Erro ao carregar produtos:", error));
}

//Fetch de categorias
function carregarCategorias() {
    fetch(`${API_URL}/categories`)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("filtro");
            data.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });
        })
        .catch(error => console.error("Erro ao carregar categorias:", error));
}

//renderizacao dos produtos
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = "";

    lista.forEach(produto => {
        const article = document.createElement("article");
        article.classList.add("produto");

        article.innerHTML = `
      <img src="${produto.image}" alt="${produto.title}">
      <h3>${produto.title}</h3>
      <p>${produto.description.substring(0, 100)}...</p>
      <p><strong>${produto.price.toFixed(2)} €</strong></p>
      <button data-id="${produto.id}">+ Adicionar ao Cesto</button>
    `;

        const btn = article.querySelector("button");
        btn.addEventListener("click", () => adicionarAoCesto(produto));

        container.appendChild(article);
    });
}

//Filtros / Sort / Search
function aplicarFiltros() {
    const categoria = document.getElementById("filtro").value;
    const ordem = document.getElementById("ordenar").value;
    const pesquisa = document.getElementById("pesquisa").value.toLowerCase();

    let filtrados = produtos.filter(p =>
        p.title.toLowerCase().includes(pesquisa)
    );

    if (categoria !== "all") {
        filtrados = filtrados.filter(p => p.category === categoria);
    }

    if (ordem === "asc") filtrados.sort((a, b) => a.price - b.price);
    else if (ordem === "desc") filtrados.sort((a, b) => b.price - a.price);

    renderizarProdutos(filtrados);
}

//Cesto
function adicionarAoCesto(produto) {
    cesto.push(produto);
    total += produto.price;
    renderizarCesto();
    salvarNoLocalStorage();
}

function removerDoCesto(id) {
    const index = cesto.findIndex(p => p.id === id);
    if (index !== -1) {
        total -= cesto[index].price;
        cesto.splice(index, 1);
        renderizarCesto();
        salvarNoLocalStorage();
    }
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
      <p>Custo total: ${item.price.toFixed(2)} €</p>
      <button class="btn-remover">- Remover do Cesto</button>
    `;

        artigo.querySelector(".btn-remover").addEventListener("click", () => removerDoCesto(item.id));
        lista.appendChild(artigo);
    });

    totalDisplay.textContent = `Custo total: ${total.toFixed(2)} €`;
}

//LOCAL STORAGE
function salvarNoLocalStorage() {
    localStorage.setItem("cesto", JSON.stringify(cesto));
    localStorage.setItem("total", total);
}

function carregarDoLocalStorage() {
    cesto = JSON.parse(localStorage.getItem("cesto")) || [];
    total = parseFloat(localStorage.getItem("total")) || 0;
    renderizarCesto();
}

//CHECKOUT(POST /buy)
const btnComprar = document.getElementById("btn-comprar");
const inputEstudante = document.getElementById("estudante");
const inputCupao = document.getElementById("cupao");
const resultadoCompra = document.getElementById("resultado-compra");

btnComprar.addEventListener("click", () => {
    if (cesto.length === 0) {
        alert("O cesto está vazio!");
        return;
    }

    const idsProdutos = cesto.map(p => p.id);

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
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                resultadoCompra.innerHTML = `<p style="color:red;">Erro: ${data.error}</p>`;
                return;
            }

            resultadoCompra.innerHTML = `
        <h3>✅ Compra efetuada com sucesso!</h3>
        <p><strong>Valor final a pagar (com eventuais descontos):</strong> ${data.total.toFixed(2)} €</p>
        <p><strong>Referência de pagamento:</strong> ${data.reference}</p>
      `;
        })
        .catch(error => {
            console.error("Erro na compra:", error);
            resultadoCompra.innerHTML = `<p style="color:red;">Ocorreu um erro ao processar a compra.</p>`;
        });
});
