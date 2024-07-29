import { LitElement as y, html as B, unsafeHTML as C, customElement as g } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT as M } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as N } from "@umbraco-cms/backoffice/document";
import { UmbContextToken as T } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple as b } from "@umbraco-cms/backoffice/observable-api";
var U = Object.defineProperty, S = Object.getOwnPropertyDescriptor, O = (e) => {
  throw TypeError(e);
}, P = (e, s, t, r) => {
  for (var i = r > 1 ? void 0 : r ? S(s, t) : s, l = e.length - 1, v; l >= 0; l--)
    (v = e[l]) && (i = (r ? v(s, t, i) : v(i)) || i);
  return r && i && U(s, t, i), i;
}, w = (e, s, t) => s.has(e) || O("Cannot " + t), a = (e, s, t) => (w(e, s, "read from private field"), t ? t.call(e) : s.get(e)), o = (e, s, t) => s.has(e) ? O("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(e) : s.set(e, t), n = (e, s, t, r) => (w(e, s, "write to private field"), s.set(e, t), t), p, _, m, u, c, f, d, h;
let k = class extends E(y) {
  constructor() {
    super(), o(this, p), o(this, _), o(this, m), o(this, u), o(this, c), o(this, f, '<uui-loader style="margin-right: 20px"></uui-loader> Loading preview...'), o(this, d, !1), o(this, h, ""), n(this, h, this.blockBeam());
    const e = new T("UmbBlockEntryContext"), s = new T("UmbBlockEntryContext");
    this.consumeContext(N, (t) => {
      n(this, _, t.getUnique()), n(this, u, t.getContentTypeId());
    }), this.consumeContext(M, (t) => {
      n(this, m, t.getAlias()), this.consumeContext(e, (r) => {
        this.observe(r.label, (i) => {
          n(this, c, i), n(this, h, this.blockBeam()), this.requestUpdate();
        }), this.observe(b(r.content, t.value), ([i, l]) => {
          this.handleBlock(i, l);
        });
      }), this.consumeContext(s, (r) => {
        this.observe(r.label, (i) => {
          n(this, c, i), n(this, h, this.blockBeam()), this.requestUpdate();
        }), this.observe(b(r.content, t.value), ([i, l]) => {
          this.handleBlock(i, l);
        });
      });
    });
  }
  handleBlock(e, s) {
    n(this, d, !0);
    const t = JSON.parse(JSON.stringify(s));
    if (t.contentData = [e], JSON.stringify(t) === JSON.stringify(a(this, p)))
      return;
    n(this, p, t);
    const r = {
      content: JSON.stringify(a(this, p)),
      contentId: a(this, _),
      propertyTypeAlias: a(this, m),
      contentTypeId: a(this, u)
    };
    fetch("/api/blockpreview", {
      method: "POST",
      body: JSON.stringify(r),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((i) => i.json()).then((i) => {
      n(this, d, !1), i.html === "blockbeam" ? n(this, h, this.blockBeam()) : n(this, h, '<div style="border: 1px solid var(--uui-color-border,#d8d7d9); min-height: 50px;">' + i.html + "</div>"), this.requestUpdate();
    });
  }
  blockBeam() {
    return `
    <umb-ref-grid-block standalone href="">
      <span style="margin-right: 20px">${a(this, c)}</span> ${a(this, d) ? a(this, f) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return B`${C(a(this, h))}`;
  }
};
p = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
u = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakMap();
h = /* @__PURE__ */ new WeakMap();
k = P([
  g("knowit-instant-block-preview")
], k);
const D = k;
export {
  k as InstantBlockPreview,
  D as default
};
//# sourceMappingURL=knowit-instantblockpreview.js.map
