# Instant Quote Calculator

A dependency-free, configurable quote calculator for local service businesses. It runs as a static website and can be embedded into an existing site or hosted as a standalone page.

## Included

- Exact money calculations in integer minor units, avoiding floating-point price errors.
- One required package or size selector.
- Quantity-based extras, minimum charges, `from` prices, and unpriced items that must be confirmed manually.
- Itemised estimate and copy-to-clipboard summary.
- Three layouts: Atelier, Signal, and Ledger.
- Responsive controls, keyboard support, visible focus states, reduced-motion support, and fallback copy text.
- No forms, accounts, analytics, external scripts, or customer-data storage.

## Configure a client version

Edit `config.js`. Prices are stored in the currency's minor unit:

- `7500` means £75.00 or €75.00.
- `currency` accepts ISO currency codes such as `GBP`, `EUR`, or `USD`.
- `locale` controls formatting, for example `en-GB` or `fr-FR`.
- `theme` accepts `atelier`, `signal`, or `ledger`.
- Set `showThemePicker` to `false` in a delivered client version.
- Set `minimumCharge` to `0` when there is no minimum.
- Set `from: true` when the displayed price is only a starting point.
- Set `quoteOnly: true` for a selectable requirement that must not be assigned an invented price.

Every option needs a unique `id`. Quantity extras may define `max` from 1 to 100.

## Delivery workflow

1. Confirm the client's exact public prices, service rules, minimum charge, taxes, coverage, and exclusions.
2. Duplicate the product folder and edit only the duplicated `config.js`.
3. Choose one visual theme and hide the theme picker.
4. Replace the generic brand and wording. Do not use a logo without the client's permission.
5. Run `node tests/test-product.cjs`.
6. Test the main price combinations, zero state, minimum, maximum quantities, reset, copied text, keyboard navigation, and a narrow mobile viewport.
7. Publish to the client's approved host only after written approval.

## Scope boundaries

The base product is a price guide, not a booking system, payment system, CRM, tax calculator, or guaranteed quotation. Integrations, customer-data collection, PDF generation, account access, and installation into a production CMS are separate scoped work.

## Files

- `index.html` — accessible page structure.
- `config.js` — client-specific words, prices, and options.
- `calculator.js` — validation, arithmetic, rendering, reset, and copy behaviour.
- `styles.css` — three responsive visual directions.
- `sales/` — marketplace listings, FAQ, pricing, and client intake material.
- `prospects/` — researched lead list and qualification notes.
- `tests/` — automated product checks.
