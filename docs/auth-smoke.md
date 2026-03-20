# Auth Smoke Test

Date: 2026-03-20

## Results
- POST /admin/login -> success
- GET /contacts (authenticated) -> 3 items
- POST /admin/logout -> success
- GET /contacts after logout -> OK (token revoked)
