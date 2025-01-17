const axios = require('axios');
const readline = require('readline');
const i18n = require('i18n'); // Importando o i18n

// Configuração do i18n
i18n.configure({
  locales: ['en', 'pt'],  // Idiomas suportados
  directory: __dirname + '/locales',  // Diretório onde os arquivos de tradução estarão
  defaultLocale: 'pt',  // Idioma padrão
  objectNotation: true,
});

// Criando a interface de leitura do console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para traduzir usando o i18n
const translateText = (text, locale = 'pt') => {
  i18n.setLocale(locale); // Definindo o idioma
  return i18n.__(text); // Traduzindo o texto
};

// Função para buscar informações de um Pokémon usando a PokéAPI
const fetchPokemonData = async (nomeOuNumero) => {
  try {
    // Verificar se o usuário forneceu um número ou nome
    const isNumero = !isNaN(nomeOuNumero);
    let url = isNumero 
      ? `https://pokeapi.co/api/v2/pokemon/${nomeOuNumero}`  // Busca pelo número
      : `https://pokeapi.co/api/v2/pokemon/${nomeOuNumero.toLowerCase()}`;  // Busca pelo nome

    // Fazendo a requisição para a PokéAPI
    const response = await axios.get(url);
    
    const pokemon = response.data;

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

    // Buscando a descrição e comportamentos
    const speciesResponse = await axios.get(pokemon.species.url);
    const habitat = speciesResponse.data.habitat ? speciesResponse.data.habitat.name : 'Desconhecido';

    // Filtrando e verificando as descrições em inglês
    const descricoesIngles = speciesResponse.data.flavor_text_entries.filter(entry => entry.language.name === 'en');
    let descricao = 'Descrição não disponível';
    if (descricoesIngles.length > 0) {
      descricao = descricoesIngles[0].flavor_text;
    }

    // Traduzir a descrição usando i18n
    const descricaoEmPortugues = descricao !== 'Descrição não disponível' 
      ? translateText(descricao, 'pt')  // Tradução
      : descricao;

    const comportamento = speciesResponse.data.generation.name ? `Comportamento típico da geração ${speciesResponse.data.generation.name}.` : 'Comportamento desconhecido';
    
    console.log(`\nDescrição e Comportamento:`);
    console.log(`Habitat: ${habitat}`);
    console.log(`Descrição: ${descricaoEmPortugues}`);
    console.log(`Comportamento: ${comportamento}`);

    // Lendas ou Curiosidades
    console.log(`Lendas e Curiosidades: Pokémon muito popular, frequentemente visto em várias culturas como mascote.`);

    // Buscando informações sobre habilidades
    const habilidades = pokemon.abilities.map(ability => ability.ability.name).join(', ');
    const movimentos = pokemon.moves.slice(0, 5).map(move => move.move.name).join(', ');

    // Evolução e pré-evolução
    const evolucaoResponse = await axios.get(speciesResponse.data.evolution_chain.url);
    const evolucoes = [];
    let evolucao = evolucaoResponse.data.chain;
    while (evolucao) {
      evolucoes.push(evolucao.species.name);
      evolucao = evolucao.evolves_to ? evolucao.evolves_to[0] : null;
    }

    // Exibindo Aspectos Técnicos
    console.log(`\nAspectos Técnicos:`);
    console.log(`Habilidades: ${habilidades}`);
    console.log(`Movimentos: ${movimentos}`);
    console.log(`Evoluções: ${evolucoes.join(' -> ')}`);

    // Dificuldade de captura
    console.log(`Dificuldade de Captura: Média`);

    // Localização e Região: Buscando informações detalhadas
    if (pokemon.location_area_encounters && Array.isArray(pokemon.location_area_encounters) && pokemon.location_area_encounters.length > 0) {
      const locationDetailsPromises = pokemon.location_area_encounters.map(async (encounter) => {
        // Buscando a URL da localização para obter o nome da área
        const locationResponse = await axios.get(encounter.location_area.url);
        return locationResponse.data.name;  // Nome da área de localização
      });

      const locationDetails = await Promise.all(locationDetailsPromises);
      console.log(`\nLocalização:`);
      console.log(`Áreas de Localização: ${locationDetails.join(', ')}`);
    } else {
      console.log(`\nLocalização: Não disponível`);
    }

    // Tipos de Pokédex
    const pokedexTipo = isNumero ? 'Pokédex Nacional' : 'Pokédex Regional'; // Exemplo fictício de diferenciação
    console.log(`\nTipo de Pokédex: ${pokedexTipo}`);

  } catch (error) {
    console.error('Erro ao buscar dados do Pokémon:', error.message || error);
  }
};

// Solicitar o número ou nome do Pokémon ao usuário
rl.question('Digite o número ou nome do Pokémon: ', (input) => {
  fetchPokemonData(input); // Chama a função com a entrada do usuário
  rl.close(); // Fecha a interface do readline após a resposta
});
