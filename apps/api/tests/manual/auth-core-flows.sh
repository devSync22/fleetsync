#!/usr/bin/env bash
# Manual (black-box) tests of the core Auth API flows: health, customer
# registration and approval, sessions, password reset, staff applications,
# and the rate limit. The EER features (role tables, profile changes,
# deactivation, audit log) are tested by auth-new-features.sh.
# Test cases are described in docs/testing/auth-api-testing.md.
# Drives the real HTTP endpoints with curl against a running API and prints
# PASS/FAIL per test case. Emailed tokens (verify / reset / activate) are read
# from the API console log, because Development uses LoggingEmailSender.
#
# Usage (from the repo root): bash apps/api/tests/manual/auth-core-flows.sh <api-log-file> [ratelimit]
#   - default mode runs every functional case (expects a high rate limit)
#   - "ratelimit" mode only checks that the 11th request in a minute gets 429
set -uo pipefail

HOST=${FLEETSYNC_API:-http://localhost:5215}
API_LOG=${1:?Pass the API log file as the first argument}
MODE=${2:-functional}
REPO=$(cd "$(dirname "$0")/../../../.." && pwd)
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

PASS=0; FAIL=0
RESULTS="$WORK/results.txt"; : > "$RESULTS"   # failure bodies, printed at the end

# --- helpers -----------------------------------------------------------------

# req METHOD PATH [curl args...] -> sets $STATUS, body in $WORK/body, headers in $WORK/headers
req() {
  local method=$1 path=$2; shift 2
  STATUS=$(curl -s -o "$WORK/body" -D "$WORK/headers" -w '%{http_code}' -X "$method" "$HOST$path" "$@")
}

# json METHOD PATH JSON [curl args...] -> POST/GET with a JSON body
json() {
  local method=$1 path=$2 data=$3; shift 3
  req "$method" "$path" -H 'Content-Type: application/json' -d "$data" "$@"
}

# Reads a field from the last response body (jq filter), empty if missing.
field() { jq -r "$1 // empty" "$WORK/body" 2>/dev/null; }

# check ID "description" expected-status [extra-condition-result]
# The optional 4th argument is "ok" when an additional assertion passed.
check() {
  local id=$1 desc=$2 expected=$3 extra=${4:-ok}
  local got="$STATUS"; [[ -n "$(field .code)" ]] && got="$STATUS $(field .code)"
  if [[ "$STATUS" == "$expected" && "$extra" == "ok" ]]; then
    PASS=$((PASS+1)); printf 'PASS | %-4s | %-62s | %s\n' "$id" "$desc" "$got" | tee -a "$RESULTS"
  else
    FAIL=$((FAIL+1)); printf 'FAIL | %-4s | %-62s | expected %s, got %s %s\n' "$id" "$desc" "$expected" "$got" "$extra" | tee -a "$RESULTS"
    head -c 400 "$WORK/body" >> "$RESULTS"; echo >> "$RESULTS"
  fi
}

# is "a" "b" -> "ok" when equal, otherwise a short reason (used as check's 4th arg)
is() { [[ "$1" == "$2" ]] && echo ok || echo "($3: '$1')"; }

# Latest emailed token for an address, taken from the API log (URL-decoded).
token_for() {
  sleep 0.5
  python3 -I - "$API_LOG" "$1" <<'PY'
import re, sys, urllib.parse
log, addr = open(sys.argv[1], encoding="utf-8", errors="replace").read(), sys.argv[2]
at = log.rfind(f"Email to {addr}")
m = re.search(r"token=([^\s&]+)", log[at:]) if at >= 0 else None
print(urllib.parse.unquote(m.group(1)) if m else "")
PY
}

# Refresh cookie value from the last response's Set-Cookie header.
refresh_cookie() { grep -i '^set-cookie: fleetsync_refresh=' "$WORK/headers" | sed -E 's/^[^=]+=([^;]*).*/\1/I' | tr -d '\r'; }

# --- rate limit mode ---------------------------------------------------------
if [[ "$MODE" == "ratelimit" ]]; then
  for i in $(seq 1 11); do
    json POST /api/auth/login '{"email":"nobody@fleetsync.test","password":"Wrong1234","rememberMe":false}'
    CODES+="$STATUS "
  done
  check RL1 "11 logins in one minute: 11th is rejected (codes: ${CODES% })" 429
  echo "TOTAL: $PASS passed, $FAIL failed"; exit 0
fi

# --- test data ---------------------------------------------------------------
RUN=$(date +%s)
CUST="qa-$RUN-cust@fleetsync.test";  CUST_PW="Custpass1A"
LOCK="qa-$RUN-lock@fleetsync.test"
DRV="qa-$RUN-driver@fleetsync.test"; DRV_PW="Driverpass1A"
MECH="qa-$RUN-mech@fleetsync.test"
NIC_DRV="${RUN}01"; NIC_MECH="${RUN}02"        # 12-digit new-format NICs
# Dev admin from User Secrets (created by DevAdminSeeder in Development).
SECRETS=$(cd "$REPO" && dotnet user-secrets list --project apps/api/src/FleetSync.Api)
ADMIN=$(sed -n 's/^Auth:DevAdmin:Email = //p' <<<"$SECRETS"); ADMIN=${ADMIN:-admin@fleetsync.local}
ADMIN_PW=$(sed -n 's/^Auth:DevAdmin:Password = //p' <<<"$SECRETS")

# Sample upload files: real PDF/JPG signatures, a fake PDF and a PNG.
printf '%%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%%%EOF\n' > "$WORK/nic.pdf"
printf '\xFF\xD8\xFF\xE0fake-jpeg-body' > "$WORK/licence.jpg"
echo "just text, not a pdf" > "$WORK/fake.pdf"
printf '\x89PNG\r\n\x1a\n' > "$WORK/photo.png"

customer_body() {  # customer_body EMAIL PASSWORD
  echo "{\"companyName\":\"QA Freight $RUN\",\"businessRegistrationNo\":\"PV $RUN\",\"billingAddress\":\"No. 1, Galle Road, Colombo 03\",\"fullName\":\"QA Customer\",\"mobile\":\"077 123 4567\",\"email\":\"$1\",\"password\":\"$2\"}"
}

echo "Run id: $RUN"

json POST /api/auth/login "{\"email\":\"$ADMIN\",\"password\":\"$ADMIN_PW\",\"rememberMe\":false}"
ADMIN_ACCESS=$(field .accessToken)
AUTH=(-H "Authorization: Bearer $ADMIN_ACCESS")
ADMIN_ID=$(field .user.id)

# approve_customer EMAIL -> admin approves that customer's application (after it was verified)
approve_customer() {
  req GET "/api/auth/applications?role=customer&pageSize=100" "${AUTH[@]}"
  local id; id=$(jq -r --arg e "$1" '.items[] | select(.email==$e) | .id' "$WORK/body" | head -1)
  req POST "/api/auth/applications/$id/approve" "${AUTH[@]}"
}

# --- 1. Health ---------------------------------------------------------------
req GET /health/live;  check H1 "Liveness endpoint" 200
req GET /health/ready; check H2 "Readiness: database (Supabase) reachable" 200 "$(is "$(cat "$WORK/body")" Healthy body)"

# --- 2. Customer registration & email verification -------------------------
json POST /api/auth/register/customer "$(customer_body "$CUST" "$CUST_PW")"
check R1 "Register customer with valid data" 201 "$( [[ "$(field .reference)" =~ ^REG-[0-9]{4}-[0-9]+$ ]] && echo ok || echo '(bad reference)')"

json POST /api/auth/register/customer "$(customer_body "$CUST" "$CUST_PW")"
check R2 "Register again while the first application is open" 409 "$(is "$(field .code)" application.duplicate code)"

json POST /api/auth/register/customer '{"companyName":"","businessRegistrationNo":"PV 1","billingAddress":"x","fullName":"A","mobile":"12345","email":"not-an-email","password":"weak"}'
check R3 "Register with invalid fields -> per-field errors" 400 "$( [[ $(jq '.errors | has("email") and has("password") and has("mobile") and has("companyName")' "$WORK/body") == true ]] && echo ok || echo '(missing field errors)')"

json POST /api/auth/login "{\"email\":\"$CUST\",\"password\":\"$CUST_PW\",\"rememberMe\":false}"
check R4 "Login (right password) before verifying email" 403 "$(is "$(field .code)" auth.email_not_verified code)"

json POST /api/auth/verify-email/resend "{\"email\":\"$CUST\"}"
check R5 "Resend verification email" 202

json POST /api/auth/verify-email/resend '{"email":"nobody-at-all@fleetsync.test"}'
check R6 "Resend for unknown email still 202 (no account enumeration)" 202

json POST /api/auth/verify-email '{"token":"not-a-real-token"}'
check R7 "Verify email with an invalid token" 400 "$(is "$(field .code)" auth.invalid_token code)"

VERIFY_TOKEN=$(token_for "$CUST")
json POST /api/auth/verify-email "{\"token\":\"$VERIFY_TOKEN\"}"
check R8 "Verify email with the emailed token" 204

json POST /api/auth/verify-email "{\"token\":\"$VERIFY_TOKEN\"}"
check R9 "Reuse the same verification token" 400 "$(is "$(field .code)" auth.invalid_token code)"

json POST /api/auth/login "{\"email\":\"$CUST\",\"password\":\"$CUST_PW\",\"rememberMe\":false}"
check R10 "Verified but not yet approved: told it's pending" 403 "$(is "$(field .code)" auth.pending_approval code)"

json POST /api/auth/login "{\"email\":\"$CUST\",\"password\":\"Wrongpass1\",\"rememberMe\":false}"
check R11 "Pending + wrong password looks like any failed login" 401 "$(is "$(field .code)" auth.invalid_credentials code)"

UNVER="qa-$RUN-unverified@fleetsync.test"
json POST /api/auth/register/customer "$(customer_body "$UNVER" "$CUST_PW")"
approve_customer "$UNVER"
check R12 "Admin can't approve an unverified customer" 409 "$(is "$(field .code)" application.email_not_verified code)"

approve_customer "$CUST"
CUST_ID=$(field .userId)
check R13 "Admin approves the verified customer -> account created" 200 "$( [[ "$(field .status)" == approved && -n "$CUST_ID" ]] && echo ok || echo '(no account)')"

json POST /api/auth/register/customer "$(customer_body "$CUST" "$CUST_PW")"
check R14 "Register with an email that now has an account" 409 "$(is "$(field .code)" auth.email_taken code)"

# --- 3. Sessions: login, me, refresh, logout --------------------------------
json POST /api/auth/login "{\"email\":\"$CUST\",\"password\":\"Wrongpass1\",\"rememberMe\":false}"
check S1 "Login with wrong password -> attemptsLeft shown" 401 "$( [[ "$(field .code)" == auth.invalid_credentials && -n "$(field .attemptsLeft)" ]] && echo ok || echo '(no attemptsLeft)')"

json POST /api/auth/login '{"email":"nobody-at-all@fleetsync.test","password":"Wrongpass1","rememberMe":false}'
check S2 "Login with unknown email -> no attemptsLeft" 401 "$( [[ -z "$(field .attemptsLeft)" ]] && echo ok || echo '(leaks attemptsLeft)')"

json POST /api/auth/login "{\"email\":\"$CUST\",\"password\":\"$CUST_PW\",\"rememberMe\":true}"
ACCESS=$(field .accessToken); COOKIE1=$(refresh_cookie)
HTTPONLY=$(grep -i '^set-cookie: fleetsync_refresh=' "$WORK/headers" | grep -qi httponly && echo ok || echo '(cookie not HttpOnly)')
check S3 "Web login: access token + HttpOnly refresh cookie" 200 "$( [[ -n "$ACCESS" && -n "$COOKIE1" ]] && echo "$HTTPONLY" || echo '(missing token/cookie)')"
# Part of S3: the web login must not return the refresh token in the body.
[[ -z "$(field .refreshToken)" ]] || { STATUS=x; check S3b "Web login must NOT return refreshToken in body" 200; }

req GET /api/auth/me -H "Authorization: Bearer $ACCESS"
check S4 "GET /me with access token -> customer role" 200 "$( jq -e '.. | strings | select(.=="customer")' "$WORK/body" >/dev/null && echo ok || echo '(role customer missing)')"

req GET /api/auth/me
check S5 "GET /me without a token" 401

req GET /api/auth/me -H "Authorization: Bearer abc.def.ghi"
check S6 "GET /me with a forged token" 401

req POST /api/auth/refresh -H "Cookie: fleetsync_refresh=$COOKIE1"
COOKIE2=$(refresh_cookie)
check S7 "Refresh with cookie -> new access token, rotated cookie" 200 "$( [[ -n "$(field .accessToken)" && -n "$COOKIE2" && "$COOKIE2" != "$COOKIE1" ]] && echo ok || echo '(not rotated)')"

req POST /api/auth/refresh -H "Cookie: fleetsync_refresh=$COOKIE1"
check S8 "Reuse the OLD refresh cookie (replay) is rejected" 401 "$(is "$(field .code)" auth.invalid_refresh_token code)"

req POST /api/auth/refresh -H "Cookie: fleetsync_refresh=$COOKIE2"
check S9 "After replay, the newest cookie is revoked too (session ended)" 401

json POST /api/auth/login "{\"email\":\"$CUST\",\"password\":\"$CUST_PW\",\"rememberMe\":false}" -H 'X-Client-Type: mobile'
MOBILE_RT=$(field .refreshToken)
check S10 "Mobile login returns refreshToken in the body" 200 "$( [[ -n "$MOBILE_RT" ]] && echo ok || echo '(no refreshToken)')"

# The mobile header is needed on /refresh too: it decides body vs cookie for the rotated token.
json POST /api/auth/refresh "{\"refreshToken\":\"$MOBILE_RT\"}" -H 'X-Client-Type: mobile'
MOBILE_RT2=$(field .refreshToken)
check S11 "Mobile refresh with body token" 200 "$( [[ -n "$MOBILE_RT2" ]] && echo ok || echo '(no new token)')"

json POST /api/auth/logout "{\"refreshToken\":\"$MOBILE_RT2\"}"
check S12 "Logout" 204

json POST /api/auth/refresh "{\"refreshToken\":\"$MOBILE_RT2\"}"
check S13 "Refresh after logout is rejected" 401

# Lockout: separate account so the main customer stays usable.
json POST /api/auth/register/customer "$(customer_body "$LOCK" "$CUST_PW")"
json POST /api/auth/verify-email "{\"token\":\"$(token_for "$LOCK")\"}"
approve_customer "$LOCK"
for i in 1 2 3 4; do json POST /api/auth/login "{\"email\":\"$LOCK\",\"password\":\"Wrongpass1\",\"rememberMe\":false}"; done
check S14 "4th wrong password -> 1 attempt left" 401 "$(is "$(field .attemptsLeft)" 1 attemptsLeft)"
json POST /api/auth/login "{\"email\":\"$LOCK\",\"password\":\"Wrongpass1\",\"rememberMe\":false}"
check S15 "5th wrong password locks the account" 423 "$( [[ -n "$(field .lockoutEnd)" ]] && echo ok || echo '(no lockoutEnd)')"
json POST /api/auth/login "{\"email\":\"$LOCK\",\"password\":\"$CUST_PW\",\"rememberMe\":false}"
check S16 "Correct password while locked is still refused" 423

# --- 4. Password reset ------------------------------------------------------
json POST /api/auth/forgot-password '{"email":"nobody-at-all@fleetsync.test"}'
check P1 "Forgot password for unknown email still 202" 202

json POST /api/auth/forgot-password "{\"email\":\"$CUST\"}"
check P2 "Forgot password for the customer" 202
RESET_TOKEN=$(token_for "$CUST")

json POST /api/auth/reset-password/lookup "{\"token\":\"$RESET_TOKEN\"}"
check P3 "Reset lookup returns the account email" 200 "$(is "$(field .email)" "$CUST" email)"

json POST /api/auth/reset-password/lookup '{"token":"bogus"}'
check P4 "Reset lookup with an invalid token" 400 "$(is "$(field .code)" auth.invalid_token code)"

json POST /api/auth/reset-password "{\"token\":\"$RESET_TOKEN\",\"newPassword\":\"weak\"}"
check P5 "Reset with a weak password" 400

json POST /api/auth/reset-password "{\"token\":\"$RESET_TOKEN\",\"newPassword\":\"$CUST_PW\"}"
check P6 "Reset to the current password (reuse) is refused" 400 "$(is "$(field .code)" auth.password_reused code)"

NEW_PW="Newpass2026B"
json POST /api/auth/reset-password "{\"token\":\"$RESET_TOKEN\",\"newPassword\":\"$NEW_PW\"}"
check P7 "Reset to a new valid password" 204

json POST /api/auth/reset-password "{\"token\":\"$RESET_TOKEN\",\"newPassword\":\"Another2026C\"}"
check P8 "Reuse the reset token" 400 "$(is "$(field .code)" auth.invalid_token code)"

json POST /api/auth/login "{\"email\":\"$CUST\",\"password\":\"$CUST_PW\",\"rememberMe\":false}"
check P9 "Old password no longer works" 401
json POST /api/auth/login "{\"email\":\"$CUST\",\"password\":\"$NEW_PW\",\"rememberMe\":false}"
CUST_ACCESS=$(field .accessToken)
check P10 "New password works" 200

# --- 5. Staff applications --------------------------------------------------
staff() {  # staff EMAIL NIC ROLE [extra curl -F args...]
  local email=$1 nic=$2 role=$3; shift 3
  req POST /api/auth/staff-applications -F "fullName=QA Staff $RUN" -F "nic=$nic" -F "email=$email" \
    -F "mobile=0771234567" -F "role=$role" "$@"
}

staff "$DRV" "$NIC_DRV" driver -F "documents=@$WORK/nic.pdf"
check A1 "Driver application without licence details" 400 "$( jq -e '.errors | has("licenceNumber")' "$WORK/body" >/dev/null && echo ok || echo '(no licence error)')"

staff "$DRV" "$NIC_DRV" driver -F licenceNumber=B$RUN -F licenceClass=heavy -F "documents=@$WORK/fake.pdf"
check A2 "Upload a text file renamed to .pdf" 400 "$(is "$(field .code)" application.invalid_document code)"

staff "$DRV" "$NIC_DRV" driver -F licenceNumber=B$RUN -F licenceClass=heavy -F "documents=@$WORK/photo.png"
check A3 "Upload a PNG (only PDF/JPG allowed)" 400

staff "$DRV" "$NIC_DRV" driver -F licenceNumber=B$RUN -F licenceClass=heavy
check A4 "Application with no documents" 400

staff "$DRV" "$NIC_DRV" driver -F licenceNumber=B$RUN -F licenceClass=heavy -F "documents=@$WORK/nic.pdf" -F "documents=@$WORK/licence.jpg"
check A5 "Valid driver application (PDF + JPG)" 201 "$( [[ "$(field .reference)" =~ ^REG- ]] && echo ok || echo '(no reference)')"

staff "qa-$RUN-other@fleetsync.test" "$NIC_DRV" driver -F licenceNumber=B$RUN -F licenceClass=heavy -F "documents=@$WORK/nic.pdf"
check A6 "Second open application with the same NIC" 409 "$(is "$(field .code)" application.duplicate code)"

staff "$MECH" "$NIC_MECH" mechanic -F "documents=@$WORK/nic.pdf"
check A7 "Valid mechanic application (no licence needed)" 201

req GET "/api/auth/applications?status=pending"
check A8 "Review list without a token" 401

req GET "/api/auth/applications?status=pending" -H "Authorization: Bearer $CUST_ACCESS"
check A9 "Review list as a customer (not admin)" 403

req GET /api/auth/me "${AUTH[@]}"
check A10 "Admin (dev seeder) is a fleet-administrator" 200 "$( jq -e '.roles | index("fleet-administrator")' "$WORK/body" >/dev/null && echo ok || echo '(not admin)')"

req GET "/api/auth/applications?status=pending&pageSize=100" "${AUTH[@]}"
DRV_ID=$(jq -r --arg e "$DRV" '.items[] | select(.email==$e) | .id' "$WORK/body")
MECH_ID=$(jq -r --arg e "$MECH" '.items[] | select(.email==$e) | .id' "$WORK/body")
check A11 "Admin sees both new applications as pending" 200 "$( [[ -n "$DRV_ID" && -n "$MECH_ID" ]] && echo ok || echo '(not listed)')"

req GET "/api/auth/applications/$DRV_ID" "${AUTH[@]}"
DOC_ID=$(field '.documents[0].id')
check A12 "Application details with 2 documents" 200 "$(is "$(jq '.documents | length' "$WORK/body")" 2 documents)"

req GET "/api/auth/applications/$DRV_ID/documents/$DOC_ID" "${AUTH[@]}"
check A13 "Download an attached document" 200 "$( head -c4 "$WORK/body" | grep -q -e '%PDF' -e $'\xFF\xD8\xFF' && echo ok || echo '(wrong content)')"

req GET "/api/auth/applications/00000000-0000-0000-0000-000000000000" "${AUTH[@]}"
check A14 "Details of a non-existent application" 404 "$(is "$(field .code)" application.not_found code)"

json POST "/api/auth/applications/$MECH_ID/reject" '{"reason":""}' "${AUTH[@]}"
check A15 "Reject without a reason" 400

json POST "/api/auth/applications/$MECH_ID/reject" '{"reason":"NIC copy is unreadable, please re-upload."}' "${AUTH[@]}"
check A16 "Reject with a reason" 200 "$(is "$(field .status)" rejected status)"

json POST "/api/auth/applications/$MECH_ID/approve" '{}' "${AUTH[@]}"
check A17 "Approve an already-rejected application" 409 "$(is "$(field .code)" application.not_pending code)"

req POST "/api/auth/applications/$DRV_ID/approve" "${AUTH[@]}"
check A18 "Approve the driver application" 200 "$(is "$(field .status)" approved status)"
ACT_TOKEN=$(token_for "$DRV")

json POST /api/auth/login "{\"email\":\"$DRV\",\"password\":\"$DRV_PW\",\"rememberMe\":false}"
check A19 "Approved but not activated driver cannot log in" 401

json POST /api/auth/activation/lookup "{\"token\":\"$ACT_TOKEN\"}"
check A20 "Activation lookup with emailed token" 200

json POST /api/auth/activation "{\"token\":\"$ACT_TOKEN\",\"password\":\"weak\"}"
check A21 "Activate with a weak password" 400

json POST /api/auth/activation "{\"token\":\"$ACT_TOKEN\",\"password\":\"$DRV_PW\"}"
check A22 "Activate with a valid password" 204

json POST /api/auth/activation "{\"token\":\"$ACT_TOKEN\",\"password\":\"$DRV_PW\"}"
check A23 "Reuse the activation token" 400 "$(is "$(field .code)" auth.invalid_token code)"

json POST /api/auth/login "{\"email\":\"$DRV\",\"password\":\"$DRV_PW\",\"rememberMe\":false}"
DRV_ACCESS=$(field .accessToken)
check A24 "Activated driver can log in" 200
req GET /api/auth/me -H "Authorization: Bearer $DRV_ACCESS"
check A25 "Driver /me shows the driver role" 200 "$( jq -e '.. | strings | select(.=="driver")' "$WORK/body" >/dev/null && echo ok || echo '(role driver missing)')"

req GET "/api/auth/applications/$DRV_ID" "${AUTH[@]}"
check A26 "Application is now marked activated" 200 "$(is "$(field .status)" activated status)"

echo "TOTAL: $PASS passed, $FAIL failed  (run id $RUN)"
[[ $FAIL -eq 0 ]] || { echo; echo "Failure details:"; grep -A1 '^FAIL' "$RESULTS"; }
