/* ==========================================================
   Checkout page (order-view.html)
   ========================================================== */
(function () {
  "use strict";
  Layout.init("checkout");
  const esc = DR.esc;
  const $ = (id) => document.getElementById(id);

  let promo = "";       // applied promo code
  let placed = false;   // true once the order is confirmed (cart is then empty on purpose)

  const type = () => document.querySelector('input[name="type"]:checked').value;

  function showView(name) {
    ["emptyView", "checkoutView", "successView"].forEach((v) => { $(v).hidden = v !== name; });
  }

  function renderLines() {
    $("coLines").innerHTML = DR.cart.lines().map((l) => `
      <div class="co-line">
        <div><strong>${esc(l.item.name)}</strong><small>${DR.fmt(l.item.price)} each</small></div>
        <div class="stepper" role="group" aria-label="Quantity of ${esc(l.item.name)}">
          <button type="button" data-cart="dec" data-id="${l.item.id}" aria-label="Decrease">&minus;</button>
          <span>${l.qty}</span>
          <button type="button" data-cart="inc" data-id="${l.item.id}" aria-label="Increase">+</button>
        </div>
        <div class="lt">${DR.fmt(l.total)}</div>
      </div>`).join("");
  }

  function renderSummary() {
    const t = DR.totals(type(), promo);
    const row = (a, b, cls) => `<div class="row-s ${cls || ""}"><span>${a}</span><span>${b}</span></div>`;
    $("sumRows").innerHTML =
      row("Subtotal", DR.fmt(t.subtotal)) +
      (t.discount ? row("Promo " + esc(promo.toUpperCase()) + " (" + t.pct + "%)", "&minus;" + DR.fmt(t.discount), "disc") : "") +
      (t.service ? row("Service charge (" + CONFIG.serviceChargePct + "%)", DR.fmt(t.service)) : "") +
      (type() === "delivery" ? row("Delivery fee", t.delivery ? DR.fmt(t.delivery) : "Free") : "") +
      row("Total", DR.fmt(t.total), "total");
  }

  function renderHints() {
    const tp = type();
    $("addrWrap").hidden = tp !== "delivery";
    $("tableWrap").hidden = tp !== "dine-in";
    $("typeHint").textContent = {
      "dine-in": "A " + CONFIG.serviceChargePct + "% service charge is added to dine-in orders.",
      takeaway: "Collect from the counter. Pay when you pick up.",
      delivery: "Delivery is " + DR.fmt(CONFIG.deliveryFee) + ", free over " + DR.fmt(CONFIG.freeDeliveryOver) +
        ". Minimum order " + DR.fmt(CONFIG.minDelivery) + "."
    }[tp];
  }

  function render() {
    if (placed) return;
    if (!DR.cart.count()) { showView("emptyView"); return; }
    showView("checkoutView");
    renderLines();
    renderHints();
    renderSummary();
  }

  /* ---------- promo ---------- */
  $("promoBtn").addEventListener("click", () => {
    const code = $("promoIn").value.trim().toUpperCase();
    const msg = $("promoMsg");
    if (!code) { promo = ""; msg.textContent = ""; renderSummary(); return; }
    if (CONFIG.promoCodes[code]) {
      promo = code;
      msg.textContent = "Code applied: " + CONFIG.promoCodes[code] + "% off.";
      msg.style.color = "#2a9d4b";
    } else {
      promo = "";
      msg.textContent = "That code is not valid.";
      msg.style.color = "var(--lacquer)";
    }
    renderSummary();
  });
  $("promoIn").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("promoBtn").click(); } });

  document.querySelectorAll('input[name="type"]').forEach((r) => r.addEventListener("change", () => { renderHints(); renderSummary(); }));
  document.addEventListener("cart:change", render);

  /* ---------- prefill from last order ---------- */
  const prof = DR.ls.get(DR.K.profile, null);
  if (prof) {
    $("oName").value = prof.name || "";
    $("oPhone").value = prof.phone || "";
    $("oAddr").value = prof.address || "";
  }

  /* ---------- place order ---------- */
  function showError(msg) {
    const e = $("formError");
    e.hidden = !msg;
    e.textContent = msg || "";
  }

  $("placeBtn").addEventListener("click", () => {
    showError("");
    const name = $("oName"), phone = $("oPhone"), addr = $("oAddr");
    const tp = type();
    let ok = true;
    ok = DR.fieldError(name, name.value.trim().length < 2 ? "Please enter your name" : "") && ok;
    ok = DR.fieldError(phone, DR.validPhone(phone.value) ? "" : "Enter a valid phone number, e.g. 077 123 4567") && ok;
    ok = DR.fieldError(addr, tp === "delivery" && addr.value.trim().length < 8 ? "Please enter your full delivery address" : "") && ok;
    if (!ok) { showError("Please fix the highlighted fields."); return; }

    const t = DR.totals(tp, promo);
    if (tp === "delivery" && t.subtotal < CONFIG.minDelivery) {
      showError("The minimum for delivery is " + DR.fmt(CONFIG.minDelivery) + ". Add " + DR.fmt(CONFIG.minDelivery - t.subtotal) + " more, or choose takeaway.");
      return;
    }
    if (DR.cart.lines().some((l) => DR.isSoldOut(l.item.id))) {
      showError("One of the dishes in your cart just sold out. Please remove it and try again.");
      return;
    }

    const order = {
      id: DR.uid("DR"),
      createdAt: new Date().toISOString(),
      status: "Pending",
      type: tp,
      payment: $("oPay").value,
      promo: promo,
      customer: {
        name: name.value.trim(),
        phone: phone.value.trim(),
        address: tp === "delivery" ? addr.value.trim() : "",
        table: tp === "dine-in" ? $("oTable").value.trim() : "",
        notes: $("oNotes").value.trim()
      },
      items: DR.cart.lines().map((l) => ({ id: l.item.id, name: l.item.name, price: l.item.price, qty: l.qty })),
      totals: t
    };

    DR.orders.add(order);
    DR.ls.set(DR.K.profile, { name: order.customer.name, phone: order.customer.phone, address: addr.value.trim() });

    placed = true;
    DR.cart.clear();
    $("receipt").innerHTML = DR.receiptHTML(order);
    $("waSend").href = DR.wa(DR.orderText(order));
    showView("successView");
    window.scrollTo({ top: 0 });
  });

  $("printBtn").addEventListener("click", () => window.print());

  render();
})();
