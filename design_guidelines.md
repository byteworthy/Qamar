# Noor CBT Design Guidelines

## Visual Identity & Brand

### Aesthetic Foundation
- **Design Inspiration**: Niyyah app warm brown aesthetic, cozy Islamic app feel
- **Mood**: Warm evening after Maghrib, intimate and comforting
- **Purpose**: Create a sanctuary for mental wellness rooted in Islam

### Color Palette (Niyyah-Inspired Dark Theme)

**Primary Background Colors:**
- Background Root: `#1a1612` (deep warm brown)
- Background Light: `#221e19` (slightly lighter brown)
- Card Background: `#2d2820` (warm brown card surface)
- Card Hover: `#3a3328` (lighter brown for interaction)

**Text Colors:**
- Primary Text: `#f5f0e8` (warm cream)
- Secondary Text: `#a89d8a` (muted cream)
- Muted: `#d4c9b8` (darker cream for subtle elements)

**Accent Colors:**
- Primary Accent: `#4fd1a8` (teal/mint green - for CTAs)
- Gold: `#c9a855` (warm gold for highlights)
- Clay: `#9b7b5c` (warm brown accent)
- Emerald: `#4a8a72` (muted green)
- Indigo: `#4a6888` (muted blue)

**Gradient Combinations for Cards:**
- Reflection: `#6a5a4a → #4a3a2a` (warm brown)
- Calming: `#4a6a5a → #2a4a3a` (forest green)
- Dua: `#4a5a6a → #2a3a4a` (calm blue)
- Insights: `#5a4a5a → #3a2a3a` (muted purple)

### Typography
- **Headings**: Georgia/Serif (contemplative, warm)
- **Body**: System sans-serif (clean, readable)
- **Title Scale**: 28px (screen titles), 22px (section headers)
- **Body Scale**: 15-17px (readable body text)
- **Small Scale**: 12-13px (labels, captions)

### Motion & Animation
- Duration: 250-350ms for most transitions
- Style: Fade and scale (FadeInUp, FadeInDown)
- Delay cascading: 40-80ms between staggered items
- Press feedback: 0.98 scale transform on press

## Navigation & Architecture

### Tab-Based Navigation
- 3 main tabs: Home, Explore, Profile
- Blurred tab bar background (iOS) or solid dark (Android)
- Tab icons: 22px Feather icons
- Active state: Cream color, Inactive: Muted cream

### Screen Structure
- Max content width: 420px (centered)
- Screen padding: 20px horizontal
- Safe area handling for all edges
- Bottom padding: 100px + bottom inset (for tab bar)

## Component Library

### Cards
- Border radius: 14-16px
- Padding: 16-18px
- Background: Card surface color
- Subtle gradient overlays for featured cards

### Module Cards (Home Screen)
- Full gradient background
- Icon in top-left (24px)
- Title + description at bottom
- PRO badge in top-right when applicable
- Min height: 100px

### Menu Items (Profile Screen)
- Horizontal layout with icon + text + chevron
- 14px border radius
- 16px internal padding
- Gap between icon and text: 14px

### Buttons
- Primary: Teal accent with dark text
- Secondary: Card background with cream text
- Pill style: 20px border radius
- Standard: 12-14px border radius
- Padding: 14px vertical, 18px horizontal

### Input Fields
- Background: Root background color
- Border radius: 12px
- Padding: 14px
- Centered text for name inputs

## Content Patterns

### Greeting Pattern
- "Salaam, [Name]" format
- Secondary subtitle below
- Edit icon (subtle) for name personalization

### Anchor/Daily Reminder
- Badge icon + label header
- Serif typography for the reminder text
- Card-based presentation

### Section Headers
- Uppercase, letter-spaced (0.8)
- 13px font size
- Muted color
- Margin bottom: 14px

## Accessibility

### Touch Targets
- Minimum: 44x44px
- Card rows: 56px min height

### Text Contrast
- Primary text on dark: 7:1+ contrast
- Secondary text: 4.5:1+ contrast

### Motion
- Respect reduce-motion preference
- Non-essential animations are subtle

## Key Constraints

- **Session Length**: Complete CBT flow under 5 minutes
- **Complexity**: Simple navigation, no deep nesting
- **Branding**: "Noor CBT" - Light for the mind, rooted in Islam
- **Tagline**: Powered by the Siraat Method
- **Theological safety**: Islam is the worldview, CBT is the method
