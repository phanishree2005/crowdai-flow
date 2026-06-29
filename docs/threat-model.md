# Threat Model

## Actors
- Edge Device (Authenticated)
- Operator (Authenticated via SSO)
- External Attacker

## Attack Vectors
- Device spoofing -> Mitigated by mTLS and JWT validation.
- DDoS -> Mitigated by Edge Envoy rate limiting.
