# Deployment notes

Private repos may need a paid GitHub plan for Pages. CI always builds `site/dist`; enable Pages manually if available.

## Suggested Pages settings

- Source: GitHub Actions
- Artifact: `site/dist` from CI

Base path in Astro is `/korea-trip-plan` to match project-pages URL shape.
