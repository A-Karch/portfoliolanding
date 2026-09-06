window.QUOTE_CALCULATOR_CONFIG = {
  brand: "BrightNest Services",
  eyebrow: "Instant price guide",
  title: "Build your cleaning estimate.",
  intro: "Choose a property size and add the jobs you need. You will get an itemised guide before contacting the team.",
  currency: "GBP",
  locale: "en-GB",
  theme: "atelier",
  showThemePicker: true,
  minimumCharge: 7500,
  baseLabel: "Property size",
  baseOptions: [
    { id: "studio", name: "Studio", description: "Kitchen, bathroom and living area", price: 7500 },
    { id: "one-bed", name: "One bedroom", description: "Up to one bedroom and one bathroom", price: 10500 },
    { id: "two-bed", name: "Two bedrooms", description: "Up to two bedrooms and one bathroom", price: 14500 },
    { id: "three-bed", name: "Three bedrooms", description: "Up to three bedrooms and two bathrooms", price: 19000, from: true }
  ],
  extrasLabel: "Optional extras",
  extras: [
    { id: "oven", name: "Inside oven", description: "Standard single oven", price: 2500, unit: "oven", max: 2 },
    { id: "bathroom", name: "Additional bathroom", description: "Beyond the package allowance", price: 1800, unit: "bathroom", max: 4 },
    { id: "windows", name: "Interior windows", description: "Reachable standard windows", price: 800, unit: "window", max: 12 },
    { id: "carpet", name: "Carpet cleaning", description: "Standard room", price: 2000, unit: "room", max: 8 },
    { id: "special", name: "Heavy soiling or special request", description: "Added to the brief without inventing a price", quoteOnly: true, unit: "request", max: 1 }
  ],
  estimateLabel: "Estimated total",
  disclaimer: "Example prices only. The final price depends on access, condition, location and the confirmed scope.",
  copyButton: "Copy estimate",
  copiedMessage: "Copied — nothing has been sent.",
  emptyMessage: "Choose a property size to begin.",
  footer: "Live product demonstration · No form, account, analytics or customer-data collection"
};
