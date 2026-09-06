(function () {
  "use strict";

  const allowedThemes = ["atelier", "signal", "ledger"];
  const config = window.QUOTE_CALCULATOR_CONFIG;
  if (!config || typeof config !== "object") throw new Error("Calculator configuration is missing.");

  const byId = (id) => document.getElementById(id);
  const state = { base: "", quantities: {} };

  function assertInteger(value, minimum, maximum, label) {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw new Error(`${label} must be a whole number between ${minimum} and ${maximum}.`);
    }
    return value;
  }

  function validateConfiguration(value) {
    const requiredText = ["brand", "title", "currency", "locale", "baseLabel", "extrasLabel", "estimateLabel", "disclaimer"];
    for (const key of requiredText) {
      if (typeof value[key] !== "string" || !value[key].trim()) throw new Error(`Configuration field “${key}” is required.`);
    }
    if (!Array.isArray(value.baseOptions) || !value.baseOptions.length) throw new Error("At least one base option is required.");
    if (!Array.isArray(value.extras)) throw new Error("Extras must be a list.");
    assertInteger(value.minimumCharge || 0, 0, Number.MAX_SAFE_INTEGER, "Minimum charge");
    const all = [...value.baseOptions, ...value.extras];
    const ids = new Set();
    for (const item of all) {
      if (!item || typeof item.id !== "string" || !item.id || ids.has(item.id)) throw new Error("Every option needs a unique id.");
      ids.add(item.id);
      if (typeof item.name !== "string" || !item.name.trim()) throw new Error(`Option ${item.id} needs a name.`);
      if (!item.quoteOnly) assertInteger(item.price, 0, Number.MAX_SAFE_INTEGER, `${item.name} price`);
      if (Object.hasOwn(item, "max")) assertInteger(item.max, 1, 100, `${item.name} maximum`);
    }
    return value;
  }

  validateConfiguration(config);
  const money = (pence) => new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(pence / 100);

  function calculate(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid calculator input.");
    const base = config.baseOptions.find((item) => item.id === input.base);
    if (input.base && !base) throw new Error("Unknown base option.");
    const quantities = input.quantities || {};
    if (typeof quantities !== "object" || Array.isArray(quantities)) throw new Error("Invalid quantities.");
    if (Object.keys(quantities).some((id) => !config.extras.some((item) => item.id === id))) throw new Error("Unknown extra.");

    const rows = [];
    let hasFromPrice = Boolean(base?.from);
    let hasQuoteOnly = false;
    if (base) rows.push({ ...base, quantity: 1, subtotal: base.price, kind: "base" });
    for (const item of config.extras) {
      const quantity = assertInteger(Object.hasOwn(quantities, item.id) ? quantities[item.id] : 0, 0, item.max || 10, item.name);
      if (!quantity) continue;
      if (item.quoteOnly) {
        hasQuoteOnly = true;
        rows.push({ ...item, quantity, subtotal: 0, kind: "quote" });
      } else {
        hasFromPrice ||= Boolean(item.from);
        rows.push({ ...item, quantity, subtotal: quantity * item.price, kind: "extra" });
      }
    }
    const subtotal = rows.reduce((sum, row) => sum + row.subtotal, 0);
    const minimumAdjustment = rows.length && subtotal ? Math.max(0, (config.minimumCharge || 0) - subtotal) : 0;
    return {
      base,
      rows,
      subtotal,
      minimumAdjustment,
      total: subtotal + minimumAdjustment,
      hasSelection: Boolean(rows.length),
      hasFromPrice,
      hasQuoteOnly
    };
  }

  function summaryText(result) {
    if (!result.hasSelection) return config.emptyMessage;
    const lines = [config.brand.toUpperCase(), "ESTIMATE GUIDE", ""];
    for (const row of result.rows) {
      const quantity = row.kind === "base" ? "" : `${row.quantity} × `;
      const amount = row.quoteOnly ? "price to confirm" : `${row.from ? "from " : ""}${money(row.subtotal)}`;
      lines.push(`${quantity}${row.name}: ${amount}`);
    }
    if (result.minimumAdjustment) lines.push(`Minimum-charge adjustment: ${money(result.minimumAdjustment)}`);
    lines.push(`${config.estimateLabel}: ${result.hasFromPrice ? "from " : ""}${money(result.total)}${result.hasQuoteOnly ? " + items to confirm" : ""}`);
    lines.push("", config.disclaimer);
    return lines.join("\n");
  }

  function createBaseOptions() {
    const container = byId("base-options");
    for (const item of config.baseOptions) {
      const label = document.createElement("label");
      label.className = "base-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "base";
      input.value = item.id;
      const text = document.createElement("span");
      text.className = "option-copy";
      const name = document.createElement("strong");
      name.textContent = item.name;
      const description = document.createElement("small");
      description.textContent = item.description || "";
      const price = document.createElement("b");
      price.textContent = `${item.from ? "from " : ""}${money(item.price)}`;
      text.append(name, description);
      label.append(input, text, price);
      input.addEventListener("change", () => {
        state.base = input.value;
        render();
      });
      container.append(label);
    }
  }

  function setQuantity(item, value) {
    state.quantities[item.id] = Math.max(0, Math.min(item.max || 10, value));
    const input = byId(`quantity-${item.id}`);
    input.value = String(state.quantities[item.id]);
    render();
  }

  function createExtras() {
    const container = byId("extras-options");
    for (const item of config.extras) {
      const row = document.createElement("div");
      row.className = "extra-option";
      const copy = document.createElement("div");
      copy.className = "option-copy";
      const name = document.createElement("strong");
      name.textContent = item.name;
      const description = document.createElement("small");
      description.textContent = item.description || "";
      const price = document.createElement("span");
      price.className = "extra-price";
      price.textContent = item.quoteOnly ? "Price to confirm" : `${item.from ? "from " : ""}${money(item.price)} / ${item.unit || "item"}`;
      copy.append(name, description, price);

      const stepper = document.createElement("div");
      stepper.className = "stepper";
      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", `Remove ${item.name}`);
      const input = document.createElement("input");
      input.id = `quantity-${item.id}`;
      input.type = "number";
      input.inputMode = "numeric";
      input.min = "0";
      input.max = String(item.max || 10);
      input.step = "1";
      input.value = "0";
      input.setAttribute("aria-label", `${item.name} quantity`);
      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", `Add ${item.name}`);
      minus.addEventListener("click", () => setQuantity(item, (state.quantities[item.id] || 0) - 1));
      plus.addEventListener("click", () => setQuantity(item, (state.quantities[item.id] || 0) + 1));
      input.addEventListener("change", () => setQuantity(item, Number(input.value)));
      stepper.append(minus, input, plus);
      row.append(copy, stepper);
      container.append(row);
    }
  }

  function setText() {
    document.title = `${config.brand} — Instant estimate demo`;
    byId("brand").textContent = config.brand;
    byId("eyebrow").textContent = config.eyebrow || "Instant estimate";
    byId("title").textContent = config.title;
    byId("intro").textContent = config.intro || "";
    byId("base-label").textContent = config.baseLabel;
    byId("extras-label").textContent = config.extrasLabel;
    byId("estimate-label").textContent = config.estimateLabel;
    byId("disclaimer").textContent = config.disclaimer;
    byId("copy").textContent = config.copyButton || "Copy estimate";
    byId("footer-copy").textContent = config.footer || "No customer data is collected.";
  }

  function render() {
    let result;
    try {
      result = calculate(state);
      byId("error").hidden = true;
    } catch (error) {
      byId("error").textContent = error.message;
      byId("error").hidden = false;
      return;
    }
    const prefix = result.hasFromPrice ? "from " : "";
    byId("total").textContent = result.hasSelection ? `${prefix}${money(result.total)}` : "—";
    byId("total-note").textContent = !result.hasSelection
      ? config.emptyMessage
      : result.hasQuoteOnly ? "Plus item(s) requiring confirmation" : "Final price confirmed after review";
    const breakdown = byId("breakdown");
    breakdown.replaceChildren();
    for (const row of result.rows) {
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = `${row.kind === "base" ? "" : `${row.quantity} × `}${row.name}`;
      const price = document.createElement("strong");
      price.textContent = row.quoteOnly ? "To confirm" : `${row.from ? "from " : ""}${money(row.subtotal)}`;
      li.append(name, price);
      breakdown.append(li);
    }
    if (result.minimumAdjustment) {
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = "Minimum-charge adjustment";
      const price = document.createElement("strong");
      price.textContent = money(result.minimumAdjustment);
      li.append(name, price);
      breakdown.append(li);
    }
    byId("empty").hidden = result.hasSelection;
    byId("copy").disabled = !result.hasSelection;
    byId("summary-text").textContent = summaryText(result);
    byId("copy-status").textContent = "";
    for (const item of config.extras) {
      const input = byId(`quantity-${item.id}`);
      const quantity = state.quantities[item.id] || 0;
      input.previousElementSibling.disabled = quantity === 0;
      input.nextElementSibling.disabled = quantity >= (item.max || 10);
    }
  }

  function applyTheme(theme) {
    const validTheme = allowedThemes.includes(theme) ? theme : "atelier";
    document.body.dataset.theme = validTheme;
    for (const button of document.querySelectorAll("[data-set-theme]")) {
      button.setAttribute("aria-pressed", String(button.dataset.setTheme === validTheme));
    }
  }

  setText();
  createBaseOptions();
  createExtras();
  const urlTheme = new URLSearchParams(location.search).get("theme");
  applyTheme(allowedThemes.includes(urlTheme) ? urlTheme : config.theme);
  byId("theme-picker").hidden = config.showThemePicker === false;
  document.querySelectorAll("[data-set-theme]").forEach((button) => button.addEventListener("click", () => applyTheme(button.dataset.setTheme)));
  byId("reset").addEventListener("click", () => {
    state.base = "";
    state.quantities = {};
    document.querySelectorAll('input[name="base"]').forEach((input) => { input.checked = false; });
    for (const item of config.extras) byId(`quantity-${item.id}`).value = "0";
    render();
  });
  byId("copy").addEventListener("click", async () => {
    const text = byId("summary-text").textContent;
    try {
      await navigator.clipboard.writeText(text);
      byId("copy-status").textContent = config.copiedMessage || "Copied.";
    } catch {
      byId("summary-details").open = true;
      byId("copy-status").textContent = "Select the text below and copy it manually.";
    }
  });
  render();

  window.QuoteCalculator = { calculate, summaryText, money, config };
})();
