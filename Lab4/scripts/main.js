// main.js

let counter = 0;
const heading = document.querySelector('h1');

function count() {
   counter++;
   heading.textContent = counter;
} 

// 1. Evento mouseover / mouseout
function mudarCor(elemento) {
  elemento.style.color = "orange";
  elemento.textContent = "Olá! Passaste aqui 😄";
}

function voltarCor(elemento) {
  elemento.style.color = "black";
  elemento.textContent = "Passar aqui";
}

// 2. Pintar quadrado
function pintar(cor) {
  document.body.style.backgroundColor = cor;
  document.getElementById("resultadoCor").textContent = `Fundo alterado para ${cor}`;
}

// 3. Mostrar dica ao mover o rato
function mostrarDica() {
  document.getElementById("dica").textContent = "Escreve algo divertido!";
}

function esconderDica() {
  document.getElementById("dica").textContent = "";
}

// 4. Mudar fundo ao submeter cor em inglês
function mudarFundo() {
  const cor = document.getElementById("corInput").value.toLowerCase();
  document.body.style.backgroundColor = cor;
  document.getElementById("resultadoCor").textContent = `Cor escolhida: ${cor}`;
}

// 5. Contador
let contador = 50;
function contar() {
  contador++;
  document.getElementById("numero").textContent = contador;
}

// 6. Trocar imagem ao duplo clique
function trocarImagem() {
  document.getElementById("imagem").src = `https://picsum.photos/200?random=${Math.floor(Math.random() * 1000)}`;
}
