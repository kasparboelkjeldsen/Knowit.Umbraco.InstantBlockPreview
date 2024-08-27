import { LitElement as W, html as J, unsafeHTML as K, css as z, customElement as X } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as V } from "@umbraco-cms/backoffice/element-api";
import { UMB_PROPERTY_CONTEXT as Y } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as Q } from "@umbraco-cms/backoffice/document";
import { UmbContextToken as P } from "@umbraco-cms/backoffice/context-api";
import { observeMultiple as j } from "@umbraco-cms/backoffice/observable-api";
import { debounce as Z } from "@umbraco-cms/backoffice/utils";
import { O as n } from "./index-RpIElxGb.js";
class A extends Error {
  constructor(e, r, s) {
    super(s), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class ee extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class te {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, s) => {
      this._resolve = r, this._reject = s;
      const o = (i) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(i));
      }, a = (i) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isRejected = !0, this._reject && this._reject(i));
      }, d = (i) => {
        this._isResolved || this._isRejected || this._isCancelled || this.cancelHandlers.push(i);
      };
      return Object.defineProperty(d, "isResolved", {
        get: () => this._isResolved
      }), Object.defineProperty(d, "isRejected", {
        get: () => this._isRejected
      }), Object.defineProperty(d, "isCancelled", {
        get: () => this._isCancelled
      }), e(o, a, d);
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
      this.cancelHandlers.length = 0, this._reject && this._reject(new ee("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
const _ = (t) => typeof t == "string", S = (t) => _(t) && t !== "", O = (t) => t instanceof Blob, H = (t) => t instanceof FormData, re = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, ae = (t) => {
  const e = [], r = (o, a) => {
    e.push(`${encodeURIComponent(o)}=${encodeURIComponent(String(a))}`);
  }, s = (o, a) => {
    a != null && (a instanceof Date ? r(o, a.toISOString()) : Array.isArray(a) ? a.forEach((d) => s(o, d)) : typeof a == "object" ? Object.entries(a).forEach(([d, i]) => s(`${o}[${d}]`, i)) : r(o, a));
  };
  return Object.entries(t).forEach(([o, a]) => s(o, a)), e.length ? `?${e.join("&")}` : "";
}, oe = (t, e) => {
  const r = encodeURI, s = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (a, d) => {
    var i;
    return (i = e.path) != null && i.hasOwnProperty(d) ? r(String(e.path[d])) : a;
  }), o = t.BASE + s;
  return e.query ? o + ae(e.query) : o;
}, se = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (s, o) => {
      _(o) || O(o) ? e.append(s, o) : e.append(s, JSON.stringify(o));
    };
    return Object.entries(t.formData).filter(([, s]) => s != null).forEach(([s, o]) => {
      Array.isArray(o) ? o.forEach((a) => r(s, a)) : r(s, o);
    }), e;
  }
}, D = async (t, e) => typeof e == "function" ? e(t) : e, ie = async (t, e) => {
  const [r, s, o, a] = await Promise.all([
    // @ts-ignore
    D(e, t.TOKEN),
    // @ts-ignore
    D(e, t.USERNAME),
    // @ts-ignore
    D(e, t.PASSWORD),
    // @ts-ignore
    D(e, t.HEADERS)
  ]), d = Object.entries({
    Accept: "application/json",
    ...a,
    ...e.headers
  }).filter(([, i]) => i != null).reduce((i, [p, h]) => ({
    ...i,
    [p]: String(h)
  }), {});
  if (S(r) && (d.Authorization = `Bearer ${r}`), S(s) && S(o)) {
    const i = re(`${s}:${o}`);
    d.Authorization = `Basic ${i}`;
  }
  return e.body !== void 0 && (e.mediaType ? d["Content-Type"] = e.mediaType : O(e.body) ? d["Content-Type"] = e.body.type || "application/octet-stream" : _(e.body) ? d["Content-Type"] = "text/plain" : H(e.body) || (d["Content-Type"] = "application/json")), new Headers(d);
}, ne = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : _(t.body) || O(t.body) || H(t.body) ? t.body : JSON.stringify(t.body);
}, ce = async (t, e, r, s, o, a, d) => {
  const i = new AbortController();
  let p = {
    headers: a,
    body: s ?? o,
    method: e.method,
    signal: i.signal
  };
  t.WITH_CREDENTIALS && (p.credentials = t.CREDENTIALS);
  for (const h of t.interceptors.request._fns)
    p = await h(p);
  return d(() => i.abort()), await fetch(r, p);
}, de = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (_(r))
      return r;
  }
}, ue = async (t) => {
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
}, he = (t, e) => {
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
    throw new A(t, e, s);
  if (!e.ok) {
    const o = e.status ?? "unknown", a = e.statusText ?? "unknown", d = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new A(
      t,
      e,
      `Generic Error: status: ${o}; status text: ${a}; body: ${d}`
    );
  }
}, c = (t, e) => new te(async (r, s, o) => {
  try {
    const a = oe(t, e), d = se(e), i = ne(e), p = await ie(t, e);
    if (!o.isCancelled) {
      let h = await ce(t, e, a, i, d, p, o);
      for (const L of t.interceptors.response._fns)
        h = await L(h);
      const y = await ue(h), b = de(h, e.responseHeader);
      let U = y;
      e.responseTransformer && h.ok && (U = await e.responseTransformer(y));
      const F = {
        url: a,
        ok: h.ok,
        status: h.status,
        statusText: h.statusText,
        body: b ?? U
      };
      he(e, F), r(F.body);
    }
  } catch (a) {
    s(a);
  }
});
class x {
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDataType(e = {}) {
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
class G {
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDocumentType(e = {}) {
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
    return c(n, {
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
var pe = Object.defineProperty, le = Object.getOwnPropertyDescriptor, M = (t) => {
  throw TypeError(t);
}, me = (t, e, r, s) => {
  for (var o = s > 1 ? void 0 : s ? le(e, r) : e, a = t.length - 1, d; a >= 0; a--)
    (d = t[a]) && (o = (s ? d(e, r, o) : d(o)) || o);
  return s && o && pe(e, r, o), o;
}, $ = (t, e, r) => e.has(t) || M("Cannot " + r), u = (t, e, r) => ($(t, e, "read from private field"), r ? r.call(t) : e.get(t)), m = (t, e, r) => e.has(t) ? M("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), l = (t, e, r, s) => ($(t, e, "write to private field"), e.set(t, r), r), g, k, f, E, R, N, w, v, I, q, T, B;
let C = class extends V(W) {
  constructor() {
    super(), m(this, g), m(this, k), m(this, f), m(this, E), m(this, R), m(this, N), m(this, w), m(this, v), m(this, I, '<uui-loader style="margin-right: 20px"></uui-loader> Loading preview...'), m(this, q, !1), m(this, T, ""), m(this, B), l(this, k, {}), l(this, f, {}), l(this, g, {}), l(this, T, this.blockBeam()), fetch("/api/blockpreview").then((t) => t.json()).then((t) => {
      l(this, g, t);
      const e = new P("UmbBlockEntryContext"), r = new P("UmbBlockEntryContext");
      this.consumeContext(Q, (s) => {
        l(this, R, s.getUnique()), l(this, w, s.getContentTypeId());
      }), this.consumeContext(Y, (s) => {
        l(this, N, s.getAlias()), this.consumeContext(e, (o) => {
          this.observe(o.label, (a) => {
            l(this, v, a), l(this, T, this.blockBeam()), this.requestUpdate();
          }), this.observe(j(o.content, s.value), ([a, d]) => {
            const i = a;
            u(this, f)[i.contentTypeKey] === void 0 ? G.getDocumentTypeById({ id: i.contentTypeKey }).then((p) => {
              const h = p.properties.map((y) => x.getDataTypeById({ id: y.dataType.id }).then((b) => {
                u(this, f)[y.alias] = b.editorAlias;
              }));
              Promise.all(h).then(() => {
                this.handleBlock(i, d);
              });
            }) : this.handleBlock(i, d);
          }), o.areas && this.observe(o.areas, (a) => {
            l(this, B, a);
          });
        }), this.consumeContext(r, (o) => {
          this.observe(o.label, (a) => {
            l(this, v, a), l(this, T, this.blockBeam()), this.requestUpdate();
          }), this.observe(j(o.content, s.value), ([a, d]) => {
            const i = a;
            u(this, f)[i.contentTypeKey] === void 0 ? G.getDocumentTypeById({ id: i.contentTypeKey }).then((p) => {
              const h = p.properties.map((y) => x.getDataTypeById({ id: y.dataType.id }).then((b) => {
                u(this, f)[y.alias] = b.editorAlias;
              }));
              Promise.all(h).then(() => {
                this.handleBlock(i, d);
              });
            }) : this.handleBlock(i, d);
          });
        });
      });
    });
  }
  parseBadKeys(t) {
    for (const e in t) {
      const r = t[e], s = u(this, f)[e];
      if (s)
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
              const d = `umb://${t[e][a].type}/${t[e][a].unique}`;
              t[e][a] = d;
            }
            t[e] = t[e].join(",");
            break;
        }
    }
    return t;
  }
  handleBlock(t, e) {
    if (l(this, q, !0), !e) return;
    const r = JSON.parse(JSON.stringify(e));
    if (t = JSON.parse(JSON.stringify(t)), u(this, k)[t.udi] && JSON.stringify(u(this, k)[t.udi]) === JSON.stringify(t))
      return;
    u(this, k)[t.udi] = t;
    const s = r.contentData.findIndex((a) => a.udi == t.udi);
    r.contentData[s] = t, r.target = t.udi;
    for (let a = 0; a < r.settingsData.length; a++)
      r.settingsData[a] = this.parseBadKeys(r.settingsData[a]);
    for (let a = 0; a < r.contentData.length; a++)
      r.contentData[a] = this.parseBadKeys(r.contentData[a]);
    l(this, E, r);
    const o = {
      content: JSON.stringify(u(this, E)),
      contentId: u(this, R),
      propertyTypeAlias: u(this, N),
      contentTypeId: u(this, w)
    };
    fetch("/api/blockpreview", {
      method: "POST",
      body: JSON.stringify(o),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((a) => a.json()).then((a) => {
      if (l(this, q, !1), a.html === "blockbeam")
        l(this, T, this.blockBeam());
      else {
        const i = a.html.includes("###renderGridAreaSlots"), p = u(this, g).divInlineStyle ? `style="${u(this, g).divInlineStyle}"` : "";
        if (i) {
          const h = this.areas();
          a.html = a.html.replace("###renderGridAreaSlots", h), l(this, T, `
            <div class="kibp_defaultDivStyle" ${p}">
              <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${u(this, v)} &nbsp;&nbsp; (Click to maximize)</span></div>
                <div class="kibp_content">
                  ${a.html}
                </div>
              </div>
            </div>`);
        } else
          l(this, T, `
            <div class="kibp_defaultDivStyle" ${p}">
              <div id="kibp_collapsible">
                <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${u(this, v)} &nbsp;&nbsp; (Click to maximize)</span></div>
                  <div class="kibp_content">
                    ${a.html}
                  </div>
                </div>
              </div>
            </div>`);
      }
      this.requestUpdate(), Z(() => {
        var h, y;
        this.manageScripts();
        const i = (h = this.shadowRoot) == null ? void 0 : h.querySelector(".kibp_collaps"), p = (y = this.shadowRoot) == null ? void 0 : y.querySelector(".kibp_content");
        u(this, g).collapsibleBlocks ? i == null || i.addEventListener("click", (b) => {
          i.classList.toggle("active"), p == null || p.classList.toggle("hidden"), b.preventDefault(), b.stopImmediatePropagation();
        }) : (i == null || i.classList.remove("kibp_collaps"), i == null || i.remove());
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
    return u(this, B) && u(this, B).length > 0 ? `
      <umb-ref-grid-block standalone href="">
        <span style="margin-right: 20px">${u(this, v)}</span> ${u(this, q) ? u(this, I) : ""}
        <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>
      </umb-ref-grid-block>
      ` : "";
  }
  blockBeam() {
    return `
    <umb-ref-grid-block standalone href="">
      <span style="margin-right: 20px">${u(this, v)}</span> ${u(this, q) ? u(this, I) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return J`${K(u(this, T))}`;
  }
};
g = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakMap();
R = /* @__PURE__ */ new WeakMap();
N = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
I = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
T = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakMap();
C.styles = z`
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
C = me([
  X("knowit-instant-block-preview")
], C);
const Be = C;
export {
  C as InstantBlockPreview,
  Be as default
};
//# sourceMappingURL=knowit-instant-block-preview-CjtgxHiU.js.map
