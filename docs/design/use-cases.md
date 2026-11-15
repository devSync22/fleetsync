# FleetSync — Use cases

Text version of the UML use case diagram on the FigJam board
[Fleet Management System - Use Case Diagram, EER, Class](https://www.figma.com/board/ORNztIyq70OekO56A7vBk2)
(section "Fleet Management System"). Image export: [diagrams/use-case-diagram.png](diagrams/use-case-diagram.png).

- Transcribed from the board on 10 Nov 2026. If the board changes, update this file in the same pull request.
- The diagram has 6 human actors, 4 external system actors and 102 distinct use cases
  (counting the included and extending ones). *Send Trip Assignment Push Notification* is drawn twice,
  with an include arrow to itself; treat it as one use case.
- Where the diagram disagrees with other project sources, the problem is listed in
  [design-issues.md](design-issues.md) (IDs `DI-xx`). Do not resolve those silently in code.

## Actors

| Actor | Kind | Client app |
|---|---|---|
| Customer | Human, external | Web |
| Operational Coordinator | Human, staff | Web |
| Fleet Administrator | Human, staff | Web |
| Fleet Owner | Human, staff | Web |
| Driver | Human, staff | Mobile (Expo / React Native) |
| Mechanic | Human, staff | Mobile (Expo / React Native) |
| Payment Gateway | External system (PayHere) | — |
| Email Service | External system | — |
| Push Notification Service | External system | — |
| Cloud Storage Service | External system | — |

The client app column is a team decision, not part of the diagram. See DI-23.

## Use cases by actor

### Customer

| Use case | Includes / extends |
|---|---|
| Login | includes *Authenticate User* |
| Request an Account | — |
| Manage Profile | — |
| Place Transport Order | includes *Enter Pickup Location*, *Enter Destination*, *Enter Transport / Cargo Details*, *Submit Order* |
| View Order Status | — |
| View Trip Status | — |
| View Fare Quotation | extended by *Accept Fare Quotation* and *Decline Fare Quotation* |
| Accept Fare Quotation | extends *View Fare Quotation*; extended by *Make Online Payment* |
| Decline Fare Quotation | extends *View Fare Quotation* |
| Make Online Payment | extends *Accept Fare Quotation*; includes *Process Online Payment* |
| View Payment History | — |
| Download Invoice | — |
| Chat with Coordinator / Driver | — (customer–driver chat: see DI-21) |

### Operational Coordinator

| Use case | Includes / extends |
|---|---|
| Login | includes *Authenticate User* |
| View Operational Dashboard | — |
| View Submitted Orders | — |
| Search / Filter Orders | — |
| View Orders Payment Status | — |
| Review Customer Order | includes *Prepare Fare Estimation* (which includes *Send Fare Quotation Email*) |
| Create Trip | includes *Check Vehicle Availability*, *Check Driver Availability*, *Assign Vehicle, Driver and Mechanic*, *Send Trip Assignment Push Notification*, *Send Trip Detail Email to Customer* |
| Monitor Active Trips | — |
| View Trip Details | — |
| Manage Trip | — |
| Cancel Trip | extended by *Provide Cancellation Reason* |
| Generate Operational Reports | includes *Export Report* |
| Chat with Customer / Driver / Mechanic | — |
| View Mail Inbox | extended by *Open Mail Attachment* |
| Send Internal Mail | includes *Select Recipients (To / Cc / Bcc)* |

### Fleet Administrator

| Use case | Includes / extends |
|---|---|
| Login | includes *Authenticate User* |
| Manage User Accounts | — |
| Manage Vehicles | — |
| Manage Drivers | — |
| Manage Customer Companies | — |
| Manage Service Types | — |
| Manage Reference Data | — |
| Generate application form | — |
| Review the application | extended by *Approve Application* (which includes *Provision user account*) and *Reject Application* |
| View Audit Information | extended by *Export Audit Report* |
| View Mail Inbox | extended by *Open Mail Attachment* |
| Send Internal Mail | includes *Select Recipients (To / Cc / Bcc)*; extended by *Attach File to Mail* |

### Fleet Owner

| Use case | Includes / extends |
|---|---|
| Login | includes *Authenticate User* |
| View Executive Dashboard | — |
| View Fleet Analysis Dashboard | — |
| Analyze Fleet Utilization | — |
| Analyze Vehicle Performance | — |
| Analyze Driver Activity | — |
| Analyze Maintenance Costs | — |
| Analyze Trip History | — |
| View Available Vehicles | — |
| View Active Trips | — |
| Generate Report | includes *Export Report* |
| Change Password | — |
| Request Profile Update | — (see DI-24) |
| Submit Account Application | — (see DI-24) |

### Driver

| Use case | Includes / extends |
|---|---|
| Login | includes *Authenticate User* |
| Submit Account Application | — |
| View Assigned Trip | — |
| View Trip Details | — |
| Start Trip | includes *Record Starting Odometer* |
| Add Driver Note | — |
| Report Vehicle Issue | — |
| Complete Trip | includes *Record Ending Odometer*, *Send Trip Completion Email* |
| View Trip History | — |
| Chat with Coordinator / Mechanic / Customer | — (customer chat: see DI-21) |
| Change Password | — |
| Request Profile Update | — |

### Mechanic

| Use case | Includes / extends |
|---|---|
| Login | includes *Authenticate User* |
| View Maintenance Queue | — |
| View Driver Reported Issues | — |
| Resolve Vehicle Issue | — |
| View Vehicle Maintenance History | — |
| Record Maintenance | includes *Capture Maintenance Details*, *Set Next Service Schedule*; extended by *Upload Maintenance Documents* (which includes *Store Document*) |
| View Upcoming Services | — |
| View Overdue Services | — |
| Chat with Driver / Coordinator | — |

### External systems

| Actor | Use cases it takes part in |
|---|---|
| Payment Gateway | Process Online Payment (extended by *Record Successful Payment*, which includes *Send Payment Confirmation Email*, and *Record Failed Payment*) |
| Email Service | Send Fare Quotation Email, Send Payment Confirmation Email, Send Trip Detail Email to Customer, Send Trip Completion Email, Send Upcoming Service Email Alert, Send Service Overdue Email Alert |
| Push Notification Service | Send Trip Assignment Push Notification, Send Message Notification (Chat), Send notification about service to mechanic (includes *Check due and about to due services*) |
| Cloud Storage Service | Store Document, Retrieve Document |

## Rules agreed outside the diagram

These were decided by the team and apply even though the diagram does not show them.

- The Operational Coordinator assigns a vehicle, a driver **and a mechanic** to each trip. The diagram now shows this in *Assign Vehicle, Driver and Mechanic*.
- A driver is never tied to one vehicle. Vehicles are matched to drivers per trip.
- No GPS, live map, ETA or IoT tracking anywhere.
- Fleet Owner screens are read-only.
- Only the Fleet Administrator creates accounts, approves or rejects them, and changes roles (DI-01, DI-02). Customer accounts also need this approval.
- The Fleet Owner is read-only in the whole system.
- *Cancel Trip* is allowed while the trip is Draft, Assigned or In Progress, but only until the driver has picked up the cargo (DI-06).
- Payments are card-only through PayHere. If a trip is cancelled while Assigned or In Progress, a full refund to the customer starts automatically (see DI-06 and DI-22).
- Chat, payments, the mobile app and the internal mail system are all in scope (DI-21, DI-22, DI-23, DI-25).

## How backend work maps to these use cases

When building an endpoint, name the use case(s) it serves in the pull request description,
for example "Create Trip → POST /api/trips, POST /api/trips/{id}/assignment".
A use case with no endpoint and no screen yet is still to do; an endpoint that serves no use case
is out of scope until the team agrees to add it here.
