import { LitElement as y, html as B, unsafeHTML as C, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as M } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT as g } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as N } from "@umbraco-cms/backoffice/document";
import { UmbContextToken as T } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple as O } from "@umbraco-cms/backoffice/observable-api";
var U = Object.defineProperty, S = Object.getOwnPropertyDescriptor, b = (e) => {
  throw TypeError(e);
}, P = (e, s, t, n) => {
  for (var i = n > 1 ? void 0 : n ? S(s, t) : s, l = e.length - 1, f; l >= 0; l--)
    (f = e[l]) && (i = (n ? f(s, t, i) : f(i)) || i);
  return n && i && U(s, t, i), i;
}, w = (e, s, t) => s.has(e) || b("Cannot " + t), a = (e, s, t) => (w(e, s, "read from private field"), t ? t.call(e) : s.get(e)), o = (e, s, t) => s.has(e) ? b("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(e) : s.set(e, t), r = (e, s, t, n) => (w(e, s, "write to private field"), s.set(e, t), t), p, m, d, u, c, v, _, h;
let k = class extends M(y) {
  constructor() {
    super(), o(this, p), o(this, m), o(this, d), o(this, u), o(this, c), o(this, v, '<uui-loader style="margin-right: 20px"></uui-loader> Loading preview...'), o(this, _, !1), o(this, h, ""), r(this, h, this.blockBeam());
    const e = new T("UmbBlockEntryContext"), s = new T("UmbBlockEntryContext");
    this.consumeContext(N, (t) => {
      r(this, m, t.getUnique()), r(this, u, t.getContentTypeId());
    }), this.consumeContext(g, (t) => {
      r(this, d, t.getAlias()), this.consumeContext(e, (n) => {
        this.observe(n.label, (i) => {
          r(this, c, i), r(this, h, this.blockBeam()), this.requestUpdate();
        }), this.observe(O(n.content, t.value), ([i, l]) => {
          this.handleBlock(i, l);
        });
      }), this.consumeContext(s, (n) => {
        this.observe(n.label, (i) => {
          r(this, c, i), r(this, h, this.blockBeam()), this.requestUpdate();
        }), this.observe(O(n.content, t.value), ([i, l]) => {
          this.handleBlock(i, l);
        });
      });
    });
  }
  handleBlock(e, s) {
    r(this, _, !0);
    const t = JSON.parse(JSON.stringify(s));
    if (t.contentData = [e], JSON.stringify(t) === JSON.stringify(a(this, p)))
      return;
    r(this, p, t);
    const n = {
      content: JSON.stringify(a(this, p)),
      contentId: a(this, m),
      propertyTypeAlias: a(this, d),
      contentTypeId: a(this, u)
    };
    fetch("/api/blockpreview", {
      method: "POST",
      body: JSON.stringify(n),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((i) => i.json()).then((i) => {
      r(this, _, !1), i.html === "blockbeam" ? r(this, h, this.blockBeam()) : r(this, h, i.html), this.requestUpdate();
    });
  }
  blockBeam() {
    return `
    <umb-ref-grid-block standalone href="">
      <span style="margin-right: 20px">${a(this, c)}</span> ${a(this, _) ? a(this, v) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return B`${C(a(this, h))}`;
  }
};
p = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakMap();
u = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
h = /* @__PURE__ */ new WeakMap();
k = P([
  E("knowit-instant-block-preview")
], k);
const D = k;
export {
  k as InstantBlockPreview,
  D as default
};
//# sourceMappingURL=knowit-instantblockpreview.js.map
