# Fábrica de Ideias: Priorização de Serviços com IA

Bem-vindo à Fábrica de Ideias! Esta é uma plataforma interativa projetada para catalisar a inovação em serviços. Com ela, sua equipe pode gerar, analisar, priorizar e explorar um portfólio completo de novas ideias de negócio, tudo em um ambiente colaborativo, seguro e potencializado por Inteligência Artificial.

## Principais Funcionalidades

- **Autenticação de Usuários**: Sistema seguro de login e cadastro para proteger o acesso ao portfólio de ideias.
- **Gerador de Ideias Inteligente**: Insira uma ideia bruta e receba sugestões de benefício principal, público-alvo e modelo de negócio geradas por IA.
- **Priorização Estratégica com IA**: Avalie e classifique automaticamente todo o portfólio de ideias com base em critérios de negócio personalizáveis.
- **Banco de Dados Centralizado**: Utiliza uma Planilha Google como banco de dados, permitindo que múltiplos usuários visualizem e contribuam com ideias em tempo real.
- **Explorador de Ideias**: Navegue, filtre e pesquise por todas as ideias do portfólio com um buscador completo.
- **Análise de Clusters**: Visualize a distribuição de ideias em clusters estratégicos e entenda as áreas de maior foco e oportunidade.
- **Assistente de IA (Chat)**: Converse com um assistente de IA para obter insights sobre o portfólio.

---

## Configuração Inicial (Essencial)

Para que o aplicativo funcione, você precisa conectá-lo a uma Planilha Google e a um script que servirão como seu backend seguro. Siga os três passos abaixo com atenção.

### Parte 1: Criar a Planilha Google (O Banco de Dados)

Esta planilha armazenará todas as ideias e também os dados dos usuários.

1.  **Crie uma nova Planilha Google**: Acesse [sheets.new](https://sheets.new) e dê um nome à sua planilha (ex: "Fábrica de Ideias - Banco de Dados").

2.  **Configure a Aba de Ideias (`IdeiasDB`)**:
    - Renomeie a primeira página (aba) da sua planilha para `IdeiasDB`.
    - Na primeira linha, crie os seguintes cabeçalhos, **exatamente nesta ordem e com estes nomes**:
        - `id`
        - `service`
        - `need`
        - `cluster`
        - `businessModel`
        - `targetAudience`
        - `status`
        - `creatorName`
        - `creationDate`
        - `score_alinhamento`
        - `score_valor_cliente`
        - `score_impacto_fin`
        - `score_viabilidade`
        - `score_vantagem_comp`
        - `revenue_estimate`

3.  **Configure a Aba de Usuários (`UsersDB`) - NOVO!**:
    - Crie uma **nova aba** na mesma planilha e renomeie-a para `UsersDB`.
    - Na primeira linha desta nova aba, crie os seguintes cabeçalhos:
        - `name`
        - `email`
        - `passwordHash` (o script irá preencher isso de forma segura)
        - `sessionToken` (o script gerencia isso para a sessão do usuário)

### Parte 2: Configurar o Backend Seguro (Google Apps Script)

Este script atuará como a ponte (API) segura entre o aplicativo, sua planilha e a IA do Gemini.

1.  **Abra o Editor de Script**: Na sua Planilha Google, vá em `Extensões` > `Apps Script`.

2.  **Cole o Código do Backend**:
    - Apague todo o conteúdo do arquivo `Code.gs`.
    - Abra o arquivo `google-apps-script/code.gs` deste projeto, copie **todo** o conteúdo e cole-o no editor de Apps Script.

3.  **Adicione sua Chave de API do Gemini (Passo de Segurança)**:
    - No menu à esquerda do editor de Apps Script, clique no ícone de engrenagem (`⚙️`) para abrir as **Configurações do Projeto**.
    - Role para baixo até **"Propriedades do script"** e clique em **`Adicionar propriedade do script`**.
    - **Propriedade**: `API_KEY`
    - **Valor**: Cole a sua chave de API do Google Gemini.
    - Clique em **`Salvar propriedades do script`**.
    > **Segurança**: A chave de API armazenada aqui só pode ser acessada pelo seu script no servidor do Google. Ela **nunca** será exposta no navegador do usuário.

4.  **Implante o Script como um Aplicativo Web**:
    - No canto superior direito, clique em **`Implantar`** > **`Nova implantação`**.
    - Clique no ícone de engrenagem (`⚙️`) e escolha **`Aplicativo da web`**.
    - Preencha os campos:
        - **Descrição**: `API para Fábrica de Ideias`
        - **Executar como**: `Eu ([seu_email@gmail.com])`.
        - **Quem pode acessar**: **`Qualquer pessoa`**.
            > **Atenção**: Esta etapa é **CRUCIAL**. Permite que o aplicativo acesse os dados sem que cada usuário precise fazer login com uma conta Google. A segurança é garantida pelo nosso sistema de login e tokens de sessão.
    - Clique em **`Implantar`**.

5.  **Autorize o Script**:
    - Clique em **`Autorizar acesso`** e escolha sua conta Google.
    - Clique em **`Avançado`** e depois em **`Acessar [Nome do seu projeto] (não seguro)`**.
    - Role para baixo e clique em **`Permitir`**.

6.  **Copie a URL do Aplicativo Web**:
    - Após a implantação, copie a **URL do aplicativo da web** fornecida.

### Parte 3: Conectar o Frontend ao Backend

1.  **Abra o arquivo de serviço**: Navegue até `services/googleSheetService.ts` no seu projeto.

2.  **Atualize a URL**: Encontre a variável `WEB_APP_URL` e substitua a string de placeholder pela URL que você copiou:
    ```typescript
    export const WEB_APP_URL: string = 'https://script.google.com/macros/s/ABCD.../exec';
    ```

3.  **Pronto!** Salve o arquivo. Ao recarregar o aplicativo, ele apresentará a tela de login/cadastro e estará conectado de forma segura à sua Planilha Google.

---

## Tornando o Aplicativo Acessível (Deployment)

Para que outras pessoas possam usar o aplicativo, você precisa hospedar os arquivos do frontend. Graças à arquitetura segura que implementamos, você pode usar qualquer serviço de hospedagem de sites estáticos.

**Opção Recomendada: Vercel ou Netlify**

Plataformas como [Vercel](https://vercel.com/) ou [Netlify](https://www.netlify.com/) são ideais.

1.  Crie uma conta gratuita em uma das plataformas.
2.  Conecte o repositório do seu projeto (ex: do GitHub).
3.  Implante o site com poucos cliques. A plataforma fornecerá uma URL pública para você compartilhar.

---

## Checklist de Verificação

### ✅ 1. Planilha Google
- [ ] Aba `IdeiasDB` existe com os 15 cabeçalhos corretos.
- [ ] Aba `UsersDB` existe com os 4 cabeçalhos corretos (`name`, `email`, `passwordHash`, `sessionToken`).

### ✅ 2. Google Apps Script
- [ ] Chave `API_KEY` foi adicionada e salva nas Propriedades do script.
- [ ] Script foi implantado como `Aplicativo da web`.
- [ ] Acesso está configurado como `Qualquer pessoa`.

### ✅ 3. Aplicação Frontend
- [ ] `WEB_APP_URL` em `services/googleSheetService.ts` foi atualizada com a sua URL.

### ✅ 4. Teste Funcional
Abra a URL final do seu aplicativo e realize as seguintes ações:

- [ ] **Cadastro**: Crie uma nova conta de usuário.
- [ ] **Login**: Saia e faça login com a conta que você criou.
- [ ] **Adicionar Ideia**: Adicione um novo item. Verifique se a nova linha aparece na sua Planilha Google na aba `IdeiasDB`.
- [ ] **Analisar com IA**: Na "Priorização", clique em "Analisar com IA". Verifique se as colunas de score são preenchidas na planilha.
- [ ] **Editar e Excluir**: No "Buscador", edite e depois exclua a ideia criada. Verifique as alterações na planilha.

Se tudo funcionar, sua aplicação está pronta para ser compartilhada!
