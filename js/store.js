/* ==========================================================
   Shared helpers: storage, cart, orders, totals, toasts
   Everything is saved in the browser (localStorage).
   ========================================================== */
(function (w) {
  "use strict";

  const K = {
    cart: "dr_cart",
    orders: "dr_orders",
    res: "dr_reservations",
    msgs: "dr_messages",
    sold: "dr_soldout",
    theme: "dr_theme",
    profile: "dr_profile"
  };

  const ls = {
    get(k, d) {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : d;
      } catch (e) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ }
    }
  };

  const byId = (id) => MENU.find((m) => m.id === Number(id));
  const emit = (name) => document.dispatchEvent(new CustomEvent(name));

  const DR = {
    K, ls, byId,

    fmt: (n) => CONFIG.currency + " " + Number(n).toLocaleString("en-US"),

    esc: (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    )),

    uid: (prefix) =>
      prefix + "-" + Date.now().toString(36).toUpperCase().slice(-5) +
      Math.random().toString(36).slice(2, 4).toUpperCase(),

    fmtTime(hhmm) {
      const [h, m] = hhmm.split(":").map(Number);
      const ap = h >= 12 ? "PM" : "AM";
      return ((h + 11) % 12 + 1) + ":" + String(m).padStart(2, "0") + " " + ap;
    },

    fmtDateTime(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " +
        d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    },

    openStatus() {
      const t = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const open = mins >= t(CONFIG.open) && mins < t(CONFIG.close);
      return {
        open,
        text: open
          ? "Open now, until " + DR.fmtTime(CONFIG.close)
          : "Closed now, opens at " + DR.fmtTime(CONFIG.open)
      };
    },

    wa: (text) => "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text),

    validPhone: (v) => /^(\+?94|0)?\d{9}$/.test(String(v).replace(/[\s-]/g, "")),
    validEmail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()),

    /* show / clear an error under an input. returns true when valid */
    fieldError(el, msg) {
      el.classList.toggle("is-invalid", !!msg);
      let fb = el.parentElement.querySelector(".invalid-feedback");
      if (!fb) {
        fb = document.createElement("div");
        fb.className = "invalid-feedback";
        el.parentElement.appendChild(fb);
      }
      fb.textContent = msg || "";
      return !msg;
    },

    toast(msg, type) {
      let box = document.getElementById("toastBox");
      if (!box) {
        box = document.createElement("div");
        box.id = "toastBox";
        box.className = "toast-box";
        box.setAttribute("role", "status");
        box.setAttribute("aria-live", "polite");
        document.body.appendChild(box);
      }
      const t = document.createElement("div");
      t.className = "dr-toast " + (type || "ok");
      t.textContent = msg;
      box.appendChild(t);
      setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 2600);
    },

    /* ---------- sold-out flags (set from the admin page) ---------- */
    isSoldOut: (id) => ls.get(K.sold, []).includes(Number(id)),
    toggleSoldOut(id) {
      let a = ls.get(K.sold, []);
      id = Number(id);
      a = a.includes(id) ? a.filter((x) => x !== id) : a.concat(id);
      ls.set(K.sold, a);
      emit("menu:change");
    },

    /* ---------- cart ---------- */
    cart: {
      get() { return ls.get(K.cart, []).filter((l) => byId(l.id)); },
      save(c) { ls.set(K.cart, c); emit("cart:change"); },
      qty(id) { const l = this.get().find((x) => x.id === Number(id)); return l ? l.qty : 0; },
      add(id, q) {
        id = Number(id); q = q || 1;
        if (!byId(id) || DR.isSoldOut(id)) return false;
        const c = this.get();
        const l = c.find((x) => x.id === id);
        if (l) l.qty = Math.min(20, l.qty + q); else c.push({ id, qty: Math.min(20, q) });
        this.save(c);
        return true;
      },
      setQty(id, q) {
        id = Number(id);
        let c = this.get();
        const l = c.find((x) => x.id === id);
        if (!l) return;
        if (q <= 0) c = c.filter((x) => x.id !== id); else l.qty = Math.min(20, q);
        this.save(c);
      },
      remove(id) { this.setQty(id, 0); },
      clear() { this.save([]); },
      count() { return this.get().reduce((s, l) => s + l.qty, 0); },
      lines() {
        return this.get().map((l) => {
          const item = byId(l.id);
          return { item, qty: l.qty, total: item.price * l.qty };
        });
      },
      subtotal() { return this.lines().reduce((s, l) => s + l.total, 0); }
    },

    /* type: dine-in | takeaway | delivery */
    totals(type, promo) {
      const subtotal = DR.cart.subtotal();
      const pct = CONFIG.promoCodes[String(promo || "").trim().toUpperCase()] || 0;
      const discount = Math.round(subtotal * pct / 100);
      const service = type === "dine-in" ? Math.round((subtotal - discount) * CONFIG.serviceChargePct / 100) : 0;
      const delivery = type === "delivery" && subtotal > 0 && subtotal < CONFIG.freeDeliveryOver ? CONFIG.deliveryFee : 0;
      return { subtotal, pct, discount, service, delivery, total: subtotal - discount + service + delivery };
    },

    /* ---------- orders ---------- */
    orders: {
      all() { return ls.get(K.orders, []); },
      add(o) { const a = this.all(); a.unshift(o); ls.set(K.orders, a); emit("data:change"); },
      update(id, patch) {
        const a = this.all().map((o) => (o.id === id ? Object.assign({}, o, patch) : o));
        ls.set(K.orders, a); emit("data:change");
      },
      remove(id) { ls.set(K.orders, this.all().filter((o) => o.id !== id)); emit("data:change"); }
    },

    orderText(o) {
      const lines = o.items.map((i) => "- " + i.qty + " x " + i.name + " (" + DR.fmt(i.price * i.qty) + ")");
      const typeLabel = { "dine-in": "Dine-in", takeaway: "Takeaway", delivery: "Delivery" }[o.type];
      const out = [
        "New order " + o.id,
        typeLabel + " | " + o.customer.name + " | " + o.customer.phone,
        "",
        lines.join("\n"),
        "",
        "Total: " + DR.fmt(o.totals.total) + " (" + (o.payment === "card" ? "Card" : "Cash") + ")"
      ];
      if (o.type === "delivery") out.push("Address: " + o.customer.address);
      if (o.customer.notes) out.push("Notes: " + o.customer.notes);
      return out.join("\n");
    }
  };

  DR.typeLabel = { "dine-in": "Dine-in", takeaway: "Takeaway", delivery: "Delivery" };

  DR.receiptHTML = function (o) {
    const t = o.totals;
    const row = (l, v, cls) => `<tr class="${cls || ""}"><td>${l}</td><td>${v}</td></tr>`;
    return `
      <h2>${DR.esc(CONFIG.name)}</h2>
      <p class="text-muted mb-3">${DR.esc(CONFIG.address)}<br>${DR.esc(CONFIG.phone)}</p>
      <p class="mb-3">Order <span class="rid">${DR.esc(o.id)}</span><br>
        ${DR.fmtDateTime(o.createdAt)} &middot; ${DR.typeLabel[o.type]} &middot; ${o.payment === "card" ? "Card" : "Cash"}<br>
        ${DR.esc(o.customer.name)}, ${DR.esc(o.customer.phone)}
        ${o.type === "delivery" ? "<br>" + DR.esc(o.customer.address) : ""}
        ${o.type === "dine-in" && o.customer.table ? "<br>Table " + DR.esc(o.customer.table) : ""}
        ${o.customer.notes ? "<br>Notes: " + DR.esc(o.customer.notes) : ""}</p>
      <table>
        ${o.items.map((i) => row(i.qty + " &times; " + DR.esc(i.name), DR.fmt(i.price * i.qty))).join("")}
        ${row("Subtotal", DR.fmt(t.subtotal))}
        ${t.discount ? row("Promo " + DR.esc(o.promo || "") + " (" + t.pct + "%)", "&minus;" + DR.fmt(t.discount)) : ""}
        ${t.service ? row("Service charge (" + CONFIG.serviceChargePct + "%)", DR.fmt(t.service)) : ""}
        ${t.delivery ? row("Delivery fee", DR.fmt(t.delivery)) : ""}
        ${row("Total", DR.fmt(t.total), "tot")}
      </table>`;
  };

  // keep tabs in sync (customer tab + admin tab in the same browser)
  w.addEventListener("storage", (e) => {
    if (e.key === K.cart) emit("cart:change");
    else if (e.key === K.sold) emit("menu:change");
    else if (e.key) emit("data:change");
  });

  w.DR = DR;
})(window);
