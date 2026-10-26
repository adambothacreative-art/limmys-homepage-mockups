
(function () {
  var ROOT = document.querySelector(".lv7"); if (!ROOT) return;
  // ---- Store wiring (test theme): real products, prices, links and basket ----
  var DATA = {}; try { DATA = JSON.parse(document.getElementById("lv7-data").textContent); } catch (e) {}
  var HANDLE = {
    "Signature Swim Vest|Sunshine Blue": "swim-vest-sunshine-blue-lim0021",
    "Signature Swim Vest|Sunset Blue": "swim-vest-sunset-blue-m-lim0022",
    "Signature Swim Vest|Berry Pink": "swim-vest-berry-pink-lim0023",
    "Signature Swim Vest|Pink Daisy": "swim-vest-pink-daisy-lim0024",
    "Classic Swim Vest|Pink Leopard": "premium-neoprene-swim-vest-pink-leopard",
    "Classic Swim Vest|Pink Blossom": "premium-neoprene-swim-vest-for-girls",
    "Classic Swim Vest|Azure Blue": "premium-neoprene-swim-vest-light-blue",
    "Classic Swim Vest|Royal Blue": "premium-neoprene-swim-vest-for-boys-1",
    "Classic Swim Vest|Navy Blue": "premium-neoprene-swim-vest-for-boys",
    "Classic Swim Vest|Pink Windmill": "premium-neoprene-swim-vest-pink-windmill",
    "Classic Swim Vest|Neon Green": "premium-neoprene-swim-vest-green",
    "Arm Bands|Orange": "arm-bands-in-orange", "Arm Bands|Purple": "arm-bands-in-purple", "Arm Bands|Pink": "arm-bands-in-pink",
    "Arm Bands|Red": "arm-bands-in-red", "Arm Bands|Yellow": "childrens-armbands-in-yellow-with-navy-accent",
    "Arm Bands|Lemon": "childrens-armbands-in-yellow-with-green-accent",
    "Kids Swim Goggles|Blue": "goggles-in-blue", "Kids Swim Goggles|Pink": "goggles-in-pink",
    "Kids Swim Cap": "kids-swim-caps", "Kids Long Hair Swim Cap": "swim-caps-kids-long-hair",
    "Swim Headband": "limmys-swimming-headband-for-kids-and-adults", "Long Hair Swim Cap": "swim-caps-womens-long-hair"
  };
  function lv7Handle(p, c) { return HANDLE[p.name + "|" + (c && c.n)] || HANDLE[p.name]; }
  // Price always comes from Shopify. If the product isn't available in this market (or not loaded yet),
  // the card becomes a placeholder: "Coming soon", buttons disabled.
  function lv7Price(el, p, c) {
    var d = DATA[lv7Handle(p, c)], soon = !d || !d.variants.some(function (v) { return v.a; });
    el.classList.toggle("soon", soon);
    el.querySelector(".price").textContent = d ? (soon ? "Sold out" : d.price) : "Coming soon";
    el.querySelectorAll(".add, .sizes button").forEach(function (b) { b.disabled = soon; });
  }
  function lv7Wire(el, p, cur) {
    lv7Price(el, p, cur());
    var go = function () { var d = DATA[lv7Handle(p, cur())]; if (d) window.location.href = d.url; };
    [el.querySelector(".ph"), el.querySelector("h3")].forEach(function (n) { n.style.cursor = "pointer"; n.addEventListener("click", go); });
    var add = el.querySelector(".add"), d = DATA[lv7Handle(p, cur())];
    if (add && d && d.variants.length > 1) add.textContent = "Choose options";
  }
  function lv7Add(p, c, size) {
    var d = DATA[lv7Handle(p, c)]; if (!d) return;
    var v = null;
    if (size) v = d.variants.filter(function (x) { return x.a && x.t.trim().charAt(0).toUpperCase() === size.trim().charAt(0).toUpperCase(); })[0];
    else if (d.variants.length === 1 && d.variants[0].a) v = d.variants[0];
    if (!v) { window.location.href = d.url; return; }
    fetch("/cart/add.js", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ items: [{ id: v.id, quantity: 1 }] }) })
      .then(function (r) { if (!r.ok) throw new Error("add failed"); return fetch("/cart.js"); })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.getElementById("lv7-bagCount").textContent = cart.item_count;
        toast(p.name + (c && p.colours.length > 1 ? ", " + c.n : "") + (size ? ", size " + size.trim() : "") + " added to basket");
      })
      .catch(function () { window.location.href = d.url; });
  }
  // header actions
  (function () {
    var bag = ROOT.querySelector('[aria-label="Basket"]'), acc = ROOT.querySelector('[aria-label="Account"]'), q = document.getElementById("lv7-q");
    if (bag) bag.addEventListener("click", function () { window.location.href = "/cart"; });
    if (acc) acc.addEventListener("click", function () { window.location.href = "/account"; });
    ROOT.querySelectorAll('.search-ic').forEach(function (s) { s.addEventListener("click", function () { window.location.href = "/search"; }); });
    if (q) q.addEventListener("keydown", function (e) { if (e.key === "Enter" && q.value.trim()) window.location.href = "/search?q=" + encodeURIComponent(q.value.trim()); });
    var sp = ROOT.querySelector(".spot .price"), az = DATA["premium-neoprene-swim-vest-light-blue"];
    if (sp && az) sp.textContent = az.price;
  })();

  var products = [
    { name: "Signature Swim Vest", badge: "Signature", dark: true, feat: "Integrated floats, YKK zip and two buckles", vest: true, alt: "l_vests",
      colours: [
        { n: "Sunshine Blue", hex: "#f6c445", img: "vest_sunshine" },
        { n: "Sunset Blue", hex: "#f28a3b", img: "vest_sunset" },
        { n: "Berry Pink", hex: "#e04f9b", img: "vest_berry" },
        { n: "Pink Daisy", hex: "#f6b3cf", img: "vest_daisy" } ] },
    { name: "Classic Swim Vest", badge: "Best seller", feat: "8 removable floats, take them out in pairs", vest: true, alt: "p_classic2",
      colours: [
        { n: "Pink Leopard", hex: "#f0408a", img: "vest_leopard" },
        { n: "Pink Blossom", hex: "#ff6b7d", img: "vest_blossom" },
        { n: "Azure Blue", hex: "#7cc6f2", img: "vest_azure" },
        { n: "Royal Blue", hex: "#1f4fc4", img: "vest_royal" },
        { n: "Navy Blue", hex: "#1b2b55", img: "vest_navy" },
        { n: "Pink Windmill", hex: "#d84bb2", img: "vest_windmill" },
        { n: "Neon Green", hex: "#8be33c", img: "vest_green" } ] },
    { name: "Arm Bands", feat: "Bright prints for first splashes", alt: "p_armbands",
      colours: [
        { n: "Orange", hex: "#f7a21b", img: "arm_orange" },
        { n: "Purple", hex: "#6b5bd6", img: "arm_purple" },
        { n: "Pink", hex: "#f58bb4", img: "arm_pink" },
        { n: "Red", hex: "#e8392f", img: "arm_red" },
        { n: "Yellow", hex: "#f5d90a", img: "arm_yellow" },
        { n: "Lemon", hex: "#b6dd4a", img: "arm_lemon" } ] },
    { name: "Kids Swim Goggles", feat: "Sized for smaller faces", model: true, alt: "p_goggles",
      colours: [
        { n: "Blue", hex: "#2d6fd6", img: "gog_blue.jpg" },
        { n: "Pink", hex: "#f39bc8", img: "gog_pink.jpg" } ] },
    { name: "Kids Swim Cap", feat: "100% silicone, one size", more: "6 colours", cover: true,
      colours: [ { n: "Pink", hex: "#ff7fb5", img: "p_kidscap" } ] },
    { name: "Kids Long Hair Swim Cap", feat: "Extra room for long hair", more: "7 colours", cover: true,
      colours: [ { n: "Yellow", hex: "#f5d90a", img: "p_kidslh" } ] },
    { name: "Swim Headband", feat: "Covers the ears, adjustable strap", more: "4 designs · S, M, L", cover: true, alt: "p_headband_towel",
      colours: [ { n: "Pink Flowers", hex: "#f7b6d2", img: "p_headband_swim" } ] },
    { name: "Long Hair Swim Cap", feat: "For grown-ups with long hair", more: "More colours", cover: true,
      colours: [ { n: "Black", hex: "#1d1d1f", img: "p_adultcap" } ] }
  ];
  function src(f) { return window.LV7A + "lv7-" + (f.indexOf(".") > -1 ? f : f + ".webp"); }
  var BG = { vest_sunshine: "sky", vest_sunset: "coral", vest_berry: "pinkt", vest_daisy: "lilac", vest_blossom: "pinkt", vest_azure: "sky",
    vest_royal: "sky", vest_navy: "mintt", vest_leopard: "pinkt", vest_windmill: "lilac", vest_green: "butter", arm_orange: "butter",
    arm_purple: "lilac", arm_pink: "pinkt", arm_red: "coral", arm_yellow: "butter", arm_lemon: "mintt", "gog_pink.jpg": "pinkt",
    "gog_blue.jpg": "sky", "cap_kids.jpg": "pinkt", "cap_kidslh.jpg": "coral", headband: "mintt", "cap_womenlh.jpg": "lilac" };
  function bg(f) { return "var(--" + (BG[f] || "mist") + ")"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var bag = 0, toastEl = document.getElementById("lv7-toast"), toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 1800); }
  function addToBag(label) { bag++; document.getElementById("lv7-bagCount").textContent = bag; toast(label + " added to basket (mockup)"); }

  // Best sellers
  var grid = document.getElementById("lv7-productGrid");
  products.forEach(function (p) {
    var c0 = p.colours[0];
    var el = document.createElement("article"); el.className = "card";
    var sw = p.colours.length > 1
      ? p.colours.map(function (c, j) { return '<button type="button" class="sw-btn" style="background:' + c.hex + '" aria-label="' + esc(c.n) + '" aria-pressed="' + (j === 0) + '" data-j="' + j + '"></button>'; }).join("") + '<span class="sw-label">' + esc(c0.n) + '</span>'
      : '<span class="sw-label">' + esc(p.more || "") + '</span>';
    var action = p.vest
      ? '<div class="sizes" role="group" aria-label="Choose a size"><button type="button">S<small>2 to 3</small></button><button type="button">M<small>3 to 6</small></button><button type="button">L<small>6 to 9</small></button></div>'
      : '<button type="button" class="add">Add to basket</button>';
    var imgCls = p.cover ? "cover" : p.model ? "model" + (p.wide ? " wide" : "") : "p";
    el.innerHTML =
      '<div class="ph" style="background:' + bg(c0.img) + '"><svg class="gfx palm"><use href="#palm"/></svg>' +
        (p.badge ? '<span class="badge' + (p.dark ? ' dark' : '') + '">' + esc(p.badge) + '</span>' : '') +
        '<img class="' + imgCls + '" src="' + src(c0.img) + '" alt="' + esc(p.name + ", " + c0.n) + '">' +
        (p.alt ? '<img class="' + (p.cover ? 'alt' : 'life') + '" src="' + window.LV7A + 'lv7-' + p.alt + '.webp" alt="">' : '') +
      '</div>' +
      '<div class="body"><h3>' + esc(p.name) + '</h3><p class="feat">' + esc(p.feat) + '</p>' +
        '<div class="swatches">' + sw + '</div>' +
        '<div class="row"><span class="price">' + p.price + '</span><span class="rating"><span class="stars">★★★★★</span></span></div>' +
        action + '</div>';
    var img = el.querySelector(".ph img"), lab = el.querySelector(".sw-label"), current = c0;
    el.querySelectorAll(".sw-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        el.classList.add("picked"); current = p.colours[+b.dataset.j]; img.src = src(current.img); el.querySelector(".ph").style.background = bg(current.img); img.alt = p.name + ", " + current.n; lab.textContent = current.n; lv7Price(el, p, current);
        el.querySelectorAll(".sw-btn").forEach(function (o) { o.setAttribute("aria-pressed", o === b); });
      });
    });
    el.querySelectorAll(".sizes button").forEach(function (b) { b.addEventListener("click", function () { lv7Add(p, current, b.firstChild.nodeValue); }); });
    var add = el.querySelector(".add");
    if (add) add.addEventListener("click", function () { lv7Add(p, current, null); });
    (function (pp, el2, get) { lv7Wire(el2, pp, get); })(p, el, function () { return current; });
    grid.appendChild(el);
  });

  // Spotlight swatches (Classic colours)
  var classic = products[1], spotImg = document.getElementById("lv7-spotImg"), spotSw = document.getElementById("lv7-spotSwatches"), spotColour = "Azure Blue";
  classic.colours.forEach(function (c) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "sw-btn"; b.style.background = c.hex; b.setAttribute("aria-label", c.n); b.setAttribute("aria-pressed", c.n === spotColour);
    b.addEventListener("click", function () {
      spotColour = c.n; spotImg.src = src(c.img); spotImg.alt = "Classic swim vest, " + c.n;
      spotSw.querySelectorAll(".sw-btn").forEach(function (o) { o.setAttribute("aria-pressed", o === b); });
      spotSw.querySelector(".sw-label").textContent = c.n;
    });
    spotSw.appendChild(b);
  });
  var sl = document.createElement("span"); sl.className = "sw-label"; sl.textContent = spotColour; spotSw.appendChild(sl);
  ROOT.querySelectorAll(".spot .sizes button").forEach(function (b) { b.addEventListener("click", function () { lv7Add(classic, classic.colours.filter(function (c) { return c.n === spotColour; })[0], b.firstChild.nodeValue); }); });

  // Mega menus (desktop) and drawer (mobile)
  var triggers = ROOT.querySelectorAll(".nav-dd"), header = ROOT.querySelector("header.site"), closeT;
  function closeAll() { triggers.forEach(function (t) { t.setAttribute("aria-expanded", "false"); document.getElementById(t.getAttribute("aria-controls")).hidden = true; }); }
  function openMenu(t) { clearTimeout(closeT); triggers.forEach(function (o) { if (o !== t) { o.setAttribute("aria-expanded", "false"); document.getElementById(o.getAttribute("aria-controls")).hidden = true; } });
    t.setAttribute("aria-expanded", "true"); document.getElementById(t.getAttribute("aria-controls")).hidden = false; }
  triggers.forEach(function (t) {
    t.addEventListener("click", function () { t.getAttribute("aria-expanded") === "true" ? closeAll() : openMenu(t); });
    t.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) openMenu(t); });
  });
  ROOT.querySelectorAll(".mega").forEach(function (m) { m.addEventListener("mouseenter", function () { clearTimeout(closeT); }); });
  header.addEventListener("mouseleave", function () { closeT = setTimeout(closeAll, 180); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeAll(); drawer.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); } });
  ROOT.querySelectorAll(".mega a").forEach(function (l) { l.addEventListener("click", closeAll); });
  var menuBtn = document.getElementById("lv7-menuBtn"), drawer = document.getElementById("lv7-drawer");
  menuBtn.addEventListener("click", function () { var open = drawer.hidden; drawer.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open)); });
  drawer.querySelectorAll("a").forEach(function (l) { l.addEventListener("click", function () { drawer.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }); });

  // Rotating announcement
  var msgs = [document.getElementById("lv7-annMsg").innerHTML, 'Award-winning swim aids', '30-day returns'], mi = 0, ann = document.getElementById("lv7-annMsg");
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(function () { mi = (mi + 1) % msgs.length; ann.innerHTML = msgs[mi]; }, 3500);

  // Swim club (mockup only)
  document.getElementById("lv7-clubForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, old = f.querySelector(".ok"); if (old) old.remove();
    var ok = document.createElement("p"); ok.className = "ok"; ok.textContent = "Test theme: the sign-up form is not connected to Klaviyo yet."; f.appendChild(ok);
  });
})();

