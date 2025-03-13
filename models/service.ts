import { ServiceUnit } from './service-unit';

export type Service = {
  title?: string;
  slug: string;
  worshipLeader?: string | null;
  date: Date;
  isDeleted: boolean;
  units: ServiceUnit[];
};

export type ServiceWith<T> = Omit<Service, keyof T> & T;

export type OptionalSlug = {
  slug?: string;
};

export type RequiredIsNew = {
  isNew: boolean;
};

export type NewService = ServiceWith<OptionalSlug>;

export function dateForSlug(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function getDefaultTitle(date: Date, serviceString: string) {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${serviceString} ${day}/${month}/${year}`;
}

export function getHumanReadableTitle(service: Service, serviceString: string) {
  return service.title?.trim() || 'Liturgia sem título';
}

export function getUnitsByType<T>(service: NewService, type: string): T[] {
  return service.units?.filter((unit) => unit.type === type).map((unit) => unit as T) || [];
}
