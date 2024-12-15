# Grade
HTML Code Quality: 9/10
CSS/Tailwind Code Quality: 7.5/10
Responsive Design: 7/10
Assignment Requirements: 8.5/10

Total: 32/40

## Comments
You added a lot of extra features that were not part of the requirements of the website but missed a number of key requirements, resulting in a loss of grade. You should focus on what is required before doing your own additions.

### HTML
- `aria-label` attribute should only be added to interactive elements where the content does not already appropriate describe what the interactive element does.
  - You have added `aria-label` to elements that are not interactive (ex: `<nav class="pagination" aria-label="Recipe pages">`). This should be removed as the label is for interactivity
  - In general, you should take a "less is more" approach with all accessibility features and `aria` attributes. It is very likely you will make accessibility worse by doing it incorrectly. If you are not 100% sure it is needed, do not include it.

Search for `prof comment` in individual files for specific comments.

### CSS/TailwindCSS
- You should not be using `px`. Use `rem` instead.
- You should not need to use `!important` in your css rules. If you are using it that is an indicator that you have done a poor job of writing your selectors and should re-work them.
- You should not be using `max-width` media queries. You should be working mobile first responsive.
- Do not use ID selectors for styling. We want our styles to be re-usable and since IDs must be unique, this removes/reduces the re-usability of styling rules.
- You did not override the default `border` styling of the to top button, causing the border styling to be inconsistent with the rest of the site.

Search for `prof comment` in individual files for specific comments.

### Responsive Design
- Multiple areas of the site are not mobile first responsive and do not work on mobile.
  - Navbar
  - Newsletter banner
  - Footer
  - Pagination
- There are numerous colour contrast errors. Some are marked by the WAVE tool, others require manual checks. For example, the orange banner title does not get caught by the checker, but a manual check shows that it does not pass on the background.
- You've inconsistently used your fonts in the headings. Some section h2's are the cursive font, some are the serif font. Pick a logical structure for the fonts and stick to it. I recommend only using the cursive font in your banners and logo and the rest be the serif. The serif is easier to read and feels more appropriate for the design.
- Add some padding to the top of your footer, the content feels too tight at the top.

### Assignment Requirements
- Accessibility features are missing:
  - no skip links
  - tabbing focus styles, both the `outline` styles and a number of elements do not properly display highlighting styles correctly when focused.
- No `@container` queries were used.