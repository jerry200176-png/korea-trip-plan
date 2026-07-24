# PRODUCT.md — Our First Korea

Product truth for Impeccable and other design agents. Visual rules live in `DESIGN.md`.

## Product

Private, mobile-first Korea travel handbook for **Jerry** and **Nikita** — their first international trip together (Seoul 4 nights + Busan 2 nights, provisional).

## Audience

Two people planning and executing one shared trip. Phone-first, offline-capable, Traditional Chinese UI with Korean place snippets.

## Jobs to be done

1. **Before:** Align on route, decisions, packing, and teaching material.
2. **During:** Today Mode — one priority, next move, map, emergency in ~10 seconds.
3. **After:** Keep a printable PDF travel book worth saving.

## Surfaces

| Surface | Mode | Notes |
|---------|------|--------|
| Home | Persuade → Read | Couple brand + discovery into the book |
| Today | Operate | Execution UI, not marketing |
| Days / guides | Read | Teaching + itinerary timeline |
| Decisions | Operate | Status-visible joint choices |
| Emergency | Operate | Large dial targets, offline PDF |

## Voice

Warm, calm, specific. Couple-facing Chinese. No dashboard jargon (“Founder”, “readiness gates”). Status always as Chinese labels, never color alone.

## Constraints

- Source of truth: `data/*.yaml` + schemas
- Privacy: no passports, full DOB, cards, booking codes, phones, ticket QR in the repo
- Astro static site; CSS tokens in `site/src/styles/tokens.css`
- Light warm editorial only; preserve `DESIGN.md` identity unless explicitly redesigning

## Anti-references

Startup dashboards, booking marketplaces, purple AI gradients, nested card walls, Inter-everywhere SaaS chrome.
