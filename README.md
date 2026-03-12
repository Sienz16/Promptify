# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.12.5 create --template minimal --types ts --add prettier vitest="usages:unit,component" mcp="ide:claude-code,cursor,gemini,opencode,vscode+setup:remote" tailwindcss="plugins:typography,forms" --install bun promptify
```

## Landing Page Generator

1. Copy `.env.example` to `.env`.
2. Set `SECRET_API_KEY` in `.env`.
3. Adjust `SECRET_API_URL` and `AI_MODEL` in `.env` if you want a different endpoint or routed model.
4. Start the app with `bun run dev`.

## Dokploy deployment

1. Add `SECRET_API_KEY`, `SECRET_API_URL`, and `AI_MODEL` in Dokploy's Environment tab.
2. Deploy the repo in Dokploy using `docker-compose.yml`.
3. Expose container port `3000` in Dokploy.

The app now builds with SvelteKit's Node adapter and runs behind Dokploy's reverse proxy using forwarded headers.

Verification:

- `bun run check`
- `bun run test`
- `bun run build`

## Developing

Once you've created a project and installed dependencies, start a development server:

```sh
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Building

To create a production version of your app:

```sh
bun run build
```

You can preview the production build with `bun run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
