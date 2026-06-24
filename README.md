# Mian Usman — Portfolio

A professional dark, 3D single-page portfolio — refined slate base with muted
sky→indigo accents. Pure HTML/CSS/JS with a Three.js animated particle-network
background. No build tools — just open it or host it anywhere.

## Run it locally
- **Easiest:** double-click `index.html`.
- **Recommended (for the 3D + fonts to load perfectly):** run a tiny local server:
  ```bash
  # Python
  python -m http.server 8000
  # then open http://localhost:8000
  ```

## Files
| File | What it is |
|------|------------|
| `index.html` | All page content (your bio, projects, experience) |
| `styles.css` | Theme, colors, layout, animations |
| `scene.js` | The 3D particle-network background (Three.js) |
| `app.js` | Typing effect, scroll reveal, nav, card tilt |
| `assets/profile.jpg` | Your photo (currently your `Usman.jpeg`) |
| `Mian_Usman_Resume.pdf` | The "Resume" download button target |

## Customize
- **Photo:** replace `assets/profile.jpg` with any square image.
- **Resume:** replace `Mian_Usman_Resume.pdf` to update the download.
- **LinkedIn:** search `linkedin.com/in/mian-usman` in `index.html` and swap in your real URL.
- **Colors:** edit the `:root` variables at the top of `styles.css`.
  The accent vars are `--cyan` (sky `#38bdf8`), `--violet` (indigo `#818cf8`),
  and `--emerald` (green). If you change the accents, update the matching colors
  in `scene.js` (`colA`, `colB`, `pointsMat.color`) so the 3D background matches.
- **Text:** all copy lives in `index.html` — edit directly.

## Deploy (free)
- **GitHub Pages:** push this folder to a repo → Settings → Pages → deploy from `main`.
- **Netlify / Vercel:** drag-and-drop the folder, or connect the repo. Done.

## Note
The site uses two CDNs (Google Fonts + Three.js), so the first load needs internet.
Everything else is self-contained.
