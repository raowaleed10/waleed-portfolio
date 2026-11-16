# DityTruck — research note (not rendered on the site)

Researched 2026-11-16 to decide what the portfolio may say about DityTruck. Sources:

- The private backend repo `raowaleed10/DtiyTruckBackend`, cloned read-only outside this project. Nothing was copied from it, its visibility was not changed, and nothing was pushed to it.
- The live product at https://www.ditytruck.com, browsed without searching, booking or entering any data.

This note deliberately contains no code, selectors, URL paths, request formats or credentials from that repo.

## What the product does

DityTruck is a truck-rental comparison and booking service for US movers.

- **Live site:** a React single-page app. Its quote form has **Trucks** and **Moving Labor** tabs, pick-up and drop-off locations, moving size, date and time, an email field, and a **Get Rates** button.
- **Brands advertised today:** U-Haul, Budget, Enterprise and Hertz. "Load Help" links out to a labour partner.
- **Backend:** the Django REST Framework service behind it. For each search, it runs browser automation against rental providers' public quote pages, normalises the results into its own tables and returns them. It can also email the quote to the customer. Reservation requests, registered users and quotes are stored for the DityTruck team.

## How each provider is handled (code snapshot, April 2025)

| Provider | What the code does | Tool |
|---|---|---|
| U-Haul (trucks) | Fills the public quote search, reads the vehicle list and prices | Playwright |
| U-Haul (trailers) | Same flow for trailers | Playwright |
| Budget | Quote search, vehicles, prices and add-ons | Playwright |
| Penske | Quote search and locations; two implementations exist | Selenium (newer), Playwright (older) |
| U-Pack | Moving-container quote search | Selenium and Playwright |
| SpareFoot | Storage-unit search | Playwright |

- Each provider's results go into its own table, all sharing one vehicle-data base model.
- Scraping is **on demand**, triggered by a customer's search. There is no scheduler, cron job or task queue in the repo.

## Architecture (file references are to the private repo)

- `backend/settings.py`, `backend/urls.py`: one Django project with a single app, `scraping`, mounted under one API prefix plus Django admin. CORS is enabled for the front end.
- `scraping/urls.py`: **23 API routes**, broken down below. The CV's "15+ endpoints" holds.
  - **Provider searches:** one per provider (U-Haul trucks, U-Haul trailers, Budget, Penske, U-Pack, SpareFoot) plus an aggregate search.
  - **Customer flow:** quote, query-response lookup, reservation request.
  - **Notifications:** email (three variants) and SMS.
  - **Accounts:** register, login, profile, change password, password-reset email, password reset, JWT token refresh.
  - **Other:** one testing route.
- `scraping/models.py`: **8 concrete models**:
  - the customer's search (`UserQuery`);
  - five provider result tables (`UhaulData`, `UhaulTrailersData`, `BudgetData`, `PenskeData`, `UpackData`), all on a shared abstract `VehicleData`;
  - `Reservation`, the customer's reservation request with status and "updated by" fields;
  - a custom email-based user model (`MyUser`, with `PermissionsMixin` and `is_staff`).
- `scraping/views.py`: the API views, the scraper functions (`scrape_uhaul`, `scrape_budget`, `scrape_penske_sel`, `scrape_Upack`, `scrape_sparefoot`, …), and the save/transform helpers.
- `scraping/important.py`: an older copy of the scrapers and views; not routed.
- `scraping/admin.py`: every model registered in Django admin, with a custom user admin.
- Auth:
  - **API:** `rest_framework_simplejwt` (login issues an access/refresh pair; profile and change-password need a token).
  - **Admin:** Django's own session admin, gated by `is_staff`.
- Notifications: Mailgun email with an HTML template, and Twilio SMS.
- PayPal SDK: configured (sandbox) but never called by any view.
- Database: the committed configuration uses **SQLite**; a PostgreSQL configuration is present but commented out. `psycopg2` is in requirements.
- Deployment: `gunicorn` is in requirements. There is **no** Nginx, Gunicorn service, Docker or deploy script in the repo or its history.

## Authorship

21 commits, 2025-03-27 → 2025-04-23. `git shortlog -sn --all`: **raowaleed10 16, Muneeb Ahmed 5**.

| File | Surviving lines (`git blame`) |
|---|---|
| `scraping/views.py` | raowaleed10 1,740 · Muneeb Ahmed 115 (≈ 94% / 6%) |
| `scraping/important.py` | raowaleed10 1,294 (100%) |
| `scraping/models.py`, `serializer.py`, `serializers.py`, `urls.py`, `admin.py`, `backend/settings.py` | raowaleed10 (100%) |

- **Muneeb Ahmed's commits:** Budget and Penske scraper fixes (`views.py`, +132 / −85 lines) and the `.gitignore`.
- **Caveats:**
  - Almost all code arrived in one "Add files via upload" commit on 2025-03-27. Git shows who committed, not who wrote the code before upload.
  - The history covers about four weeks of a role that ran Sep 2024 – Oct 2025.
  - The front end is not in this repo.

## CV claim vs what the code shows

| CV claim | What the code shows | Status |
|---|---|---|
| Code Todo (remote), Sep 2024 – Oct 2025, small team under a team lead | Repo history is Mar–Apr 2025; two committers | Dates and team lead **unverified** (outside the repo) |
| Built the backend from scratch | ~94% of surviving lines committed by Rao; one bulk initial upload | **Mostly supported**; pre-upload authorship unknowable |
| Django REST Framework | DRF API views and serializers | **Verified** |
| 15+ endpoints | 23 API routes | **Verified** |
| On PostgreSQL | Committed config is SQLite; Postgres config commented out; driver installed | **Unverified**: production may differ |
| 3 Playwright/Selenium scrapers, Budget, Penske, U-Haul | Scrapers for U-Haul (trucks and trailers), Budget, Penske, U-Pack and SpareFoot: 5 providers, 6 flows | **Code shows more than the CV** |
| Aggregating 500+ listings daily | Scraping is on demand per search; no scheduler or count in code | **Unverified** |
| Selenium reservation automation that books on those providers | Selenium automates the providers' **quote searches** (Penske, U-Pack). Reservations are **stored for the team**; no code books with a provider | **Not supported by this repo** |
| JWT + RBAC admin panel | JWT on the customer API; admin is Django admin gated by `is_staff` (Django's permission system), not JWT | **Partially**: "JWT" and "admin panel" are separate things here |
| Deployed on Ubuntu with Nginx and Gunicorn | `gunicorn` in requirements only; no deploy config | **Unverified** |
| 40% lower endpoint response times (schema, indexes, query restructuring) | No indexes, `select_related` or query tuning in this snapshot | **Unverified**: may postdate April 2025 |

## Proposed accurate wording (needs Rao's approval before any claim changes)

- **Reservation automation:** "Automated multi-step quote searches on providers' public sites with Selenium and Playwright; reservation requests stored for the operations team."
- **Providers:** "aggregated listings and rates from five public rental providers (U-Haul, Budget, Penske, U-Pack, SpareFoot)", or keep the CV's three if the other two were dropped.
- **Admin and auth:** "JWT authentication for the customer API and a staff-only Django admin."
- **Unverified items** (PostgreSQL, 500+ daily, Ubuntu/Nginx/Gunicorn, 40%): keep only if Rao confirms them from production. Otherwise TODO(waleed), not rendered.

## Incident candidates

The only commits that describe bug fixes are **Muneeb Ahmed's**:
- `2817447` "Added fix when first truck option is not available in budget"
- `8daea71` "Fixed issues in budget and penske scraper"

None of Rao's commits describe a fix; they are all "Update <file>". **No incident is proposed** for the incident log.
