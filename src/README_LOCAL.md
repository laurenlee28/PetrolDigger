# Local Development Setup

To run this project locally in VS Code:

1. **Install Node.js** (v18 or later)
2. **Create a new project folder**
3. **Copy the provided files** into the folder structure below
4. **Install dependencies**: `npm install`
5. **Run the dev server**: `npm run dev`

## Folder Structure

```
my-game/
├── public/
│   └── assets/
│       ├── game-bg.png       (Background image)
│       └── character.png     (Character sprite)
├── src/
│   ├── components/
│   │   ├── GameScreen.tsx
│   │   ├── PixelDrill.tsx
│   │   └── ... other components
│   ├── utils/
│   │   ├── soundSystem.ts
│   │   └── simulationWebSocket.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Asset Setup

You need to place your image files in `src/assets/` (or `public/assets/` depending on import style).
The provided code uses `../assets/filename.png` relative imports, so place images in `src/assets/`.

- Rename your background image to `game-bg.png`
- Rename your character image to `character.png`
