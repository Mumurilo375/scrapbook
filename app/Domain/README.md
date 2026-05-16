# Domain Layout

The application is organized as a modular monolith. Each domain can grow with the same local shape:

- `Actions`: explicit business workflows.
- `Data`: DTOs and value objects.
- `Enums`: persisted status and option values.
- `Models`: Eloquent models owned by the domain.

Keep controllers thin and route important behavior through actions or services.
