# Awtrix 3 Web

## Development
#### With Nix
If you're using [Nix](https://nixos.org), we provide a development shell that sets up everything you need
to start working on the web interface. This includes `node` and` bun`, so you don't need to install any
dependencies or worry about polluting your system environment. Run `nix develop` in order to enter the
development shell.

Alternatively, if you have `direnv` installed, run `direnv allow` once, which will automatically bring you
into a development shell every time you enter the project directory.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
