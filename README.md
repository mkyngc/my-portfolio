# Personal Portfolio Website

A modern, dark-and-orange developer portfolio built with plain HTML5, CSS3, and
vanilla JavaScript — no frameworks, no build step. Ready to customize and deploy
straight to GitHub Pages.

## Folder structure

```
portfolio/
│
├── index.html
├── login.html
├── admin.html
├── css/
│   ├── style.css
│   ├── login.css
│   └── admin.css
├── js/
│   ├── script.js
│   ├── login.js
│   ├── admin.js
│   ├── render.js
│   └── content-data.js
├── assets/
│   ├── images/
│   │   ├── profile.svg
│   │   ├── project1.svg
│   │   ├── project2.svg
│   │   └── project3.svg
│   └── icons/
└── README.md
```

> The sample images are simple SVG placeholders styled to match the site's
> theme, so the layout looks right even before you add your own photos. Swap
> them out with real screenshots whenever you're ready (see below).

## What's already working

- Sticky nav bar with a mobile hamburger menu and active-link highlighting on scroll
- Large hero name with a static title line and a steady (non-animated) profile photo
- Hidden admin area: open `/login.html` (not linked anywhere), sign in, and manage everything from `admin.html`
- Scroll-reveal animations and animated skill progress bars
- Filterable project grid with editable categories, plus "View all" buttons for Projects and Certificates
- A project details modal for projects without a live demo link
- A contact form with client-side validation and success/error messages,
  wired up to FormSubmit (no backend required)
- Back-to-top button and an auto-updating copyright year
- Responsive layout for desktop, tablet, and mobile

## 1. Things to customize before you deploy

Open `index.html` and update:

| Section | What to change |
|---|---|
| `<title>` and meta description | Your name and a short tagline |
| Hero | Your name, short bio, and social links (GitHub, LinkedIn, Facebook) |
| About → Personal Introduction | Your real background and goals |
| About → Education | School name, degree, years, achievements |
| About → Technical Skills | Add/remove skills and categories in the admin panel (or `content-data.js`) |
| About → Timeline | Your real work experience and education entries |
| Projects | Replace the three sample cards with your own projects, screenshots, and links |
| Certificates | Replace the three sample certificate images in `assets/images/` (`certificate1.svg`, etc.) with scans or exports of your real certificates, and update the titles/issuers in `index.html` and the `CERTIFICATE_DETAILS` object in `js/script.js` |
| Contact | Your email, phone (optional), and location |
| Footer | Keep in sync with the hero's name/social links |
| Hero → "Download Resume" button | Points to `assets/resume.pdf` by default — add your actual resume file there, or update the `href` |
| Admin login | Default is `admin@example.com` / `password123`. Change it in **Admin → Publish & Security**, then paste the generated lines into `js/login.js` |
| Hero → orbit icons | The three floating skill badges (JS/CSS/Figma) are decorative — swap the icon classes in `index.html` (`fa-js`, `fa-css3-alt`, `fa-figma`) for whichever skills you want to highlight |

Replace the placeholder images in `assets/images/` with real screenshots —
keep the same filenames (`project1.svg`, etc.) or update the `src` paths in
`index.html` if you rename them. JPG/PNG/WebP all work fine; SVG is just what
the placeholders use.

## 2. Setting up the contact form (FormSubmit)

The form works without any backend, using [FormSubmit](https://formsubmit.co):

1. The form sends to the email set in **Admin → Contact** (currently
   `mkyngc@gmail.com`). No code edit is needed.
2. Put the site online, then submit the form once. FormSubmit sends a one-time
   confirmation email — click **Activate Form**. After that, every submission
   is emailed to you automatically. It will not work from `file://`.

Prefer EmailJS instead? Swap the `fetch()` call in `initContactForm()` for the
[EmailJS SDK](https://www.emailjs.com/docs/) call; the validation and UI
feedback code around it doesn't need to change.

## 3. Running it locally

No build tools needed. Either:

- Open `index.html` directly in a browser, or
- Serve it locally so relative paths and the contact form behave exactly
  like production:
  ```bash
  npx serve .
  # or
  python3 -m http.server 8000
  ```

## 4. Deploying to GitHub Pages

1. **Create a repository**
   - On GitHub, click **New repository**.
   - Name it anything you like (e.g. `portfolio`), set it to **Public**, and
     create it without a README (you already have one).

2. **Push your code**
   ```bash
   cd portfolio
   git init
   git add .
   git commit -m "Initial portfolio commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - In your repository, go to **Settings → Pages**.
   - Under **Build and deployment → Source**, choose **Deploy from a branch**.
   - Under **Branch**, choose `main` and `/ (root)`, then click **Save**.
   - GitHub will show a URL like:
     `https://YOUR-USERNAME.github.io/YOUR-REPO/`
   - It can take a minute or two to go live the first time.

4. **Verify after deployment**
   - Open the GitHub Pages URL and check that fonts, icons, images, and the
     contact form all work (they use relative paths and CDN links only, so
     nothing should break after deployment).
   - If you used a special repo name (not `YOUR-USERNAME.github.io`), all
     asset paths here are relative, so they'll resolve correctly under the
     `/YOUR-REPO/` subpath automatically.

## Credits / libraries used

- [Google Fonts](https://fonts.google.com/) — Poppins & Inter
- [Font Awesome](https://fontawesome.com/) (via CDN) — icons
- [FormSubmit](https://formsubmit.co/) — contact form email delivery, no backend required

No JavaScript frameworks are used anywhere in this project.

## Admin dashboard

1. Go to `login.html` and sign in (the page is not linked from the portfolio).
2. Edit Home, About, Skills, Experience, Projects, Certificates and Contact. Changes auto-save as a **draft in your browser**; use **Preview draft** to see them on the real site.
3. To publish: **Publish & Security → Download content-data.js**, replace `js/content-data.js` in the project with it, and upload/push the project again.

**Security note:** this is a static site, so the login is checked in the browser. It keeps casual visitors out of the dashboard, but anyone with technical skill could bypass it. It cannot change what visitors see — only the published `content-data.js` does — so the worst case is that someone edits a draft in their own browser. For real multi-device editing, connect a back-end such as Firebase.

## Project photo galleries

In **Admin → Projects**, each project has a *Cover image* (shown on the card) and a *More photos* gallery. Select several photos at once to add them, and click the **×** on any photo to delete it (or *Delete all photos*). Visitors see the photos as clickable thumbnails inside the project's **View Details** popup; projects with a live link get a **Photos** button when a gallery exists. Remember to **Download content-data.js** and replace the file to publish. Photos are resized to keep the file small.

