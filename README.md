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

The project is developed using the [bun](https://bun.sh/package-manager) package manager as it is
a blazingly fast npm alternative. Of course you can use `npm`, `pnpm` or `yarn` as well, however for
the sake of this documentation we will only reference `npm` and `bun` commands from here on out.

```bash
# npm
npm install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# bun
bun run dev
```
