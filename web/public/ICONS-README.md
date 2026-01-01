# PWA Icons Setup

To complete the PWA setup, you need to generate PNG icons from the SVG.

## Option 1: Using the Script (Recommended)

1. Install sharp (if not already installed):
   ```bash
   pnpm add -D sharp -w
   # or
   npm install --save-dev sharp
   ```

2. Generate icons:
   ```bash
   pnpm run generate-icons
   # or
   npm run generate-icons
   ```

## Option 2: Using Online Tools

1. Use an online SVG to PNG converter (e.g., https://cloudconvert.com/svg-to-png)
2. Convert `icon.svg` to PNG with sizes:
   - 192x192 pixels → save as `icon-192x192.png`
   - 512x512 pixels → save as `icon-512x512.png`
3. Place both files in the `public/` directory

## Option 3: Using ImageMagick

```bash
convert -background none -resize 192x192 icon.svg icon-192x192.png
convert -background none -resize 512x512 icon.svg icon-512x512.png
```

## Icon Requirements

- **Format**: PNG
- **Sizes**: 192x192 and 512x512 pixels
- **Location**: `public/` directory
- **Purpose**: Should be "any maskable" for best compatibility

The PWA will work without these icons, but they improve the install experience and app appearance on home screens.

