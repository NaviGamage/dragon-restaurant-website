/* ==========================================================
   Layout: header, footer, cart drawer, dark mode, global cart buttons
   (Rendered by JavaScript so it also works when you open the
   files directly, without a web server.)
   ========================================================== */
(function (w) {
  "use strict";
  const esc = DR.esc;

  function headerHTML(page) {
    const base = page === "home" ? "" : "index.html";
    const active = (p) => (page === p ? ' aria-current="page"' : "");
    return `
<a class="skip-link" href="#main">Skip to content</a>
<nav class="navbar navbar-expand-lg dr-nav fixed-top" aria-label="Main">
  <div class="container">
    <a class="navbar-brand" href="index.html">
      <span class="brand-mark"><span aria-hidden="true">龍</span><img src="images/logo.jpg" alt="" onerror="this.remove()"></span>
      <span class="brand-name">${esc(CONFIG.name)}</span>
    </a>
    <div class="d-flex align-items-center gap-2 order-lg-3">
      <button class="icon-btn" id="themeBtn" type="button" aria-label="Switch dark mode"><i class="fa-solid fa-moon"></i></button>
      <button class="icon-btn cart-btn" id="cartBtn" type="button" aria-label="Open cart">
        <i class="fa-solid fa-basket-shopping"></i>
        <span class="cart-count" id="cartCount">0</span>
      </button>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
    </div>
    <div class="collapse navbar-collapse" id="navMain">
      <ul class="navbar-nav ms-auto me-lg-3">
        <li class="nav-item"><a class="nav-link"${active("home")} href="${base}#home">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="${base}#menu">Menu</a></li>
        <li class="nav-item"><a class="nav-link" href="${base}#reserve">Reserve</a></li>
        <li class="nav-item"><a class="nav-link" href="${base}#about">About</a></li>
        <li class="nav-item"><a class="nav-link" href="${base}#contact">Contact</a></li>
        <li class="nav-item"><a class="nav-link"${active("orders")} href="my-orders.html">My orders</a></li>
      </ul>
    </div>
  </div>
</nav>

<div class="drawer-overlay" id="cartOverlay"></div>
<aside class="cart-drawer" id="cartDrawer" aria-label="Your cart" aria-hidden="true">
  <div class="drawer-head">
    <h2>Your cart</h2>
    <button class="icon-btn" id="cartClose" type="button" aria-label="Close cart"><i class="fa-solid fa-xmark"></i></button>
  </div>
  <div class="drawer-body" id="cartBody"></div>
  <div class="drawer-foot" id="cartFoot"></div>
</aside>`;
  }

  function footerHTML() {
    return `
<footer class="dr-footer">
  <div class="container">
    <div class="row g-4">
      <div class="col-lg-4">
        <div class="foot-brand"><span class="brand-mark" aria-hidden="true">龍</span> ${esc(CONFIG.name)}</div>
        <p class="foot-note">${esc(CONFIG.tagline)}. Cooked to order, every time.</p>
      </div>
      <div class="col-6 col-lg-4">
        <h3>Visit us</h3>
        <p>${esc(CONFIG.address)}<br>Every day, ${DR.fmtTime(CONFIG.open)} to ${DR.fmtTime(CONFIG.close)}</p>
      </div>
      <div class="col-6 col-lg-4">
        <h3>Get in touch</h3>
        <p><a href="tel:${esc(CONFIG.phone.replace(/\s/g, ""))}">${esc(CONFIG.phone)}</a><br>
        <a href="${DR.wa("Hello Dragon Restaurant")}" target="_blank" rel="noopener">Message on WhatsApp</a><br>
        <a href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a></p>
      </div>
    </div>
    <div class="foot-bottom">
      <span>&copy; ${new Date().getFullYear()} ${esc(CONFIG.name)}</span>
      <a href="admin.html">Staff login</a>
    </div>
  </div>
</footer>`;
  }

  /* ---------- cart drawer ---------- */
  function renderCart() {
    const lines = DR.cart.lines();
    const count = DR.cart.count();
    const badge = document.getElementById("cartCount");
    if (badge) { badge.textContent = count; badge.classList.toggle("show", count > 0); }

    const body = document.getElementById("cartBody");
    const foot = document.getElementById("cartFoot");
    if (!body || !foot) return;

    if (!lines.length) {
      body.innerHTML = `<div class="empty-state"><i class="fa-solid fa-bowl-food"></i>
        <p>Your cart is empty.</p><a class="btn btn-lacquer" href="index.html#menu" data-close-cart>Browse the menu</a></div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = lines.map((l) => `
      <div class="cart-line">
        <div class="cart-line-info">
          <strong>${esc(l.item.name)}</strong>
          <span>${DR.fmt(l.item.price)} each</span>
        </div>
        <div class="stepper" role="group" aria-label="Quantity of ${esc(l.item.name)}">
          <button type="button" data-cart="dec" data-id="${l.item.id}" aria-label="Decrease">&minus;</button>
          <span>${l.qty}</span>
          <button type="button" data-cart="inc" data-id="${l.item.id}" aria-label="Increase">+</button>
        </div>
        <div class="cart-line-total">${DR.fmt(l.total)}</div>
        <button class="icon-btn sm" type="button" data-cart="del" data-id="${l.item.id}" aria-label="Remove ${esc(l.item.name)}"><i class="fa-regular fa-trash-can"></i></button>
      </div>`).join("");
    foot.innerHTML = `
      <div class="sum-row"><span>Subtotal</span><strong>${DR.fmt(DR.cart.subtotal())}</strong></div>
      <p class="small-note">Service charge, delivery fee and promo codes are applied at checkout.</p>
      <a class="btn btn-lacquer w-100" href="order-view.html">Go to checkout</a>
      <button class="btn btn-link w-100 text-muted" type="button" data-cart="clear">Clear cart</button>`;
  }

  function openCart() {
    document.getElementById("cartDrawer").classList.add("open");
    document.getElementById("cartOverlay").classList.add("open");
    document.getElementById("cartDrawer").setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    document.getElementById("cartClose").focus();
  }
  function closeCart() {
    document.getElementById("cartDrawer").classList.remove("open");
    document.getElementById("cartOverlay").classList.remove("open");
    document.getElementById("cartDrawer").setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-bs-theme", t);
    const b = document.getElementById("themeBtn");
    if (b) {
      b.innerHTML = t === "dark" ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  function init(page) {
    const h = document.getElementById("header");
    const f = document.getElementById("footer");
    if (h) h.innerHTML = headerHTML(page);
    if (f) f.innerHTML = footerHTML();

    applyTheme(localStorage.getItem(DR.K.theme) || "light");
    document.getElementById("themeBtn").addEventListener("click", () => {
      const t = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(DR.K.theme, t);
      applyTheme(t);
    });

    document.getElementById("cartBtn").addEventListener("click", openCart);
    document.getElementById("cartClose").addEventListener("click", closeCart);
    document.getElementById("cartOverlay").addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

    // close mobile nav after choosing a link
    document.querySelectorAll("#navMain .nav-link").forEach((a) => a.addEventListener("click", () => {
      const nav = document.getElementById("navMain");
      if (nav.classList.contains("show") && w.bootstrap) w.bootstrap.Collapse.getOrCreateInstance(nav).hide();
    }));

    // one click handler for every add / + / - / remove button on the site
    document.addEventListener("click", (e) => {
      const closeLink = e.target.closest("[data-close-cart]");
      if (closeLink) closeCart();

      const b = e.target.closest("[data-cart]");
      if (!b) return;
      const act = b.dataset.cart;
      const id = Number(b.dataset.id);
      if (act === "add") {
        if (DR.cart.add(id, 1)) DR.toast("Added " + DR.byId(id).name);
        else DR.toast("Sorry, that dish is not available right now", "warn");
      } else if (act === "inc") DR.cart.add(id, 1);
      else if (act === "dec") DR.cart.setQty(id, DR.cart.qty(id) - 1);
      else if (act === "del") DR.cart.remove(id);
      else if (act === "clear") DR.cart.clear();
    });

    document.addEventListener("cart:change", renderCart);
    renderCart();

    if (w.DRChat) w.DRChat.mount();
  }

  w.Layout = { init, openCart, closeCart, renderCart };
})(window);
