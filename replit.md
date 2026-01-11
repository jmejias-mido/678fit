# 678FIT - Gym Boutique Website

## Overview
A static landing page website for 678FIT, a boutique gym targeted at professional women (30-45 years old). The website is built with HTML, CSS, and JavaScript and features a modern dark theme with purple accents.

## Project Structure
```
/
├── index.html          # Main HTML page
├── styles.css          # All CSS styles including responsive design
├── script.js           # JavaScript for animations, modal, and interactions
├── assets/
│   └── images/         # Image assets (logo, hero background, etc.)
└── README.md           # Original project readme
```

## Features
- Responsive design (mobile-first)
- Dark/Light theme toggle with localStorage persistence
- Scroll animations using Intersection Observer
- Booking modal with form
- Smooth scrolling navigation
- Hero parallax effect

## Running Locally
The website is served using Python's built-in HTTP server on port 5000:
```
python -m http.server 5000 --bind 0.0.0.0
```

## Deployment
Configured for static deployment - serves all files from the root directory.
