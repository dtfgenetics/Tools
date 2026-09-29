# Secure Provider Telemetry Gateway Design

Date: 2026-09-28

## Goal
Add one server-side, vendor-neutral, read-only gateway for authenticated telemetry providers so browser tools never receive provider API keys.

## Architecture
Use Web-standard Request/Response and fetch so the gateway can run in Cloudflare Workers, Node-compatible edge runtimes, or another server layer. Provider adapters implement device discovery and recent telemetry. The gateway exposes only normalized read endpoints and imports the existing live telemetry packet contract.

## Initial provider
Pulse Grow:
- secret: `PULSE_API_KEY`
- auth header: `x-api-key`
- devices: `GET https://api.pulsegrow.com/all-devices`
- recent sensor telemetry: `GET https://api.pulsegrow.com/sensors/{sensorId}/recent-data`

## Gateway routes
- `GET /api/telemetry/providers`
- `GET /api/telemetry/pulse/devices`
- `GET /api/telemetry/pulse/devices/:id/recent`

## Security constraints
- reject non-GET methods with 405.
- never return secrets/authorization headers.
- provider secrets are injected from server env only.
- device IDs are validated before URL construction.
- upstream non-2xx responses are converted to bounded safe errors.
- no write/control provider endpoints in this phase.
- no new runtime dependency.
