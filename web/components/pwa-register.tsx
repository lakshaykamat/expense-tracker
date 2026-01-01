'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          })
          
          console.log('Service Worker registered:', registration.scope)
          
          // Check for updates immediately and then periodically
          registration.update()
          
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000) // Check every hour
          
          // Handle service worker updates
          let refreshing = false
          const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              refreshing = true
              // Only reload in production, not in dev
              if (!isDev) {
                window.location.reload()
              }
            }
          })
        } catch (error) {
          console.error('Service Worker registration failed:', error)
        }
      }

      // Register immediately if page is already loaded, otherwise wait for load
      if (document.readyState === 'complete') {
        registerServiceWorker()
      } else {
        window.addEventListener('load', registerServiceWorker)
      }
    }
  }, [])

  return null
}

