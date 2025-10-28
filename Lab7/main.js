// Espera até que o DOM esteja completamente carregado
document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos(produtos);
});

// Função principal: recebe a lista de produtos e renderiza-os no DOM
function carregarProdutos(listaProdutos) {
    const secaoProdutos = document.getElementById("produtos");

    // percorre todos os produtos da lista
    listaProdutos.forEach(produto => {
        console.log(produto.id, produto.title);

        const artigo = criarProduto(produto);
        secaoProdutos.append(artigo);
    });
}

// Cria e retorna um elemento <article> com as informações do produto
function criarProduto(produto) {
    const article = document.createElement("article");
    article.classList.add("produto");

    // Título
    const titulo = document.createElement("h3");
    titulo.textContent = produto.title;

    // Imagem
    const imagem = document.createElement("img");
    imagem.src = produto.image;
    imagem.alt = produto.title;

    // Descrição
    const descricao = document.createElement("p");
    descricao.textContent = produto.description.substring(0, 100) + "...";

    // Preço
    const preco = document.createElement("p");
    preco.innerHTML = `<strong>${produto.price.toFixed(2)} €</strong>`;

    // Botão de adicionar
    const botao = document.createElement("button");
    botao.textContent = "+ Adicionar ao Cesto";
    botao.dataset.id = produto.id;
    botao.addEventListener("click", () => adicionarAoCesto(produto.id));

    //Estrutura do artigo
    article.append(titulo, imagem, descricao, preco, botao);

    return article;
}

let cesto = [];
let total = 0;

function adicionarAoCesto(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;

    cesto.push(produto);
    total += produto.price;
    renderizarCesto();
    salvarNoLocalStorage();
}

function removerDoCesto(id) {
    const index = cesto.findIndex(item => item.id === id);
    if (index !== -1) {
        total -= cesto[index].price;
        cesto.splice(index, 1);
        renderizarCesto();
        salvarNoLocalStorage();
    }
}

function renderizarCesto() {
    const listaCesto = document.getElementById("lista-cesto");
    const totalDisplay = document.getElementById("total");
    listaCesto.innerHTML = "";

    cesto.forEach(item => {
        const artigo = document.createElement("article");
        artigo.classList.add("produto");

        const titulo = document.createElement("h4");
        titulo.textContent = item.title;

        const imagem = document.createElement("img");
        imagem.src = item.image;
        imagem.alt = item.title;

        const preco = document.createElement("p");
        preco.textContent = `Custo total: ${item.price.toFixed(2)} €`;

        const botaoRemover = document.createElement("button");
        botaoRemover.textContent = "- Remover do Cesto";
        botaoRemover.classList.add("btn-remover");
        botaoRemover.addEventListener("click", () => removerDoCesto(item.id));

        artigo.append(titulo, imagem, preco, botaoRemover);
        listaCesto.append(artigo);
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

// Carrega o cesto salvo ao iniciar
document.addEventListener("DOMContentLoaded", carregarDoLocalStorage);
