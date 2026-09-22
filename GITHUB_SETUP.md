# Publish this site on GitHub Pages

1. Create a new **public** GitHub repository, for example `kurdish-digital-library`.
2. Upload the **contents of this folder** to the root of the repository. `index.html` must be at the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/(root)`, then **Save**.
6. Wait a few minutes, then use the **Visit site** link shown by GitHub.

Your default public URL will normally be:
`https://YOUR-USERNAME.github.io/kurdish-digital-library/`

## Important

- Upload the extracted files/folders, not the ZIP itself.
- Keep `.nojekyll` in the root.
- The current Suggest a Book form was built for Netlify Forms. GitHub Pages can display the form but cannot process the submission by itself. Use Netlify connected to this GitHub repository, or connect the form to another form backend.
- Run `archive-books.command` on your Mac before uploading if you want eligible preservation copies stored inside the site's `books/` folder.
- Browser uploads to GitHub are limited for large files. If preserved PDFs become large, use GitHub Desktop/git, and remember GitHub blocks individual regular Git files over 100 MiB. GitHub Pages itself has a 1 GB published-site limit.
