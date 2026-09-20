/* ==========================================================
   Restaurant assistant (rule-based, works offline).
   It knows the menu, prices, hours, delivery, and can add
   dishes to the cart.
   ========================================================== */
(function (w) {
  "use strict";
  const esc = DR.esc;

  const STOP = new Set(("add to my the a an of please pls me i want like would can you get order one two three four five " +
    "some for and with cart price cost how much is what whats tell about show").split(" "));
  const NUMWORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, a: 1, an: 1 };

  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const stem = (t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t);

  function tokens(text) {
    return norm(text).split(" ").filter((t) => t && !STOP.has(t) && !/^\d+$/.test(t)).map(stem);
  }

  /* find dishes that match the words in a message */
  function findItems(text) {
    const q = tokens(text);
    if (!q.length) return [];
    let best = 0, hits = [];
    MENU.forEach((m) => {
      const words = norm(m.name).split(" ").map(stem);
      const score = q.filter((t) => words.includes(t)).length;
      if (score > best) { best = score; hits = [m]; }
      else if (score === best && score > 0) hits.push(m);
    });
    // a match only counts if it explains most of what the person typed
    return best >= Math.min(q.length, 2) || (best === 1 && q.length === 1) ? hits : [];
  }

  function quantity(text) {
    const m = text.match(/\b(\d{1,2})\b/);
    if (m) return Math.min(20, Math.max(1, Number(m[1])));
    for (const k in NUMWORDS) if (new RegExp("\\b" + k + "\\b").test(text) && k !== "a" && k !== "an") return NUMWORDS[k];
    return 1;
  }

  const has = (t, re) => re.test(t);
  const list = (items) => items.map((m) => `<li>${esc(m.name)} <b>${DR.fmt(m.price)}</b></li>`).join("");
  const chipsFor = (items) => items.slice(0, 4).map((m) => "Add " + m.name);

  function reply(raw) {
    const t = norm(raw);
    if (!t) return { html: "Type a question, or tap one of the options below." };

    if (has(t, /^(hi|hello|hey|hola|ayubowan|kohomada)\b/))
      return { html: "Hello! I can show the menu, suggest dishes, add items to your cart and answer questions about hours or delivery.", chips: ["Popular dishes", "Vegetarian options", "Opening hours", "Delivery info"] };

    // add to cart
    if (has(t, /\b(add|order|get|buy|i want|i d like|i ll have|give me)\b/) && !has(t, /\b(order status|my orders?)\b/)) {
      const hits = findItems(raw);
      if (hits.length === 1) {
        const m = hits[0], q = quantity(t.replace(norm(m.name), " "));
        if (DR.isSoldOut(m.id)) return { html: `Sorry, <b>${esc(m.name)}</b> is sold out right now.`, chips: ["Popular dishes"] };
        DR.cart.add(m.id, q);
        return { html: `Added <b>${q} &times; ${esc(m.name)}</b>. Your cart total is ${DR.fmt(DR.cart.subtotal())}.`, chips: ["Show my cart", "Checkout", "Popular dishes"] };
      }
      if (hits.length > 1 && hits.length <= 6)
        return { html: "Which one would you like?<ul>" + list(hits) + "</ul>", chips: chipsFor(hits) };
    }

    if (has(t, /\b(cart|basket|my order|checkout|check out|pay now)\b/)) {
      const lines = DR.cart.lines();
      if (!lines.length) return { html: "Your cart is empty. Ask for popular dishes or open the menu to start.", chips: ["Popular dishes"] };
      return {
        html: "In your cart:<ul>" + lines.map((l) => `<li>${l.qty} &times; ${esc(l.item.name)} <b>${DR.fmt(l.total)}</b></li>`).join("") +
          `</ul>Subtotal <b>${DR.fmt(DR.cart.subtotal())}</b>. <a href="order-view.html">Go to checkout</a>`
      };
    }

    if (has(t, /\b(price|cost|how much)\b/)) {
      const hits = findItems(raw);
      if (hits.length === 1) return { html: `<b>${esc(hits[0].name)}</b> is ${DR.fmt(hits[0].price)}.`, chips: ["Add " + hits[0].name] };
      if (hits.length > 1 && hits.length <= 6) return { html: "Prices:<ul>" + list(hits) + "</ul>", chips: chipsFor(hits) };
    }

    if (has(t, /\b(hours?|open|close|closing|opening|time|when)\b/) && !has(t, /\b(reserve|book)\b/)) {
      const s = DR.openStatus();
      return { html: `We are open every day, ${DR.fmtTime(CONFIG.open)} to ${DR.fmtTime(CONFIG.close)}. Right now: <b>${esc(s.text)}</b>.` };
    }
    if (has(t, /\b(where|address|location|directions?|find you)\b/))
      return { html: `You can find us at <b>${esc(CONFIG.address)}</b>.` };
    if (has(t, /\b(phone|call|contact|whatsapp|number|email)\b/))
      return { html: `Call <a href="tel:${esc(CONFIG.phone.replace(/\s/g, ""))}">${esc(CONFIG.phone)}</a> or <a href="${DR.wa("Hello Dragon Restaurant")}" target="_blank" rel="noopener">message us on WhatsApp</a>.` };
    if (has(t, /\b(deliver|delivery|takeaway|take away|pickup|pick up)\b/))
      return { html: `We offer dine-in, takeaway and delivery. Delivery is ${DR.fmt(CONFIG.deliveryFee)} (free over ${DR.fmt(CONFIG.freeDeliveryOver)}), with a minimum order of ${DR.fmt(CONFIG.minDelivery)}.` };
    if (has(t, /\b(pay|payment|cash|card|visa|master)\b/))
      return { html: "You can pay by cash or card, at the counter or on delivery." };
    if (has(t, /\b(reserve|reservation|book|booking|table)\b/))
      return { html: `You can book a table in the <a href="index.html#reserve">Reserve section</a>. It takes under a minute.` };
    if (has(t, /\b(promo|coupon|discount|offer|code|deal)\b/))
      return { html: "Enter a promo code at checkout. Try <b>" + Object.keys(CONFIG.promoCodes)[0] + "</b> for " + Object.values(CONFIG.promoCodes)[0] + "% off." };
    if (has(t, /\b(veg|vegetarian|vegan|no meat|meatless)\b/)) {
      const v = MENU.filter((m) => m.veg);
      return { html: "Vegetarian dishes:<ul>" + list(v.slice(0, 8)) + "</ul>Ask me to add any of them.", chips: chipsFor(v) };
    }
    if (has(t, /\b(spicy|hot|heat)\b/)) {
      const s = MENU.filter((m) => m.spicy === 3);
      return { html: "Our hottest dishes:<ul>" + list(s) + "</ul>", chips: chipsFor(s) };
    }
    if (has(t, /\b(mild|not spicy|kids?|children)\b/)) {
      const s = MENU.filter((m) => m.spicy <= 1 && m.category !== "Beverages" && m.category !== "Desserts").slice(0, 6);
      return { html: "Mild dishes that suit kids:<ul>" + list(s) + "</ul>", chips: chipsFor(s) };
    }
    if (has(t, /\b(popular|best|recommend|recommendation|suggest|special|favou?rite|signature)\b/)) {
      const p = MENU.filter((m) => m.popular);
      return { html: "Guest favourites:<ul>" + list(p) + "</ul>", chips: chipsFor(p) };
    }
    if (has(t, /\b(dessert|sweet)\b/)) return catReply("Desserts");
    if (has(t, /\b(drink|drinks|beverage|beverages|juice)\b/)) return catReply("Beverages");
    if (has(t, /\b(menu|categories|what do you have|food)\b/))
      return { html: "We serve: " + CATEGORIES.join(", ") + ". Ask about any of them, or open the <a href=\"index.html#menu\">full menu</a>.", chips: ["Kottu", "Rice & Curry", "Seafood", "Desserts"] };

    for (const c of CATEGORIES) {
      const words = norm(c).split(" ").filter((x) => x !== "and").map(stem);
      if (words.some((wd) => wd.length > 3 && t.split(" ").map(stem).includes(wd))) return catReply(c);
    }

    if (has(t, /\b(thanks|thank you|thx|great|ok|okay)\b/)) return { html: "You're welcome! Anything else I can help with?" };
    if (has(t, /\b(bye|goodbye)\b/)) return { html: "Bye! Enjoy your meal." };

    // last try: the message might just be a dish name
    const hits = findItems(raw);
    if (hits.length === 1) {
      const m = hits[0];
      return { html: `<b>${esc(m.name)}</b>, ${DR.fmt(m.price)}. ${esc(m.desc)}`, chips: ["Add " + m.name] };
    }
    if (hits.length > 1 && hits.length <= 6)
      return { html: "I found these:<ul>" + list(hits) + "</ul>", chips: chipsFor(hits) };

    return { html: "I'm not sure about that one. I can help with the menu, prices, hours, delivery, reservations and your cart.", chips: ["Popular dishes", "Opening hours", "Delivery info", "Show my cart"] };
  }

  function catReply(cat) {
    const items = MENU.filter((m) => m.category === cat);
    return { html: `<b>${esc(cat)}</b><ul>${list(items)}</ul>`, chips: chipsFor(items) };
  }

  /* ---------- UI ---------- */
  let built = false;
  function mount() {
    if (built) return;
    built = true;
    const root = document.createElement("div");
    root.className = "chat-root";
    root.innerHTML = `
      <button class="chat-fab" id="chatFab" type="button" aria-label="Open chat assistant" aria-expanded="false">
        <i class="fa-regular fa-comment-dots"></i><span>Ask us</span>
      </button>
      <section class="chat-panel" id="chatPanel" aria-label="Restaurant assistant" hidden>
        <header><strong>Restaurant assistant</strong>
          <button class="icon-btn sm" id="chatClose" type="button" aria-label="Close chat"><i class="fa-solid fa-xmark"></i></button></header>
        <div class="chat-log" id="chatLog" aria-live="polite"></div>
        <div class="chat-chips" id="chatChips"></div>
        <form class="chat-form" id="chatForm" autocomplete="off">
          <input id="chatInput" type="text" placeholder="Ask about the menu, hours, delivery" aria-label="Your message" maxlength="200">
          <button class="btn btn-lacquer" type="submit">Send</button>
        </form>
      </section>`;
    document.body.appendChild(root);

    const fab = root.querySelector("#chatFab"), panel = root.querySelector("#chatPanel");
    const log = root.querySelector("#chatLog"), chips = root.querySelector("#chatChips");
    const input = root.querySelector("#chatInput");

    const say = (html, who) => {
      const d = document.createElement("div");
      d.className = "msg " + who;
      if (who === "me") d.textContent = html; else d.innerHTML = html;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    };
    const setChips = (arr) => {
      chips.innerHTML = "";
      (arr || []).forEach((c) => {
        const b = document.createElement("button");
        b.type = "button"; b.textContent = c;
        b.addEventListener("click", () => ask(c));
        chips.appendChild(b);
      });
    };
    function ask(text) {
      say(text, "me");
      setChips([]);
      const typing = say("<span class='dots'><i></i><i></i><i></i></span>", "bot");
      setTimeout(() => {
        typing.remove();
        const r = reply(text);
        say(r.html, "bot");
        setChips(r.chips || ["Popular dishes", "Opening hours", "Show my cart"]);
      }, 450);
    }
    function toggle(open) {
      panel.hidden = !open;
      fab.setAttribute("aria-expanded", String(open));
      if (open) {
        if (!log.children.length) {
          say("Hello! Welcome to " + esc(CONFIG.name) + ". What can I help you with?", "bot");
          setChips(["Popular dishes", "Vegetarian options", "Opening hours", "Delivery info"]);
        }
        input.focus();
      }
    }
    fab.addEventListener("click", () => toggle(panel.hidden));
    root.querySelector("#chatClose").addEventListener("click", () => toggle(false));
    root.querySelector("#chatForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (v) { input.value = ""; ask(v); }
    });
  }

  w.DRChat = { mount, reply };
})(window);
