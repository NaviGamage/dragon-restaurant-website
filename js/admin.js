/* ==========================================================
   Staff dashboard.
   NOTE: this runs in the browser only. The PIN is a convenience
   lock, not real security, and the data lives in this browser.
   For a real shop connect a backend (see README).
   ========================================================== */
(function () {
  "use strict";
  const esc = DR.esc;
  const $ = (id) => document.getElementById(id);
  const ORDER_STATUS = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];
  const RES_STATUS = ["Pending", "Confirmed", "Cancelled"];

  let tab = "orders";
  let orderFilter = "All";
  const expanded = new Set();

  /* ---------- login ---------- */
  const isIn = () => sessionStorage.getItem("dr_admin") === "1";
  function gate() {
    $("loginView").hidden = isIn();
    $("dashView").hidden = !isIn();
    if (isIn()) render(); else $("pin").focus();
  }
  $("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("pin").value === CONFIG.adminPin) { sessionStorage.setItem("dr_admin", "1"); $("pin").value = ""; gate(); }
    else DR.fieldError($("pin"), "Wrong PIN");
  });
  $("logoutBtn").addEventListener("click", () => { sessionStorage.removeItem("dr_admin"); gate(); });

  /* ---------- stats ---------- */
  const sameDay = (iso) => new Date(iso).toDateString() === new Date().toDateString();
  function stats() {
    const orders = DR.orders.all();
    const todays = orders.filter((o) => sameDay(o.createdAt) && o.status !== "Cancelled");
    const revenue = todays.reduce((s, o) => s + o.totals.total, 0);
    const pending = orders.filter((o) => o.status === "Pending").length;
    const upcoming = DR.ls.get(DR.K.res, []).filter((r) => r.status !== "Cancelled" && r.date >= new Date().toISOString().slice(0, 10)).length;
    const box = (n, l) => `<div class="col-6 col-lg-3"><div class="stat"><b>${n}</b><span>${l}</span></div></div>`;
    $("stats").innerHTML = box(todays.length, "Orders today") + box(DR.fmt(revenue), "Sales today") +
      box(pending, "Waiting for the kitchen") + box(upcoming, "Upcoming reservations");
  }

  /* ---------- tabs ---------- */
  const statusSelect = (list, cur, kind, id) =>
    `<select class="form-select" data-kind="${kind}" data-id="${esc(id)}" aria-label="Status">` +
    list.map((s) => `<option ${s === cur ? "selected" : ""}>${s}</option>`).join("") + "</select>";

  function ordersTab() {
    let orders = DR.orders.all();
    const filterHtml = `<div class="d-flex flex-wrap gap-2 align-items-center mb-3">
      <label class="me-1" for="ofilter">Show</label>
      <select class="form-select w-auto" id="ofilter">${["All"].concat(ORDER_STATUS).map((s) => `<option ${s === orderFilter ? "selected" : ""}>${s}</option>`).join("")}</select>
      <button class="btn btn-outline-jade ms-auto" type="button" data-act="csv"><i class="fa-solid fa-file-csv"></i> Export CSV</button></div>`;
    if (orderFilter !== "All") orders = orders.filter((o) => o.status === orderFilter);
    if (!orders.length) return filterHtml + `<div class="empty-state"><p>No orders to show.</p></div>`;
    return filterHtml + `<div class="table-responsive"><table class="admin-table"><thead><tr>
      <th>Order</th><th>Time</th><th>Customer</th><th>Type</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>` +
      orders.map((o) => `
        <tr>
          <td><b>${esc(o.id)}</b></td><td>${DR.fmtDateTime(o.createdAt)}</td>
          <td>${esc(o.customer.name)}<br><a href="tel:${esc(o.customer.phone)}">${esc(o.customer.phone)}</a></td>
          <td>${DR.typeLabel[o.type]}</td><td>${DR.fmt(o.totals.total)}</td>
          <td>${statusSelect(ORDER_STATUS, o.status, "order", o.id)}</td>
          <td class="text-nowrap">
            <button class="btn btn-sm btn-outline-jade" data-act="toggle" data-id="${esc(o.id)}">${expanded.has(o.id) ? "Hide" : "Details"}</button>
            <button class="btn btn-sm btn-outline-jade" data-act="del-order" data-id="${esc(o.id)}" aria-label="Delete order ${esc(o.id)}"><i class="fa-regular fa-trash-can"></i></button>
          </td>
        </tr>
        ${expanded.has(o.id) ? `<tr class="detail"><td colspan="7">
          ${o.items.map((i) => `${i.qty} &times; ${esc(i.name)} (${DR.fmt(i.price * i.qty)})`).join("<br>")}
          <hr class="my-2">Payment: ${o.payment === "card" ? "Card" : "Cash"}
          ${o.customer.address ? "<br>Address: " + esc(o.customer.address) : ""}
          ${o.customer.table ? "<br>Table: " + esc(o.customer.table) : ""}
          ${o.customer.notes ? "<br>Notes: " + esc(o.customer.notes) : ""}
          ${o.promo ? "<br>Promo: " + esc(o.promo) : ""}</td></tr>` : ""}`).join("") +
      `</tbody></table></div>`;
  }

  function reservationsTab() {
    const rs = DR.ls.get(DR.K.res, []);
    if (!rs.length) return `<div class="empty-state"><p>No reservations yet.</p></div>`;
    return `<div class="table-responsive"><table class="admin-table"><thead><tr>
      <th>Ref</th><th>Guest</th><th>When</th><th>Guests</th><th>Note</th><th>Status</th><th></th></tr></thead><tbody>` +
      rs.map((r) => `<tr>
        <td><b>${esc(r.id)}</b></td>
        <td>${esc(r.name)}<br><a href="tel:${esc(r.phone)}">${esc(r.phone)}</a></td>
        <td>${esc(r.date)}<br>${DR.fmtTime(r.time)}</td><td>${r.guests}</td><td>${esc(r.note) || "-"}</td>
        <td>${statusSelect(RES_STATUS, r.status, "res", r.id)}</td>
        <td><button class="btn btn-sm btn-outline-jade" data-act="del-res" data-id="${esc(r.id)}" aria-label="Delete reservation"><i class="fa-regular fa-trash-can"></i></button></td>
      </tr>`).join("") + `</tbody></table></div>`;
  }

  function messagesTab() {
    const ms = DR.ls.get(DR.K.msgs, []);
    if (!ms.length) return `<div class="empty-state"><p>No messages yet.</p></div>`;
    return ms.map((m) => `
      <div class="order-card">
        <header><div><b>${esc(m.name)}</b> &middot; <a href="mailto:${esc(m.email)}">${esc(m.email)}</a><br><small class="text-muted">${DR.fmtDateTime(m.createdAt)}</small></div>
        <button class="btn btn-sm btn-outline-jade" data-act="del-msg" data-id="${esc(m.id)}" aria-label="Delete message"><i class="fa-regular fa-trash-can"></i></button></header>
        <p class="mb-0" style="white-space:pre-wrap">${esc(m.message)}</p>
      </div>`).join("");
  }

  function menuTab() {
    return `<p class="text-muted">Switch a dish off when it runs out. Customers will see it as sold out and cannot add it to their cart.</p>
      <div class="table-responsive"><table class="admin-table"><thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Available</th></tr></thead><tbody>` +
      MENU.map((m) => `<tr><td>${m.emoji} ${esc(m.name)}</td><td>${esc(m.category)}</td><td>${DR.fmt(m.price)}</td>
        <td><label class="switch"><input type="checkbox" data-kind="avail" data-id="${m.id}" ${DR.isSoldOut(m.id) ? "" : "checked"}> <span>${DR.isSoldOut(m.id) ? "Sold out" : "On sale"}</span></label></td></tr>`).join("") +
      `</tbody></table></div>`;
  }

  function settingsTab() {
    return `<div class="panel"><h2 class="h5">Data on this device</h2>
      <p class="text-muted">Orders, reservations and messages are stored in this browser only. Export orders as CSV regularly.</p>
      <button class="btn btn-outline-jade" type="button" data-act="csv">Export orders (CSV)</button>
      <button class="btn btn-lacquer ms-2" type="button" data-act="wipe">Delete all orders, reservations and messages</button></div>`;
  }

  function render() {
    stats();
    document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    $("tabBody").innerHTML = { orders: ordersTab, reservations: reservationsTab, messages: messagesTab, menu: menuTab, settings: settingsTab }[tab]();
  }

  /* ---------- CSV ---------- */
  function exportCsv() {
    const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const rows = [["Order ID", "Created", "Status", "Type", "Payment", "Name", "Phone", "Address", "Items", "Subtotal", "Discount", "Service", "Delivery", "Total"]];
    DR.orders.all().forEach((o) => rows.push([
      o.id, o.createdAt, o.status, o.type, o.payment, o.customer.name, o.customer.phone, o.customer.address,
      o.items.map((i) => i.qty + "x " + i.name).join("; "),
      o.totals.subtotal, o.totals.discount, o.totals.service, o.totals.delivery, o.totals.total
    ]));
    const blob = new Blob(["\ufeff" + rows.map((r) => r.map(q).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "dragon-orders-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- events ---------- */
  document.querySelector(".admin-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (b) { tab = b.dataset.tab; render(); }
  });

  $("tabBody").addEventListener("change", (e) => {
    const t = e.target;
    if (t.id === "ofilter") { orderFilter = t.value; render(); return; }
    if (t.dataset.kind === "order") { DR.orders.update(t.dataset.id, { status: t.value }); DR.toast("Order updated"); }
    else if (t.dataset.kind === "res") {
      const rs = DR.ls.get(DR.K.res, []).map((r) => (r.id === t.dataset.id ? Object.assign({}, r, { status: t.value }) : r));
      DR.ls.set(DR.K.res, rs); render();
    } else if (t.dataset.kind === "avail") { DR.toggleSoldOut(t.dataset.id); render(); }
  });

  $("tabBody").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const id = b.dataset.id;
    switch (b.dataset.act) {
      case "toggle": expanded.has(id) ? expanded.delete(id) : expanded.add(id); render(); break;
      case "del-order": if (confirm("Delete order " + id + "?")) { DR.orders.remove(id); render(); } break;
      case "del-res": if (confirm("Delete this reservation?")) { DR.ls.set(DR.K.res, DR.ls.get(DR.K.res, []).filter((r) => r.id !== id)); render(); } break;
      case "del-msg": DR.ls.set(DR.K.msgs, DR.ls.get(DR.K.msgs, []).filter((m) => m.id !== id)); render(); break;
      case "csv": exportCsv(); break;
      case "wipe":
        if (confirm("Delete ALL orders, reservations and messages on this device? This cannot be undone.")) {
          [DR.K.orders, DR.K.res, DR.K.msgs].forEach((k) => localStorage.removeItem(k));
          render(); DR.toast("All data deleted");
        }
        break;
    }
  });

  // new orders placed in another tab show up here automatically
  document.addEventListener("data:change", () => { if (isIn()) render(); });
  document.addEventListener("menu:change", () => { if (isIn() && tab === "menu") render(); });

  gate();
})();
