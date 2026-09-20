# Dragon Restaurant website

A complete front-end restaurant site: menu, cart, checkout, order tracking, table reservations,
chat assistant and a staff dashboard. No build step, no installs.

## Run it
Open `index.html` in a browser (double-click), or serve the folder:

    python3 -m http.server 8000      # then visit http://localhost:8000

## Pages
| File | What it does |
|------|--------------|
| `index.html` | Home: hero, menu (search, categories, veg filter, sorting), reservations, about, reviews, contact |
| `order-view.html` | Checkout: edit quantities, dine-in / takeaway / delivery, promo code, confirm, receipt, print, WhatsApp |
| `my-orders.html` | Order history, progress bar, order again, cancel (while Pending) |
| `admin.html` | Staff dashboard: orders + status, reservations, messages, sold-out switches, CSV export |

## Change things (all in `js/menuData.js`)
* Restaurant phone / WhatsApp number (`whatsapp`, format `94771234567`), address, opening hours
* Service charge, delivery fee, free-delivery limit, minimum delivery order, promo codes
* Menu: add / edit dishes. To show a real photo set `image: "images/kottu.jpg"` (emoji shows until then)
* **Change `adminPin` (default 1234)** and replace the sample reviews

## Your own files
* Logo: `images/logo.jpg` (square). A 龍 badge shows if it is missing.
* Hero video: `video/hero.mp4` (rename your old `video 02.mp4`). Hidden automatically if missing.

## Important: what "no backend" means
Orders, reservations and messages are saved in the visitor's browser (localStorage). That means:
* The staff dashboard only sees orders placed in the same browser. For a real shop, customers
  send each order to the restaurant with the **WhatsApp button** on the receipt (already built).
* The admin PIN is a convenience lock, not real security.
* To receive orders from every customer on your own dashboard you need a small backend
  (Firebase, Supabase, or Node + database). The code is organised so only `DR.orders` in
  `js/store.js` needs to change.
