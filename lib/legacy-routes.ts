export function mapLegacyRoute(route: string | null, id: string | null): string | undefined {
  if (route === "users/find") return "/doctors";
  if (route === "users/profile" && id && /^\d+$/u.test(id)) return `/doctors/${id}`;
  if (route === "arart010/list") return id === "1" ? "/news" : `/articles${id && /^\d+$/u.test(id) ? `?category=${id}` : ""}`;
  if (route === "arart010/detail" && id && /^\d+$/u.test(id)) return `/articles/${id}`;
  if (route === "wbtpc010/list" && id === "1") return "/community/questions";
  if (route === "wbtpc010/detail" && id && /^\d+$/u.test(id)) return `/community/questions/${id}`;
  if (route === "site/contact") return "/contact";
  return undefined;
}
