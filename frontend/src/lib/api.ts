import axios, { AxiosError } from "axios";

/** BASES y endpoints desde .env.local (con defaults) */
const BASE_URL   = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
const EP_REPORTS = process.env.NEXT_PUBLIC_ENDPOINT_REPORTS || "/incidents";
const EP_LOGIN   = process.env.NEXT_PUBLIC_ENDPOINT_LOGIN   || "/auth/login";

/** Tenant por defecto */
let TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "colegio-a";

/** Exporto los endpoints por si quieres reutilizarlos en otras partes */
export const ENDPOINTS = {
  base: BASE_URL,
  reports: EP_REPORTS,
  login: EP_LOGIN,
};

/** Cliente Axios */
export const api = axios.create({ baseURL: BASE_URL });

/** Inyecta tenant y Authorization en cada request */
api.interceptors.request.use((cfg) => {
  cfg.headers = cfg.headers ?? {};
  cfg.headers["x-tenant-id"] = TENANT_ID;

  // Si refrescaste el navegador, vuelve a leer el token guardado
  if (!cfg.headers.Authorization && typeof window !== "undefined") {
    const t = localStorage.getItem("token");
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
});

/** (Opcional) Log simple de errores axios para depurar */
api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response) {
      console.error(
        "[API ERROR]",
        err.config?.method?.toUpperCase(),
        err.config?.url,
        err.response.status,
        err.response.data
      );
    } else {
      console.error("[API ERROR] sin respuesta", err.message);
    }
    return Promise.reject(err);
  }
);

/** Seteo/limpieza del token global + persistencia */
export function setAuth(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    if (typeof window !== "undefined") localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    if (typeof window !== "undefined") localStorage.removeItem("token");
  }
}

/** Por si algún día quieres cambiar el tenant desde UI */
export function setTenant(tenantId: string) {
  TENANT_ID = tenantId || "default";
}

/** Auth */
export const AuthAPI = {
  // El backend actual solo requiere { username }
  login: (payload: { username: string }) =>
    api
      .post(EP_LOGIN, payload)
      .then((r) => r.data as { access_token: string; token_type: string }),
};

/** Reports / Incidents */
export const ReportsAPI = {
  /** GET /incidents */
  list: () => api.get(EP_REPORTS).then((r) => r.data),

  /** POST /incidents */
  create: (data: any) => api.post(EP_REPORTS, data).then((r) => r.data),

  /** GET /incidents/{id} (si el backend lo agrega) */
  get: (id: string) => api.get(`${EP_REPORTS}/${id}`).then((r) => r.data),

  /** PATCH /incidents/{id} */
  update: (id: string, data: any) =>
    api.patch(`${EP_REPORTS}/${id}`, data).then((r) => r.data),

  /** Alias */
  patch: (id: string, data: any) =>
    api.patch(`${EP_REPORTS}/${id}`, data).then((r) => r.data),

  /** DELETE /incidents/{id} (cuando el backend lo exponga) */
  delete: async (id: string) => {
    await api.delete(`${EP_REPORTS}/${id}`);
  },
};

/** (Útil para tests/proxy) */
export const HealthAPI = {
  health: () => api.get("/health").then((r) => r.data),
};
