# PWA Setup Guide

This application is configured as a Progressive Web App (PWA) with offline support.

## Features

- ✅ Installable on mobile and desktop
- ✅ Offline functionality with service worker
- ✅ App-like experience (standalone mode)
- ✅ Fast loading with cached resources

## Generating Icons

Before deploying, you need to generate the PWA icons from the SVG:

```bash
npm run generate-icons
```

This will create:
- `public/icon-192x192.png`
- `public/icon-512x512.png`

## Testing PWA

### Local Development

1. Build the application:
   ```bash
   npm run build
   npm start
   ```

2. Open in Chrome/Edge and check:
   - Application tab → Service Workers (should show registered)
   - Application tab → Manifest (should show manifest details)
   - Lighthouse → PWA audit

### Mobile Testing

1. Deploy to a server (HTTPS required for PWA)
2. Open on mobile device
3. Use "Add to Home Screen" option
4. Test offline functionality

## Service Worker

The service worker (`public/sw.js`) provides:
- Offline caching of static assets
- Network-first strategy for API calls
- Automatic cache updates

## Manifest

The `manifest.json` includes:
- App name and description
- Icons for different sizes
- Display mode (standalone)
- Theme colors
- Shortcuts for quick actions

## Browser Support

- ✅ Chrome/Edge (Android, Desktop)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Android, Desktop)
- ⚠️ Limited support in older browsers

## Troubleshooting

### Service Worker Not Registering

- Ensure you're using HTTPS (or localhost for development)
- Check browser console for errors
- Verify `sw.js` is accessible at `/sw.js`

### Icons Not Showing

- Run `npm run generate-icons` to create PNG icons
- Verify icons exist in `public/` directory
- Check manifest.json icon paths

### App Not Installable

- Ensure manifest.json is valid
- Check that icons are properly sized
- Verify HTTPS is enabled (required for install)

