import { LitElement as C, html as E, unsafeHTML as M, customElement as N } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as A } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT as x } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as S } from "@umbraco-cms/backoffice/document";
import { UmbContextToken as k } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple as w } from "@umbraco-cms/backoffice/observable-api";
import { debounce as I } from "@umbraco-cms/backoffice/utils";
var U = Object.defineProperty, D = Object.getOwnPropertyDescriptor, O = (t) => {
  throw TypeError(t);
}, P = (t, s, e, a) => {
  for (var r = a > 1 ? void 0 : a ? D(s, e) : s, i = t.length - 1, f; i >= 0; i--)
    (f = t[i]) && (r = (a ? f(s, e, r) : f(r)) || r);
  return a && r && U(s, e, r), r;
}, T = (t, s, e) => s.has(t) || O("Cannot " + e), n = (t, s, e) => (T(t, s, "read from private field"), e ? e.call(t) : s.get(t)), h = (t, s, e) => s.has(t) ? O("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(t) : s.set(t, e), o = (t, s, e, a) => (T(t, s, "write to private field"), s.set(t, e), e), p, c, b, _, y, d, g, u, l, m;
let v = class extends A(C) {
  constructor() {
    super(), h(this, p), h(this, c), h(this, b), h(this, _), h(this, y), h(this, d), h(this, g, '<uui-loader style="margin-right: 20px"></uui-loader> Loading preview...'), h(this, u, !1), h(this, l, ""), h(this, m), o(this, p, {}), o(this, l, this.blockBeam());
    const t = new k("UmbBlockEntryContext"), s = new k("UmbBlockEntryContext");
    this.consumeContext(S, (e) => {
      o(this, b, e.getUnique()), o(this, y, e.getContentTypeId());
    }), this.consumeContext(x, (e) => {
      o(this, _, e.getAlias()), this.consumeContext(t, (a) => {
        this.observe(a.label, (r) => {
          o(this, d, r), o(this, l, this.blockBeam()), this.requestUpdate();
        }), this.observe(w(a.content, e.value), ([r, i]) => {
          this.handleBlock(r, i);
        }), a.areas && this.observe(a.areas, (r) => {
          o(this, m, r);
        });
      }), this.consumeContext(s, (a) => {
        this.observe(a.label, (r) => {
          o(this, d, r), o(this, l, this.blockBeam()), this.requestUpdate();
        }), this.observe(w(a.content, e.value), ([r, i]) => {
          this.handleBlock(r, i);
        });
      });
    });
  }
  parseBadKeys(t) {
    for (const s in t) {
      const e = t[s];
      if (Array.isArray(t[s]) && t[s].every((r) => r && typeof r.type == "string" && typeof r.unique == "string")) {
        for (let r = 0; r < t[s].length; r++) {
          const i = `umb://${t[s][r].type}/${t[s][r].unique}`;
          t[s][r] = i;
        }
        t[s] = t[s].join(",");
      }
      e && typeof e == "object" && "from" in e && "to" in e && typeof e.from == "number" && typeof e.to == "number" && e.from === e.to && (t[s] = e.from);
    }
    return t;
  }
  handleBlock(t, s) {
    if (o(this, u, !0), !s) return;
    const e = JSON.parse(JSON.stringify(s));
    if (t = JSON.parse(JSON.stringify(t)), n(this, p)[t.udi] && JSON.stringify(n(this, p)[t.udi]) === JSON.stringify(t))
      return;
    n(this, p)[t.udi] = t;
    const a = e.contentData.findIndex((i) => i.udi == t.udi);
    e.contentData[a] = t, e.target = t.udi;
    for (let i = 0; i < e.settingsData.length; i++)
      e.settingsData[i] = this.parseBadKeys(e.settingsData[i]);
    for (let i = 0; i < e.contentData.length; i++)
      e.contentData[i] = this.parseBadKeys(e.contentData[i]);
    o(this, c, e);
    const r = {
      content: JSON.stringify(n(this, c)),
      contentId: n(this, b),
      propertyTypeAlias: n(this, _),
      contentTypeId: n(this, y)
    };
    fetch("/api/blockpreview", {
      method: "POST",
      body: JSON.stringify(r),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((i) => i.json()).then((i) => {
      if (o(this, u, !1), i.html === "blockbeam")
        o(this, l, this.blockBeam());
      else {
        if (i.html.includes("###renderGridAreaSlots")) {
          const B = this.areas();
          i.html = i.html.replace("###renderGridAreaSlots", B);
        }
        o(this, l, '<div style="border: 1px solid var(--uui-color-border,#d8d7d9); min-height: 50px; box-sizing: border-box;">' + i.html + "</div>");
      }
      this.requestUpdate(), I(() => {
        this.manageScripts();
      }, 100)();
    });
  }
  manageScripts() {
    var s;
    const t = (s = this.shadowRoot) == null ? void 0 : s.querySelectorAll("script");
    t == null || t.forEach((e) => {
      var r;
      const a = document.createElement("script");
      Array.from(e.attributes).forEach((i) => {
        a.setAttribute(i.name, i.value);
      }), e.src ? a.src = e.src : a.textContent = e.textContent, (r = e == null ? void 0 : e.parentNode) == null || r.replaceChild(a, e);
    });
  }
  areas() {
    return n(this, m) && n(this, m).length > 0 ? `
      <umb-ref-grid-block standalone href="">
        <span style="margin-right: 20px">${n(this, d)}</span> ${n(this, u) ? n(this, g) : ""}
        <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>
      </umb-ref-grid-block>
      ` : "";
  }
  blockBeam() {
    return `
    <umb-ref-grid-block standalone href="">
      <span style="margin-right: 20px">${n(this, d)}</span> ${n(this, u) ? n(this, g) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return E`${M(n(this, l))}`;
  }
};
p = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
u = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
v = P([
  N("knowit-instant-block-preview")
], v);
const X = v;
export {
  v as InstantBlockPreview,
  X as default
};
//# sourceMappingURL=knowit-instantblockpreview.js.map
