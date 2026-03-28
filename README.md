# EA Somalia — Website

Official website for **Effective Altruism Somalia**, a community of ~50 Somali professionals applying evidence and reason to do the most good. Launched February 2026.

## 🚀 Deploy to Vercel

1. Push this repo to GitHub
2. Import the GitHub repo at [vercel.com](https://vercel.com)
3. Vercel auto-detects static HTML — no framework config needed
4. Deploy in seconds ✓

## 📁 Project Structure

```
ea-somalia/
├── index.html          # Home page
├── vercel.json         # URL rewrites & headers
├── css/
│   └── style.css       # Design system (fonts, colors, layout)
├── js/
│   ├── components.js   # Shared nav & footer
│   └── main.js         # Animations, scroll effects, count-up
└── pages/
    ├── career.html     # Career Guide
    ├── giving.html     # Giving Effectively
    ├── community.html  # Community & Mentorship
    ├── jobs.html       # Job Board & Grants
    └── about.html      # About Us & Contact
```

## 🛠 Tech Stack

- Pure HTML, CSS, JavaScript — no build step, no dependencies
- Google Fonts (Playfair Display + DM Sans + DM Mono)
- Deployed on Vercel Hobby (free tier) with automatic CI/CD

## ✏️ How to Update Content

- **Stats / member count**: Edit `index.html` hero section `data-count` attributes
- **Job listings**: Edit `pages/jobs.html` `.job-card` elements
- **Team members**: Edit `pages/about.html` team grid
- **Nav & footer**: Edit `js/components.js`

## 📧 Email Contacts

All contact forms use `mailto:` links:
- `info@easomalia.org` — General
- `chapters@easomalia.org` — Chapters
- `mentorship@easomalia.org` — Mentorship
- `grants@easomalia.org` — Grants

## 📄 License

© 2026 Effective Altruism Somalia. All rights reserved.
