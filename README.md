# Brew

Just brew it. Brew is a mobile-first community map for finding cafes, logging
specific coffees, and seeing what friends are sipping.

## Run

```sh
npm install
npm run dev
```

Mapbox is loaded from `VITE_MAPBOX_TOKEN` in `.env.local`.

## QA

Start the dev server, then run:

```sh
npm run qa
```

The QA script exercises the mobile map flow, matcha filtering, city search,
feed navigation, and coffee logging. It also captures mobile and desktop
screenshots in `screenshots/`.
