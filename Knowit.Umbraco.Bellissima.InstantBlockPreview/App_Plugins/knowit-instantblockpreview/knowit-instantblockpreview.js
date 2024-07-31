import { LitElement as C, html as M, unsafeHTML as S, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as N } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT as U } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as W } from "@umbraco-cms/backoffice/document";
import { UmbContextToken as w } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple as y } from "@umbraco-cms/backoffice/observable-api";
var x = Object.defineProperty, P = Object.getOwnPropertyDescriptor, O = (e) => {
  throw TypeError(e);
}, I = (e, s, t, a) => {
  for (var r = a > 1 ? void 0 : a ? P(s, t) : s, i = e.length - 1, p; i >= 0; i--)
    (p = e[i]) && (r = (a ? p(s, t, r) : p(r)) || r);
  return a && r && x(s, t, r), r;
}, T = (e, s, t) => s.has(e) || O("Cannot " + t), n = (e, s, t) => (T(e, s, "read from private field"), t ? t.call(e) : s.get(e)), h = (e, s, t) => s.has(e) ? O("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(e) : s.set(e, t), o = (e, s, t, a) => (T(e, s, "write to private field"), s.set(e, t), t), d, f, _, k, b, c, v, u, l, m;
let g = class extends N(C) {
  constructor() {
    super(), h(this, d), h(this, f), h(this, _), h(this, k), h(this, b), h(this, c), h(this, v, '<uui-loader style="margin-right: 20px"></uui-loader> Loading preview...'), h(this, u, !1), h(this, l, ""), h(this, m), o(this, d, {}), o(this, l, this.blockBeam());
    const e = new w("UmbBlockEntryContext"), s = new w("UmbBlockEntryContext");
    this.consumeContext(W, (t) => {
      o(this, _, t.getUnique()), o(this, b, t.getContentTypeId());
    }), this.consumeContext(U, (t) => {
      o(this, k, t.getAlias()), this.consumeContext(e, (a) => {
        this.observe(a.label, (r) => {
          o(this, c, r), o(this, l, this.blockBeam()), this.requestUpdate();
        }), this.observe(y(a.content, t.value, a.areas), ([r, i]) => {
          this.handleBlock(r, i);
        }), a.areas && this.observe(a.areas, (r) => {
          o(this, m, r);
        });
      }), this.consumeContext(s, (a) => {
        this.observe(a.label, (r) => {
          o(this, c, r), o(this, l, this.blockBeam()), this.requestUpdate();
        }), this.observe(y(a.content, t.value), ([r, i]) => {
          this.handleBlock(r, i);
        });
      });
    });
  }
  handleBlock(e, s) {
    o(this, u, !0);
    const t = JSON.parse(JSON.stringify(s));
    if (e = JSON.parse(JSON.stringify(e)), n(this, d)[e.udi] && JSON.stringify(n(this, d)[e.udi]) === JSON.stringify(e))
      return;
    n(this, d)[e.udi] = e;
    const a = t.contentData.findIndex((i) => i.udi == e.udi);
    if (e.picker) {
      for (let i = 0; i < e.picker.length; i++) {
        const p = `umb://${e.picker[i].type}/${e.picker[i].unique}`;
        e.picker[i] = p;
      }
      e.picker = e.picker.join(",");
    }
    console.log("content", e), t.contentData[a] = e, t.target = e.udi, o(this, f, t);
    const r = {
      content: JSON.stringify(n(this, f)),
      contentId: n(this, _),
      propertyTypeAlias: n(this, k),
      contentTypeId: n(this, b)
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
      this.requestUpdate();
    });
  }
  areas() {
    return n(this, m) && n(this, m).length > 0 ? `
      <umb-ref-grid-block standalone href="">
        <span style="margin-right: 20px">${n(this, c)}</span> ${n(this, u) ? n(this, v) : ""}
        <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>
      </umb-ref-grid-block>
` : "";
  }
  blockBeam() {
    return `
    <umb-ref-grid-block standalone href="">
      <span style="margin-right: 20px">${n(this, c)}</span> ${n(this, u) ? n(this, v) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return M`${S(n(this, l))}`;
  }
};
d = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
u = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
g = I([
  E("knowit-instant-block-preview")
], g);
const G = g;
export {
  g as InstantBlockPreview,
  G as default
};
//# sourceMappingURL=knowit-instantblockpreview.js.map
