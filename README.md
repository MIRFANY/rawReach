# 🥦 Smartmandi — Streamlining Street Vendor Supply Chains

**KisanDeals** is a web-based marketplace designed to empower Indian street food vendors by giving them access to real-time sabzi mandi (vegetable market) prices and enabling them to source raw materials efficiently. Vendors can list special deals, firms can register product listings, and admins can ingest mandi data directly via automation.

## 🚀 Features

- 📦 **Marketplace Page**: Browse firm listings for essential raw materials.
- 💰 **Special Deals Page**: Vendors can post exclusive, limited-time offers for other vendors.
- 🗂️ **Admin Dashboard**: Automatically scrape and ingest sabzi mandi data from official portals via Puppeteer and store in Supabase.
- 🔎 **Filters by State & District**: Helps users narrow down listings relevant to their region.
- 🛒 **Floating Cart System**: Add/remove items dynamically and redirect to cart for checkout (mock).
- 🧮 **Data Normalization**: Converts Sabzi Mandi Excel data into a unified schema with checksum deduplication.

---

## 🏗️ Tech Stack

| Layer        | Tech                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Frontend     | [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [ShadCN UI](https://ui.shadcn.com/) |
| Styling      | Tailwind CSS, ShadCN components                                                                    |
| Backend      | Next.js API routes, Puppeteer, Chromium                                                            |
| Database     | [Supabase](https://supabase.com/) (PostgreSQL)                                                     |
| File Parsing | [SheetJS / XLSX](https://sheetjs.com/)                                                             |
| Hosting      | [Vercel](https://vercel.com/)                                                                      |

---

## 🛠️ Setup Instructions

1. **Clone the repo**

   ```bash
   git clone https://github.com/MIRFANY/rawReach
   cd smartmandi
   Install dependencies
   npm install
   Set up environment variables
   Create a .env.local file and add:

   ```

NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=your-key>

Run the dev server

```
npm run dev
```

Access the app
http://localhost:3000
🔐 Supabase Schema Summary

---

## 📦 Database Schema

### `listings` (Firm Listings)

| Column       | Type    | Description                    |
| ------------ | ------- | ------------------------------ |
| id           | uuid    | Primary key                    |
| name         | text    | Product name                   |
| price        | numeric | Total price for package        |
| quantity     | integer | Package quantity (in kg, etc.) |
| type         | text    | "vendor" or "sabzimandi"       |
| state        | text    | Associated state               |
| district     | text    | Associated district            |
| contact_info | jsonb   | Firm/vendor contact details    |
| photo_url    | text    | Image URL                      |

### `special_deals` (Vendor Deals)

| Column      | Type    | Description         |
| ----------- | ------- | ------------------- |
| id          | uuid    | Primary key         |
| name        | text    | Item name           |
| description | text    | Description of deal |
| price       | numeric | Offered price       |
| quantity    | integer | Quantity in KG      |
| vendor_name | text    | Vendor name         |
| state       | text    | State               |
| district    | text    | District            |

### `mandi_prices` (Scraped Sabzi Mandi Data)

| Column       | Type    | Description                       |
| ------------ | ------- | --------------------------------- |
| id           | uuid    | Primary key                       |
| commodity    | text    | Item name                         |
| variety      | text    | Specific variety (if any)         |
| market       | text    | Mandi name                        |
| state        | text    | State                             |
| district     | text    | District                          |
| min_price    | numeric | Lowest price per unit             |
| modal_price  | numeric | Median price                      |
| max_price    | numeric | Highest price                     |
| arrival_date | date    | Date of arrival                   |
| checksum     | text    | SHA256 checksum for deduplication |

---

## ⚙️ Scraper Endpoint

A backend API endpoint uses Puppeteer + Chromium to scrape and download `.xlsx` data from official mandi portals.

### Endpoint

`POST /api/admin/bulk-import`

#### Request Body

```json
{
  "url": "https://example.com/mandi/export"
}
```

Description:
Navigates to the given URL.
Clicks on #exportButton.
Downloads .xlsx file to a temp folder.
Converts to JSON using sheet_to_json.
Inserts parsed records into mandi_prices table (with checksum-based deduplication).
🛒 Cart System

🏁 License

MIT License © 2025
This is an open-source project made for social good. Contributions welcome!

---

```

```
