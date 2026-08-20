export type ScheduleRow = { age: string; vaccine: string };

export type Service = {
  id: string;
  name: string;
  desc: string;
  seoTitle: string;
  metaDescription: string;
  longDesc: string;
  benefits: string[];
  duration: string;
  price: string;
  schedule?: ScheduleRow[];
};

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function findServiceByKeyword(services: Service[], keyword: string): Service | undefined {
  return services.find((s) => s.name.toLowerCase().includes(keyword.toLowerCase())) ?? services[0];
}
