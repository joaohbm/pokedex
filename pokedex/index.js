const fs = require('fs');
const axios = require('axios');
const readline = require('readline');

// Tratamento de erro ao carregar as descrições
let pokemonDescriptions;
try {
  pokemonDescriptions = require('./descricao.js');
} catch (error) {
  console.error('Erro ao carregar o arquivo de descrições:', error.message);
  pokemonDescriptions = {}; // Garantir que o código continue mesmo que o arquivo falhe.
}

// Criando a interface de leitura do console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para buscar descrição traduzida de um Pokémon
const getTranslatedDescription = (id) => {
  const description = pokemonDescriptions[id];
  return description ? description : 'Descrição não disponível.';
};

// Função para buscar informações de um Pokémon usando a PokéAPI
const fetchPokemonData = async (nomeOuNumero) => {
  try {
    // Verificar se o usuário forneceu um número ou nome
    const isNumero = !isNaN(nomeOuNumero);
    const url = isNumero 
      ? `https://pokeapi.co/api/v2/pokemon/${nomeOuNumero}`  // Busca pelo número
      : `https://pokeapi.co/api/v2/pokemon/${nomeOuNumero.toLowerCase()}`;  // Busca pelo nome

    // Fazendo a requisição para a PokéAPI
    const response = await axios.get(url);
    const pokemon = response.data;

    if (!pokemon) {
      throw new Error('Pokémon não encontrado.');
    }

    // Extrair os dados básicos do Pokémon
    const nomePokemon = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const numeroRegistro = pokemon.id;
    const tipos = pokemon.types.map(type => type.type.name).join(', ');
    const peso = pokemon.weight / 10; // Peso retornado em hectogramas
    const altura = pokemon.height / 10; // Altura retornada em decímetros

    // Exibindo os Dados Básicos
    console.log(`\nDados Básicos:`);
    console.log(`Nome: ${nomePokemon}`);
    console.log(`Número de Registro: ${numeroRegistro}`);
    console.log(`Tipos: ${tipos}`);
    console.log(`Peso: ${peso} kg`);
    console.log(`Altura: ${altura} m`);

    // Buscar a descrição traduzida
    const descricaoEmPortugues = getTranslatedDescription(numeroRegistro);
    console.log(`\nDescrição: ${descricaoEmPortugues}`);

    // Lendas ou Curiosidades
    console.log(`Lendas e Curiosidades: Pokémon muito popular, frequentemente visto em várias culturas como mascote.`);

    // Buscando informações sobre habilidades
    const habilidades = pokemon.abilities.map(ability => ability.ability.name).join(', ');
    const movimentos = pokemon.moves.slice(0, 5).map(move => move.move.name).join(', ');

    console.log(`\nAspectos Técnicos:`);
    console.log(`Habilidades: ${habilidades}`);
    console.log(`Movimentos: ${movimentos}`);

    // Dificuldade de captura
    console.log(`Dificuldade de Captura: Média`);
    
  } catch (error) {
    if (error.response) {
      // Se a API retornar um erro (ex: 404, 500)
      console.error('Erro ao buscar dados do Pokémon na PokéAPI:', error.response.status);
      console.log('A API está temporariamente fora do ar. Por favor, tente novamente mais tarde ou entre em contato com o suporte.');
    } else if (error.request) {
      // Se não houver resposta da API (erro de rede)
      console.error('Erro de rede ao tentar acessar a PokéAPI:', error.message);
      console.log('Parece que a conexão com a API falhou. Tente novamente mais tarde.');
    } else {
      // Erro desconhecido
      console.error('Erro inesperado:', error.message);
      console.log('Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.');
    }
  }
};

// Solicitar o número ou nome do Pokémon ao usuário
rl.question('Digite o número ou nome do Pokémon: ', (input) => {
  fetchPokemonData(input); // Chama a função com a entrada do usuário
  rl.close(); // Fecha a interface do readline após a resposta
});
