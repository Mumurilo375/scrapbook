# Domain Layout

The application is organized as a modular monolith. Each domain can grow with the same local shape:

- `Actions`: explicit business workflows.
- `Data`: DTOs and value objects.
- `Enums`: persisted status and option values.
- `Models`: Eloquent models owned by the domain.

Keep controllers thin and route important behavior through actions or services.

Current ownership:

- `Templates`: occasions, templates, template versions and template pages.
- `Themes`: themes and theme versions.
- `Assets`: reusable visual assets.
- `Gifts`: gifts, gift pages and music metadata selections.
- `Media`: uploaded user media items.
- `Payments`: plans, orders and payments.
- `Analytics`: gift visits and events.
