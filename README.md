# Hero Dash
Endless anime-hero side-scroller MVP (Phaser 3, static site, no build step). Original characters only.

## Run locally
    cd hero-dash && python3 -m http.server 8000   # open http://localhost:8000
Phaser is vendored at `lib/phaser.min.js` (CDN fallback included).

## Controls
Jump / double jump: Z, Up, Space, or tap the left half. Dash: X, Shift, or tap the right half.
If you hit an obstacle while dashing, you smash it. If you hit one without dashing, or fall, you crash. Your number of wishes (lives) depends on difficulty.

## Difficulty
Pick one on the hero select screen: press 1/2/3 (or D to cycle), or tap the buttons. Your choice is saved, it shows in the HUD and on the game over screen, and each difficulty keeps its own best score.
- **Easy:** slow start and ramp, small and fewer gaps, fewer crates, 5 wishes. If you clip a ledge's side wall, you get nudged up onto the platform. Generous coyote time and jump buffer.
- **Medium:** moderate speed and ramp, 3 wishes, coyote time, and a few px of grace on side walls.
- **Hard:** faster start and ramp, wide gaps, more crates, 3 wishes. Side-wall hits crash.

## Deploy free
- **Cloudflare Pages:** Go to Create project → Direct Upload and drag in this folder (or connect the repo). Leave the build command empty and set the output dir to `/`.
- **GitHub Pages:** Push to a repo, then go to Settings → Pages → Deploy from branch `main`, folder `/ (root)`.
