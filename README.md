# Nostr Web of Trust

Open infrastructure for trust-based filtering on Nostr.

## The Problem

Nostr has no central authority to filter spam or verify identity. Web of Trust solves this by measuring social distance—how many hops separate you from someone in the follow graph.

## Components

| Project | Description |
|---------|-------------|
| [WoT Extension](https://github.com/mappingbitcoin/nostr-wot-extension) | Browser extension exposing `window.nostr.wot` API |
| [WoT Oracle](https://github.com/mappingbitcoin/wot-oracle) | Backend API for graph queries |

## How It Works

1. Your pubkey is the center
2. People you follow = 1 hop
3. People they follow = 2 hops
4. Beyond 3 hops = likely noise

## Use Cases

- Spam filtering without centralized blocklists
- Trust scores for marketplace/reviews
- Tiered notifications by social proximity
- Client-side content filtering

## API
```js
// Extension (client-side)
await window.nostr.wot.getDistance(pubkey)

// Oracle (server-side)
GET /distance?from={pubkey}&to={pubkey}
```

## Run Your Own

Both components are fully open source. Run your own oracle, fork the extension, build trust infrastructure for your community.

## License

MIT
