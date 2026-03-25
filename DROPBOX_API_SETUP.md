# Como usar a API do Dropbox com token permanente

1. **Crie um app no Dropbox:**
   - Acesse https://www.dropbox.com/developers/apps
   - Clique em "Create App"
   - Escolha "Scoped access" e "Full dropbox" (ou "App folder" se preferir restrito)
   - Dê um nome ao app e crie

2. **Gere um token de acesso:**
   - No painel do app, vá em "OAuth 2" > "Generated access token"
   - Clique em "Generate" para criar um token permanente
   - Copie o token gerado (guarde com segurança)

3. **Configure o token no projeto:**
   - Crie/edite o arquivo `.env.local` na raiz do projeto
   - Adicione:
     VITE_DROPBOX_TOKEN=SEU_TOKEN_AQUI

4. **Acesse arquivos pelo caminho via API:**
   - Use o endpoint `https://api.dropboxapi.com/2/files/download` com o header `Authorization: Bearer <TOKEN>` e `Dropbox-API-Arg: {"path": "/CAMINHO/DO/ARQUIVO.xlsm"}`

5. **No Quasar:**
   - O frontend não deve expor o token! Implemente uma função no backend (Node.js, etc) para buscar o arquivo e servir ao frontend.
   - Se for só local/teste, pode fazer a chamada via Node.js direto.

---

Se quiser, posso gerar um exemplo de backend Node.js para servir o arquivo do Dropbox ao frontend. Confirme se deseja esse exemplo ou se quer integrar direto no frontend (não recomendado por segurança).
