# SMAart View — Security & Threat Model (Mini)

This document describes the security posture of SMAart View
and the realistic risks associated with its operation.

It is intentionally brief and practical.

---

## What SMAart View does NOT store

SMAart View does not collect or store:

- cookies
- IP addresses
- user identifiers
- personal profiles
- cross-site tracking data

As a result, no personal data is processed or retained.

---

## Potential risks

### Fake or noisy events
A third party could send artificial events to the system.

**Impact:**  
Only aggregated counts may be affected.

**Why this is acceptable:**  
No individual data exists, and no decisions depend on exact precision.

---

### Widget overuse or repeated loading
The widget could be loaded multiple times on the same page or site.

**Impact:**  
Minor statistical noise.

**Why this is acceptable:**  
The system is designed for directional insight, not forensic analytics.

---

### Public access to aggregated stats
Aggregated statistics are publicly readable for a given site identifier.

**Impact:**  
Visibility of high-level activity only.

**Why this is acceptable:**  
The data is anonymous, non-sensitive, and intentionally non-granular.

---

## Non-goals

SMAart View is intentionally not designed to:

- protect against adversarial data poisoning
- provide legally auditable analytics
- store historical surveillance data
- identify or fingerprint visitors

---

## Summary

Even in worst-case scenarios:

- no personal data is exposed
- no individuals are identifiable
- no legal or privacy harm occurs

This risk profile is intentional
and aligned with the product’s privacy-first philosophy.
