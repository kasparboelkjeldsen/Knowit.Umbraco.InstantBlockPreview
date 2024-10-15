import { html as R, unsafeHTML as J, css as re, customElement as ae } from "@umbraco-cms/backoffice/external/lit";
import { UMB_PROPERTY_CONTEXT as se } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as oe } from "@umbraco-cms/backoffice/document";
import { debounce as ne } from "@umbraco-cms/backoffice/utils";
import { O as n } from "./index-CZBT1fFq.js";
import "@umbraco-cms/backoffice/ufm";
import { UMB_BLOCK_ENTRY_CONTEXT as ie } from "@umbraco-cms/backoffice/block";
import { observeMultiple as ce } from "@umbraco-cms/backoffice/observable-api";
import { UmbLitElement as de } from "@umbraco-cms/backoffice/lit-element";
class z extends Error {
  constructor(e, r, s) {
    super(s), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class ue extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class he {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, s) => {
      this._resolve = r, this._reject = s;
      const a = (u) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(u));
      }, o = (u) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isRejected = !0, this._reject && this._reject(u));
      }, d = (u) => {
        this._isResolved || this._isRejected || this._isCancelled || this.cancelHandlers.push(u);
      };
      return Object.defineProperty(d, "isResolved", {
        get: () => this._isResolved
      }), Object.defineProperty(d, "isRejected", {
        get: () => this._isRejected
      }), Object.defineProperty(d, "isCancelled", {
        get: () => this._isCancelled
      }), e(a, o, d);
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
      this.cancelHandlers.length = 0, this._reject && this._reject(new ue("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
const D = (t) => typeof t == "string", H = (t) => D(t) && t !== "", x = (t) => t instanceof Blob, Y = (t) => t instanceof FormData, pe = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, le = (t) => {
  const e = [], r = (a, o) => {
    e.push(`${encodeURIComponent(a)}=${encodeURIComponent(String(o))}`);
  }, s = (a, o) => {
    o != null && (o instanceof Date ? r(a, o.toISOString()) : Array.isArray(o) ? o.forEach((d) => s(a, d)) : typeof o == "object" ? Object.entries(o).forEach(([d, u]) => s(`${a}[${d}]`, u)) : r(a, o));
  };
  return Object.entries(t).forEach(([a, o]) => s(a, o)), e.length ? `?${e.join("&")}` : "";
}, me = (t, e) => {
  const r = encodeURI, s = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (o, d) => {
    var u;
    return (u = e.path) != null && u.hasOwnProperty(d) ? r(String(e.path[d])) : o;
  }), a = t.BASE + s;
  return e.query ? a + le(e.query) : a;
}, ye = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (s, a) => {
      D(a) || x(a) ? e.append(s, a) : e.append(s, JSON.stringify(a));
    };
    return Object.entries(t.formData).filter(([, s]) => s != null).forEach(([s, a]) => {
      Array.isArray(a) ? a.forEach((o) => r(s, o)) : r(s, a);
    }), e;
  }
}, N = async (t, e) => typeof e == "function" ? e(t) : e, Te = async (t, e) => {
  const [r, s, a, o] = await Promise.all([
    // @ts-ignore
    N(e, t.TOKEN),
    // @ts-ignore
    N(e, t.USERNAME),
    // @ts-ignore
    N(e, t.PASSWORD),
    // @ts-ignore
    N(e, t.HEADERS)
  ]), d = Object.entries({
    Accept: "application/json",
    ...o,
    ...e.headers
  }).filter(([, u]) => u != null).reduce((u, [l, m]) => ({
    ...u,
    [l]: String(m)
  }), {});
  if (H(r) && (d.Authorization = `Bearer ${r}`), H(s) && H(a)) {
    const u = pe(`${s}:${a}`);
    d.Authorization = `Basic ${u}`;
  }
  return e.body !== void 0 && (e.mediaType ? d["Content-Type"] = e.mediaType : x(e.body) ? d["Content-Type"] = e.body.type || "application/octet-stream" : D(e.body) ? d["Content-Type"] = "text/plain" : Y(e.body) || (d["Content-Type"] = "application/json")), new Headers(d);
}, be = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : D(t.body) || x(t.body) || Y(t.body) ? t.body : JSON.stringify(t.body);
}, fe = async (t, e, r, s, a, o, d) => {
  const u = new AbortController();
  let l = {
    headers: o,
    body: s ?? a,
    method: e.method,
    signal: u.signal
  };
  t.WITH_CREDENTIALS && (l.credentials = t.CREDENTIALS);
  for (const m of t.interceptors.request._fns)
    l = await m(l);
  return d(() => u.abort()), await fetch(r, l);
}, ke = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (D(r))
      return r;
  }
}, ge = async (t) => {
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
}, ve = (t, e) => {
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
    throw new z(t, e, s);
  if (!e.ok) {
    const a = e.status ?? "unknown", o = e.statusText ?? "unknown", d = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new z(
      t,
      e,
      `Generic Error: status: ${a}; status text: ${o}; body: ${d}`
    );
  }
}, i = (t, e) => new he(async (r, s, a) => {
  try {
    const o = me(t, e), d = ye(e), u = be(e), l = await Te(t, e);
    if (!a.isCancelled) {
      let m = await fe(t, e, o, u, d, l, a);
      for (const te of t.interceptors.response._fns)
        m = await te(m);
      const L = await ge(m), ee = ke(m, e.responseHeader);
      let W = L;
      e.responseTransformer && m.ok && (W = await e.responseTransformer(L));
      const K = {
        url: o,
        ok: m.ok,
        status: m.status,
        statusText: m.statusText,
        body: ee ?? W
      };
      ve(e, K), r(K.body);
    }
  } catch (o) {
    s(o);
  }
});
class qe {
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
class _e {
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
function V(t, e, r, s) {
  const a = JSON.parse(JSON.stringify(t));
  return e.forEach((o) => {
    const d = !o.culture || o.culture === r, u = !o.segment || o.segment === s;
    d && u && (a[o.alias] = o.value);
  }), a;
}
function X(t, e) {
  var s;
  const r = JSON.parse(JSON.stringify(t));
  for (const a in r) {
    const o = r[a], d = (s = e[a]) == null ? void 0 : s.editorAlias;
    if (d)
      switch (d) {
        case "Umbraco.Tags":
          r[a] = JSON.stringify(o);
          break;
        case "Umbraco.Decimal":
          r[a] = JSON.stringify(o);
          break;
        case "Umbraco.ContentPicker":
          const u = `umb://document/${o}`;
          r[a] = u;
          break;
        case "Umbraco.DropDown.Flexible":
          r[a] = JSON.stringify(o);
          break;
        case "Umbraco.CheckBoxList":
          r[a] = JSON.stringify(o);
          break;
        case "Umbraco.MultipleTextstring":
          r[a] = o.join(`
`);
          break;
        case "Umbraco.MultiNodeTreePicker":
          for (let l = 0; l < r[a].length; l++) {
            const m = `umb://${r[a][l].type}/${r[a][l].unique}`;
            r[a][l] = m;
          }
          r[a] = r[a].join(",");
          break;
      }
  }
  return r;
}
var we = Object.defineProperty, Ee = Object.getOwnPropertyDescriptor, Q = (t) => {
  throw TypeError(t);
}, Be = (t, e, r, s) => {
  for (var a = s > 1 ? void 0 : s ? Ee(e, r) : e, o = t.length - 1, d; o >= 0; o--)
    (d = t[o]) && (a = (s ? d(e, r, a) : d(a)) || a);
  return s && a && we(e, r, a), a;
}, Z = (t, e, r) => e.has(t) || Q("Cannot " + r), c = (t, e, r) => (Z(t, e, "read from private field"), r ? r.call(t) : e.get(t)), p = (t, e, r) => e.has(t) ? Q("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), h = (t, e, r, s) => (Z(t, e, "write to private field"), e.set(t, r), r), S, k, C, v, q, I, O, P, U, _, A, f, F, j, M, g, b, G, $, w, T, E, B;
let y = class extends de {
  constructor() {
    super(), p(this, S), p(this, k), p(this, C), p(this, v), p(this, q), p(this, I), p(this, O), p(this, P), p(this, U), p(this, _), p(this, A), p(this, f), p(this, F), p(this, j), p(this, M, "Loading preview..."), p(this, g, !1), p(this, b), p(this, G), p(this, $), p(this, w), p(this, T), p(this, E), p(this, B), h(this, T, /* @__PURE__ */ new Map()), h(this, b, this.blockBeam()), this.init();
  }
  async init() {
    h(this, k, await fetch("/api/blockpreview")), this.consumeContext(oe, (e) => {
      h(this, O, e.getUnique()), h(this, P, e.getContentTypeId());
    });
    let t = "";
    this.consumeContext(se, (e) => {
      var r;
      h(this, S, e.getAlias()), this.observe(e.value, (s) => {
        h(this, q, s), this.handleBlock();
      }), t = ((r = e.getEditor()) == null ? void 0 : r.tagName) ?? "";
    }), this.consumeContext(ie, async (e) => {
      h(this, I, t == "UMB-PROPERTY-EDITOR-UI-BLOCK-LIST" ? "list" : "grid"), h(this, f, e.getLabel()), h(this, b, this.blockBeam()), this.requestUpdate();
      const r = e._manager;
      this.observe(r == null ? void 0 : r.variantId, (s) => {
        h(this, E, s == null ? void 0 : s.culture), h(this, B, s == null ? void 0 : s.segment);
      }), this.observe(
        ce(
          [
            e.contentKey,
            e.contentTypeKey,
            e.contentElementTypeKey,
            e.settingsElementTypeKey,
            e.workspaceEditContentPath,
            e.workspaceEditSettingsPath,
            e.contentElementTypeIcon
          ]
        ),
        ([
          s,
          a,
          o,
          d,
          u,
          l,
          m
        ]) => {
          h(this, _, s), h(this, w, a), h(this, U, o), h(this, A, d), h(this, F, u), h(this, j, l), h(this, G, m);
        }
      ), await this.GetDataTypes(), e.settingsValues().then(async (s) => {
        this.observe(s, async (a) => {
          h(this, C, a), this.handleBlock();
        });
      }), e.contentValues().then(async (s) => {
        this.observe(s, async (a) => {
          h(this, v, a), this.handleBlock();
        });
      });
    });
  }
  async handleBlock() {
    if (h(this, g, !0), c(this, v) == null)
      return;
    const t = c(this, v), e = c(this, C), r = V(t, c(this, q).contentData.find((l) => l.key === c(this, _)).values, c(this, E), c(this, B)), s = e && V(t, c(this, q).settingsData.find((l) => l.key === c(this, _)).values, c(this, E), c(this, B)), a = X(r, y.typeDefinitions), o = e && X(s, y.typeDefinitions), d = {
      content: JSON.stringify(a),
      settings: JSON.stringify(o),
      contentId: c(this, O),
      propertyTypeAlias: c(this, S),
      contentTypeId: c(this, P),
      contentElementTypeKey: c(this, U),
      settingsElementTypeKey: c(this, A),
      blockType: c(this, I)
    }, u = await this.fetchBlockPreview(d);
    this.buildHtml(u), this.requestUpdate(), this.parseBlockScriptsAndAttachListeners();
  }
  async fetchBlockPreview(t) {
    c(this, T) === void 0 && h(this, T, /* @__PURE__ */ new Map());
    const e = JSON.stringify(t);
    if (c(this, T).has(e))
      return c(this, T).get(e);
    const s = await (await fetch("/api/blockpreview", {
      method: "POST",
      body: e,
      // Reuse the stringified payload
      headers: {
        "Content-Type": "application/json"
      }
    })).json();
    return c(this, T).values.length > 10 && c(this, T).delete(c(this, T).keys().next().value), c(this, T).set(e, s), s;
  }
  parseBlockScriptsAndAttachListeners() {
    ne(() => {
      var s, a;
      this.manageScripts();
      const e = (s = this.shadowRoot) == null ? void 0 : s.querySelector(".kibp_collaps"), r = (a = this.shadowRoot) == null ? void 0 : a.querySelector(".kibp_content");
      c(this, k).collapsibleBlocks ? e == null || e.addEventListener("click", (o) => {
        e.classList.toggle("active"), r == null || r.classList.toggle("hidden"), o.preventDefault(), o.stopImmediatePropagation();
      }) : (e == null || e.classList.remove("kibp_collaps"), e == null || e.remove());
    }, 100)();
  }
  buildHtml(t) {
    if (h(this, g, !1), t.html === "blockbeam")
      h(this, b, this.blockBeam());
    else {
      const e = t.html.includes("###renderGridAreaSlots"), r = c(this, k).divInlineStyle ? `style="${c(this, k).divInlineStyle}"` : "";
      if (e) {
        const s = this.areas();
        t.html = t.html.replace("###renderGridAreaSlots", s), h(this, b, R`
            <div class="kibp_defaultDivStyle" ${r}>
              <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${c(this, f)} &nbsp;&nbsp; (Click to maximize)</span></div>
                <div class="kibp_content">
                ${J(t.html)}
                </div>
              </div>
            </div>`);
      } else
        h(this, b, R`
            <div class="kibp_defaultDivStyle" ${r}>
              <div id="kibp_collapsible">
                <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${c(this, f)} &nbsp;&nbsp; (Click to maximize)</span></div>
                  <div class="kibp_content">
                    ${J(t.html)}
                  </div>
                </div>
              </div>
            </div>`);
    }
  }
  async GetDataTypes() {
    const e = (await _e.getDocumentTypeById({ id: c(this, w) })).properties.map(async (r) => {
      const s = r.dataType.id;
      let a = y.typeKeys.find((o) => {
        var d;
        return ((d = y.typeDefinitions[o]) == null ? void 0 : d.id) === s;
      });
      if (!a) {
        const o = await qe.getDataTypeById({ id: s });
        a = o.editorAlias, y.typeKeys.push(c(this, w)), y.typeDefinitions[r.alias] = o;
      }
      return a;
    });
    await Promise.all(e);
  }
  manageScripts() {
    var e;
    const t = (e = this.shadowRoot) == null ? void 0 : e.querySelectorAll("script");
    t == null || t.forEach((r) => {
      var a;
      const s = document.createElement("script");
      Array.from(r.attributes).forEach((o) => {
        s.setAttribute(o.name, o.value);
      }), r.src ? s.src = r.src : s.textContent = r.textContent, (a = r == null ? void 0 : r.parentNode) == null || a.replaceChild(s, r);
    });
  }
  areas() {
    return `
      <umb-ref-grid-block standalone href="${c(this, j)}">
        <span style="margin-right: 20px">${c(this, f)}</span> ${c(this, g) ? c(this, M) : ""}
        <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>
      </umb-ref-grid-block>
      `;
  }
  blockBeam() {
    return R`
    <umb-ref-grid-block standalone href="${c(this, F)}">
      <umb-icon slot="icon" .name=${c(this, G)}></umb-icon>
      <umb-ufm-render inline .markdown=${c(this, f)} .value=${c(this, $)}></umb-ufm-render>
      ${c(this, g) ? c(this, M) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return R`${c(this, b)}`;
  }
};
S = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
C = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
I = /* @__PURE__ */ new WeakMap();
O = /* @__PURE__ */ new WeakMap();
P = /* @__PURE__ */ new WeakMap();
U = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
A = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakMap();
F = /* @__PURE__ */ new WeakMap();
j = /* @__PURE__ */ new WeakMap();
M = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
G = /* @__PURE__ */ new WeakMap();
$ = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
T = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakMap();
y.typeKeys = [];
y.typeDefinitions = {};
y.styles = re`
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
y = Be([
  ae("knowit-instant-block-preview")
], y);
const Ae = y;
export {
  y as InstantBlockPreview,
  Ae as default
};
//# sourceMappingURL=knowit-instant-block-preview-C06YWKED.js.map
