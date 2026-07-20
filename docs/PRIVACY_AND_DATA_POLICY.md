# Privacy and Data Policy

**Applies to:** this repository (private today; treat as if it could become public).  
**Last updated:** 2026-07-20

## Never commit

- Passport numbers
- National ID numbers
- Full dates of birth
- Credit / debit card data
- Booking confirmation codes that can be used by others
- Phone numbers, home addresses, hotel room numbers
- Airline / hotel account passwords
- QR codes or ticket barcodes that grant access
- Scanned passport / ID images

## Allowed patterns

| Data | How to store |
|------|----------------|
| Traveler first names / nicknames | OK in `data/travelers.yaml` |
| Preferences, dietary rules | OK |
| Place names, public addresses of attractions | OK |
| Booking *structure* | Use `data/bookings.example.yaml` with placeholders like `REPLACE_ME` |
| Real bookings | Keep offline (password manager / private notes); never push |

## Local private overrides

If you need machine-local secrets for PDF generation:

1. Copy `data/bookings.example.yaml` → `data/bookings.local.yaml`
2. Ensure `bookings.local.yaml` is gitignored
3. Scripts may merge local file when present; CI must not require it

## Scanning

`npm run check:privacy` (root) fails the build if high-risk patterns appear in tracked files.

## Screenshots and artifacts

Do not attach boarding passes, hotel vouchers, or ID photos to PRs or `dist/` committed artifacts.
