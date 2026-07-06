import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "assets",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      // ─── Team members (About page) ────────────────────────────────────
      {
        name: "team",
        label: "Team",
        path: "content/team",
        format: "json",
        ui: {
          allowedActions: { create: true, delete: true },
          defaultItem: () => ({ order: 99 }),
        },
        fields: [
          { type: "string",  name: "name",       label: "Full name",     required: true, isTitle: true },
          { type: "string",  name: "role",        label: "Role/Title",    required: true },
          { type: "number",  name: "order",       label: "Display order" },
          { type: "image",   name: "photo",       label: "Photo" },
          { type: "string",  name: "phone",       label: "Phone (tel: href)" },
          { type: "string",  name: "email",       label: "Email" },
          { type: "string",  name: "linkedin",    label: "LinkedIn URL" },
        ],
      },

      // ─── Testimonials (Customers page) ────────────────────────────────
      {
        name: "testimonial",
        label: "Testimonials",
        path: "content/testimonials",
        format: "json",
        ui: {
          allowedActions: { create: true, delete: true },
          defaultItem: () => ({ order: 99 }),
        },
        fields: [
          { type: "string",  name: "company",    label: "Company name",  required: true, isTitle: true },
          { type: "number",  name: "order",      label: "Display order" },
          { type: "image",   name: "logo",       label: "Company logo" },
          { type: "image",   name: "photo",      label: "Feature photo (optional)" },
          { type: "string",  name: "quote",      label: "Full quote",    ui: { component: "textarea" } },
          { type: "string",  name: "previewQuote", label: "Short preview quote (card)", ui: { component: "textarea" } },
          {
            type: "object",
            name: "authors",
            label: "Authors",
            list: true,
            ui: { itemProps: (item) => ({ label: item.name }) },
            fields: [
              { type: "string", name: "name",  label: "Name" },
              { type: "string", name: "title", label: "Title / Company" },
            ],
          },
        ],
      },

      // ─── Customer logos (Customers page grid) ─────────────────────────
      {
        name: "customer",
        label: "Customers",
        path: "content/customers",
        format: "json",
        ui: {
          allowedActions: { create: true, delete: true },
          defaultItem: () => ({ order: 99 }),
        },
        fields: [
          { type: "string", name: "name",  label: "Company name", required: true, isTitle: true },
          { type: "number", name: "order", label: "Display order" },
          { type: "image",  name: "logo",  label: "Logo" },
        ],
      },

      // ─── Integration logos (Integrations page) ────────────────────────
      {
        name: "integration",
        label: "Integrations",
        path: "content/integrations",
        format: "json",
        ui: {
          allowedActions: { create: true, delete: true },
          defaultItem: () => ({ order: 99 }),
        },
        fields: [
          { type: "string", name: "name",     label: "Integration name",  required: true, isTitle: true },
          { type: "number", name: "order",    label: "Display order" },
          { type: "image",  name: "logo",     label: "Logo" },
          { type: "string", name: "category", label: "Category (Accounting, Banking, Government…)" },
        ],
      },

      // ─── Offices (About page map) ──────────────────────────────────────
      {
        name: "office",
        label: "Offices",
        path: "content/offices",
        format: "json",
        ui: {
          allowedActions: { create: true, delete: true },
          defaultItem: () => ({ order: 99 }),
        },
        fields: [
          { type: "string", name: "city",  label: "City name",       required: true, isTitle: true },
          { type: "number", name: "order", label: "Display order" },
          { type: "number", name: "lat",   label: "Latitude" },
          { type: "number", name: "lng",   label: "Longitude" },
          { type: "string", name: "mapsUrl", label: "Google Maps URL" },
        ],
      },
    ],
  },
});
