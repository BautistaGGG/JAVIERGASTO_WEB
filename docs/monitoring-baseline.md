# Monitoring Baseline

Date: 2026-03-20

## Core Metrics
- API availability (% 2xx/3xx over total requests)
- Error rate (% 4xx/5xx over total requests)
- p95 response time for:
  - `GET /api/products`
  - `POST /api/admin/login`
  - `POST /api/contacts`
- Daily count of admin logins
- Daily count of contact submissions

## Log Events to Track
- `http_request` (from request logger)
- `route_error`
- `unhandled_error`

## Alert Thresholds
- Availability < 99% in 15 min window
- Error rate > 5% in 10 min window
- p95 > 1500ms for public endpoints
- 3+ failed admin login attempts in 5 min from same IP

## Review Cadence
- Daily quick review: availability and errors
- Weekly review: latency trends and incident summary

