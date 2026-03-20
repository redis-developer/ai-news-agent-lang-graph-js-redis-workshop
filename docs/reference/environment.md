# How to Use the Workshop Environment

Everything you need for this workshop runs in a single browser tab. The workbench is made up of panels that you can show, hide, resize, maximize, and even open in a new tab using the buttons in the top right of each panel. You can also show and hide panels using the hamburger menu in the top-left corner.

## Instructions

The sidebar on the left. You're reading it right now. It contains the step-by-step workshop guide. Use the sidebar navigation hamburger button on the bottom left to move between sections if you get lost.

## Code

A full VS Code editor running in the browser. All your workshop code lives here. Changes are saved to the container and persist across page refreshes.

## App

The news agent application. It updates automatically when you save changes in the Code panel—no manual refresh needed.

## Terminal

A shared terminal running inside the container. It uses tmux, so mouse wheel scrolling works. If you need to select text for copy/paste, hold **Shift** while selecting.

The dev server runs here automatically. You'll see build output and server logs as you work. If you kill the server, you can restart it by running `npm run dev` in the terminal. If you exit the terminal, it will automatically restart, but you might need to refresh some panels.

## Redis Insight

A visual browser for your Redis data. Hidden by default—toggle it from the hamburger menu. Use it to inspect keys, view JSON documents, and run Redis commands directly.
