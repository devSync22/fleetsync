#!/usr/bin/env bash
# Manual (black-box) tests for the Auth features added to match the EER:
# customer approval, role subtype tables, profile change requests,
# account deactivation (is_active), the audit log and session metadata.
#
# It drives the running API with curl and checks rows directly with psql.
# Test cases are described in docs/testing/auth-api-testing.md (part B).
#
# Prerequisites
#   - API running in Development on http://localhost:5215 with a high rate
#     limit so the run isn't throttled:
#       Auth__RateLimiting__PermitLimit=1000 dotnet run --project apps/api/src/FleetSync.Api --launch-profile http
#   - Emailed links are read from the dev pickup folder
#     apps/api/src/FleetSync.Api/App_Data/dev-emails (override with EMAIL_DIR=...)
#   - Dev admin configured in User Secrets (Auth:DevAdmin:Email / Password)
#   - Database: the API's connection string from User Secrets, or
#     ConnectionStrings__FleetSyncDatabase if set (same precedence as the API)
#   - curl, jq, python3, psql
#
# Usage (from the repo root):
#   bash apps/api/tests/manual/auth-new-features.sh
#
# Every run uses new qa-<run id>-…@fleetsync.test emails, so it can be repeated.
set -uo pipefail

HOST=${FLEETSYNC_API:-http://localhost:5215}
REPO=${REPO:-$(cd "$(dirname "$0")/../../../.." && pwd)}
# Development saves emails here instead of sending them (Auth:Email:PickupDirectory).
EMAIL_DIR=${EMAIL_DIR:-$REPO/apps/api/src/FleetSync.Api/App_Data/dev-emails}
mkdir -p "$EMAIL_DIR"
API_PROJECT="$REPO/apps/api/src/FleetSync.Api"
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

PASS=0; FAIL=0; FAILED_IDS=()
UA="fleetsync-manual-test/1.0"

# --- database access ---------------------------------------------------------
# libpq settings from the API's own connection string, so no password is typed
# or printed. A short connect timeout keeps a blocked database from hanging the run.
eval "$(cd "$REPO" && python3 -I - "$API_PROJECT" <<'PY'
import os, shlex, subprocess, sys
out = subprocess.run(["dotnet", "user-secrets", "list", "--project", sys.argv[1]], capture_output=True, text=True).stdout
secrets = dict(l.split(" = ", 1) for l in out.splitlines() if " = " in l)
parts, buf, quoted = [], "", False
# The same override the API honours: ConnectionStrings__FleetSyncDatabase beats User Secrets.
conn = os.environ.get("ConnectionStrings__FleetSyncDatabase") or secrets["ConnectionStrings:FleetSyncDatabase"]
for ch in conn:   # split on ';' outside quotes
    if ch == "'": quoted = not quoted; buf += ch
    elif ch == ";" and not quoted: parts.append(buf); buf = ""
    else: buf += ch
parts.append(buf)
kv = {}
for p in parts:
    if "=" in p:
        k, v = p.split("=", 1); v = v.strip()
        if v.startswith("'") and v.endswith("'"): v = v[1:-1].replace("''", "'")
        kv[k.strip().lower()] = v
for key, env in {"host": "PGHOST", "port": "PGPORT", "database": "PGDATABASE", "username": "PGUSER", "password": "PGPASSWORD"}.items():
    if key in kv:
        print(f"export {env}={shlex.quote(kv[key])}")
# Match the connection string's SSL setting (Supabase requires it; a local server may not have SSL).
ssl = kv.get("ssl mode", "prefer").lower()
print(f"export PGSSLMODE={shlex.quote(ssl)} PGCONNECT_TIMEOUT=10")
print(f"ADMIN={shlex.quote(secrets.get('Auth:DevAdmin:Email', 'admin@fleetsync.local'))}")
print(f"ADMIN_PW={shlex.quote(secrets.get('Auth:DevAdmin:Password', ''))}")
PY
)"

# pg "SQL" -> single value (empty on error)
pg() { psql -X -At -c "$1" 2>/dev/null; }

# --- HTTP helpers ------------------------------------------------------------
# req METHOD PATH [curl args...] -> $STATUS, body in $WORK/body, headers in $WORK/headers
req() {
  local method=$1 path=$2; shift 2
  STATUS=$(curl -s -A "$UA" -o "$WORK/body" -D "$WORK/headers" -w '%{http_code}' -X "$method" "$HOST$path" "$@")
}
json() { local m=$1 p=$2 d=$3; shift 3; req "$m" "$p" -H 'Content-Type: application/json' -d "$d" "$@"; }

# field '.jq.path' -> value from the last body ("false" and "0" are kept, unlike `// empty`)
field() { jq -r "if ($1) == null then \"\" else ($1) end" "$WORK/body" 2>/dev/null; }

# check ID "description" expected-status [extra-assertion-result]
check() {
  local id=$1 desc=$2 expected=$3 extra=${4:-ok}
  local got="$STATUS"; [[ -n "$(field .errorCode)" ]] && got="$STATUS $(field .errorCode)"
  if [[ "$STATUS" == "$expected" && "$extra" == "ok" ]]; then
    PASS=$((PASS+1)); printf 'PASS | %-5s | %-66s | %s\n' "$id" "$desc" "$got"
  else
    FAIL=$((FAIL+1)); FAILED_IDS+=("$id")
    printf 'FAIL | %-5s | %-66s | expected %s, got %s %s\n' "$id" "$desc" "$expected" "$got" "$extra"
  fi
}
# For database-only checks: no HTTP status involved.
dbcheck() { STATUS=db; echo '{}' > "$WORK/body"; check "$1" "$2" db "$3"; }
is() { [[ "$1" == "$2" ]] && echo ok || echo "($3: '$1')"; }

# Latest emailed token for an address, from the dev email pickup folder (URL-decoded).
token_for() {
  sleep 0.5
  python3 -I - "$EMAIL_DIR" "$1" <<'PY2'
import os, re, sys, urllib.parse
folder, addr = sys.argv[1], sys.argv[2]
for name in sorted(os.listdir(folder), reverse=True):        # file names sort by time
    text = open(os.path.join(folder, name), encoding="utf-8").read()
    if text.startswith(f"To: {addr}\n"):
        m = re.search(r"token=([^\s&]+)", text)
        print(urllib.parse.unquote(m.group(1)) if m else ""); break
PY2
}
# emails_to ADDRESS [SUBJECT-TEXT] -> how many emails were saved for that address
emails_to() { grep -lx "To: $1" "$EMAIL_DIR"/*.txt 2>/dev/null | xargs -r grep -l "^Subject: .*${2:-}" | wc -l; }

# --- test data -----------------------------------------------------------------
RUN=$(date +%s)
PW="Qatest2026A"
q() { echo "qa-$RUN-$1@fleetsync.test"; }
BRN="PV $RUN"

customer_body() {  # customer_body EMAIL [BRN]
  echo "{\"companyName\":\"QA Freight $RUN\",\"businessRegistrationNo\":\"${2:-$BRN}\",\"billingAddress\":\"No. 1, Galle Road, Colombo 03\",\"fullName\":\"QA Customer\",\"mobile\":\"077 123 4567\",\"email\":\"$1\",\"password\":\"$PW\"}"
}
login() { json POST /api/auth/login "{\"email\":\"$1\",\"password\":\"${2:-$PW}\",\"rememberMe\":false}" "${@:3}"; }
bearer() { login "$1" "${2:-$PW}"; echo "Authorization: Bearer $(field .accessToken)"; }

printf '%%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%%%EOF\n' > "$WORK/nic.pdf"
staff() {  # staff EMAIL NIC ROLE [extra -F args...]
  local email=$1 nic=$2 role=$3; shift 3
  req POST /api/auth/staff-applications -F "fullName=QA $role $RUN" -F "nic=$nic" -F "email=$email" \
    -F "mobile=0771234567" -F "role=$role" -F "documents=@$WORK/nic.pdf" "$@"
}
app_id() {  # app_id EMAIL -> application id (admin list)
  req GET "/api/auth/applications?pageSize=100" -H "$ADMIN_AUTH"
  jq -r --arg e "$1" '[.items[] | select(.email==$e)][0].id // empty' "$WORK/body"
}
user_id() { pg "select \"Id\" from identity.\"Users\" where \"NormalizedEmail\"=upper('$1')"; }

# approve_and_activate EMAIL -> staff applicant gets an account with password $PW
approve_and_activate() {
  req POST "/api/auth/applications/$(app_id "$1")/approve" -H "$ADMIN_AUTH"
  json POST /api/auth/activation "{\"token\":\"$(token_for "$1")\",\"password\":\"$PW\"}"
}

echo "Run id: $RUN"
if [[ -z "$(pg 'select 1')" ]]; then
  echo "Cannot reach the database with psql (check the connection or Supabase network bans)."; exit 2
fi

ADMIN_AUTH=$(bearer "$ADMIN" "$ADMIN_PW")
ADMIN_ID=$(user_id "$ADMIN")
[[ -n "$ADMIN_ID" ]] || { echo "Dev admin $ADMIN can't sign in; is Auth:DevAdmin set?"; exit 2; }

# ============================================================================
# 1. Customer approval flow (USER_APPLICATION for customers)
# ============================================================================
C1=$(q cust1); C2=$(q cust2); C3=$(q cust3); C4=$(q cust4)

json POST /api/auth/register/customer "$(customer_body "$C1")"
check CA01 "Customer registration creates an application with a reference" 201 \
  "$( [[ "$(field .reference)" =~ ^REG-[0-9]{4}-[0-9]+$ ]] && echo ok || echo '(reference)')"
dbcheck CA02 "No account exists yet; application is pending with a password hash" \
  "$(is "$(pg "select (select count(*) from identity.\"Users\" where \"NormalizedEmail\"=upper('$C1')) || ':' || \"Status\" || ':' || (\"PasswordHash\" is not null) from identity.\"UserApplications\" where \"NormalizedEmail\"=upper('$C1')")" "0:Pending:true" state)"

login "$C1"
check CA03 "Sign-in before verifying (right password) -> told to verify" 403 "$(is "$(field .errorCode)" auth.email_not_verified code)"
login "$C1" Wrong2026Pass
check CA04 "Sign-in before verifying (wrong password) reveals nothing" 401 "$(is "$(field .errorCode)" auth.invalid_credentials code)"

json POST /api/auth/register/customer "$(customer_body "$C1")"
check CA05 "Second registration while the first is open" 409 "$(is "$(field .errorCode)" application.duplicate code)"

json POST /api/auth/verify-email/resend "{\"email\":\"$C1\"}"
FIRST_TOKEN=$(token_for "$C1")
check CA06 "Resend verification for a pending application" 202
json POST /api/auth/verify-email "{\"token\":\"$FIRST_TOKEN\"}"
check CA07 "Verify with the resent token" 204

login "$C1"
check CA08 "Verified but not approved -> pending approval" 403 "$(is "$(field .errorCode)" auth.pending_approval code)"

req GET "/api/auth/applications?role=customer&status=pending&pageSize=100" -H "$ADMIN_AUTH"
check CA09 "Review list filtered by role=customer shows it as verified" 200 \
  "$(is "$(jq -r --arg e "$C1" '[.items[] | select(.email==$e)][0].emailVerified' "$WORK/body")" true emailVerified)"
req GET "/api/auth/applications?role=pilot" -H "$ADMIN_AUTH"
check CA10 "Unknown role filter" 400 "$( jq -e '.errors.role' "$WORK/body" >/dev/null && echo ok || echo '(no role error)')"

json POST /api/auth/register/customer "$(customer_body "$C2")"
req POST "/api/auth/applications/$(app_id "$C2")/approve" -H "$ADMIN_AUTH"
check CA11 "Approving an unverified customer is refused" 409 "$(is "$(field .errorCode)" application.email_not_verified code)"

C1_APP=$(app_id "$C1")
req POST "/api/auth/applications/$C1_APP/approve" -H "$ADMIN_AUTH"
C1_ID=$(field .userId)
check CA12 "Approve the verified customer -> account linked (userId)" 200 \
  "$( [[ "$(field .status)" == approved && -n "$C1_ID" ]] && echo ok || echo '(no userId)')"
check CA13 "Approval email sent to the customer" 200 "$( [[ $(emails_to "$C1" "Your FleetSync account was approved") -ge 1 ]] && echo ok || echo '(no email)')"

req POST "/api/auth/applications/$C1_APP/approve" -H "$ADMIN_AUTH"
check CA14 "Approving twice" 409 "$(is "$(field .errorCode)" application.not_pending code)"

login "$C1"
check CA15 "Approved customer signs in with the registration password" 200 \
  "$(is "$(field '.user.roles | join(",")')" customer roles)"

dbcheck CA16 "CUSTOMER row linked to a CUSTOMER_COMPANY with the registration details" \
  "$(is "$(pg "select k.\"CompanyName\" || '|' || k.\"BusinessRegistrationNo\" from identity.\"Customers\" c join identity.\"CustomerCompanies\" k on k.\"Id\"=c.\"CompanyId\" where c.\"UserId\"='$C1_ID'")" "QA Freight $RUN|$BRN" company)"
dbcheck CA17 "Password hash removed from the approved application" \
  "$(is "$(pg "select (\"PasswordHash\" is null) from identity.\"UserApplications\" where \"Id\"='$C1_APP'")" t hash)"

# Same business registration number typed differently -> the same company.
json POST /api/auth/register/customer "$(customer_body "$C3" "pv$RUN")"
json POST /api/auth/verify-email "{\"token\":\"$(token_for "$C3")\"}"
req POST "/api/auth/applications/$(app_id "$C3")/approve" -H "$ADMIN_AUTH"
C3_ID=$(field .userId)
dbcheck CA18 "Second contact with the same registration number joins the same company" \
  "$(is "$(pg "select count(distinct \"CompanyId\") || ':' || count(*) from identity.\"Customers\" where \"UserId\" in ('$C1_ID','$C3_ID')")" "1:2" companies)"

json POST /api/auth/register/customer "$(customer_body "$C4")"
json POST /api/auth/verify-email "{\"token\":\"$(token_for "$C4")\"}"
C4_APP=$(app_id "$C4")
json POST "/api/auth/applications/$C4_APP/reject" '{"reason":"Business registration could not be confirmed."}' -H "$ADMIN_AUTH"
check CA19 "Reject a customer with a reason" 200 "$(is "$(field .status)" rejected status)"
dbcheck CA20 "Rejected application keeps no password hash and creates no account" \
  "$(is "$(pg "select (\"PasswordHash\" is null) || ':' || (\"UserId\" is null) from identity.\"UserApplications\" where \"Id\"='$C4_APP'")" "true:true" state)"
login "$C4"
check CA21 "Rejected customer can't sign in" 401 "$(is "$(field .errorCode)" auth.invalid_credentials code)"

json POST /api/auth/register/customer "$(customer_body "$C1")"
check CA22 "Registering an email that now has an account" 409 "$(is "$(field .errorCode)" auth.email_taken code)"

# ============================================================================
# 2. Staff roles and EER subtype tables
# ============================================================================
DRV=$(q driver); MECH=$(q mech); COORD=$(q coord); OWN=$(q owner)
LIC="B$RUN"

staff "$(q x1)" "${RUN}11" customer
check SR01 "Staff form refuses role=customer" 400 "$( jq -e '.errors.role' "$WORK/body" >/dev/null && echo ok || echo '(no role error)')"
staff "$(q x2)" "${RUN}12" fleet-administrator
check SR02 "Staff form refuses role=fleet-administrator" 400 "$( jq -e '.errors.role' "$WORK/body" >/dev/null && echo ok || echo '(no role error)')"
staff "$(q x3)" "${RUN}13" driver -F licenceNumber=X$RUN -F licenceClass=heavy -F licenceExpiry=2020-01-01
check SR03 "Driver with an expired licence" 400 "$( jq -e '.errors.licenceExpiry' "$WORK/body" >/dev/null && echo ok || echo '(no expiry error)')"
staff "$(q x4)" "${RUN}14" driver -F licenceNumber=X$RUN -F licenceClass=heavy -F licenceExpiry=31/01/2030
check SR04 "Driver with a badly formatted expiry date" 400 "$( jq -e '.errors.licenceExpiry' "$WORK/body" >/dev/null && echo ok || echo '(no expiry error)')"

staff "$DRV" "${RUN}21" driver -F licenceNumber=$LIC -F licenceClass=heavy -F licenceExpiry=2030-01-31
check SR05 "Driver application with licence expiry" 201
staff "$MECH" "${RUN}22" mechanic;     check SR06 "Mechanic application" 201
staff "$COORD" "${RUN}23" coordinator; check SR07 "Coordinator application" 201
staff "$OWN" "${RUN}24" owner;         check SR08 "Owner application (EER requested_role OWNER)" 201

req GET "/api/auth/applications/$(app_id "$DRV")" -H "$ADMIN_AUTH"
check SR09 "Details show the licence expiry" 200 "$(is "$(field .licenceExpiry)" 2030-01-31 licenceExpiry)"

approve_and_activate "$DRV";   check SR10 "Driver activates" 204
approve_and_activate "$MECH";  check SR11 "Mechanic activates" 204
approve_and_activate "$COORD"; check SR12 "Coordinator activates" 204
approve_and_activate "$OWN";   check SR13 "Owner activates" 204

DRV_ID=$(user_id "$DRV"); MECH_ID=$(user_id "$MECH"); COORD_ID=$(user_id "$COORD"); OWN_ID=$(user_id "$OWN")
dbcheck SR14 "DRIVER row with licence number, class and expiry" \
  "$(is "$(pg "select \"LicenceNumber\" || '|' || \"LicenceClass\" || '|' || \"LicenceExpiry\" from identity.\"Drivers\" where \"UserId\"='$DRV_ID'")" "$LIC|Heavy|2030-01-31" driver)"
dbcheck SR15 "MECHANIC, OPERATIONAL_COORDINATOR and FLEET_OWNER rows exist" \
  "$(is "$(pg "select concat((select count(*) from identity.\"Mechanics\" where \"UserId\"='$MECH_ID'), (select count(*) from identity.\"OperationalCoordinators\" where \"UserId\"='$COORD_ID'), (select count(*) from identity.\"FleetOwners\" where \"UserId\"='$OWN_ID'))")" 111 rows)"
dbcheck SR16 "Dev admin has a FLEET_ADMINISTRATOR row" \
  "$(is "$(pg "select count(*) from identity.\"FleetAdministrators\" where \"UserId\"='$ADMIN_ID'")" 1 rows)"

# Every account: exactly one Identity role, and the matching subtype row.
dbcheck SR17 "Every user has exactly one role and its matching subtype row" "$(is "$(pg "
  select count(*) from identity.\"Users\" u
  left join identity.\"UserRoles\" ur on ur.\"UserId\"=u.\"Id\"
  left join identity.\"Roles\" r on r.\"Id\"=ur.\"RoleId\"
  where (select count(*) from identity.\"UserRoles\" x where x.\"UserId\"=u.\"Id\") <> 1
     or (r.\"Name\"='fleet-administrator' and not exists (select 1 from identity.\"FleetAdministrators\" s where s.\"UserId\"=u.\"Id\"))
     or (r.\"Name\"='customer'            and not exists (select 1 from identity.\"Customers\" s where s.\"UserId\"=u.\"Id\"))
     or (r.\"Name\"='driver'              and not exists (select 1 from identity.\"Drivers\" s where s.\"UserId\"=u.\"Id\"))
     or (r.\"Name\"='mechanic'            and not exists (select 1 from identity.\"Mechanics\" s where s.\"UserId\"=u.\"Id\"))
     or (r.\"Name\"='coordinator'         and not exists (select 1 from identity.\"OperationalCoordinators\" s where s.\"UserId\"=u.\"Id\"))
     or (r.\"Name\"='owner'               and not exists (select 1 from identity.\"FleetOwners\" s where s.\"UserId\"=u.\"Id\"))")" 0 violations)"

SECOND_ROLE=$(psql -X -At -c "insert into identity.\"UserRoles\" (\"UserId\",\"RoleId\") select '$DRV_ID', \"Id\" from identity.\"Roles\" where \"Name\"='mechanic'" 2>&1)
dbcheck SR18 "Database refuses a second role for a user (unique UserRoles.UserId)" \
  "$( [[ "$SECOND_ROLE" == *IX_UserRoles_UserId* ]] && echo ok || echo "(insert allowed: $SECOND_ROLE)")"
dbcheck SR19 "Application reviewed_by references the Fleet Administrator" \
  "$(is "$(pg "select \"ReviewedByUserId\" from identity.\"UserApplications\" where \"NormalizedEmail\"=upper('$DRV')")" "$ADMIN_ID" reviewer)"

staff "$(q drv2)" "${RUN}25" driver -F licenceNumber=$LIC -F licenceClass=light
check SR20 "Another driver with the same licence number" 409 "$(is "$(field .errorCode)" application.licence_taken code)"

OWN_AUTH=$(bearer "$OWN")
req GET /api/auth/applications -H "$OWN_AUTH"
check SR21 "Owner can't review applications (Fleet Administrators only)" 403

# ============================================================================
# 3. Profile change requests
# ============================================================================
C1_AUTH=$(bearer "$C1")
DRV_AUTH=$(bearer "$DRV")
PCR=/api/auth/profile-change-requests

json POST $PCR '{"field":"phone","newValue":"0777654321"}'
check PC01 "Anonymous request" 401
json POST $PCR '{"field":"nic","newValue":"x"}' -H "$C1_AUTH"
check PC02 "Unknown field" 400 "$( jq -e '.errors.field' "$WORK/body" >/dev/null && echo ok || echo '(no field error)')"
json POST $PCR '{"field":"phone","newValue":"12345"}' -H "$C1_AUTH"
check PC03 "Invalid phone number" 400 "$( jq -e '.errors.newValue' "$WORK/body" >/dev/null && echo ok || echo '(no value error)')"

json POST $PCR '{"field":"phone","newValue":"077 765 4321"}' -H "$C1_AUTH"
PC_PHONE=$(field .id)
check PC04 "Request a phone change (old and new values normalised)" 201 \
  "$( [[ "$(field .oldValue)" == "+94771234567" && "$(field .newValue)" == "+94777654321" && "$(field .status)" == pending ]] && echo ok || echo '(values)')"
dbcheck PC05 "Not applied before approval" "$(is "$(pg "select \"PhoneNumber\" from identity.\"Users\" where \"Id\"='$C1_ID'")" "+94771234567" phone)"

json POST $PCR '{"field":"phone","newValue":"077 111 2222"}' -H "$C1_AUTH"
check PC06 "Second pending request for the same field" 409 "$(is "$(field .errorCode)" profile_change.duplicate code)"
json POST $PCR '{"field":"full-name","newValue":"QA Customer"}' -H "$C1_AUTH"
check PC07 "Same as the current value" 400 "$(is "$(field .errorCode)" profile_change.no_change code)"
json POST $PCR '{"field":"licence-number","newValue":"Z1"}' -H "$C1_AUTH"
check PC08 "Licence field for a customer" 400 "$(is "$(field .errorCode)" profile_change.field_not_allowed code)"
json POST $PCR "{\"field\":\"email\",\"newValue\":\"$ADMIN\"}" -H "$C1_AUTH"
check PC09 "Email already used by another account" 409 "$(is "$(field .errorCode)" auth.email_taken code)"

req GET $PCR/mine -H "$C1_AUTH"
check PC10 "User lists their own requests" 200 "$(is "$(jq 'length' "$WORK/body")" 1 count)"
req GET "$PCR?status=pending&pageSize=100" -H "$ADMIN_AUTH"
check PC11 "Admin review list includes the request" 200 "$(jq -e --arg id "$PC_PHONE" '.items | any(.id==$id)' "$WORK/body" >/dev/null && echo ok || echo '(missing)')"
req GET $PCR -H "$C1_AUTH"
check PC12 "Customer can't open the review list" 403

req POST $PCR/$PC_PHONE/approve -H "$C1_AUTH"
check PC13 "Customer can't approve" 403
req POST $PCR/$PC_PHONE/approve -H "$ADMIN_AUTH"
check PC14 "Admin approves the phone change" 200 "$(is "$(field .status)" approved status)"
dbcheck PC15 "Phone applied, updated_at set, approved_by = admin" \
  "$(is "$(pg "select u.\"PhoneNumber\" || ':' || (u.\"UpdatedAt\" is not null) || ':' || r.\"ApprovedByUserId\" from identity.\"Users\" u join identity.\"ProfileChangeRequests\" r on r.\"UserId\"=u.\"Id\" where r.\"Id\"='$PC_PHONE'")" "+94777654321:true:$ADMIN_ID" state)"
req POST $PCR/$PC_PHONE/approve -H "$ADMIN_AUTH"
check PC16 "Approving twice" 409 "$(is "$(field .errorCode)" profile_change.not_pending code)"
req POST $PCR/00000000-0000-0000-0000-000000000000/approve -H "$ADMIN_AUTH"
check PC17 "Unknown request id" 404 "$(is "$(field .errorCode)" profile_change.not_found code)"

NEW_EMAIL=$(q cust1-renamed)
json POST $PCR "{\"field\":\"email\",\"newValue\":\"$NEW_EMAIL\"}" -H "$C1_AUTH"
req POST "$PCR/$(field .id)/approve" -H "$ADMIN_AUTH"
check PC18 "Admin approves an email change" 200
login "$NEW_EMAIL"; check PC19 "Sign in with the new email" 200
login "$C1";        check PC20 "Old email no longer signs in" 401
C1_AUTH=$(bearer "$NEW_EMAIL")

json POST $PCR "{\"field\":\"licence-number\",\"newValue\":\"n$RUN\"}" -H "$DRV_AUTH"
req POST "$PCR/$(field .id)/approve" -H "$ADMIN_AUTH"
check PC21 "Driver licence-number change approved" 200
dbcheck PC22 "DRIVER row updated (stored upper-case)" "$(is "$(pg "select \"LicenceNumber\" from identity.\"Drivers\" where \"UserId\"='$DRV_ID'")" "N$RUN" licence)"

json POST $PCR '{"field":"licence-class","newValue":"heavy-trailer"}' -H "$DRV_AUTH"
PC_CLASS=$(field .id)
json POST $PCR/$PC_CLASS/reject '{"reason":""}' -H "$ADMIN_AUTH"
check PC23 "Reject without a reason" 400
json POST $PCR/$PC_CLASS/reject '{"reason":"Upload the new licence first."}' -H "$ADMIN_AUTH"
check PC24 "Reject with a reason" 200 "$( [[ "$(field .status)" == rejected && "$(field .rejectionReason)" == "Upload the new licence first." ]] && echo ok || echo '(state)')"
dbcheck PC25 "Rejected change isn't applied" "$(is "$(pg "select \"LicenceClass\" from identity.\"Drivers\" where \"UserId\"='$DRV_ID'")" Heavy class)"

# The dev admin is shared between runs: clear any pending request an interrupted run left behind.
pg "delete from identity.\"ProfileChangeRequests\" where \"UserId\"='$ADMIN_ID' and \"Status\"='Pending'" >/dev/null
json POST $PCR "{\"field\":\"full-name\",\"newValue\":\"QA Admin $RUN\"}" -H "$ADMIN_AUTH"
PC_SELF=$(field .id)
req POST $PCR/$PC_SELF/approve -H "$ADMIN_AUTH"
check PC26 "Admin can't approve their own change" 403 "$(is "$(field .errorCode)" profile_change.self_review code)"
# Leave nothing pending on the shared admin account for the next run.
pg "delete from identity.\"ProfileChangeRequests\" where \"Id\"='$PC_SELF'" >/dev/null

# ============================================================================
# 4. Account deactivation (USER.is_active)
# ============================================================================
login "$C3" "$PW" -H 'X-Client-Type: mobile'
C3_RT=$(field .refreshToken)
BEFORE=$(pg "select coalesce(\"UpdatedAt\"::text,'') from identity.\"Users\" where \"Id\"='$C3_ID'")
login "$C3" Wrong2026Pass
login "$C3"
dbcheck US01 "Sign-in (failed or successful) doesn't change updated_at" "$(is "$(pg "select coalesce(\"UpdatedAt\"::text,'') from identity.\"Users\" where \"Id\"='$C3_ID'")" "$BEFORE" updatedAt)"

json PUT /api/auth/users/$C3_ID/status '{"isActive":false}' -H "$C1_AUTH"
check US02 "Non-admin can't deactivate" 403
json PUT /api/auth/users/00000000-0000-0000-0000-000000000000/status '{"isActive":false}' -H "$ADMIN_AUTH"
check US03 "Unknown user" 404 "$(is "$(field .errorCode)" user.not_found code)"
json PUT /api/auth/users/$ADMIN_ID/status '{"isActive":false}' -H "$ADMIN_AUTH"
check US04 "Admin can't deactivate themselves" 400 "$(is "$(field .errorCode)" user.cannot_deactivate_self code)"

json PUT /api/auth/users/$C3_ID/status '{"isActive":false}' -H "$ADMIN_AUTH"
check US05 "Admin deactivates a customer" 200 "$( [[ "$(field .isActive)" == false && -n "$(field .updatedAt)" ]] && echo ok || echo '(state)')"
login "$C3"
check US06 "Deactivated account, right password" 403 "$(is "$(field .errorCode)" auth.account_disabled code)"
login "$C3" Wrong2026Pass
check US07 "Deactivated account, wrong password reveals nothing" 401 "$(is "$(field .errorCode)" auth.invalid_credentials code)"
json POST /api/auth/refresh "{\"refreshToken\":\"$C3_RT\"}" -H 'X-Client-Type: mobile'
check US08 "Existing session ended" 401 "$(is "$(field .errorCode)" auth.invalid_refresh_token code)"
SENT=$(emails_to "$C3")
json POST /api/auth/forgot-password "{\"email\":\"$C3\"}"
check US09 "Forgot password still 202 but no email is sent" 202 "$(is "$(sleep 0.5; emails_to "$C3")" "$SENT" emails)"

json PUT /api/auth/users/$C3_ID/status '{"isActive":true}' -H "$ADMIN_AUTH"
check US10 "Admin reactivates the account" 200 "$(is "$(field .isActive)" true isActive)"
login "$C3"
check US11 "Reactivated account signs in" 200

# ============================================================================
# 5. Audit log and session metadata
# ============================================================================
json POST /api/auth/logout "{\"refreshToken\":\"$(login "$C3" "$PW" -H 'X-Client-Type: mobile'; field .refreshToken)\"}"
login "$C3" Wrong2026Pass

req GET "/api/auth/audit-log?userId=$C3_ID&pageSize=200" -H "$ADMIN_AUTH"
ACTIONS=",$(jq -r '[.items[].action] | unique | join(",")' "$WORK/body"),"
MISSING=""; for a in LOGIN LOGIN_FAILED LOGOUT ACCOUNT_DEACTIVATED ACCOUNT_REACTIVATED; do [[ "$ACTIONS" == *",$a,"* ]] || MISSING+="$a "; done
check AU01 "User history: sign-in, failure, sign-out, deactivate, reactivate" 200 "$( [[ -z "$MISSING" ]] && echo ok || echo "(missing $MISSING)")"

dbcheck AU02 "Application lifecycle events recorded for the driver" "$(is "$(pg "
  select string_agg(distinct \"Action\", ',' order by \"Action\") from identity.\"AuditLog\"
  where \"EntityId\" = (select \"Id\"::text from identity.\"UserApplications\" where \"NormalizedEmail\"=upper('$DRV'))")" \
  "APPLICATION_APPROVED,APPLICATION_SUBMITTED" actions)"
dbcheck AU03 "Customer events: verified and rejected applications" "$(is "$(pg "
  select count(*) from identity.\"AuditLog\" where (\"Action\"='EMAIL_VERIFIED' and \"EntityId\"='$C1_APP') or (\"Action\"='APPLICATION_REJECTED' and \"EntityId\"='$C4_APP')")" 2 rows)"
dbcheck AU04 "Activation and profile change events recorded" "$(is "$(pg "
  select concat((select count(*) from identity.\"AuditLog\" where \"Action\"='ACCOUNT_ACTIVATED' and \"UserId\"='$DRV_ID'),
                (select count(*) from identity.\"AuditLog\" where \"Action\"='PROFILE_CHANGE_APPROVED' and \"EntityId\"='$PC_PHONE'),
                (select count(*) from identity.\"AuditLog\" where \"Action\"='PROFILE_CHANGE_REJECTED' and \"EntityId\"='$PC_CLASS'))")" 111 rows)"

login "nobody-$RUN@fleetsync.test" Wrong2026Pass
dbcheck AU05 "Unknown-email failure logged without a user or the typed email" "$(is "$(pg "
  select (\"UserId\" is null) || ':' || coalesce(\"Details\",'') from identity.\"AuditLog\" where \"Action\"='LOGIN_FAILED' order by \"OccurredAt\" desc limit 1")" "true:Unknown email" entry)"

req GET "/api/auth/audit-log?action=login_failed&pageSize=5" -H "$ADMIN_AUTH"
check AU06 "Action filter is case-insensitive" 200 "$(is "$(jq -r '[.items[].action] | unique | join(",")' "$WORK/body")" LOGIN_FAILED actions)"
check AU07 "Entries carry the client IP" 200 "$( [[ -n "$(jq -r '.items[0].ipAddress // empty' "$WORK/body")" ]] && echo ok || echo '(no ip)')"
req GET /api/auth/audit-log -H "$C1_AUTH";  check AU08 "Audit log: non-admin" 403
req GET /api/auth/audit-log;                 check AU09 "Audit log: anonymous" 401
dbcheck AU10 "No tokens or passwords in audit details" "$(is "$(pg "
  select count(*) from identity.\"AuditLog\" where \"Details\" ilike '%token=%' or \"Details\" ilike '%$PW%'")" 0 rows)"

dbcheck SM01 "Sessions store the client IP and User-Agent" "$(is "$(pg "
  select count(*) filter (where \"IpAddress\" is not null and \"UserAgent\"='$UA') || '/' || count(*) from identity.\"RefreshTokens\" where \"UserId\"='$C3_ID'")" \
  "$(pg "select count(*) || '/' || count(*) from identity.\"RefreshTokens\" where \"UserId\"='$C3_ID'")" sessions)"

echo
echo "TOTAL: $PASS passed, $FAIL failed  (run id $RUN)"
[[ $FAIL -eq 0 ]] || echo "Failed: ${FAILED_IDS[*]}"
