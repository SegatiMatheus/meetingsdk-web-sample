const axios = require('axios');

// URL da API Laravel que você deseja consumir
const apiUrl = 'http://localhost/4selet/public/api';

function getApi() {
    let usuario = axios.get(apiUrl + '/buscas/dados-zoom') // Substitua '/endpoint' pelo endpoint específico da sua API Laravel
        .then(response => {
            console.log('Dados da API Laravel:', response.data);
        })
        .catch(error => {
            // Manipule erros aqui
            console.error('Erro ao consumir a API Laravel:', error);
        });

    return usuario;
}

getApi();
