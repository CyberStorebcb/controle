# Quasar App (quasar-project)

A Quasar Project

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Deploy to Vercel

1. Crie uma conta na [Vercel](https://vercel.com), conecte o seu repositório Git e selecione este projeto como root.
2. A Vercel vai ler o `vercel.json` e aplicar automaticamente:
   - `pnpm install --frozen-lockfile`
   - `pnpm quasar build`
   - Diretório de saída: `dist/spa`
3. Opcionalmente, faça o deploy pelo terminal:
   ```bash
   pnpm dlx vercel@latest login
   pnpm dlx vercel link
   pnpm dlx vercel deploy --prod
   ```
4. Cada push no branch configurado dispara um novo deploy automático.

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
