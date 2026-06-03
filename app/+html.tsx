import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

/**
 * Web-only HTML shell. Adds PWA manifest, iOS standalone meta tags so
 * "Add to Home Screen" launches without browser chrome, theme color, and
 * the apple-touch-icon. Native builds ignore this file entirely.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
        />

        <title>Life Autopilot</title>
        <meta
          name="description"
          content="your warm, calm life dashboard — meals, fridge, fitness, reading."
        />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#EDEAE3" />

        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Autopilot" />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: bodyCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const bodyCss = `
body { background-color: #EDEAE3; }
@media (prefers-color-scheme: dark) {
  body { background-color: #1a1816; }
}
`;
