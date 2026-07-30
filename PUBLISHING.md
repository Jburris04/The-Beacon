# Publishing The Beacon with GitHub Desktop

Beacon Studio works entirely in your browser. It does not need a paid server or database.

## Publish a new edition

1. Open `https://jburris04.github.io/The-Beacon/admin/` and create or load your edition.
2. Review the live preview, then select **Save draft**. Drafts stay only in that browser.
3. Select **Generate publish package**. Your browser downloads a ZIP file.
4. Unzip the package. It contains `content`, `edition`, and `article` folders.
5. Open **The-Beacon** in GitHub Desktop, then choose **Repository → Show in Finder** (Windows: **Show in Explorer**).
6. Drag the three folders from the package into the repository folder. Choose **Merge** or **Replace** when asked. Existing editions and articles remain in place; only matching generated files are updated.
7. Return to GitHub Desktop. Review the changed files. The list should include the new edition JSON, the edition page, its article pages, and `content/editions/index.json`.
8. Enter a summary such as `Publish Beacon Edition 003`, select **Commit to main**, then **Push origin**.
9. After GitHub Pages finishes publishing, check the homepage, edition, each article, and the archive at `https://jburris04.github.io/The-Beacon/`.

## Safety and recovery

- Use **Export JSON** for a portable backup before publishing.
- Saved drafts use browser `localStorage`; clearing site data or changing browsers removes them.
- Never delete earlier `content/editions`, `edition`, or `article` folders when adding a new edition.
- If a publish is wrong, use GitHub Desktop’s history to revert that commit, then push again.
