import React from 'react';
import type { ParsedError } from '../types';

export const parseApiError = (error: any): ParsedError => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Cenário 1: Falha na conexão (CORS, URL errada, sem internet)
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    return {
      title: 'Erro de Conexão com o Servidor',
      details: (
        <>
          <p>O aplicativo não conseguiu se comunicar com o seu backend (Google Apps Script). Isso geralmente acontece por um dos motivos abaixo.</p>
          <p className="mt-2 text-sm text-gray-500"><strong>Detalhe técnico:</strong> <code>{errorMessage}</code></p>
        </>
      ),
      troubleshootingSteps: (
        <ul className="list-decimal list-inside space-y-3 text-left">
          <li>
            <strong>Teste de Acessibilidade da URL:</strong>
            <p className="pl-4 text-sm text-gray-600">
              Abra o arquivo <code>services/googleSheetService.ts</code> e verifique se a constante <code>WEB_APP_URL</code> contém a URL <strong>exata</strong> da sua implantação.
            </p>
            <p className="mt-1 pl-4 text-sm text-gray-600">
              <strong>Para confirmar, cole a URL diretamente no seu navegador.</strong> O que você deve ver?
            </p>
            <ul className="list-disc list-inside mt-1 pl-8 text-sm">
                <li><strong className="text-green-700">Resultado BOM:</strong> Ver uma página de erro do Google com a mensagem "Script function not found: doGet". Isso confirma que a URL está online e acessível.</li>
                <li><strong className="text-red-700">Resultado RUIM:</strong> Ver uma página de login do Google ou um erro de "permissão negada". Isso significa que as permissões de acesso na implantação estão incorretas (veja o próximo passo).</li>
            </ul>
          </li>
          <li>
            <strong>Verifique as Permissões de Acesso (Causa Comum):</strong>
            <p className="pl-4 text-sm text-gray-600">Na implantação do seu Google Apps Script, a opção <strong>"Quem pode acessar"</strong> deve estar configurada como <strong>"Qualquer pessoa"</strong>. Esta é a causa mais comum de falhas de conexão.</p>
          </li>
          <li>
            <strong>Verifique a Conexão com a Internet:</strong>
             <p className="pl-4 text-sm text-gray-600">Assegure-se de que você está conectado à internet.</p>
          </li>
        </ul>
      ),
    };
  }

  // Cenário 2: O backend retornou um erro (ex: HTML em vez de JSON)
  if (errorMessage.toLowerCase().includes('unexpected token') || errorMessage.includes('JSON')) {
     return {
      title: 'Erro na Resposta do Backend',
      details: (
        <>
          <p>O backend (Google Apps Script) retornou uma resposta que não é um JSON válido, provavelmente uma página de erro do Google.</p>
           <p className="mt-2 text-sm text-gray-500"><strong>Detalhe técnico:</strong> <code>{errorMessage}</code></p>
        </>
      ),
      troubleshootingSteps: (
        <ul className="list-decimal list-inside space-y-3 text-left">
           <li>
            <strong>Verifique os Nomes das Abas e Colunas:</strong>
            <p className="pl-4 text-sm text-gray-600">Confirme que os nomes das abas (`IdeiasDB`, `UsersDB`) e todos os cabeçalhos das colunas na sua Planilha Google estão **exatamente** como especificado no `README.md`.</p>
          </li>
          <li>
            <strong>Verifique os Logs do Script:</strong>
             <p className="pl-4 text-sm text-gray-600">No editor do Apps Script, clique em "Execuções" (ícone de relógio) para ver se há algum erro sendo registrado quando o aplicativo tenta acessar os dados.</p>
          </li>
           <li>
            <strong>Faça uma Nova Implantação:</strong>
             <p className="pl-4 text-sm text-gray-600">Se você fez alguma alteração no código do script (`code.gs`), é necessário criar uma "Nova versão" na tela de "Gerenciar implantações".</p>
          </li>
        </ul>
      ),
    };
  }

  // Cenário 3: Erro genérico da API
  return {
    title: 'Erro Inesperado na API',
    details: (
        <>
         <p>Ocorreu um erro durante a comunicação com a API. Verifique os detalhes abaixo.</p>
         <p className="mt-2 text-sm text-gray-500"><strong>Mensagem:</strong> <code>{errorMessage}</code></p>
        </>
    ),
    troubleshootingSteps: (
         <ul className="list-decimal list-inside space-y-3 text-left">
           <li>Siga as mesmas etapas de verificação para "Erro de Conexão" e "Erro na Resposta do Backend".</li>
           <li>Verifique se a sua chave de API do Gemini foi configurada corretamente nas propriedades do script.</li>
        </ul>
    ),
  };
};