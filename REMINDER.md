# Note for myself if i forget how to publish

## Build and publish

```sh
# Build the dist files
npm run build

# Publish to npm
npm publish
```

- npm: https://www.npmjs.com/package/alpinejs-poll
- unpkg: https://unpkg.com/alpinejs-poll@latest/dist/cdn.min.js

To update later:

## Bump version
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

## Publish
npm publish
