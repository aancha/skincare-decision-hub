# Data pipeline

The private operational system uses bounded retailer connectors, a shared normalizer, contract validation, SQLite live reads, and a static fallback. Retailer ingestion, production state, and derived catalogs are deliberately absent from this public showcase.

```mermaid
flowchart LR
  R[Private retailer connectors] --> N[Normalize + validate]
  N --> DB[(SQLite live store)]
  N --> J[Static fallback]
  DB --> API[Python API]
  API -->|JSON + SSE| W[No-build browser client]
  J --> W
```

The showcase substitutes 12 fictional products with local project-created SVG illustrations. The fixture keeps the production frontend schema—`id`, `retailer`, `brand`, `name`, `category`, `concerns`, `price`, `description`, `url`, `image`, and `ingredients`—without redistributing retailer content.
