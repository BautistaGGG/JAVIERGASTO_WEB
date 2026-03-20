# Smoke Test API

Date: 2026-03-20

## Results
- GET /products -> 6 items
- GET /categories -> 6 items
- GET /brands -> 6 items
- POST /contacts -> id=4
- POST /admin/login -> success
- POST /categories -> id=13
- POST /brands -> id=13
- POST /products -> id=7
- PUT /products/:id -> price=13000, stockStatus=low_stock
- PUT /contacts/:id/status -> status=replied
- GET /contacts -> 4 items
- DELETE /products/:id -> success
- DELETE /brands/:id -> success
- DELETE /categories/:id -> success
- POST /admin/logout -> success
