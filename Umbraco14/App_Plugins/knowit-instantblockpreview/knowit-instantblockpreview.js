import { LitElement as y, html as B, unsafeHTML as C, customElement as M } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT as S } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as N } from "@umbraco-cms/backoffice/document";
import { UmbContextToken as T } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple as w } from "@umbraco-cms/backoffice/observable-api";
var U = Object.defineProperty, W = Object.getOwnPropertyDescriptor, O = (s) => {
  throw TypeError(s);
}, P = (s, r, t, i) => {
  for (var e = i > 1 ? void 0 : i ? W(r, t) : r, h = s.length - 1, c; h >= 0; h--)
    (c = s[h]) && (e = (i ? c(r, t, e) : c(e)) || e);
  return i && e && U(r, t, e), e;
}, g = (s, r, t) => r.has(s) || O("Cannot " + t), n = (s, r, t) => (g(s, r, "read from private field"), t ? t.call(s) : r.get(s)), o = (s, r, t) => r.has(s) ? O("Cannot add the same private member more than once") : r instanceof WeakSet ? r.add(s) : r.set(s, t), a = (s, r, t, i) => (g(s, r, "write to private field"), r.set(s, t), t), p, _, v, f, d, b, m, l, u;
let k = class extends E(y) {
  constructor() {
    super(), o(this, p), o(this, _), o(this, v), o(this, f), o(this, d), o(this, b, '<uui-loader style="margin-right: 20px"></uui-loader> Loading preview...'), o(this, m, !1), o(this, l, ""), o(this, u), a(this, l, this.blockBeam());
    const s = new T("UmbBlockEntryContext"), r = new T("UmbBlockEntryContext");
    this.consumeContext(N, (t) => {
      a(this, _, t.getUnique()), a(this, f, t.getContentTypeId());
    }), this.consumeContext(S, (t) => {
      a(this, v, t.getAlias()), this.consumeContext(s, (i) => {
        this.observe(i.label, (e) => {
          a(this, d, e), a(this, l, this.blockBeam()), this.requestUpdate();
        }), this.observe(w(i.content, t.value, i.areas), ([e, h]) => {
          this.handleBlock(e, h);
        }), i.areas && this.observe(i.areas, (e) => {
          a(this, u, e);
        });
      }), this.consumeContext(r, (i) => {
        this.observe(i.label, (e) => {
          a(this, d, e), a(this, l, this.blockBeam()), this.requestUpdate();
        }), this.observe(w(i.content, t.value), ([e, h]) => {
          this.handleBlock(e, h);
        });
      });
    });
  }
  handleBlock(s, r) {
    a(this, m, !0);
    const t = JSON.parse(JSON.stringify(r));
    if (t.contentData = [s], JSON.stringify(t) === JSON.stringify(n(this, p)))
      return;
    a(this, p, t);
    const i = {
      content: JSON.stringify(n(this, p)),
      contentId: n(this, _),
      propertyTypeAlias: n(this, v),
      contentTypeId: n(this, f)
    };
    fetch("/api/blockpreview", {
      method: "POST",
      body: JSON.stringify(i),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((e) => e.json()).then((e) => {
      if (a(this, m, !1), e.html === "blockbeam")
        a(this, l, this.blockBeam());
      else {
        if (e.html.includes("###renderGridAreaSlots")) {
          const c = this.areas();
          console.log(c), e.html = e.html.replace("###renderGridAreaSlots", c);
        }
        a(this, l, '<div style="border: 1px solid var(--uui-color-border,#d8d7d9); min-height: 50px;">' + e.html + "</div>");
      }
      this.requestUpdate();
    });
  }
  areas() {
    return n(this, u) && n(this, u).length > 0 ? `
      <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>` : "";
  }
  blockBeam() {
    return `
    <umb-ref-grid-block standalone href="">
      <span style="margin-right: 20px">${n(this, d)}</span> ${n(this, m) ? n(this, b) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return B`${C(n(this, l))}`;
  }
};
p = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakMap();
u = /* @__PURE__ */ new WeakMap();
k = P([
  M("knowit-instant-block-preview")
], k);
const J = k;
export {
  k as InstantBlockPreview,
  J as default
};
//# sourceMappingURL=knowit-instantblockpreview.js.map
