# Visual Design — Roc4t Kick-off Presentation

## Theme
- Dark, sophisticated, architectural feel
- Deep navy/charcoal primary with warm accent
- Clean typography, generous whitespace
- Professional, corporate, high-trust

## Color Palette
```yaml
colors:
  primary: "#0F172A"       # Deep navy / slate 900
  secondary: "#1E293B"     # Slate 800
  accent: "#F59E0B"        # Amber 500 — warm highlight
  background: "#0F172A"    # Dark background for cover/chapter
  surface: "#1E293B"       # Card/surface background
  text: "#F8FAFC"          # Slate 50 — near white
  textMuted: "#94A3B8"     # Slate 400
  border: "#334155"        # Slate 700
  success: "#10B981"       # Emerald 500
  warning: "#F59E0B"       # Amber 500
  danger: "#EF4444"        # Red 500
```

## Text Styles
```yaml
textStyles:
  title:
    fontSize: 44
    color: "$text"
    fontFamily: "Arial"
  subtitle:
    fontSize: 22
    color: "$textMuted"
    fontFamily: "Arial"
  heading:
    fontSize: 28
    color: "$text"
    fontFamily: "Arial"
  body:
    fontSize: 18
    color: "$textMuted"
    fontFamily: "Arial"
    lineHeight: 1.5
  caption:
    fontSize: 14
    color: "$textMuted"
    fontFamily: "Arial"
  badge:
    fontSize: 12
    color: "$text"
    fontFamily: "Arial"
    backgroundColor: "$accent"
```

## Layout Rules
- Cover: Full-bleed dark background with gradient overlay, centered title, bottom accent bar
- Content pages: Dark background, left-aligned heading, body content in cards or clean lists
- Tables: Header with accent color, alternating dark rows
- Architecture diagrams: Use shapes with solid fills, rounded corners, connected by arrows
- Consistent margins: 60px left/right, 50px top/bottom
- Use accent color sparingly for emphasis, badges, and key highlights

## Page Types
- cover: Full dark background, large title, subtitle, accent decoration
- content: Dark background, heading top-left, body content below
- final: Dark background, centered closing message, accent decoration
