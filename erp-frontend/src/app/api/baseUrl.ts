export function erpApiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_ERP_API_URL || `http://${window.location.hostname}:8080`;
  return base.replace(/\/$/, '') + path;
}
