# NewsFlash Article Creation Guide

## Quick Start

### Option 1: Upload HTML File (Recommended)
1. Go to **Admin → Articles → New Article**
2. Click **"📂 Choose HTML File"** button
3. Select your `.html` file
4. System auto-fills: title, content, summary, category, tags, featured image
5. Review and adjust if needed
6. Click **"Publish Article"**

### Option 2: Manual Entry
1. Go to **Admin → Articles → New Article**
2. Fill in all fields manually
3. Click **"Publish Article"**

---

## HTML File Structure

### Minimal HTML File
```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Article Title</title>
    <meta name="description" content="Brief summary">
    <meta name="keywords" content="tag1, tag2, tag3">
    <meta property="og:image" content="https://example.com/image.jpg">
</head>
<body>
    <article>
        <h1>Article Title</h1>
        <p>Your article content here...</p>
    </article>
</body>
</html>
```

### Complete HTML File (Recommended)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>Article Title - NewsFlash</title>
    <meta name="description" content="Article description (150-160 chars)">
    <meta name="keywords" content="keyword1, keyword2, keyword3">
    <meta name="author" content="Author Name">
    
    <!-- Open Graph (Social Media) -->
    <meta property="og:title" content="Article Title">
    <meta property="og:description" content="Article description">
    <meta property="og:image" content="https://example.com/image.jpg">
    <meta property="og:type" content="article">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Article Title">
    <meta name="twitter:description" content="Article description">
    <meta name="twitter:image" content="https://example.com/image.jpg">
</head>
<body>
    <article>
        <h1>Article Title</h1>
        <img src="https://example.com/featured-image.jpg" alt="Description">
        
        <p>Introduction paragraph...</p>
        
        <h2>Section 1</h2>
        <p>Content...</p>
        
        <h2>Section 2</h2>
        <table>
            <tr><th>Header 1</th><th>Header 2</th></tr>
            <tr><td>Data 1</td><td>Data 2</td></tr>
        </table>
        
        <h2>Section 3</h2>
        <ul>
            <li>Point 1</li>
            <li>Point 2</li>
        </ul>
    </article>
</body>
</html>
```

---

## What Gets Imported

### ✅ Automatically Extracted
- **Title**: From `<h1>` tag or `<meta property="og:title">`
- **Content**: All HTML structure (tables, lists, images, etc.)
- **Summary**: From `<meta name="description">` or first paragraph
- **Featured Image**: From `<meta property="og:image">` or first `<img>` tag
- **Category**: Auto-detected from keywords (NEET→Education, Cricket→Sports, etc.)
- **Tags**: From `<meta name="keywords">`
- **Author**: From `<meta name="author">` or `.byline` element
- **Read Time**: Calculated from word count

### ✅ Content Elements Preserved
- **Headings**: `<h1>`, `<h2>`, `<h3>`, etc.
- **Paragraphs**: `<p>` with formatting (`<strong>`, `<em>`, `<u>`)
- **Lists**: `<ul>`, `<ol>`, `<li>`
- **Tables**: Complete `<table>` with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- **Images**: All `<img>` tags with URLs preserved
- **Blockquotes**: `<blockquote>` elements
- **Iframes**: Embedded videos, maps, etc.
- **Code Blocks**: `<pre>`, `<code>` elements
- **SVG & Canvas**: Graphics and interactive elements

### ❌ Automatically Removed
- Navigation (`<nav>`, `.navbar`, `.menu`)
- Headers/Footers (`<header>`, `<footer>`)
- Sidebars (`<aside>`, `.sidebar`)
- Ads (`[class*="ad"]`, `[id*="ad"]`)
- Comments sections
- Related articles sections
- Share buttons

---

## SEO Meta Tags Reference

### Essential Tags
| Tag | Purpose | Example |
|-----|---------|---------|
| `<title>` | Page title (50-60 chars) | `<title>NEET 2026 Guide - NewsFlash</title>` |
| `<meta name="description">` | Page description (150-160 chars) | `<meta name="description" content="Complete NEET 2026 guide...">` |
| `<meta name="keywords">` | Search keywords (comma-separated) | `<meta name="keywords" content="NEET, exam, preparation">` |
| `<meta name="author">` | Article author | `<meta name="author" content="John Doe">` |

### Open Graph Tags (Social Media)
| Tag | Purpose | Example |
|-----|---------|---------|
| `<meta property="og:title">` | Social media title | `<meta property="og:title" content="...">` |
| `<meta property="og:description">` | Social media description | `<meta property="og:description" content="...">` |
| `<meta property="og:image">` | Social media image (1200x630px) | `<meta property="og:image" content="https://...">` |
| `<meta property="og:type">` | Content type | `<meta property="og:type" content="article">` |

### Twitter Card Tags
| Tag | Purpose | Example |
|-----|---------|---------|
| `<meta name="twitter:card">` | Card type | `<meta name="twitter:card" content="summary_large_image">` |
| `<meta name="twitter:title">` | Twitter title | `<meta name="twitter:title" content="...">` |
| `<meta name="twitter:description">` | Twitter description | `<meta name="twitter:description" content="...">` |
| `<meta name="twitter:image">` | Twitter image | `<meta name="twitter:image" content="https://...">` |

---

## Category Auto-Detection

The system automatically detects categories based on keywords:

| Category | Keywords |
|----------|----------|
| **Education** | NEET, JEE, exam, university, school, syllabus, admission |
| **Sports** | Cricket, IPL, match, player, tournament, score |
| **Technology** | Tech, AI, startup, software, app, digital, innovation |
| **Business** | Business, market, economy, finance, investment, stock |
| **Health** | Health, medical, hospital, disease, treatment, doctor |
| **World** | World, global, international, country, nation |
| **Sarkari** | Sarkari, government job, recruitment, vacancy, notification |
| **India** | Default category (if no keywords match) |

---

## Image Guidelines

### Featured Image
- **Recommended Size**: 1200 x 630 pixels
- **Format**: JPG, PNG, WebP
- **File Size**: < 500 KB
- **Source**: Use absolute URLs (https://...)

### Content Images
- **Recommended Size**: 800 x 600 pixels or wider
- **Format**: JPG, PNG, WebP
- **File Size**: < 300 KB each
- **Alt Text**: Always include descriptive alt text

### Image URL Examples
```html
<!-- Absolute URL (Recommended) -->
<img src="https://example.com/images/article-image.jpg" alt="Description">

<!-- Relative URL (will be preserved) -->
<img src="/images/article-image.jpg" alt="Description">
```

---

## Content Examples

### Tables
```html
<table>
    <thead>
        <tr>
            <th>Column 1</th>
            <th>Column 2</th>
            <th>Column 3</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Data 1</td>
            <td>Data 2</td>
            <td>Data 3</td>
        </tr>
    </tbody>
</table>
```

### Lists
```html
<!-- Unordered List -->
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ul>

<!-- Ordered List -->
<ol>
    <li>First step</li>
    <li>Second step</li>
    <li>Third step</li>
</ol>
```

### Blockquotes
```html
<blockquote>
    "This is an important quote from an expert or source."
</blockquote>
```

### Text Formatting
```html
<p>Normal text with <strong>bold</strong>, <em>italic</em>, and <u>underline</u>.</p>
```

### Embedded Videos
```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" 
    title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; 
    clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
</iframe>
```

---

## Best Practices

✅ **DO:**
- Use semantic HTML tags (`<article>`, `<section>`, `<header>`)
- Include all SEO meta tags
- Use absolute URLs for images
- Keep HTML clean and well-structured
- Test your HTML file in a browser first
- Use descriptive alt text for all images
- Keep tables properly formatted with `<thead>` and `<tbody>`

❌ **DON'T:**
- Use inline CSS styles (they will be removed)
- Include navigation, header, footer elements
- Use relative image paths without domain
- Leave images without alt text
- Use deprecated HTML tags
- Include ads or tracking scripts
- Use complex nested divs for layout

---

## Troubleshooting

### Issue: Images Not Showing
**Solution**: Ensure image URLs are absolute (start with `https://` or `http://`)

### Issue: Content Not Imported
**Solution**: Check that content is inside `<article>`, `<main>`, or `<body>` tags

### Issue: Wrong Category Detected
**Solution**: Edit the category manually after import, or add keywords to title/content

### Issue: Summary Not Extracted
**Solution**: Add `<meta name="description">` tag or ensure first paragraph has >50 characters

### Issue: Featured Image Not Set
**Solution**: Add `<meta property="og:image">` tag or include `<img>` tag in content

### Issue: Table/Chart Not Showing
**Solution**: Ensure table is properly formatted with `<table>`, `<tr>`, `<td>` tags

---

## Example Files

### Download Template
A complete example HTML file is available at:
`/article-template.html`

You can download and use this as a starting point for your articles.

### Full Guide
For detailed information, see:
`/HTML-IMPORT-GUIDE.md`

---

## Step-by-Step Import Process

### 1. Prepare Your HTML File
- Create or export your article as HTML
- Ensure all images use absolute URLs (https://...)
- Include SEO meta tags
- Validate HTML structure

### 2. Upload the File
- Go to **Admin → Articles → New Article**
- Click **"📂 Choose HTML File"** button
- Select your `.html` file

### 3. Review Imported Data
- Check that title, content, and images are correct
- Verify category auto-detection
- Edit any fields that need adjustment

### 4. Add Additional Information
- Add key highlights (one per line)
- Set article status (Draft/Published)
- Mark as Breaking News or Featured if needed

### 5. Publish
- Click **"Publish Article"** or **"Save as Draft"**
- Article will be live immediately if published

---

## Support

For issues or questions about HTML import:
1. Check this guide
2. Review the example template
3. Contact: support@newsflash.in

---

**Last Updated**: May 2026
**Version**: 3.0
