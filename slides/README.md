# Workshop Slides

Presentation slides for the AI News Agent Workshop, built with [MARP](https://marp.app/) and a custom Redis theme.

## Setup

```bash
npm install
```

## Usage

**Live preview with auto-refresh:**

```bash
npm start
```

Opens a local server that serves the slides and refreshes when you make changes. Click the `.md` file in the listing to view the slides.

**Export to PDF:**

```bash
npm run build
```

Generates a PDF in the current directory.

## Presenting

1. Run `npm start`
2. Open the slide deck in your browser
3. Go fullscreen
4. Use arrow keys to navigate
5. Press **P** for presenter mode (speaker notes + next slide preview)

## Redis Theme

The custom Redis theme lives in `themes/redis/redis-theme.css`. It uses **Space Grotesk** for text and **Space Mono** for code.

### Frontmatter

Every deck starts with:

```markdown
---
marp: true
theme: redis
paginate: true
---
```

### Slide Types

Each slide needs a layout class and a color class, set via an HTML comment:

```markdown
<!-- _class: content dark -->
```

#### Layout Classes

| Class              | Description                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| `title`            | Title/opening slide. Logo, title (h1), and subtitle info (ul)                           |
| `thanks`           | Closing slide. Logo and a thank-you message (p)                                         |
| `hero`             | Big, bold, centered, uppercase text (h1). No title/subtitle                             |
| `content`          | Standard content slide. Left-aligned with h1 title and h2 subtitle                      |
| `centered-content` | Like `content` but centered. Good for diagrams or single images                         |
| `centered-images`  | Like `content` with images in horizontal rows. Uses h1/h2 for title/subtitle            |
| `blank`            | No title/subtitle. Content is centered. Good for standalone code, text, or images       |
| `blank-images`     | Like `blank` with images laid out horizontally                                          |
| `speaker`          | Two-column speaker/about-me slide. Photo, name, and title on left; bio content on right |

#### Color Classes

| Class   | Background          | Text  | Available on                   |
| ------- | ------------------- | ----- | ------------------------------ |
| `dark`  | Midnight (#091a23)  | White | All slide types                |
| `light` | White (#ffffff)     | Black | All slide types                |
| `hyper` | Redis Red (#ff4438) | White | `title`, `thanks`, `hero` only |

Combine them: `<!-- _class: content dark -->`, `<!-- _class: hero hyper -->`, etc.

#### Utility Classes

| Class     | Description                                   |
| --------- | --------------------------------------------- |
| `no-logo` | Hides the small logo. Works on any slide type |

### Pagination

Page numbers are on by default (set in frontmatter). They are automatically hidden on `title`, `thanks`, and `hero` slides.

To hide on a specific slide:

```markdown
<!-- _paginate: false -->
```

### Slide Examples

**Title slide:**

```markdown
<!-- _class: title dark -->

# Presentation Title

- Speaker Name
- Date
```

**Content slide:**

```markdown
<!-- _class: content dark -->

# Slide Title

## Subtitle

Some body text with **bold** and _italic_.

- Bullet points
- More bullets
```

**Hero slide:**

```markdown
<!-- _class: hero hyper no-logo -->

# Make a bold statement
```

**Blank slide with code:**

````markdown
<!-- _class: blank dark -->

```typescript
const message = 'Hello, world!'
console.log(message)
```
````

**Centered images:**

```markdown
<!-- _class: centered-images dark -->

# Technologies

## What powers the workshop

![h:80](themes/redis/logo1.svg)
![h:80](themes/redis/logo2.svg)
![h:80](themes/redis/logo3.svg)
```

Images on the same line (no blank line between them) form a single row. A blank line starts a new row.

**Speaker slide:**

```markdown
<!-- _class: speaker dark -->

![](headshot.jpg)

# Speaker Name

## Job Title, Company

# Talk Title

Some background info about the speaker.

- ![h:50 w:50](icon.png) @handle
- ![h:50 w:50](icon.png) username
```

The first image is the headshot (left column). The first h1 is the speaker name (with a colored bullet). The first h2 is the title. Everything after the first h2 flows into the right column.

### Background Images

MARP's built-in background image syntax works on any slide:

```markdown
![bg right:40%](image.png) <!-- split slide, image on right -->
![bg left:40%](image.png) <!-- split slide, image on left -->
![bg opacity:0.3](image.png) <!-- full background, dimmed -->
![bg](image.png) <!-- full background -->
```

### Image Sizing

Control image dimensions in the alt text:

```markdown
![w:400](image.png) <!-- width 400px -->
![h:300](image.png) <!-- height 300px -->
![w:400 h:300](image.png) <!-- both -->
```

### Speaker Notes

Add notes that only appear in presenter mode:

```markdown
<!-- This is a speaker note. The audience won't see this. -->
```
