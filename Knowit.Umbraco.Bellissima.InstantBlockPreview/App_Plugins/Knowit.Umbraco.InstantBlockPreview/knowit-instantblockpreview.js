import { LitElement as C, html as b, unsafeHTML as B, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as M } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT as g } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as N } from "@umbraco-cms/backoffice/document";
import { UmbContextToken as k } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple as O } from "@umbraco-cms/backoffice/observable-api";
var U = Object.defineProperty, S = Object.getOwnPropertyDescriptor, w = (e) => {
  throw TypeError(e);
}, P = (e, s, t, n) => {
  for (var i = n > 1 ? void 0 : n ? S(s, t) : s, h = e.length - 1, f; h >= 0; h--)
    (f = e[h]) && (i = (n ? f(s, t, i) : f(i)) || i);
  return n && i && U(s, t, i), i;
}, y = (e, s, t) => s.has(e) || w("Cannot " + t), a = (e, s, t) => (y(e, s, "read from private field"), t ? t.call(e) : s.get(e)), o = (e, s, t) => s.has(e) ? w("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(e) : s.set(e, t), r = (e, s, t, n) => (y(e, s, "write to private field"), s.set(e, t), t), p, d, u, m, c, v, _, l;
let T = class extends M(C) {
  constructor() {
    super(), o(this, p), o(this, d), o(this, u), o(this, m), o(this, c), o(this, v, '<uui-loader style="margin-right: 20px"></uui-loader> Loading preview...'), o(this, _, !1), o(this, l, ""), r(this, l, this.blockBeam());
    const e = new k("UmbBlockEntryContext"), s = new k("UmbBlockEntryContext");
    this.consumeContext(N, (t) => {
      r(this, d, t.getUnique()), r(this, m, t.getContentTypeId());
    }), this.consumeContext(g, (t) => {
      r(this, u, t.getAlias()), this.consumeContext(e, (n) => {
        this.observe(n.label, (i) => {
          r(this, c, i), r(this, l, this.blockBeam()), this.requestUpdate();
        }), this.observe(O(n.content, t.value), ([i, h]) => {
          this.handleBlock(i, h);
        });
      }), this.consumeContext(s, (n) => {
        this.observe(n.label, (i) => {
          r(this, c, i), r(this, l, this.blockBeam()), this.requestUpdate();
        }), this.observe(O(n.content, t.value), ([i, h]) => {
          this.handleBlock(i, h);
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
      contentId: a(this, d),
      propertyTypeAlias: a(this, u),
      contentTypeId: a(this, m)
    };
    fetch("/api/blockpreview", {
      method: "POST",
      body: JSON.stringify(n),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((i) => i.json()).then((i) => {
      r(this, _, !1), r(this, l, i.html), this.requestUpdate();
    });
  }
  blockBeam() {
    return `
    <umb-ref-grid-block standalone href="">
      <span style="margin-right: 20px">${a(this, c)}</span> ${a(this, _) ? a(this, v) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return b`${B(a(this, l))}`;
  }
};
p = /* @__PURE__ */ new WeakMap();
d = /* @__PURE__ */ new WeakMap();
u = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakMap();
T = P([
  E("knowit-instant-block-preview")
], T);
const D = T;
export {
  T as InstantBlockPreview,
  D as default
};
//# sourceMappingURL=knowit-instantblockpreview.js.map
