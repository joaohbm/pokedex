// translator.js
const { TranslationServiceClient } = require('@google-cloud/translate');
const path = require('path');

// Configurar o caminho para o arquivo de credenciais
process.env.GOOGLE_APPLICATION_CREDENTIALS = '/home/aluno/Área de trabalho/pokedex/node_modules/@google-cloud/translate/build/src/v3/.json'; // Substitua com o caminho correto

// Criando o cliente de tradução
const client = new TranslationServiceClient();
const projectId = 'SEU_ID_DE_PROJETO_GOOGLE'; // Substitua pelo seu ID do Google Cloud
const location = 'global';

// Função para traduzir um texto para o português
async function translateText(text) {
  try {
    const [response] = await client.translateText({
      parent: client.locationPath(projectId, location),
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: 'en', // Código do idioma de origem (inglês)
      targetLanguageCode: 'pt', // Código do idioma de destino (português)
    });
    return response.translations[0].translatedText;
  } catch (error) {
    console.error('Erro ao traduzir texto:', error);
    return text; // Se ocorrer erro, retorna o texto original
  }
}

// Exportar a função para uso em outros arquivos
module.exports = { translateText };
