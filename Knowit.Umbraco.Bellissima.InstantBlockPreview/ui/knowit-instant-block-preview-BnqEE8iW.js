import { LitElement as z, html as N, unsafeHTML as x, css as V, customElement as X } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as Y } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT as Q } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Z } from "@umbraco-cms/backoffice/document";
import { debounce as ee } from "@umbraco-cms/backoffice/utils";
import { O as n } from "./index-B1O-rD1q.js";
import "@umbraco-cms/backoffice/ufm";
import { UMB_BLOCK_ENTRY_CONTEXT as te } from "@umbraco-cms/backoffice/block";
class $ extends Error {
  constructor(e, r, a) {
    super(a), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class re extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class ae {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, a) => {
      this._resolve = r, this._reject = a;
      const s = (d) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(d));
      }, o = (d) => {
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
      }), e(s, o, c);
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
      this.cancelHandlers.length = 0, this._reject && this._reject(new re("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
const R = (t) => typeof t == "string", G = (t) => R(t) && t !== "", H = (t) => t instanceof Blob, L = (t) => t instanceof FormData, se = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, oe = (t) => {
  const e = [], r = (s, o) => {
    e.push(`${encodeURIComponent(s)}=${encodeURIComponent(String(o))}`);
  }, a = (s, o) => {
    o != null && (o instanceof Date ? r(s, o.toISOString()) : Array.isArray(o) ? o.forEach((c) => a(s, c)) : typeof o == "object" ? Object.entries(o).forEach(([c, d]) => a(`${s}[${c}]`, d)) : r(s, o));
  };
  return Object.entries(t).forEach(([s, o]) => a(s, o)), e.length ? `?${e.join("&")}` : "";
}, ne = (t, e) => {
  const r = encodeURI, a = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (o, c) => {
    var d;
    return (d = e.path) != null && d.hasOwnProperty(c) ? r(String(e.path[c])) : o;
  }), s = t.BASE + a;
  return e.query ? s + oe(e.query) : s;
}, ie = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (a, s) => {
      R(s) || H(s) ? e.append(a, s) : e.append(a, JSON.stringify(s));
    };
    return Object.entries(t.formData).filter(([, a]) => a != null).forEach(([a, s]) => {
      Array.isArray(s) ? s.forEach((o) => r(a, o)) : r(a, s);
    }), e;
  }
}, C = async (t, e) => typeof e == "function" ? e(t) : e, ce = async (t, e) => {
  const [r, a, s, o] = await Promise.all([
    // @ts-ignore
    C(e, t.TOKEN),
    // @ts-ignore
    C(e, t.USERNAME),
    // @ts-ignore
    C(e, t.PASSWORD),
    // @ts-ignore
    C(e, t.HEADERS)
  ]), c = Object.entries({
    Accept: "application/json",
    ...o,
    ...e.headers
  }).filter(([, d]) => d != null).reduce((d, [m, h]) => ({
    ...d,
    [m]: String(h)
  }), {});
  if (G(r) && (c.Authorization = `Bearer ${r}`), G(a) && G(s)) {
    const d = se(`${a}:${s}`);
    c.Authorization = `Basic ${d}`;
  }
  return e.body !== void 0 && (e.mediaType ? c["Content-Type"] = e.mediaType : H(e.body) ? c["Content-Type"] = e.body.type || "application/octet-stream" : R(e.body) ? c["Content-Type"] = "text/plain" : L(e.body) || (c["Content-Type"] = "application/json")), new Headers(c);
}, de = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : R(t.body) || H(t.body) || L(t.body) ? t.body : JSON.stringify(t.body);
}, ue = async (t, e, r, a, s, o, c) => {
  const d = new AbortController();
  let m = {
    headers: o,
    body: a ?? s,
    method: e.method,
    signal: d.signal
  };
  t.WITH_CREDENTIALS && (m.credentials = t.CREDENTIALS);
  for (const h of t.interceptors.request._fns)
    m = await h(m);
  return c(() => d.abort()), await fetch(r, m);
}, he = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (R(r))
      return r;
  }
}, pe = async (t) => {
  if (t.status !== 204)
    try {
      const e = t.headers.get("Content-Type");
      if (e) {
        const r = ["application/octet-stream", "application/pdf", "application/zip", "audio/", "image/", "video/"];
        if (e.includes("application/json") || e.includes("+json"))
          return await t.json();
        if (r.some((a) => e.includes(a)))
          return await t.blob();
        if (e.includes("multipart/form-data"))
          return await t.formData();
        if (e.includes("text/"))
          return await t.text();
      }
    } catch (e) {
      console.error(e);
    }
}, le = (t, e) => {
  const a = {
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
  if (a)
    throw new $(t, e, a);
  if (!e.ok) {
    const s = e.status ?? "unknown", o = e.statusText ?? "unknown", c = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new $(
      t,
      e,
      `Generic Error: status: ${s}; status text: ${o}; body: ${c}`
    );
  }
}, i = (t, e) => new ae(async (r, a, s) => {
  try {
    const o = ne(t, e), c = ie(e), d = de(e), m = await ce(t, e);
    if (!s.isCancelled) {
      let h = await ue(t, e, o, d, c, m, s);
      for (const J of t.interceptors.response._fns)
        h = await J(h);
      const T = await pe(h), k = he(h, e.responseHeader);
      let B = T;
      e.responseTransformer && h.ok && (B = await e.responseTransformer(T));
      const w = {
        url: o,
        ok: h.ok,
        status: h.status,
        statusText: h.statusText,
        body: k ?? B
      };
      le(e, w), r(w.body);
    }
  } catch (o) {
    a(o);
  }
});
class me {
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
class ye {
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
var Te = Object.defineProperty, be = Object.getOwnPropertyDescriptor, W = (t) => {
  throw TypeError(t);
}, fe = (t, e, r, a) => {
  for (var s = a > 1 ? void 0 : a ? be(e, r) : e, o = t.length - 1, c; o >= 0; o--)
    (c = t[o]) && (s = (a ? c(e, r, s) : c(s)) || s);
  return a && s && Te(e, r, s), s;
}, K = (t, e, r) => e.has(t) || W("Cannot " + r), u = (t, e, r) => (K(t, e, "read from private field"), r ? r.call(t) : e.get(t)), l = (t, e, r) => e.has(t) ? W("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), p = (t, e, r, a) => (K(t, e, "write to private field"), e.set(t, r), r), I, q, S, E, D, O, U, P, A, F, v, j, _, b, M, g, f;
let y = class extends Y(z) {
  constructor() {
    super(), l(this, I), l(this, q), l(this, S), l(this, E), l(this, D), l(this, O), l(this, U), l(this, P), l(this, A), l(this, F), l(this, v), l(this, j, "Loading preview..."), l(this, _, !1), l(this, b), l(this, M), l(this, g), l(this, f), p(this, f, /* @__PURE__ */ new Map()), p(this, b, this.blockBeam()), this.init();
  }
  async init() {
    p(this, q, await fetch("/api/blockpreview")), this.consumeContext(Z, (e) => {
      p(this, U, e.getUnique()), p(this, P, e.getContentTypeId());
    });
    let t = "";
    this.consumeContext(Q, (e) => {
      p(this, I, e.getAlias()), this.observe(e.value, (r) => {
        p(this, D, r), this.handleBlock();
      }), this.observe(e.editor, (r) => {
        t = (r == null ? void 0 : r.tagName) ?? "";
      });
    }), this.consumeContext(te, async (e) => {
      p(this, O, t == "UMB-PROPERTY-EDITOR-UI-BLOCK-LIST" ? "list" : "grid"), p(this, v, e.getLabel()), p(this, b, this.blockBeam()), this.requestUpdate(), this.observe(e.contentTypeKey, (r) => {
        p(this, g, r);
      }), this.observe(e.contentElementTypeKey, (r) => {
        p(this, A, r);
      }), this.observe(e.settingsElementTypeKey, (r) => {
        p(this, F, r);
      }), await this.GetDataTypes(), e.settingsValues().then(async (r) => {
        this.observe(r, async (a) => {
          p(this, S, a), this.handleBlock();
        });
      }), e.contentValues().then(async (r) => {
        this.observe(r, async (a) => {
          p(this, E, a), this.handleBlock();
        });
      });
    });
  }
  MarryContentAndValue(t, e) {
    const r = JSON.parse(JSON.stringify(t));
    return e.forEach((a) => {
      r[a.alias] = a.value;
    }), r;
  }
  async fetchBlockPreview(t) {
    u(this, f) === void 0 && p(this, f, /* @__PURE__ */ new Map());
    const e = JSON.stringify(t);
    if (u(this, f).has(e))
      return u(this, f).get(e);
    const a = await (await fetch("/api/blockpreview", {
      method: "POST",
      body: e,
      // Reuse the stringified payload
      headers: {
        "Content-Type": "application/json"
      }
    })).json();
    return u(this, f).set(e, a), a;
  }
  async handleBlock() {
    if (p(this, _, !0), u(this, E) == null) return;
    const t = u(this, E), e = u(this, S), r = this.MarryContentAndValue(t, u(this, D).contentData.find((h) => h.contentTypeKey === u(this, g)).values), a = e && this.MarryContentAndValue(t, u(this, D).settingsData.find((h) => h.contentTypeKey === u(this, g)).values), s = this.parseBadKeys(r), o = e && this.parseBadKeys(a), c = {
      content: JSON.stringify(s),
      settings: JSON.stringify(o),
      contentId: u(this, U),
      propertyTypeAlias: u(this, I),
      contentTypeId: u(this, P),
      contentElementTypeKey: u(this, A),
      settingsElementTypeKey: u(this, F),
      blockType: u(this, O)
    }, d = await this.fetchBlockPreview(c);
    if (p(this, _, !1), d.html === "blockbeam")
      p(this, b, this.blockBeam());
    else {
      const h = d.html.includes("###renderGridAreaSlots"), T = u(this, q).divInlineStyle ? `style="${u(this, q).divInlineStyle}"` : "";
      if (h) {
        const k = this.areas();
        d.html = d.html.replace("###renderGridAreaSlots", k), p(this, b, N`
            <div class="kibp_defaultDivStyle" ${T}>
              <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${u(this, v)} &nbsp;&nbsp; (Click to maximize)</span></div>
                <div class="kibp_content">
                ${x(d.html)}
                </div>
              </div>
            </div>`);
      } else
        p(this, b, N`
            <div class="kibp_defaultDivStyle" ${T}>
              <div id="kibp_collapsible">
                <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${u(this, v)} &nbsp;&nbsp; (Click to maximize)</span></div>
                  <div class="kibp_content">
                    ${x(d.html)}
                  </div>
                </div>
              </div>
            </div>`);
    }
    this.requestUpdate(), ee(() => {
      var k, B;
      this.manageScripts();
      const h = (k = this.shadowRoot) == null ? void 0 : k.querySelector(".kibp_collaps"), T = (B = this.shadowRoot) == null ? void 0 : B.querySelector(".kibp_content");
      u(this, q).collapsibleBlocks ? h == null || h.addEventListener("click", (w) => {
        h.classList.toggle("active"), T == null || T.classList.toggle("hidden"), w.preventDefault(), w.stopImmediatePropagation();
      }) : (h == null || h.classList.remove("kibp_collaps"), h == null || h.remove());
    }, 100)();
  }
  async GetDataTypes() {
    const e = (await ye.getDocumentTypeById({ id: u(this, g) })).properties.map(async (r) => {
      const a = r.dataType.id;
      let s = y.typeKeys.find((o) => {
        var c;
        return ((c = y.typeDefinitions[o]) == null ? void 0 : c.id) === a;
      });
      if (!s) {
        const o = await me.getDataTypeById({ id: a });
        s = o.editorAlias, y.typeKeys.push(u(this, g)), y.typeDefinitions[r.alias] = o;
      }
      return s;
    });
    await Promise.all(e);
  }
  parseBadKeys(t) {
    var r;
    const e = JSON.parse(JSON.stringify(t));
    for (const a in e) {
      const s = e[a], o = (r = y.typeDefinitions[a]) == null ? void 0 : r.editorAlias;
      if (o)
        switch (o) {
          case "Umbraco.Tags":
            e[a] = JSON.stringify(s);
            break;
          case "Umbraco.Decimal":
            e[a] = JSON.stringify(s);
            break;
          case "Umbraco.ContentPicker":
            const c = `umb://document/${s}`;
            e[a] = c;
            break;
          case "Umbraco.DropDown.Flexible":
            e[a] = JSON.stringify(s);
            break;
          case "Umbraco.CheckBoxList":
            e[a] = JSON.stringify(s);
            break;
          case "Umbraco.MultipleTextstring":
            e[a] = s.join(`
`);
            break;
          case "Umbraco.MultiNodeTreePicker":
            for (let d = 0; d < e[a].length; d++) {
              const m = `umb://${e[a][d].type}/${e[a][d].unique}`;
              e[a][d] = m;
            }
            e[a] = e[a].join(",");
            break;
        }
    }
    return e;
  }
  manageScripts() {
    var e;
    const t = (e = this.shadowRoot) == null ? void 0 : e.querySelectorAll("script");
    t == null || t.forEach((r) => {
      var s;
      const a = document.createElement("script");
      Array.from(r.attributes).forEach((o) => {
        a.setAttribute(o.name, o.value);
      }), r.src ? a.src = r.src : a.textContent = r.textContent, (s = r == null ? void 0 : r.parentNode) == null || s.replaceChild(a, r);
    });
  }
  areas() {
    return `
      <umb-ref-grid-block standalone href="">
        <span style="margin-right: 20px">${u(this, v)}</span> ${u(this, _) ? u(this, j) : ""}
        <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>
      </umb-ref-grid-block>
      `;
  }
  blockBeam() {
    return N`
    <umb-ref-grid-block standalone href="">
      <umb-ufm-render inline .markdown=${u(this, v)} .value=${u(this, M)}></umb-ufm-render>
      ${u(this, _) ? u(this, j) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return N`${u(this, b)}`;
  }
};
I = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
S = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakMap();
D = /* @__PURE__ */ new WeakMap();
O = /* @__PURE__ */ new WeakMap();
U = /* @__PURE__ */ new WeakMap();
P = /* @__PURE__ */ new WeakMap();
A = /* @__PURE__ */ new WeakMap();
F = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
j = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
M = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakMap();
y.typeKeys = [];
y.typeDefinitions = {};
y.styles = V`
  .kibp_content.hidden {
    height: 0;
    overflow:hidden;
  }

  .kibp_defaultDivStyle {
    border: 1px solid var(--uui-color-border,#d8d7d9);
    min-height: 50px; box-sizing: border-box;
  }

  #kibp_collapsible:hover .kibp_collaps {
    height: 25px;
  }
  .kibp_collaps {
      height: 0px;
      width: 150px;
      background-color: #1b264f;
      transition: all ease 0.4s;
      color: white;
      font-weight: bold;
      position: absolute;
      top: 0;
      font-size: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      opacity: 0.8;
      cursor: pointer;
  }
      .kibp_collaps span {
        margin-left: 10px;
      }

.kibp_collaps .active {
    display: none;
}

.kibp_collaps.active {
    background-color: #86a0ff;
    height: 50px !important;
    width: 100%;
    position: initial;
}

    .kibp_collaps.active .inactive {
        display: none;
    }

    .kibp_collaps.active .active {
        display: inline;
    }
  `;
y = fe([
  X("knowit-instant-block-preview")
], y);
const De = y;
export {
  y as InstantBlockPreview,
  De as default
};
//# sourceMappingURL=knowit-instant-block-preview-BnqEE8iW.js.map
