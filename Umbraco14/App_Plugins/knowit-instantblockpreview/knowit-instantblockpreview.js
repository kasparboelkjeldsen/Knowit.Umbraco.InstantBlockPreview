import { LitElement as B, html as M, unsafeHTML as N, customElement as A } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as x } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT as S } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as I } from "@umbraco-cms/backoffice/document";
import { UmbContextToken as O } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple as T } from "@umbraco-cms/backoffice/observable-api";
import { debounce as U } from "@umbraco-cms/backoffice/utils";
var P = Object.defineProperty, W = Object.getOwnPropertyDescriptor, C = (e) => {
  throw TypeError(e);
}, R = (e, r, t, a) => {
  for (var i = a > 1 ? void 0 : a ? W(r, t) : r, s = e.length - 1, m; s >= 0; s--)
    (m = e[s]) && (i = (a ? m(r, t, i) : m(i)) || i);
  return a && i && P(r, t, i), i;
}, E = (e, r, t) => r.has(e) || C("Cannot " + t), n = (e, r, t) => (E(e, r, "read from private field"), t ? t.call(e) : r.get(e)), l = (e, r, t) => r.has(e) ? C("Cannot add the same private member more than once") : r instanceof WeakSet ? r.add(e) : r.set(e, t), o = (e, r, t, a) => (E(e, r, "write to private field"), r.set(e, t), t), p, b, _, v, y, u, g, c, d, f;
let w = class extends x(B) {
  constructor() {
    super(), l(this, p), l(this, b), l(this, _), l(this, v), l(this, y), l(this, u), l(this, g, '<uui-loader style="margin-right: 20px"></uui-loader> Loading preview...'), l(this, c, !1), l(this, d, ""), l(this, f), o(this, p, {}), o(this, d, this.blockBeam());
    const e = new O("UmbBlockEntryContext"), r = new O("UmbBlockEntryContext");
    this.consumeContext(I, (t) => {
      o(this, _, t.getUnique()), o(this, y, t.getContentTypeId());
    }), this.consumeContext(S, (t) => {
      o(this, v, t.getAlias()), this.consumeContext(e, (a) => {
        this.observe(a.label, (i) => {
          o(this, u, i), o(this, d, this.blockBeam()), this.requestUpdate();
        }), this.observe(T(a.content, t.value), ([i, s]) => {
          this.handleBlock(i, s);
        }), a.areas && this.observe(a.areas, (i) => {
          o(this, f, i);
        });
      }), this.consumeContext(r, (a) => {
        this.observe(a.label, (i) => {
          o(this, u, i), o(this, d, this.blockBeam()), this.requestUpdate();
        }), this.observe(T(a.content, t.value), ([i, s]) => {
          this.handleBlock(i, s);
        });
      });
    });
  }
  handleBlock(e, r) {
    if (o(this, c, !0), !r) return;
    const t = JSON.parse(JSON.stringify(r));
    if (e = JSON.parse(JSON.stringify(e)), n(this, p)[e.udi] && JSON.stringify(n(this, p)[e.udi]) === JSON.stringify(e))
      return;
    n(this, p)[e.udi] = e;
    const a = t.contentData.findIndex((s) => s.udi == e.udi);
    for (const s in e)
      if (Array.isArray(e[s]) && e[s].every((h) => h && typeof h.type == "string" && typeof h.unique == "string")) {
        for (let h = 0; h < e[s].length; h++) {
          const k = `umb://${e[s][h].type}/${e[s][h].unique}`;
          e[s][h] = k;
        }
        e[s] = e[s].join(",");
      }
    t.contentData[a] = e, t.target = e.udi, o(this, b, t);
    const i = {
      content: JSON.stringify(n(this, b)),
      contentId: n(this, _),
      propertyTypeAlias: n(this, v),
      contentTypeId: n(this, y)
    };
    fetch("/api/blockpreview", {
      method: "POST",
      body: JSON.stringify(i),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((s) => s.json()).then((s) => {
      if (o(this, c, !1), s.html === "blockbeam")
        o(this, d, this.blockBeam());
      else {
        if (s.html.includes("###renderGridAreaSlots")) {
          const k = this.areas();
          s.html = s.html.replace("###renderGridAreaSlots", k);
        }
        o(this, d, '<div style="border: 1px solid var(--uui-color-border,#d8d7d9); min-height: 50px; box-sizing: border-box;">' + s.html + "</div>");
      }
      this.requestUpdate(), U(() => {
        this.manageScripts();
      }, 100)();
    });
  }
  manageScripts() {
    var r;
    const e = (r = this.shadowRoot) == null ? void 0 : r.querySelectorAll("script");
    e == null || e.forEach((t) => {
      var i;
      const a = document.createElement("script");
      Array.from(t.attributes).forEach((s) => {
        a.setAttribute(s.name, s.value);
      }), t.src ? a.src = t.src : a.textContent = t.textContent, (i = t == null ? void 0 : t.parentNode) == null || i.replaceChild(a, t);
    });
  }
  areas() {
    return n(this, f) && n(this, f).length > 0 ? `
      <umb-ref-grid-block standalone href="">
        <span style="margin-right: 20px">${n(this, u)}</span> ${n(this, c) ? n(this, g) : ""}
        <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>
      </umb-ref-grid-block>
      ` : "";
  }
  blockBeam() {
    return `
    <umb-ref-grid-block standalone href="">
      <span style="margin-right: 20px">${n(this, u)}</span> ${n(this, c) ? n(this, g) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return M`${N(n(this, d))}`;
  }
};
p = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
u = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakMap();
w = R([
  A("knowit-instant-block-preview")
], w);
const K = w;
export {
  w as InstantBlockPreview,
  K as default
};
//# sourceMappingURL=knowit-instantblockpreview.js.map
