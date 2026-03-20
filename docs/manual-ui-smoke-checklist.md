# Manual UI Smoke Checklist

Date: 2026-03-20

## Public Flow
- Open `/` and verify hero, categories, featured products.
- Open `/productos` and verify filters, search, and pagination render.
- Open `/producto/1` and verify image gallery, add-to-quote button, and WhatsApp CTA.
- Open `/contacto` and submit valid form data; verify success state.

## Admin Flow (Single User)
- Open `/admin` and login with configured admin credentials.
- Verify dashboard counters render.
- Create, edit, and delete one product.
- Create, edit, and delete one category.
- Create, edit, and delete one brand.
- Open inquiries and toggle one inquiry status.

## Expected Outcome
- No blocking UI errors.
- API-dependent actions persist correctly.
- Error banner appears in admin when API is unavailable and mock fallback is disabled.

