/* ==========================================================
   My orders: history, status, reorder, cancel
   ========================================================== */
(function () {
  "use strict";
  Layout.init("orders");
  const esc = DR.esc;
  const STEPS = ["Pending", "Preparing", "Ready", "Completed"];
  const open = new Set(); // order ids whose receipt is expanded

  function timeline(status) {
    if (status === "Cancelled") return "";
    const at = STEPS.indexOf(status);
    return `<div class="timeline" aria-label="Order progress">${STEPS.map((s, i) =>
      `<div class="step ${i <= at ? "done" : ""}">${s === "Pending" ? "Received" : s}</div>`).join("")}</div>`;
  }

  function render() {
    const list = document.getElementById("ordersList");
    const orders = DR.orders.all();
    if (!orders.length) {
      list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-receipt"></i>
        <p>You have not placed any orders on this device yet.</p>
        <a class="btn btn-lacquer" href="index.html#menu">Browse the menu</a></div>`;
      return;
    }
    list.innerHTML = orders.map((o) => `
      <article class="order-card" data-id="${esc(o.id)}">
        <header>
          <div><span class="rid">${esc(o.id)}</span><br><small class="text-muted">${DR.fmtDateTime(o.createdAt)} &middot; ${DR.typeLabel[o.type]}</small></div>
          <div class="text-end"><span class="badge-st ${esc(o.status)}">${esc(o.status)}</span><br><strong>${DR.fmt(o.totals.total)}</strong></div>
        </header>
        <div>${o.items.map((i) => `${i.qty} &times; ${esc(i.name)}`).join(", ")}</div>
        ${timeline(o.status)}
        <div class="d-flex flex-wrap gap-2 mt-3">
          <button class="btn btn-outline-jade btn-sm" type="button" data-act="reorder">Order again</button>
          <button class="btn btn-outline-jade btn-sm" type="button" data-act="receipt">${open.has(o.id) ? "Hide receipt" : "View receipt"}</button>
          <a class="btn btn-outline-jade btn-sm" target="_blank" rel="noopener" href="${DR.wa(DR.orderText(o))}"><i class="fa-brands fa-whatsapp"></i> Send to kitchen</a>
          ${o.status === "Pending" ? '<button class="btn btn-outline-jade btn-sm" type="button" data-act="cancel">Cancel order</button>' : ""}
        </div>
        ${open.has(o.id) ? `<div class="receipt mt-3">${DR.receiptHTML(o)}</div>` : ""}
      </article>`).join("");
  }

  document.getElementById("ordersList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const id = b.closest("[data-id]").dataset.id;
    const o = DR.orders.all().find((x) => x.id === id);
    if (!o) return;

    if (b.dataset.act === "reorder") {
      let added = 0;
      o.items.forEach((i) => { if (DR.cart.add(i.id, i.qty)) added++; });
      DR.toast(added ? "Added to your cart" : "Those dishes are not available right now", added ? "ok" : "warn");
      if (added) Layout.openCart();
    } else if (b.dataset.act === "receipt") {
      open.has(id) ? open.delete(id) : open.add(id);
      render();
    } else if (b.dataset.act === "cancel") {
      if (confirm("Cancel order " + id + "?")) { DR.orders.update(id, { status: "Cancelled" }); DR.toast("Order cancelled"); }
    }
  });

  document.addEventListener("data:change", render);
  render();
})();
