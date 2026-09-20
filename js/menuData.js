/* ==========================================================
   Dragon Restaurant - site settings + menu data
   Edit this file to change prices, dishes, phone number, etc.
   ========================================================== */

const CONFIG = {
  name: "Dragon Restaurant",
  tagline: "Sri Lankan & Asian wok kitchen",
  currency: "Rs.",
  // WhatsApp number in international format, no + or spaces (94 = Sri Lanka)
  whatsapp: "94771234567",
  phone: "+94 77 123 4567",
  email: "hello@dragonrestaurant.lk",
  address: "No. 00, Main Street, Your Town",
  open: "10:00",           // opening time (24h)
  close: "22:30",          // closing time (24h)
  serviceChargePct: 10,    // applied to dine-in orders only
  deliveryFee: 350,
  freeDeliveryOver: 5000,
  minDelivery: 1500,
  // promo codes: CODE -> percent discount
  promoCodes: { DRAGON10: 10, WELCOME5: 5 },
  adminPin: "1234"         // CHANGE THIS. Client-side only (see README)
};

const CATEGORIES = [
  "Rice & Curry",
  "Kottu",
  "Noodles & Fried Rice",
  "Starters",
  "Seafood",
  "Breakfast & Short Eats",
  "Desserts",
  "Beverages"
];

/* spicy: 0 = none, 1 = mild, 2 = medium, 3 = hot
   image: optional path, e.g. "images/kottu.jpg" (emoji shows if empty/missing) */
const MENU = [
  // ---- Rice & Curry
  { id: 1,  name: "Chicken Rice & Curry", category: "Rice & Curry", price: 950,  emoji: "🍛", veg: false, spicy: 2, popular: true,  image: "", desc: "Steamed rice, chicken curry, dhal, three vegetable curries, pol sambol and papadam." },
  { id: 2,  name: "Fish Ambul Thiyal Rice & Curry", category: "Rice & Curry", price: 1100, emoji: "🍛", veg: false, spicy: 2, popular: false, image: "", desc: "Southern-style sour fish curry with goraka, served with rice and three sides." },
  { id: 3,  name: "Vegetable Rice & Curry", category: "Rice & Curry", price: 750,  emoji: "🥗", veg: true,  spicy: 1, popular: false, image: "", desc: "Rice with dhal, jackfruit curry, beetroot, gotukola sambol and papadam." },
  { id: 4,  name: "Lamprais", category: "Rice & Curry", price: 1350, emoji: "🍃", veg: false, spicy: 2, popular: true,  image: "", desc: "Rice, meat curry, frikkadel, brinjal moju and seeni sambol baked in a banana leaf." },

  // ---- Kottu
  { id: 5,  name: "Chicken Kottu", category: "Kottu", price: 1200, emoji: "🔥", veg: false, spicy: 2, popular: true,  image: "", desc: "Chopped godamba roti tossed on the hot plate with chicken, egg, leeks and curry sauce." },
  { id: 6,  name: "Cheese Kottu", category: "Kottu", price: 1400, emoji: "🧀", veg: false, spicy: 1, popular: true,  image: "", desc: "Our chicken kottu finished with a thick layer of melted cheese." },
  { id: 7,  name: "Egg Kottu", category: "Kottu", price: 950,  emoji: "🍳", veg: false, spicy: 1, popular: false, image: "", desc: "Roti, scrambled egg, vegetables and spices chopped on the plate." },
  { id: 8,  name: "Vegetable Kottu", category: "Kottu", price: 850,  emoji: "🥕", veg: true,  spicy: 1, popular: false, image: "", desc: "Roti with carrot, cabbage, leeks and tomato in a light curry sauce." },

  // ---- Noodles & Fried Rice
  { id: 9,  name: "Chicken Fried Rice", category: "Noodles & Fried Rice", price: 1050, emoji: "🍚", veg: false, spicy: 1, popular: false, image: "", desc: "Wok-fried rice with chicken, egg and spring onion." },
  { id: 10, name: "Seafood Fried Rice", category: "Noodles & Fried Rice", price: 1400, emoji: "🦐", veg: false, spicy: 1, popular: false, image: "", desc: "Prawns, cuttlefish and fish fried with rice and vegetables." },
  { id: 11, name: "Vegetable Noodles", category: "Noodles & Fried Rice", price: 800,  emoji: "🍜", veg: true,  spicy: 0, popular: false, image: "", desc: "Egg-free noodles stir-fried with seasonal vegetables and soy." },
  { id: 12, name: "Chicken Chopsuey", category: "Noodles & Fried Rice", price: 1300, emoji: "🥘", veg: false, spicy: 0, popular: false, image: "", desc: "Crispy noodles topped with chicken and vegetables in a glossy sauce." },

  // ---- Starters
  { id: 13, name: "Devilled Chicken", category: "Starters", price: 1250, emoji: "🌶️", veg: false, spicy: 3, popular: true,  image: "", desc: "Crispy chicken tossed with onion, capsicum and a sweet-hot chilli sauce." },
  { id: 14, name: "Chilli Prawns", category: "Starters", price: 1650, emoji: "🦐", veg: false, spicy: 3, popular: false, image: "", desc: "Batter-fried prawns in a sticky chilli and garlic glaze." },
  { id: 15, name: "Crispy Cuttlefish", category: "Starters", price: 1500, emoji: "🦑", veg: false, spicy: 2, popular: false, image: "", desc: "Lightly battered cuttlefish rings with a hot garlic dip." },
  { id: 16, name: "Vegetable Spring Rolls", category: "Starters", price: 600,  emoji: "🥟", veg: true,  spicy: 0, popular: false, image: "", desc: "Four crisp rolls filled with cabbage, carrot and glass noodles." },
  { id: 17, name: "Fish Cutlets (3 pcs)", category: "Starters", price: 480,  emoji: "🐟", veg: false, spicy: 1, popular: false, image: "", desc: "Spiced fish and potato croquettes, breadcrumbed and fried." },

  // ---- Seafood
  { id: 18, name: "Butter Garlic Prawns", category: "Seafood", price: 1900, emoji: "🍤", veg: false, spicy: 0, popular: false, image: "", desc: "Large prawns pan-tossed in garlic butter with herbs." },
  { id: 19, name: "Devilled Fish", category: "Seafood", price: 1500, emoji: "🐠", veg: false, spicy: 3, popular: false, image: "", desc: "Fried fish pieces tossed in our hot devilled sauce." },
  { id: 20, name: "Crab Curry", category: "Seafood", price: 2600, emoji: "🦀", veg: false, spicy: 3, popular: true,  image: "", desc: "Fresh lagoon crab simmered in roasted Jaffna-style curry powder." },

  // ---- Breakfast & Short Eats
  { id: 21, name: "String Hoppers Set", category: "Breakfast & Short Eats", price: 650, emoji: "🍥", veg: true,  spicy: 1, popular: false, image: "", desc: "Ten string hoppers with dhal curry, potato curry and pol sambol." },
  { id: 22, name: "Egg Hopper (2 pcs)", category: "Breakfast & Short Eats", price: 400, emoji: "🥚", veg: false, spicy: 1, popular: false, image: "", desc: "Crisp-edged hoppers with a soft egg, served with lunu miris." },
  { id: 23, name: "Plain Hoppers (3 pcs)", category: "Breakfast & Short Eats", price: 300, emoji: "🥣", veg: true,  spicy: 0, popular: false, image: "", desc: "Fermented rice-and-coconut bowls, with sambol on the side." },
  { id: 24, name: "Pol Roti & Sambol", category: "Breakfast & Short Eats", price: 450, emoji: "🫓", veg: true,  spicy: 1, popular: false, image: "", desc: "Coconut flatbreads with katta sambol and a dhal dip." },

  // ---- Desserts
  { id: 25, name: "Watalappan", category: "Desserts", price: 550, emoji: "🍮", veg: false, spicy: 0, popular: true,  image: "", desc: "Steamed coconut custard with jaggery, cardamom and cashew." },
  { id: 26, name: "Curd & Treacle", category: "Desserts", price: 480, emoji: "🥛", veg: true,  spicy: 0, popular: false, image: "", desc: "Buffalo curd with kithul treacle." },
  { id: 27, name: "Ice Cream Sundae", category: "Desserts", price: 650, emoji: "🍨", veg: true,  spicy: 0, popular: false, image: "", desc: "Three scoops with chocolate sauce, nuts and wafer." },

  // ---- Beverages
  { id: 28, name: "Ceylon Iced Tea", category: "Beverages", price: 350, emoji: "🧊", veg: true, spicy: 0, popular: false, image: "", desc: "Strong Ceylon black tea over ice with a squeeze of lime." },
  { id: 29, name: "Fresh Lime Juice", category: "Beverages", price: 300, emoji: "🍋", veg: true, spicy: 0, popular: false, image: "", desc: "Freshly squeezed lime, sweet, salted or mixed." },
  { id: 30, name: "Wood Apple Juice", category: "Beverages", price: 400, emoji: "🥤", veg: true, spicy: 0, popular: false, image: "", desc: "Thick, tangy elephant-apple juice with jaggery." },
  { id: 31, name: "King Coconut", category: "Beverages", price: 250, emoji: "🥥", veg: true, spicy: 0, popular: false, image: "", desc: "A chilled thambili, served whole." },
  { id: 32, name: "Faluda", category: "Beverages", price: 550, emoji: "🍧", veg: true, spicy: 0, popular: false, image: "", desc: "Rose milk with basil seeds, vermicelli and ice cream." }
];

/* SAMPLE reviews - replace these with real customer reviews before going live */
const REVIEWS = [
  { name: "Sample Customer A", text: "Replace this with a real review. The cheese kottu was the best part of the night.", stars: 5 },
  { name: "Sample Customer B", text: "Replace this with a real review. Quick delivery and everything arrived hot.", stars: 5 },
  { name: "Sample Customer C", text: "Replace this with a real review. Friendly staff and generous portions.", stars: 4 }
];
