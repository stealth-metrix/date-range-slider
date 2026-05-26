import e from "nouislider";
//#region src/index.js
var t = 1440 * 60 * 1e3, n = [
	"Su",
	"Mo",
	"Tu",
	"We",
	"Th",
	"Fr",
	"Sa"
], r = [
	{
		label: "7d",
		days: 7
	},
	{
		label: "30d",
		days: 30
	},
	{
		label: "90d",
		days: 90
	},
	{
		label: "6mo",
		days: 180
	},
	{
		label: "1yr",
		days: 365
	},
	{
		label: "2yr",
		days: 730
	},
	{
		label: "Max",
		days: "max"
	}
];
function i(e) {
	return new Date(e.getFullYear(), e.getMonth(), e.getDate());
}
function a(e, t) {
	return e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth() && e.getDate() === t.getDate();
}
function o(e, n) {
	return Math.round((n - e) / t);
}
function s(e) {
	return `${e.toLocaleDateString("en-US", { month: "short" })} ${String(e.getDate()).padStart(2, "0")}, ${e.getFullYear()}`;
}
function c(e, t, n) {
	let r = document.createElement(e);
	return t && (r.className = t), n && Object.entries(n).forEach(([e, t]) => {
		e === "text" ? r.textContent = t : e === "html" ? r.innerHTML = t : r.setAttribute(e, t);
	}), r;
}
function l(l, u = {}) {
	let d = typeof l == "string" ? document.querySelector(l) : l;
	if (!d) throw Error("DateRangeSlider: target element not found");
	let f = i(/* @__PURE__ */ new Date()), p = u.minDate ? i(u.minDate) : new Date(f.getFullYear() - 3, f.getMonth(), f.getDate()), m = u.maxDate ? i(u.maxDate) : f, h = u.startDate ? i(u.startDate) : new Date(f.getFullYear() - 1, f.getMonth(), f.getDate()), ee = u.endDate ? i(u.endDate) : f, g = u.presets || r, _ = u.showZoom !== !1, v = u.showNudge !== !1, y = u.showCalendar !== !1, b = u.showPresets !== !1, x = u.onChange || null, S = p.getTime(), C = m.getTime(), w = S, T = C, E, D, O;
	d.classList.add("drs-container");
	let k = c("div", "drs-summary"), A = c("span", "drs-date", { text: "--" }), te = c("span", "drs-separator", { html: "&mdash;" }), j = c("span", "drs-date", { text: "--" }), M = c("span", "drs-badge", { text: "--" }), N = c("span", "drs-max-label", { text: "MAX" });
	k.append(A, te, j, M, N);
	let P = c("div", "drs-cal-overlay"), F = c("div", "drs-cal-dropdown"), I = c("div", "drs-cal-grid");
	function L(e) {
		let t = c("div", "drs-cal-month"), r = c("div", "drs-cal-header"), i = c("span", "drs-cal-title"), a = c("button", "drs-cal-nav");
		a.innerHTML = e === "left" ? "&#9664;" : "&#9654;";
		let o = c("span");
		e === "left" ? r.append(a, i, o) : r.append(o, i, a);
		let s = c("div", "drs-cal-weekdays");
		n.forEach((e) => s.appendChild(c("span", null, { text: e })));
		let l = c("div", "drs-cal-days");
		return t.append(r, s, l), {
			month: t,
			title: i,
			nav: a,
			days: l
		};
	}
	let R = L("left"), z = L("right");
	I.append(R.month, z.month);
	let B = c("div", "drs-cal-label", { html: "Click a date to set <strong>start</strong>" });
	F.append(I, B), y && k.append(P, F), d.appendChild(k);
	let V = [];
	if (b) {
		let e = c("div", "drs-presets");
		g.forEach((t) => {
			let n = c("button", "drs-preset", { text: t.label });
			n.dataset.days = t.days, e.appendChild(n), V.push(n);
		}), d.appendChild(e);
	}
	let H = c("div", "drs-slider-row"), U = c("button", "drs-nudge", {
		html: "&#9664;",
		title: "Shift range earlier"
	}), W = c("button", "drs-nudge", {
		html: "&#9654;",
		title: "Shift range later"
	}), G = c("div", "drs-slider-wrap"), K = c("div"), q = c("div", "drs-labels");
	G.append(K, q), v && H.appendChild(U), H.appendChild(G), v && H.appendChild(W), d.appendChild(H);
	let J, Y, X, Z;
	if (_) {
		let e = c("div", "drs-controls");
		J = c("button", "drs-zoom-btn", {
			text: "+ Zoom",
			title: "Zoom in"
		}), Z = c("span", "drs-zoom-level", { text: "3yr view" }), Y = c("button", "drs-zoom-btn", {
			html: "&minus; Zoom",
			title: "Zoom out"
		}), X = c("button", "drs-zoom-btn", {
			text: "Reset",
			title: "Reset to full range"
		}), e.append(J, Z, Y, X), d.appendChild(e);
	}
	e.create(K, {
		start: [h.getTime(), ee.getTime()],
		connect: !0,
		range: {
			min: S,
			max: C
		},
		step: t,
		behaviour: "drag"
	});
	function ne(e) {
		let t = new Date(Number(e[0])), n = new Date(Number(e[1]));
		A.textContent = s(t), j.textContent = s(n);
		let r = o(t, n), i = o(p, m);
		M.textContent = `${r} day${r === 1 ? "" : "s"}`, N.classList.toggle("visible", r >= i), x && x({
			start: t,
			end: n,
			days: r
		});
	}
	if (K.noUiSlider.on("update", ne), y) {
		function e(e) {
			let t = K.noUiSlider.get();
			if (D = e, O = null, e === "start") {
				let e = new Date(Number(t[0]));
				E = new Date(e.getFullYear(), e.getMonth(), 1);
			} else {
				let e = new Date(Number(t[1]));
				E = new Date(e.getFullYear(), e.getMonth() - 1, 1);
			}
			n(), r(), F.classList.add("open"), P.classList.add("open");
		}
		function t() {
			F.classList.remove("open"), P.classList.remove("open");
		}
		function n() {
			B.innerHTML = D === "start" ? "Click a date to set <strong>start</strong>" : "Click a date to set <strong>end</strong>";
		}
		function r() {
			let e = K.noUiSlider.get(), t = O || new Date(Number(e[0])), n = new Date(Number(e[1])), r = E, a = new Date(r.getFullYear(), r.getMonth() + 1, 1);
			R.title.textContent = r.toLocaleDateString("en-US", {
				month: "long",
				year: "numeric"
			}), z.title.textContent = a.toLocaleDateString("en-US", {
				month: "long",
				year: "numeric"
			}), i(R.days, r, t, n), i(z.days, a, t, n);
		}
		function i(e, t, n, r) {
			e.innerHTML = "";
			let i = t.getFullYear(), s = t.getMonth(), l = new Date(i, s, 1).getDay(), u = new Date(i, s + 1, 0).getDate();
			for (let t = 0; t < l; t++) e.appendChild(c("div", "drs-cal-day empty"));
			for (let t = 1; t <= u; t++) {
				let l = c("div", "drs-cal-day", { text: t }), u = new Date(i, s, t);
				u < p || u > m ? l.classList.add("disabled") : (a(u, n) && l.classList.add("range-start"), a(u, r) && l.classList.add("range-end"), u > n && u < r && l.classList.add("in-range"), a(u, f) && l.classList.add("today"), l.addEventListener("click", () => o(u))), e.appendChild(l);
			}
		}
		function o(e) {
			if (D === "start") O = e, D = "end", n(), r();
			else {
				let n = O || new Date(Number(K.noUiSlider.get()[0])), r = e;
				if (r < n) {
					let e = n;
					n = r, r = e;
				}
				K.noUiSlider.set([n.getTime(), r.getTime()]), t();
			}
		}
		R.nav.addEventListener("click", () => {
			E = new Date(E.getFullYear(), E.getMonth() - 1, 1), r();
		}), z.nav.addEventListener("click", () => {
			E = new Date(E.getFullYear(), E.getMonth() + 1, 1), r();
		}), A.addEventListener("click", () => e("start")), j.addEventListener("click", () => e("end")), P.addEventListener("click", t);
	}
	if (b && (V.forEach((e) => {
		e.addEventListener("click", function() {
			V.forEach((e) => e.classList.remove("active")), this.classList.add("active");
			let e = this.dataset.days;
			if (e === "max") K.noUiSlider.set([S, C]);
			else {
				let t = parseInt(e), n = new Date(m.getFullYear(), m.getMonth(), m.getDate() - t);
				K.noUiSlider.set([n.getTime(), C]);
			}
		});
	}), K.noUiSlider.on("start", () => {
		V.forEach((e) => e.classList.remove("active"));
	})), v) {
		function e(e) {
			let n = K.noUiSlider.get(), r = Number(n[0]), i = Number(n[1]), a = i - r, o = Math.min(a, 7 * t) * e, s = r + o, c = i + o;
			s < w ? K.noUiSlider.set([w, w + a]) : c > T ? K.noUiSlider.set([T - a, T]) : K.noUiSlider.set([s, c]), V.forEach((e) => e.classList.remove("active"));
		}
		U.addEventListener("click", () => e(-1)), W.addEventListener("click", () => e(1));
	}
	function Q() {
		q.innerHTML = "";
		let e = new Date(w), t = new Date(T), n = o(e, t);
		if (n <= 60) [e, t].forEach((e) => q.appendChild(c("span", null, { text: s(e) })));
		else if (n <= 365) {
			let n = new Date(e.getFullYear(), e.getMonth(), 1);
			for (; n <= t;) q.appendChild(c("span", null, { text: n.toLocaleDateString("en-US", {
				month: "short",
				year: "2-digit"
			}) })), n.setMonth(n.getMonth() + 1);
		} else for (let n = e.getFullYear(); n <= t.getFullYear(); n++) q.appendChild(c("span", null, { text: String(n) }));
		if (_) {
			let e = o(p, m);
			n >= e ? Z.textContent = Math.round(e / 365) + "yr view" : n >= 365 ? Z.textContent = Math.round(n / 365 * 10) / 10 + "yr view" : n >= 30 ? Z.textContent = Math.round(n / 30) + "mo view" : Z.textContent = n + "d view", Y.disabled = w <= S && T >= C, J.disabled = n <= 14;
		}
	}
	function re() {
		let e = K.noUiSlider.get();
		K.noUiSlider.updateOptions({ range: {
			min: w,
			max: T
		} }, !1), K.noUiSlider.set(e), Q();
	}
	function $(e, t) {
		w = Math.max(e, S), T = Math.min(t, C), re();
	}
	return _ && (J.addEventListener("click", () => {
		let e = K.noUiSlider.get(), n = Number(e[0]), r = Number(e[1]), i = r - n, a = Math.max(i * .5, 14 * t * .5);
		$(n - a, r + a);
	}), Y.addEventListener("click", () => {
		let e = T - w, t = (w + T) / 2;
		$(t - e, t + e);
	}), X.addEventListener("click", () => $(S, C))), Q(), {
		getRange() {
			let e = K.noUiSlider.get(), t = new Date(Number(e[0])), n = new Date(Number(e[1]));
			return {
				start: t,
				end: n,
				days: o(t, n)
			};
		},
		setRange(e, t) {
			K.noUiSlider.set([i(e).getTime(), i(t).getTime()]);
		},
		destroy() {
			K.noUiSlider.destroy(), d.innerHTML = "", d.classList.remove("drs-container");
		}
	};
}
//#endregion
export { l as default };
