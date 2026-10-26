/* Limmys v7 sections: menus, product cards, spotlight, sign-up. Works with the theme editor (section reloads). */
(function () {
  if (window.LV7_INIT) return;
  window.LV7_INIT = true;

  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      var host = document.querySelector(".lv7");
      if (!host) return;
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      host.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function setBag(n) {
    document.querySelectorAll(".lv7 [data-bag-count]").forEach(function (e) { e.textContent = n; });
  }

  function addVariant(id, label, fallbackUrl) {
    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ items: [{ id: id, quantity: 1 }] })
    })
      .then(function (r) { if (!r.ok) throw new Error("add failed"); return fetch("/cart.js"); })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        setBag(cart.item_count);
        toast(label + " added to basket");
        document.dispatchEvent(new CustomEvent("cart:refresh", { bubbles: true }));
      })
      .catch(function () { window.location.href = fallbackUrl; });
  }

  function sizeInfo(t) {
    var m = String(t).match(/\(([^)]+)\)/);
    return {
      letter: String(t).trim().charAt(0).toUpperCase(),
      small: m ? m[1].replace(/\s*Years?/i, " yrs").replace(/\s*-\s*/, " to ") : ""
    };
  }

  // ---------- Product card (best sellers) and spotlight ----------
  function initCard(card, isSpot) {
    if (card.dataset.lv7Ready) return;
    card.dataset.lv7Ready = "1";
    var data;
    try { data = JSON.parse(card.querySelector("[data-products]").textContent); } catch (e) { return; }
    if (!data || !data.length) return;

    var ph = card.querySelector("[data-ph]"), pack = card.querySelector("[data-pack]"),
        price = card.querySelector("[data-price]"), sw = card.querySelector("[data-swatches]"),
        act = card.querySelector("[data-action]"), h3 = card.querySelector("h3"),
        title = isSpot ? "" : (h3 ? h3.textContent.trim() : ""), cur = 0;

    function label(d) {
      var t = isSpot ? d.n : title + (data.length > 1 ? ", " + d.n : "");
      return t;
    }

    function render(i, picked) {
      cur = i;
      var d = data[i], avail = d.v.some(function (v) { return v.a; });
      if (pack) {
        var src = d.c || d.i || "";
        if (src) pack.src = src;
        pack.classList.toggle("pk", !d.c);
        pack.alt = (title ? title + ", " : "") + d.n;
      }
      if (ph && d.t && !isSpot) ph.style.background = d.t;
      if (picked) card.classList.add("picked");
      card.classList.toggle("soon", !avail);
      if (price) price.textContent = avail ? d.pr : "Sold out";
      if (sw) {
        sw.querySelectorAll(".sw-btn").forEach(function (b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
        var l = sw.querySelector(".sw-label");
        if (l && data.length > 1) l.textContent = d.n;
      }
      if (act) {
        act.innerHTML = "";
        var isSize = d.v.length > 1 && /size/i.test(d.opt || "");
        if (isSize) {
          var g = document.createElement("div");
          g.className = "sizes"; g.setAttribute("role", "group"); g.setAttribute("aria-label", "Choose a size");
          d.v.forEach(function (v) {
            var s = sizeInfo(v.t), b = document.createElement("button");
            b.type = "button"; b.disabled = !v.a; b.title = v.t;
            b.innerHTML = s.letter + (s.small ? "<small>" + s.small + "</small>" : "");
            b.addEventListener("click", function () { addVariant(v.id, label(d) + ", size " + s.letter, d.u); });
            g.appendChild(b);
          });
          act.appendChild(g);
        } else if (d.v.length > 1) {
          var a = document.createElement("a");
          a.className = "add"; a.href = d.u; a.textContent = avail ? "Choose options" : "Sold out";
          act.appendChild(a);
        } else {
          var btn = document.createElement("button");
          btn.type = "button"; btn.className = "add"; btn.disabled = !avail;
          btn.textContent = avail ? "Add to basket" : "Sold out";
          btn.addEventListener("click", function () { addVariant(d.v[0].id, label(d), d.u); });
          act.appendChild(btn);
        }
      }
    }

    if (sw && data.length > 1) {
      sw.innerHTML = "";
      data.forEach(function (d, j) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "sw-btn"; b.style.background = d.x; b.setAttribute("aria-label", d.n);
        b.addEventListener("click", function () { render(j, true); });
        sw.appendChild(b);
      });
      var l = document.createElement("span"); l.className = "sw-label"; sw.appendChild(l);
    }

    if (!isSpot) {
      [ph, h3].forEach(function (n) {
        if (!n) return;
        n.style.cursor = "pointer";
        n.addEventListener("click", function () { window.location.href = data[cur].u; });
      });
    }
    render(0, false);
  }

  // ---------- Header: mega menus, mobile drawer, rotating messages ----------
  function initHeader(root) {
    if (root.dataset.lv7Ready) return;
    root.dataset.lv7Ready = "1";
    var header = root.querySelector("header.site"), triggers = root.querySelectorAll(".nav-dd"), closeT;
    function panel(t) { return document.getElementById(t.getAttribute("aria-controls")); }
    function closeAll() { triggers.forEach(function (t) { t.setAttribute("aria-expanded", "false"); var p = panel(t); if (p) p.hidden = true; }); }
    function openMenu(t) {
      clearTimeout(closeT);
      triggers.forEach(function (o) { if (o !== t) { o.setAttribute("aria-expanded", "false"); var p = panel(o); if (p) p.hidden = true; } });
      t.setAttribute("aria-expanded", "true"); var p = panel(t); if (p) p.hidden = false;
    }
    root._lv7Open = openMenu; root._lv7Close = closeAll;
    triggers.forEach(function (t) {
      t.addEventListener("click", function () { t.getAttribute("aria-expanded") === "true" ? closeAll() : openMenu(t); });
      t.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) openMenu(t); });
    });
    root.querySelectorAll(".mega").forEach(function (m) { m.addEventListener("mouseenter", function () { clearTimeout(closeT); }); });
    if (header) header.addEventListener("mouseleave", function () { closeT = setTimeout(closeAll, 180); });

    var menuBtn = root.querySelector(".menu-btn"), drawer = menuBtn && document.getElementById(menuBtn.getAttribute("aria-controls"));
    if (menuBtn && drawer) {
      menuBtn.addEventListener("click", function () { var open = drawer.hidden; drawer.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open)); });
      drawer.querySelectorAll("a").forEach(function (l) { l.addEventListener("click", function () { drawer.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }); });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      closeAll();
      if (drawer) { drawer.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }
    });

    var msgs = (root.getAttribute("data-msgs") || "").split("|||").map(function (s) { return s.trim(); }).filter(Boolean),
        el = root.querySelector("[data-msg]"), mi = 0;
    if (el && msgs.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root._lv7Timer = setInterval(function () { mi = (mi + 1) % msgs.length; el.textContent = msgs[mi]; }, 3500);
    }
  }

  function initClub(root) {
    var f = root.querySelector("[data-club]");
    if (!f || f.dataset.lv7Ready) return;
    f.dataset.lv7Ready = "1";
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var old = f.querySelector(".ok"); if (old) old.remove();
      var ok = document.createElement("p"); ok.className = "ok";
      ok.textContent = "Test version: this form is not connected to Klaviyo yet.";
      f.appendChild(ok);
    });
  }

  function initIn(scope) {
    var roots = scope.matches && scope.matches(".lv7[data-lv7]") ? [scope] : [];
    scope.querySelectorAll(".lv7[data-lv7]").forEach(function (r) { roots.push(r); });
    roots.forEach(function (root) {
      var type = root.getAttribute("data-lv7");
      if (type === "header") initHeader(root);
      if (type === "club") initClub(root);
      if (type === "cards" || type === "spotlight") {
        root.querySelectorAll("[data-card]").forEach(function (c) { initCard(c, type === "spotlight"); });
      }
    });
  }

  initIn(document);

  // Theme editor support
  document.addEventListener("shopify:section:load", function (e) { initIn(e.target); });
  document.addEventListener("shopify:section:unload", function (e) {
    var r = e.target.querySelector(".lv7[data-lv7=header]"); if (r && r._lv7Timer) clearInterval(r._lv7Timer);
  });
  document.addEventListener("shopify:block:select", function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains("nav-dd")) {
      var root = t.closest(".lv7[data-lv7=header]"); if (root && root._lv7Open) root._lv7Open(t);
    }
  });
  document.addEventListener("shopify:block:deselect", function (e) {
    var root = e.target && e.target.closest && e.target.closest(".lv7[data-lv7=header]");
    if (root && root._lv7Close) root._lv7Close();
  });
})();
