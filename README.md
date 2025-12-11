# Alpine JS Poll

![](https://img.shields.io/bundlephobia/min/alpinejs-poll)
![](https://img.shields.io/npm/v/alpinejs-poll)
![](https://img.shields.io/npm/dt/alpinejs-poll)
![](https://img.shields.io/github/license/eznix86/alpinejs-poll)

Alpine.js plugin for polling and visibility tracking.

## What you get

- `x-poll` - Execute expressions at intervals
- `x-visible` - React to page visibility changes
- Visibility-aware polling with `.visible` modifier
- Supports `ms`, `s`, `m`, `h` time units

## Install

### CDN

```html
<script defer src="https://unpkg.com/alpinejs-poll@latest/dist/cdn.min.js"></script>
<script defer src="https://unpkg.com/alpinejs@latest/dist/cdn.min.js"></script>
```

### Package

```shell
npm install -D alpinejs-poll
```

```js
import Alpine from 'alpinejs'
import poll from 'alpinejs-poll'

Alpine.plugin(poll)
Alpine.start()
```

## Usage

### x-poll

Execute an expression at regular intervals. Executes immediately on init, then at each interval.

```html
<div x-data="{ count: 0 }" x-poll.1s="count++">
  Count: <span x-text="count"></span>
</div>
```

#### Time Units

| Modifier | Description |
|----------|-------------|
| `.500ms` | 500 milliseconds |
| `.1s` | 1 second |
| `.5m` | 5 minutes |
| `.1h` | 1 hour |

Default interval is 60 seconds if not specified.

```html
<!-- Poll every 5 seconds -->
<div x-poll.5s="fetchData()">...</div>

<!-- Poll every 100ms -->
<div x-poll.100ms="tick()">...</div>

<!-- Poll every 2 minutes -->
<div x-poll.2m="refresh()">...</div>
```

### x-poll.visible

Only poll when the page is visible. Executes immediately when visibility is restored.

```html
<div x-data="{ data: null }" x-poll.5s.visible="data = await fetchData()">
  <span x-text="data"></span>
</div>
```

Visibility is tracked via:
- `document.visibilitychange` - tab switching
- `window.focus` / `window.blur` - window focus
- `pageshow` / `pagehide` - iOS PWA / bfcache

### x-visible

React to page visibility changes. Calls handler with `true` when visible, `false` when hidden.

```html
<div x-data="{ status: 'visible' }" x-visible="(visible) => status = visible ? 'visible' : 'hidden'">
  Status: <span x-text="status"></span>
</div>
```

```html
<!-- Pause video when tab is hidden -->
<video x-data x-visible="(visible) => visible ? $el.play() : $el.pause()">
  <source src="video.mp4" type="video/mp4">
</video>
```

## Examples

### Auto-refresh data

```html
<div x-data="{ users: [] }" x-poll.30s.visible="users = await (await fetch('/api/users')).json()">
  <template x-for="user in users">
    <div x-text="user.name"></div>
  </template>
</div>
```

### Live clock

```html
<div x-data="{ time: new Date() }" x-poll.1s="time = new Date()">
  <span x-text="time.toLocaleTimeString()"></span>
</div>
```

### Connection status

```html
<div x-data="{ online: true }" x-visible="(visible) => online = visible">
  <span x-show="online">Online</span>
  <span x-show="!online">Away</span>
</div>
```

## License

MIT

### Build and publish

```sh
# Build the dist files
npm run build

# Publish to npm
npm publish
```

- npm: https://www.npmjs.com/package/alpinejs-poll
- unpkg: https://unpkg.com/alpinejs-poll@latest/dist/cdn.min.js

To update later:

### Bump version
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

### Publish
npm publish
