// GLP Dziennik website interactions. Plain JavaScript, no external libraries or trackers.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal sections on scroll.
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 }) : null;
  $$(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

  // Hero phone carousel.
  const hero = $("#heroScreen"), dotsEl = $("#heroDots");
  if (hero && dotsEl) {
    const imgs = $$("img", hero); let i = 0, timer;
    imgs.forEach((_, k) => { const b = document.createElement("button"); b.setAttribute("aria-label", `Ekran ${k + 1}`); b.onclick = () => { show(k); restart(); }; dotsEl.appendChild(b); });
    const dots = $$("button", dotsEl);
    function show(k) { i = k; imgs.forEach((im, n) => im.classList.toggle("on", n === k)); dots.forEach((d, n) => d.classList.toggle("on", n === k)); }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(() => show((i + 1) % imgs.length), 3500); }
    show(0); restart();
  }

  // Feature tabs switch the phone screen.
  const tabScreen = $("#tabScreen");
  $$("#tabs .tab").forEach((t) => t.addEventListener("click", () => {
    $$("#tabs .tab").forEach((x) => x.classList.toggle("on", x === t));
    const cur = $("img", tabScreen);
    const next = new Image(); next.src = t.dataset.img; next.alt = "Ekran aplikacji";
    tabScreen.appendChild(next);
    requestAnimationFrame(() => { next.classList.add("on"); cur.classList.remove("on"); setTimeout(() => cur.remove(), 650); });
  }));

  // Interactive sample week after the dose (sample data only).
  const WEEK = [
    { n: "Dzień dawki", v: [2, 1, 2, 2], tip: "Apetyt zwykle zaczyna spadać. Dobry dzień na lekki posiłek i wodę." },
    { n: "Dzień +1", v: [1, 2, 1, 3], tip: "Najmniejszy apetyt, ale też najwięcej objawów. Małe porcje, dużo płynów." },
    { n: "Dzień +2", v: [1, 1, 2, 3], tip: "Objawy słabną, spokój wokół jedzenia zostaje. Pilnuj białka." },
    { n: "Dzień +3", v: [2, 0, 3, 2], tip: "Wraca energia. Dobry moment na trening." },
    { n: "Dzień +4", v: [3, 0, 3, 2], tip: "Apetyt rośnie. Warto zaplanować posiłki z wyprzedzeniem." },
    { n: "Dzień +5", v: [4, 0, 2, 1], tip: "Głód bywa wyraźniejszy. Białko i warzywa pomagają przetrwać." },
    { n: "Dzień +6", v: [4, 0, 2, 1], tip: "Najsilniejszy apetyt przed kolejną dawką. Tu przydaje się plan." },
  ];
  const daysEl = $("#days");
  if (daysEl) {
    const MAX = [5, 3, 3, 3], LBL = [["brak", "mały", "mały", "średni", "duży", "bardzo duży"], ["brak", "lekkie", "średnie", "silne"], ["niska", "niska", "średnia", "wysoka"], ["niski", "niski", "średni", "wysoki"]];
    WEEK.forEach((d, k) => { const b = document.createElement("button"); b.textContent = k === 0 ? "Dawka" : `+${k}`; b.onclick = () => setDay(k); daysEl.appendChild(b); });
    function setDay(k) {
      $$("button", daysEl).forEach((b, n) => b.classList.toggle("on", n === k));
      WEEK[k].v.forEach((v, j) => { $("#f" + j).style.width = `${Math.max(4, (v / MAX[j]) * 100)}%`; $("#v" + j).textContent = LBL[j][v]; });
      $("#dayName").textContent = WEEK[k].n; $("#tip").textContent = WEEK[k].tip;
    }
    setDay(1);
  }

  // Goal calculator: constant pace, shown as a simple estimate.
  const now = $("#now"), goal = $("#goal"), pace = $("#pace");
  if (now && goal && pace) {
    let p = 0.75;
    const fmt = (v) => String(v).replace(".", ",");
    function calc() {
      const a = +now.value, g = +goal.value;
      $("#oNow").textContent = `${a} kg`; $("#oGoal").textContent = `${g} kg`;
      if (g >= a) { $("#weeks").textContent = "Cel osiągnięty"; $("#date").textContent = "Waga docelowa nie jest niższa od obecnej."; return; }
      const w = Math.ceil((a - g) / p);
      const d = new Date(Date.now() + w * 7 * 86400000);
      $("#weeks").textContent = `${w} tyg.`;
      const M = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
      $("#date").textContent = `${fmt(+(a - g).toFixed(1))} kg mniej, około ${M[d.getMonth()]} ${d.getFullYear()}`;
    }
    now.oninput = calc; goal.oninput = calc;
    $$("button", pace).forEach((b) => b.onclick = () => { p = +b.dataset.v; $$("button", pace).forEach((x) => x.classList.toggle("on", x === b)); calc(); });
    calc();
  }

  // Pricing toggle.
  const toggle = $("#toggle");
  if (toggle) {
    const knob = $(".knob", toggle), btns = $$("button", toggle);
    const P = { year: ["149,99 zł <small>/ rok</small>", "ok. 12,50 zł miesięcznie, jednorazowo"], month: ["29,99 zł <small>/ miesiąc</small>", "jednorazowo, bez odnawiania"] };
    function set(b) {
      btns.forEach((x) => x.classList.toggle("on", x === b));
      knob.style.left = `${b.offsetLeft}px`; knob.style.width = `${b.offsetWidth}px`;
      $("#amount").innerHTML = P[b.dataset.p][0]; $("#per").textContent = P[b.dataset.p][1];
    }
    btns.forEach((b) => b.onclick = () => set(b));
    const init = () => set(btns.find((b) => b.classList.contains("on")));
    init(); window.addEventListener("resize", init); document.fonts && document.fonts.ready.then(init);
  }

  // FAQ accordion.
  $$("#faq .qa").forEach((qa) => $("button", qa).addEventListener("click", () => {
    const ans = $(".ans", qa), open = qa.classList.toggle("on");
    ans.style.maxHeight = open ? `${ans.scrollHeight}px` : "0";
  }));
})();
