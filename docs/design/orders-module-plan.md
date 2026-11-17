# Orders module — implementation plan

Status: **Draft for team review** · Author: Thamod (Operational Coordinator backend) · 2026-11-17

The first coordinator module. It serves the coordinator web pages that already run on mock data
(`apps/web/src/features/orders`): Submitted orders, Review order / Prepare quote, Order details, Quotation sent /
Quotation details. It follows ADR-0002 (Backend Modules) and the patterns of the Auth module.

**Ownership.** The Orders module is shared: Thamod builds the coordinator side, Dissanayake the customer side
(place an order, accept or decline a quotation, My orders, Order details). Both sides use the same tables, so the
entities and status values below must be agreed by both **before the first migration**.

## 1. Module layout

```
apps/api/src/Modules/Orders/FleetSync.Modules.Orders/
├── Domain/            TransportOrder, CargoDetails, FareQuotation, QuotationLine, OrderEvent, enums, rules
├── Application/       one folder per use case: contracts (records), FluentValidation validators, service
│   ├── Common/        OrderError + OrderErrors catalogue, Result<T> (same shape as the Auth module)
│   ├── Listing/       list + tab counts for Submitted orders
│   ├── Details/       order details with history
│   └── Quotations/    save draft, send, read quotation
├── Infrastructure/    OrdersDbContext (schema "orders"), configurations, migrations, dev seeder
├── Endpoints/         Minimal API routes under /api/orders
└── OrdersModule.cs    AddOrdersModule() / MapOrdersEndpoints() — the only public types
tests/FleetSync.Modules.Orders.UnitTests/   domain rules and services
tests/FleetSync.IntegrationTests/Orders/    endpoints, roles, ownership, migrations (real PostgreSQL)
```

- PostgreSQL schema **`orders`** with its own `__EFMigrationsHistory` (not a Supabase-reserved name).
- Tables in PascalCase, like the Auth module (`TransportOrders`, `FareQuotations`, …).
- Error codes follow the Auth style: `orders.not_found`, `orders.already_quoted`, `orders.quotation_invalid`.
- JSON enums are kebab-case (host convention), so they match the web types directly (`pending-review`).

## 2. Entities

GUID keys, `decimal(18,2)` LKR, `DateTimeOffset` UTC, enums stored as strings (DI-05, DI-14, DI-27 proposed defaults).

### TransportOrder (EER TRANSPORT_ORDER + DI-12)

| Field | Type | Notes |
|---|---|---|
| Id | Guid | |
| OrderNumber | string, unique | `ORD-1049`; from a PostgreSQL sequence in schema `orders` |
| CustomerUserId | Guid | The customer who placed it (Auth user). No FK across schemas |
| CustomerCompanyId | Guid? | From the customer's token/profile at placement |
| CustomerSnapshot | owned | Company name, contact name, phone, email **as at placement** (see §6) |
| Pickup / Destination | owned `Location` | Address, City, ContactName, ContactPhone |
| PickupAt | DateTimeOffset | Requested pickup date-time |
| DeliverBy | DateTimeOffset? | "Same day, before 15:00" |
| DistanceKm | int? | Entered by the coordinator while quoting (no GPS/route API) |
| Cargo | owned `CargoDetails` | CargoType (Pallets / Bags / Cartons / LooseItems), Description, WeightKg, UnitsCount, UnitsDetail, Handling, Note |
| RequiredVehicleType | enum? | Light5t / Heavy9t / Heavy14t (DI-11, DI-12) |
| Status | `OrderStatus` | §3 |
| PaymentStatus | `OrderPaymentStatus` | §3 — a projection; the Payments module will own payments |
| ReviewedByUserId | Guid? | EER *Reviews order* (0..1) |
| TripId | Guid? | Set by the Trips module when a trip is created |
| CreatedAt, UpdatedAt | DateTimeOffset | |

### FareQuotation (EER FARE_QUOTATION + DI-13)

| Field | Type | Notes |
|---|---|---|
| Id, OrderId | Guid | One order has 0..N quotations; at most one is current |
| QuotationNumber | string, unique | `QT-2026-0001` |
| Status | `QuotationStatus` | Draft / Sent / Accepted / Declined / Expired / Superseded |
| VehicleType | enum | Vehicle class priced |
| Lines | `QuotationLine[]` | Child table: Kind (Distance / Load / Handling / Special / Tolls / Other), Label, Detail, Amount |
| Total | decimal(18,2) | Sum of lines, computed in the domain; stored for reporting |
| ValidUntil | DateTimeOffset | Must be in the future when sent |
| MessageToCustomer | string? | |
| PreparedByUserId | Guid | EER *Prepares* |
| SentAt, RespondedAt | DateTimeOffset? | |
| DeclineReason | string? | Set by the customer side |

Rule (BR-32): a **sent quotation is never edited**. Re-quoting creates a new one and marks the old one Superseded.

### OrderEvent (history timeline — new, not in the EER)

`Id, OrderId, Type, Title, Detail, OccurredAt, ActorUserId?`. Written by the domain on each state change.
Both web pages already show this timeline (coordinator "Order history", customer "Updates").
**Needs a DI row** (proposed DI-30) because it is not in the EER.

### As built (slice 2)

Fields added while implementing, beyond the tables above:

- TransportOrder: `TripNumber` (shown before the Trips module can be asked), `ClosedAt`, and a `Version` row
  version (PostgreSQL `xmin`) so concurrent changes fail instead of overwriting.
- FareQuotation: `ViewCount`, `FirstViewedAt`, `LastViewedAt` ("Opened 2 times" on the web).
- OrderEvent: `Amount` (quotation and payment events).
- Numbers: sequences `orders.order_number_seq` (starts at 1100, above the seeded ORD-10xx) and
  `orders.quotation_number_seq` (`QT-yyyy-nnnn`).
- Every status change is a method on `TransportOrder` (Submit, SendQuotation, AcceptQuotation, RecordPayment,
  DeclineQuotation, ExpireQuotation, ScheduleTrip, StartTrip, Complete, Cancel). **The customer side should call these
  same methods** so both sides follow one set of rules.

## 3. Status values (needs agreement — DI-14)

The two frontends use slightly different names. Proposed single list, sent as kebab-case:

| Backend `OrderStatus` | JSON | Coordinator web today | Customer web today |
|---|---|---|---|
| PendingReview | `pending-review` | same | same |
| Quoted | `quoted` | same | same |
| Accepted | `accepted` | same | same |
| TripScheduled | `trip-scheduled` | `trip-created` → **rename** | same |
| InProgress | `in-progress` | (shown as trip-created) → **add** | same |
| Completed | `completed` | same | same |
| Declined | `declined` | same | same |
| QuotationExpired | `quotation-expired` | same | same |
| Cancelled | `cancelled` | `trip-cancelled` → **rename** | same |

`OrderPaymentStatus`: `not-due`, `awaiting-payment`, `paid`, `payment-failed`, `refunded`, `no-payment`.

Allowed transitions are enforced in the domain:
`PendingReview → Quoted → Accepted | Declined | QuotationExpired`,
`Accepted (paid) → TripScheduled → InProgress → Completed`, and `→ Cancelled` from Accepted / TripScheduled /
InProgress **before cargo pickup** (DI-06, owned by the Trips module).

I will rename the coordinator web values to match (they are my pages).

## 4. Coordinator endpoints (this plan)

All under `/api/orders`, tag `Orders`, policy **`RequireOperations`**.

| Method | Route | Use case | Web call it replaces |
|---|---|---|---|
| GET | `/api/orders?tab=&search=&pickupDate=&page=&pageSize=` | View Submitted Orders, Search / Filter, View Orders Payment Status | `getSubmittedOrders` |
| GET | `/api/orders/{orderNumber}` | Review Customer Order / View order details (with history) | `getOrderDetail` |
| PUT | `/api/orders/{orderNumber}/quotation/draft` | Prepare Fare Estimation (save) | `saveQuotationDraft` |
| POST | `/api/orders/{orderNumber}/quotation/send` | Send Fare Quotation (+ email) | `sendQuotation` |
| GET | `/api/orders/{orderNumber}/quotation` | Quotation sent / details | `getSentQuotation` |

- The list returns `{ items, page, pageSize, totalCount, tabCounts }` (default 20, max 100).
- Routes use the **order number** because the web URLs and people use it; the GUID is still the key.
- Errors: 404 `orders.not_found`, 409 `orders.already_quoted` / `orders.invalid_transition`,
  400 `validation_failed` (empty lines, total ≤ 0, `validUntil` in the past, missing distance).
- Sending a quotation sets the order to Quoted and PaymentStatus to `awaiting-payment`, writes an OrderEvent and
  emails the customer (§6).

**Customer endpoints** (Dissanayake): `/api/customer/orders` — place, list mine, details, accept, decline.
Ownership comes from the token (`CustomerUserId` / company), never from the request; another customer's order → 404.

## 5. Policies

ADR rules say to use the shared names. Only `RequireFleetAdministrator` and `RequireAuditTrailReader` exist (inside
the Auth module, internal). Proposal:

- Move the shared policy names and role lists into the host (or a small `FleetSync.Modules.Shared` project) so every
  module can use them. Role values are the Auth module's: `owner`, `fleet-administrator`, `coordinator`, `driver`,
  `mechanic`, `customer`.
- `RequireOperations` = `coordinator` (+ `fleet-administrator`? **to confirm against the auth contract**).
- Never include `owner` in a write policy.

## 6. Cross-module dependencies (ask before building)

| Need | From | Proposal |
|---|---|---|
| Customer company name, contact, email for an order | Auth (holds `CustomerCompanies`, users) | Snapshot onto the order at placement (an order should show the details it was placed with). Later: read through a `FleetSync.Modules.Auth.Contracts` lookup (Prasad) |
| Send the quotation email | Auth has an internal `IEmailSender` (pickup folder in dev) | Move `IEmailSender` to a shared project or a Notifications module (Welihena / Arawindi). Until then Orders writes to the same dev pickup folder |
| Payment status | Payments module (Dissanayake) | Orders keeps `PaymentStatus` as a projection; Payments updates it through an Orders contract method or a domain event |
| Trip id and trip progress | Trips module (coordinator) | Trips calls an Orders contract (`MarkTripScheduled`, `MarkInProgress`, `MarkCompleted`, `MarkCancelled`) |
| Vehicle classes and per-km rates (150 / 210 / 260) | Fleet (no owner, OI-27); pricing method OI-07 | Configuration in Orders (`Orders:FareRates`) until Fleet owns vehicle types |

## 7. Development data

A Development-only seeder fills the `orders` schema with the orders the web mocks show (ORD-1028 … ORD-1054,
including the three quoted orders and their quotations), so the coordinator pages look the same before customers can
place real orders. It runs only in Development and only when the tables are empty.

## 8. Tests

- Unit: status transitions, BR-32 (sent quotation immutable / superseded), total = sum of lines, validation rules.
- Integration (PostgreSQL `fleetsync_test`): the migration applies; list paging and tab counts; draft → send →
  quoted; 409 on a second send; 404 for an unknown order; **403 for `customer`, `driver` and `owner`** on every
  coordinator endpoint; 401 without a token.

## 9. Delivery slices (one PR each)

1. Module skeleton: project, `OrdersDbContext` + schema, shared policies, OrderStatus, empty migration, wiring in `Program.cs`.
2. Entities + migration + Development seeder; `GET /api/orders` and `GET /api/orders/{orderNumber}`.
3. Quotations: draft, send (+ email), read.
4. Coordinator web: switch `ordersApi.ts` from mocks to `apiClient`; rename the status values in §3.

## 10. Decisions needed before slice 2

| # | Question | Who | Default if no answer |
|---|---|---|---|
| 1 | Status lists in §3 | Thamod, Dissanayake | As proposed |
| 2 | Order fields and cargo shape (DI-12) | Thamod, Dissanayake | As in §2 |
| 3 | Quotation lines and numbering (DI-13) | Thamod, Prasad | As in §2 |
| 4 | `RequireOperations` role list; where shared policies live | Prasad | `coordinator` only, host project |
| 5 | Customer details: snapshot vs live lookup | Prasad, Dissanayake | Snapshot |
| 6 | Email sender location | Welihena, Arawindi | Shared project |
| 7 | OrderEvent table (new DI-30) | Team | Add it |
