/* ==========================================================
   Home page: menu, hero picks, reservation, contact, reviews
   ========================================================== */
(function () {
  "use strict";
  Layout.init("home");
  const esc = DR.esc;
  const $ = (id) => document.getElementById(id);

  /* ---------- static info from CONFIG ---------- */
  $("scPct").textContent = CONFIG.serviceChargePct;
  $("delivText").textContent = "Delivered to your door for " + DR.fmt(CONFIG.deliveryFee) + ", free over " +
    DR.fmt(CONFIG.freeDeliveryOver) + ". Minimum order " + DR.fmt(CONFIG.minDelivery) + ".";
  $("hoursText").textContent = DR.fmtTime(CONFIG.open) + " to " + DR.fmtTime(CONFIG.close);
  $("addrText").textContent = CONFIG.address;
  $("phoneLink").textContent = CONFIG.phone;
  $("phoneLink").href = "tel:" + CONFIG.phone.replace(/\s/g, "");
  $("waLink").href = DR.wa("Hello Dragon Restaurant, I have a question.");

  function updateStatus() {
    const s = DR.openStatus();
    $("statusPill").classList.toggle("open", s.open);
    $("statusPill").lastElementChild.textContent = s.text;
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- hero: guest favourites ---------- */
  function renderPicks() {
    const picks = MENU.filter((m) => m.popular).slice(0, 3);
    $("heroPicks").innerHTML = picks.map((m) => `
      <div class="board-row">
        <span class="em" aria-hidden="true">${m.emoji}</span>
        <div class="nm"><strong>${esc(m.name)}</strong><span>${DR.fmt(m.price)}</span></div>
        <button class="btn-add" type="button" data-cart="add" data-id="${m.id}" ${DR.isSoldOut(m.id) ? "disabled" : ""}>Add</button>
      </div>`).join("");
  }
  renderPicks();

  /* ---------- menu ---------- */
  const state = { q: "", cat: "All", veg: false, sort: "popular", expanded: false };
  const INITIAL = 8;

  function chips() {
    $("menuChips").innerHTML = ["All"].concat(CATEGORIES).map((c) =>
      `<button type="button" class="chip ${state.cat === c ? "active" : ""}" data-cat="${esc(c)}" aria-pressed="${state.cat === c}">${esc(c)}</button>`
    ).join("");
  }

  function heat(n) {
    if (!n) return "";
    const label = ["", "Mild", "Medium", "Hot"][n];
    let icons = "";
    for (let i = 1; i <= 3; i++) icons += `<i class="fa-solid fa-pepper-hot ${i <= n ? "on" : ""}" ${i <= n ? 'style="color:var(--lacquer)"' : ""}></i>`;
    return `<span class="heat" title="${label}">${icons}<small>${label}</small></span>`;
  }

  function card(m) {
    const sold = DR.isSoldOut(m.id);
    const q = DR.cart.qty(m.id);
    const tone = "c" + (CATEGORIES.indexOf(m.category) % 5);
    const img = m.image ? `<img src="${esc(m.image)}" alt="${esc(m.name)}" loading="lazy" onerror="this.remove()">` : "";
    let control;
    if (sold) control = `<button class="btn-add" type="button" disabled>Unavailable</button>`;
    else if (q > 0) control = `
      <div class="stepper" role="group" aria-label="Quantity of ${esc(m.name)}">
        <button type="button" data-cart="dec" data-id="${m.id}" aria-label="Decrease">&minus;</button>
        <span>${q}</span>
        <button type="button" data-cart="inc" data-id="${m.id}" aria-label="Increase">+</button>
      </div>`;
    else control = `<button class="btn-add" type="button" data-cart="add" data-id="${m.id}">Add</button>`;

    return `
      <article class="dish ${sold ? "is-sold" : ""}">
        <div class="dish-media ${tone}">
          <span class="dish-emoji" aria-hidden="true">${m.emoji}</span>${img}
          ${sold ? '<span class="tag tag-sold">Sold out</span>' : m.popular ? '<span class="tag">Popular</span>' : ""}
        </div>
        <div class="dish-body">
          <div class="dish-top"><h3>${esc(m.name)}</h3>
            <span class="veg-dot ${m.veg ? "is-veg" : "is-nonveg"}" title="${m.veg ? "Vegetarian" : "Contains meat, fish or egg"}" role="img" aria-label="${m.veg ? "Vegetarian" : "Non-vegetarian"}"></span></div>
          <p>${esc(m.desc)}</p>
          <div class="dish-meta">${heat(m.spicy)}</div>
          <div class="dish-foot"><strong>${DR.fmt(m.price)}</strong>${control}</div>
        </div>
      </article>`;
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = MENU.filter((m) =>
      (state.cat === "All" || m.category === state.cat) &&
      (!state.veg || m.veg) &&
      (!q || (m.name + " " + m.desc + " " + m.category).toLowerCase().includes(q))
    );
    const idx = (m) => MENU.indexOf(m);
    if (state.sort === "low") list.sort((a, b) => a.price - b.price);
    else if (state.sort === "high") list.sort((a, b) => b.price - a.price);
    else if (state.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => (b.popular - a.popular) || (idx(a) - idx(b)));
    return list;
  }

  function renderMenu() {
    const list = filtered();
    const filtering = state.q || state.cat !== "All" || state.veg;
    const showAll = state.expanded || filtering;
    const shown = showAll ? list : list.slice(0, INITIAL);

    $("dishGrid").innerHTML = shown.length
      ? shown.map(card).join("")
      : `<div class="no-results"><p>No dishes match your search.</p><button class="btn btn-outline-jade" type="button" id="resetFilters">Clear filters</button></div>`;

    const btn = $("showMoreBtn");
    btn.hidden = filtering || list.length <= INITIAL;
    btn.textContent = state.expanded ? "Show fewer dishes" : "Show all " + list.length + " dishes";
  }

  $("menuChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    state.cat = b.dataset.cat; chips(); renderMenu();
  });
  $("menuSearch").addEventListener("input", (e) => { state.q = e.target.value; renderMenu(); });
  $("vegOnly").addEventListener("change", (e) => { state.veg = e.target.checked; renderMenu(); });
  $("menuSort").addEventListener("change", (e) => { state.sort = e.target.value; renderMenu(); });
  $("showMoreBtn").addEventListener("click", () => {
    state.expanded = !state.expanded; renderMenu();
    if (!state.expanded) $("menu").scrollIntoView();
  });
  $("dishGrid").addEventListener("click", (e) => {
    if (e.target.id !== "resetFilters") return;
    Object.assign(state, { q: "", cat: "All", veg: false });
    $("menuSearch").value = ""; $("vegOnly").checked = false;
    chips(); renderMenu();
  });

  chips();
  renderMenu();
  document.addEventListener("cart:change", renderMenu);
  document.addEventListener("menu:change", () => { renderMenu(); renderPicks(); });

  /* ---------- reservation ---------- */
  const rDate = $("rDate"), rTime = $("rTime");
  const today = new Date();
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  rDate.min = iso(today);
  rDate.value = iso(today);
  $("rGuests").innerHTML = Array.from({ length: 12 }, (_, i) =>
    `<option value="${i + 1}" ${i === 1 ? "selected" : ""}>${i + 1} ${i ? "guests" : "guest"}</option>`).join("");

  function buildSlots() {
    const [oh, om] = CONFIG.open.split(":").map(Number);
    const [ch, cm] = CONFIG.close.split(":").map(Number);
    const start = oh * 60 + om, end = ch * 60 + cm - 60; // last seating 1 hour before close
    const now = new Date();
    const isToday = rDate.value === iso(now);
    const nowMin = now.getHours() * 60 + now.getMinutes() + 30;
    let html = "";
    for (let m = start; m <= end; m += 30) {
      if (isToday && m < nowMin) continue;
      const v = String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
      html += `<option value="${v}">${DR.fmtTime(v)}</option>`;
    }
    rTime.innerHTML = html || `<option value="">No slots left today</option>`;
  }
  buildSlots();
  rDate.addEventListener("change", buildSlots);

  $("resForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("rName"), phone = $("rPhone");
    let ok = true;
    ok = DR.fieldError(name, name.value.trim().length < 2 ? "Please enter your name" : "") && ok;
    ok = DR.fieldError(phone, DR.validPhone(phone.value) ? "" : "Enter a valid phone number, e.g. 077 123 4567") && ok;
    ok = DR.fieldError(rDate, !rDate.value || rDate.value < rDate.min ? "Choose today or a later date" : "") && ok;
    ok = DR.fieldError(rTime, !rTime.value ? "Choose another date, no slots left today" : "") && ok;
    if (!ok) return;

    const r = {
      id: DR.uid("RS"), createdAt: new Date().toISOString(), status: "Pending",
      name: name.value.trim(), phone: phone.value.trim(), date: rDate.value, time: rTime.value,
      guests: Number($("rGuests").value), note: $("rNote").value.trim()
    };
    const all = DR.ls.get(DR.K.res, []); all.unshift(r); DR.ls.set(DR.K.res, all);

    const msg = `Table request ${r.id}\n${r.name}, ${r.phone}\n${r.date} at ${DR.fmtTime(r.time)} for ${r.guests}` + (r.note ? "\nNote: " + r.note : "");
    const done = $("resDone");
    done.hidden = false;
    done.innerHTML = `<strong>Request received.</strong> Your reference is <b>${r.id}</b>. To get a faster reply, send it to us on WhatsApp.<br>
      <a class="btn btn-lacquer btn-sm mt-2" target="_blank" rel="noopener" href="${DR.wa(msg)}"><i class="fa-brands fa-whatsapp"></i> Send on WhatsApp</a>`;
    e.target.reset(); rDate.value = iso(new Date()); buildSlots();
    DR.toast("Booking request saved");
  });

  /* ---------- contact ---------- */
  $("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const n = $("cName"), m = $("cEmail"), t = $("cMsg");
    let ok = true;
    ok = DR.fieldError(n, n.value.trim().length < 2 ? "Please enter your name" : "") && ok;
    ok = DR.fieldError(m, DR.validEmail(m.value) ? "" : "Enter a valid email address") && ok;
    ok = DR.fieldError(t, t.value.trim().length < 10 ? "Please write at least 10 characters" : "") && ok;
    if (!ok) return;
    const all = DR.ls.get(DR.K.msgs, []);
    all.unshift({ id: DR.uid("MS"), createdAt: new Date().toISOString(), name: n.value.trim(), email: m.value.trim(), message: t.value.trim() });
    DR.ls.set(DR.K.msgs, all);
    const d = $("contactDone");
    d.hidden = false;
    d.innerHTML = "<strong>Message sent.</strong> Thank you, we will get back to you soon.";
    e.target.reset();
  });

  /* ---------- reviews ---------- */
  $("reviews").innerHTML = REVIEWS.map((r) => `
    <div class="col-md-4"><figure class="review m-0">
      <div class="stars" aria-label="${r.stars} out of 5 stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
      <p>${esc(r.text)}</p><figcaption><cite>${esc(r.name)}</cite></figcaption>
    </figure></div>`).join("");
})();
