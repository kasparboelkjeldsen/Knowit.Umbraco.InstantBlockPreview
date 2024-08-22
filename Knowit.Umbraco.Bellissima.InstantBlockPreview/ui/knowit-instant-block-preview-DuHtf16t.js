import { LitElement as $, html as W, unsafeHTML as J, customElement as K } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as z } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT as X } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as V } from "@umbraco-cms/backoffice/document";
import { UmbContextToken as U } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple as F } from "@umbraco-cms/backoffice/observable-api";
import { debounce as Y } from "@umbraco-cms/backoffice/utils";
import { O as n } from "./index-BI0tBnYC.js";
class P extends Error {
  constructor(e, r, s) {
    super(s), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class Q extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class Z {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, s) => {
      this._resolve = r, this._reject = s;
      const o = (d) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(d));
      }, a = (d) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isRejected = !0, this._reject && this._reject(d));
      }, c = (d) => {
        this._isResolved || this._isRejected || this._isCancelled || this.cancelHandlers.push(d);
      };
      return Object.defineProperty(c, "isResolved", {
        get: () => this._isResolved
      }), Object.defineProperty(c, "isRejected", {
        get: () => this._isRejected
      }), Object.defineProperty(c, "isCancelled", {
        get: () => this._isCancelled
      }), e(o, a, c);
    });
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(e, r) {
    return this.promise.then(e, r);
  }
  catch(e) {
    return this.promise.catch(e);
  }
  finally(e) {
    return this.promise.finally(e);
  }
  cancel() {
    if (!(this._isResolved || this._isRejected || this._isCancelled)) {
      if (this._isCancelled = !0, this.cancelHandlers.length)
        try {
          for (const e of this.cancelHandlers)
            e();
        } catch (e) {
          console.warn("Cancellation threw an error", e);
          return;
        }
      this.cancelHandlers.length = 0, this._reject && this._reject(new Q("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
const q = (t) => typeof t == "string", I = (t) => q(t) && t !== "", C = (t) => t instanceof Blob, G = (t) => t instanceof FormData, ee = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, te = (t) => {
  const e = [], r = (o, a) => {
    e.push(`${encodeURIComponent(o)}=${encodeURIComponent(String(a))}`);
  }, s = (o, a) => {
    a != null && (a instanceof Date ? r(o, a.toISOString()) : Array.isArray(a) ? a.forEach((c) => s(o, c)) : typeof a == "object" ? Object.entries(a).forEach(([c, d]) => s(`${o}[${c}]`, d)) : r(o, a));
  };
  return Object.entries(t).forEach(([o, a]) => s(o, a)), e.length ? `?${e.join("&")}` : "";
}, re = (t, e) => {
  const r = encodeURI, s = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (a, c) => {
    var d;
    return (d = e.path) != null && d.hasOwnProperty(c) ? r(String(e.path[c])) : a;
  }), o = t.BASE + s;
  return e.query ? o + te(e.query) : o;
}, ae = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (s, o) => {
      q(o) || C(o) ? e.append(s, o) : e.append(s, JSON.stringify(o));
    };
    return Object.entries(t.formData).filter(([, s]) => s != null).forEach(([s, o]) => {
      Array.isArray(o) ? o.forEach((a) => r(s, a)) : r(s, o);
    }), e;
  }
}, B = async (t, e) => typeof e == "function" ? e(t) : e, oe = async (t, e) => {
  const [r, s, o, a] = await Promise.all([
    // @ts-ignore
    B(e, t.TOKEN),
    // @ts-ignore
    B(e, t.USERNAME),
    // @ts-ignore
    B(e, t.PASSWORD),
    // @ts-ignore
    B(e, t.HEADERS)
  ]), c = Object.entries({
    Accept: "application/json",
    ...a,
    ...e.headers
  }).filter(([, d]) => d != null).reduce((d, [m, h]) => ({
    ...d,
    [m]: String(h)
  }), {});
  if (I(r) && (c.Authorization = `Bearer ${r}`), I(s) && I(o)) {
    const d = ee(`${s}:${o}`);
    c.Authorization = `Basic ${d}`;
  }
  return e.body !== void 0 && (e.mediaType ? c["Content-Type"] = e.mediaType : C(e.body) ? c["Content-Type"] = e.body.type || "application/octet-stream" : q(e.body) ? c["Content-Type"] = "text/plain" : G(e.body) || (c["Content-Type"] = "application/json")), new Headers(c);
}, se = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : q(t.body) || C(t.body) || G(t.body) ? t.body : JSON.stringify(t.body);
}, ne = async (t, e, r, s, o, a, c) => {
  const d = new AbortController();
  let m = {
    headers: a,
    body: s ?? o,
    method: e.method,
    signal: d.signal
  };
  t.WITH_CREDENTIALS && (m.credentials = t.CREDENTIALS);
  for (const h of t.interceptors.request._fns)
    m = await h(m);
  return c(() => d.abort()), await fetch(r, m);
}, ie = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (q(r))
      return r;
  }
}, ce = async (t) => {
  if (t.status !== 204)
    try {
      const e = t.headers.get("Content-Type");
      if (e) {
        const r = ["application/octet-stream", "application/pdf", "application/zip", "audio/", "image/", "video/"];
        if (e.includes("application/json") || e.includes("+json"))
          return await t.json();
        if (r.some((s) => e.includes(s)))
          return await t.blob();
        if (e.includes("multipart/form-data"))
          return await t.formData();
        if (e.includes("text/"))
          return await t.text();
      }
    } catch (e) {
      console.error(e);
    }
}, de = (t, e) => {
  const s = {
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "Im a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Content",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
    ...t.errors
  }[e.status];
  if (s)
    throw new P(t, e, s);
  if (!e.ok) {
    const o = e.status ?? "unknown", a = e.statusText ?? "unknown", c = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new P(
      t,
      e,
      `Generic Error: status: ${o}; status text: ${a}; body: ${c}`
    );
  }
}, i = (t, e) => new Z(async (r, s, o) => {
  try {
    const a = re(t, e), c = ae(e), d = se(e), m = await oe(t, e);
    if (!o.isCancelled) {
      let h = await ne(t, e, a, d, c, m, o);
      for (const L of t.interceptors.response._fns)
        h = await L(h);
      const b = await ce(h), M = ie(h, e.responseHeader);
      let O = b;
      e.responseTransformer && h.ok && (O = await e.responseTransformer(b));
      const S = {
        url: a,
        ok: h.ok,
        status: h.status,
        statusText: h.statusText,
        body: M ?? O
      };
      de(e, S), r(S.body);
    }
  } catch (a) {
    s(a);
  }
});
class j {
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDataType(e = {}) {
    return i(n, {
      method: "POST",
      url: "/umbraco/management/api/v1/data-type",
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDataTypeById(e) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/data-type/{id}",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns string OK
   * @throws ApiError
   */
  static deleteDataTypeById(e) {
    return i(n, {
      method: "DELETE",
      url: "/umbraco/management/api/v1/data-type/{id}",
      path: {
        id: e.id
      },
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDataTypeById(e) {
    return i(n, {
      method: "PUT",
      url: "/umbraco/management/api/v1/data-type/{id}",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDataTypeByIdCopy(e) {
    return i(n, {
      method: "POST",
      url: "/umbraco/management/api/v1/data-type/{id}/copy",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns boolean OK
   * @throws ApiError
   */
  static getDataTypeByIdIsUsed(e) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/data-type/{id}/is-used",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDataTypeByIdMove(e) {
    return i(n, {
      method: "PUT",
      url: "/umbraco/management/api/v1/data-type/{id}/move",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDataTypeByIdReferences(e) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/data-type/{id}/references",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @returns unknown OK
   * @throws ApiError
   */
  static getDataTypeConfiguration() {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/data-type/configuration",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDataTypeFolder(e = {}) {
    return i(n, {
      method: "POST",
      url: "/umbraco/management/api/v1/data-type/folder",
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDataTypeFolderById(e) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/data-type/folder/{id}",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns string OK
   * @throws ApiError
   */
  static deleteDataTypeFolderById(e) {
    return i(n, {
      method: "DELETE",
      url: "/umbraco/management/api/v1/data-type/folder/{id}",
      path: {
        id: e.id
      },
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDataTypeFolderById(e) {
    return i(n, {
      method: "PUT",
      url: "/umbraco/management/api/v1/data-type/folder/{id}",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.skip
   * @param data.take
   * @param data.name
   * @param data.editorUiAlias
   * @param data.editorAlias
   * @returns unknown OK
   * @throws ApiError
   */
  static getFilterDataType(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/filter/data-type",
      query: {
        skip: e.skip,
        take: e.take,
        name: e.name,
        editorUiAlias: e.editorUiAlias,
        editorAlias: e.editorAlias
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getItemDataType(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/item/data-type",
      query: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.query
   * @param data.skip
   * @param data.take
   * @returns unknown OK
   * @throws ApiError
   */
  static getItemDataTypeSearch(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/item/data-type/search",
      query: {
        query: e.query,
        skip: e.skip,
        take: e.take
      },
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.descendantId
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDataTypeAncestors(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/data-type/ancestors",
      query: {
        descendantId: e.descendantId
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.parentId
   * @param data.skip
   * @param data.take
   * @param data.foldersOnly
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDataTypeChildren(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/data-type/children",
      query: {
        parentId: e.parentId,
        skip: e.skip,
        take: e.take,
        foldersOnly: e.foldersOnly
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.skip
   * @param data.take
   * @param data.foldersOnly
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDataTypeRoot(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/data-type/root",
      query: {
        skip: e.skip,
        take: e.take,
        foldersOnly: e.foldersOnly
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
}
class A {
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDocumentType(e = {}) {
    return i(n, {
      method: "POST",
      url: "/umbraco/management/api/v1/document-type",
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeById(e) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/{id}",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns string OK
   * @throws ApiError
   */
  static deleteDocumentTypeById(e) {
    return i(n, {
      method: "DELETE",
      url: "/umbraco/management/api/v1/document-type/{id}",
      path: {
        id: e.id
      },
      responseHeader: "Umb-Notifications",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDocumentTypeById(e) {
    return i(n, {
      method: "PUT",
      url: "/umbraco/management/api/v1/document-type/{id}",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.skip
   * @param data.take
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeByIdAllowedChildren(e) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/{id}/allowed-children",
      path: {
        id: e.id
      },
      query: {
        skip: e.skip,
        take: e.take
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.skip
   * @param data.take
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeByIdBlueprint(e) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/{id}/blueprint",
      path: {
        id: e.id
      },
      query: {
        skip: e.skip,
        take: e.take
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeByIdCompositionReferences(e) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/{id}/composition-references",
      path: {
        id: e.id
      },
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDocumentTypeByIdCopy(e) {
    return i(n, {
      method: "POST",
      url: "/umbraco/management/api/v1/document-type/{id}/copy",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeByIdExport(e) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/{id}/export",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDocumentTypeByIdImport(e) {
    return i(n, {
      method: "PUT",
      url: "/umbraco/management/api/v1/document-type/{id}/import",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDocumentTypeByIdMove(e) {
    return i(n, {
      method: "PUT",
      url: "/umbraco/management/api/v1/document-type/{id}/move",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.skip
   * @param data.take
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeAllowedAtRoot(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/allowed-at-root",
      query: {
        skip: e.skip,
        take: e.take
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns unknown OK
   * @throws ApiError
   */
  static postDocumentTypeAvailableCompositions(e = {}) {
    return i(n, {
      method: "POST",
      url: "/umbraco/management/api/v1/document-type/available-compositions",
      body: e.requestBody,
      mediaType: "application/json",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeConfiguration() {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/configuration",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDocumentTypeFolder(e = {}) {
    return i(n, {
      method: "POST",
      url: "/umbraco/management/api/v1/document-type/folder",
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeFolderById(e) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/folder/{id}",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns string OK
   * @throws ApiError
   */
  static deleteDocumentTypeFolderById(e) {
    return i(n, {
      method: "DELETE",
      url: "/umbraco/management/api/v1/document-type/folder/{id}",
      path: {
        id: e.id
      },
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDocumentTypeFolderById(e) {
    return i(n, {
      method: "PUT",
      url: "/umbraco/management/api/v1/document-type/folder/{id}",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDocumentTypeImport(e = {}) {
    return i(n, {
      method: "POST",
      url: "/umbraco/management/api/v1/document-type/import",
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getItemDocumentType(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/item/document-type",
      query: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.query
   * @param data.skip
   * @param data.take
   * @returns unknown OK
   * @throws ApiError
   */
  static getItemDocumentTypeSearch(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/item/document-type/search",
      query: {
        query: e.query,
        skip: e.skip,
        take: e.take
      },
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.descendantId
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDocumentTypeAncestors(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/document-type/ancestors",
      query: {
        descendantId: e.descendantId
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.parentId
   * @param data.skip
   * @param data.take
   * @param data.foldersOnly
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDocumentTypeChildren(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/document-type/children",
      query: {
        parentId: e.parentId,
        skip: e.skip,
        take: e.take,
        foldersOnly: e.foldersOnly
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.skip
   * @param data.take
   * @param data.foldersOnly
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDocumentTypeRoot(e = {}) {
    return i(n, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/document-type/root",
      query: {
        skip: e.skip,
        take: e.take,
        foldersOnly: e.foldersOnly
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
}
var ue = Object.defineProperty, he = Object.getOwnPropertyDescriptor, H = (t) => {
  throw TypeError(t);
}, pe = (t, e, r, s) => {
  for (var o = s > 1 ? void 0 : s ? he(e, r) : e, a = t.length - 1, c; a >= 0; a--)
    (c = t[a]) && (o = (s ? c(e, r, o) : c(o)) || o);
  return s && o && ue(e, r, o), o;
}, x = (t, e, r) => e.has(t) || H("Cannot " + r), u = (t, e, r) => (x(t, e, "read from private field"), r ? r.call(t) : e.get(t)), l = (t, e, r) => e.has(t) ? H("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), p = (t, e, r, s) => (x(t, e, "write to private field"), e.set(t, r), r), f, y, E, D, R, N, g, _, v, T, k;
let w = class extends z($) {
  constructor() {
    super(), l(this, f), l(this, y), l(this, E), l(this, D), l(this, R), l(this, N), l(this, g), l(this, _, '<uui-loader style="margin-right: 20px"></uui-loader> Loading preview...'), l(this, v, !1), l(this, T, ""), l(this, k), p(this, f, {}), p(this, y, {}), p(this, T, this.blockBeam());
    const t = new U("UmbBlockEntryContext"), e = new U("UmbBlockEntryContext");
    this.consumeContext(V, (r) => {
      p(this, D, r.getUnique()), p(this, N, r.getContentTypeId());
    }), this.consumeContext(X, (r) => {
      p(this, R, r.getAlias()), this.consumeContext(t, (s) => {
        this.observe(s.label, (o) => {
          p(this, g, o), p(this, T, this.blockBeam()), this.requestUpdate();
        }), this.observe(F(s.content, r.value), ([o, a]) => {
          const c = o;
          u(this, y)[c.contentTypeKey] === void 0 ? A.getDocumentTypeById({ id: c.contentTypeKey }).then((d) => {
            const m = d.properties.map((h) => j.getDataTypeById({ id: h.dataType.id }).then((b) => {
              u(this, y)[h.alias] = b.editorAlias;
            }));
            Promise.all(m).then(() => {
              this.handleBlock(c, a);
            });
          }) : this.handleBlock(c, a);
        }), s.areas && this.observe(s.areas, (o) => {
          p(this, k, o);
        });
      }), this.consumeContext(e, (s) => {
        this.observe(s.label, (o) => {
          p(this, g, o), p(this, T, this.blockBeam()), this.requestUpdate();
        }), this.observe(F(s.content, r.value), ([o, a]) => {
          const c = o;
          u(this, y)[c.contentTypeKey] === void 0 ? A.getDocumentTypeById({ id: c.contentTypeKey }).then((d) => {
            const m = d.properties.map((h) => j.getDataTypeById({ id: h.dataType.id }).then((b) => {
              u(this, y)[h.alias] = b.editorAlias;
            }));
            Promise.all(m).then(() => {
              this.handleBlock(c, a);
            });
          }) : this.handleBlock(c, a);
        });
      });
    });
  }
  parseBadKeys(t) {
    for (const e in t) {
      const r = t[e], s = u(this, y)[e];
      if (console.log(e, { value: r, editorAlias: s }), s)
        switch (s) {
          case "Umbraco.Tags":
            t[e] = JSON.stringify(r);
            break;
          case "Umbraco.ContentPicker":
            const o = `umb://document/${r}`;
            t[e] = o;
            break;
          case "Umbraco.DropDown.Flexible":
            t[e] = JSON.stringify(r);
            break;
          case "Umbraco.CheckBoxList":
            t[e] = JSON.stringify(r);
            break;
          case "Umbraco.MultipleTextstring":
            t[e] = r.join(`
`);
            break;
          case "Umbraco.MultiNodeTreePicker":
            for (let a = 0; a < t[e].length; a++) {
              const c = `umb://${t[e][a].type}/${t[e][a].unique}`;
              t[e][a] = c;
            }
            t[e] = t[e].join(",");
            break;
        }
    }
    return t;
  }
  handleBlock(t, e) {
    if (p(this, v, !0), !e) return;
    const r = JSON.parse(JSON.stringify(e));
    if (t = JSON.parse(JSON.stringify(t)), u(this, f)[t.udi] && JSON.stringify(u(this, f)[t.udi]) === JSON.stringify(t))
      return;
    u(this, f)[t.udi] = t;
    const s = r.contentData.findIndex((a) => a.udi == t.udi);
    r.contentData[s] = t, r.target = t.udi;
    for (let a = 0; a < r.settingsData.length; a++)
      r.settingsData[a] = this.parseBadKeys(r.settingsData[a]);
    for (let a = 0; a < r.contentData.length; a++)
      r.contentData[a] = this.parseBadKeys(r.contentData[a]);
    p(this, E, r);
    const o = {
      content: JSON.stringify(u(this, E)),
      contentId: u(this, D),
      propertyTypeAlias: u(this, R),
      contentTypeId: u(this, N)
    };
    fetch("/api/blockpreview", {
      method: "POST",
      body: JSON.stringify(o),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((a) => a.json()).then((a) => {
      if (p(this, v, !1), a.html === "blockbeam")
        p(this, T, this.blockBeam());
      else {
        if (a.html.includes("###renderGridAreaSlots")) {
          const m = this.areas();
          a.html = a.html.replace("###renderGridAreaSlots", m);
        }
        p(this, T, '<div style="border: 1px solid var(--uui-color-border,#d8d7d9); min-height: 50px; box-sizing: border-box;">' + a.html + "</div>");
      }
      this.requestUpdate(), Y(() => {
        this.manageScripts();
      }, 100)();
    });
  }
  manageScripts() {
    var e;
    const t = (e = this.shadowRoot) == null ? void 0 : e.querySelectorAll("script");
    t == null || t.forEach((r) => {
      var o;
      const s = document.createElement("script");
      Array.from(r.attributes).forEach((a) => {
        s.setAttribute(a.name, a.value);
      }), r.src ? s.src = r.src : s.textContent = r.textContent, (o = r == null ? void 0 : r.parentNode) == null || o.replaceChild(s, r);
    });
  }
  areas() {
    return u(this, k) && u(this, k).length > 0 ? `
      <umb-ref-grid-block standalone href="">
        <span style="margin-right: 20px">${u(this, g)}</span> ${u(this, v) ? u(this, _) : ""}
        <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>
      </umb-ref-grid-block>
      ` : "";
  }
  blockBeam() {
    return `
    <umb-ref-grid-block standalone href="">
      <span style="margin-right: 20px">${u(this, g)}</span> ${u(this, v) ? u(this, _) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return W`${J(u(this, T))}`;
  }
};
f = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakMap();
D = /* @__PURE__ */ new WeakMap();
R = /* @__PURE__ */ new WeakMap();
N = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
T = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
w = pe([
  K("knowit-instant-block-preview")
], w);
const ke = w;
export {
  w as InstantBlockPreview,
  ke as default
};
//# sourceMappingURL=knowit-instant-block-preview-DuHtf16t.js.map
