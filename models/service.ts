import { SerializedServiceUnit, ServiceUnit, ServiceUnitType } from './service-unit';

export class Service {
  title: string;
  slug?: string;
  worshipLeader: string | null;
  date: Date;
  isDeleted: boolean;
  units: ServiceUnit[];
  isNew: boolean;

  constructor({
    title,
    slug,
    worshipLeader,
    date,
    isDeleted,
    units,
    isNew,
  }: {
    title?: string;
    slug?: string;
    worshipLeader?: string | null;
    date?: Date;
    isDeleted?: boolean;
    units?: ServiceUnit[];
    isNew?: boolean;
  }) {
    this.title = title || '';
    this.slug = slug;
    this.worshipLeader = worshipLeader || null;
    this.date = date || new Date();
    this.isDeleted = !!isDeleted;
    this.units = units || [];
    this.isNew = !!isNew;
  }

  serialize(): SerializedService {
    return {
      title: this.title,
      slug: this.slug,
      worshipLeader: this.worshipLeader,
      date: this.date.toISOString(),
      isDeleted: this.isDeleted,
      units: this.units.map((unit) => unit.serialize()),
    };
  }

  static deserialize(serialized: SerializedService): Service {
    return new Service({
      title: serialized.title,
      slug: serialized.slug,
      worshipLeader: serialized.worshipLeader,
      date: new Date(serialized.date),
      isDeleted: serialized.isDeleted,
      units: serialized.units.map(ServiceUnit.deserialize),
    });
  }

  get isValid() {
    return (
      (this.worshipLeader?.length || 0) > 0 &&
      this.date instanceof Date &&
      this.units.length > 0 &&
      this.units.every((unit) => unit.isValid)
    );
  }

  swapUnits(indexA: number, indexB: number) {
    if (indexA < 0 || indexA >= this.units.length || indexB < 0 || indexB >= this.units.length) {
      throw new Error('Index out of bounds');
    }
    const temp = this.units[indexA];
    this.units[indexA] = this.units[indexB];
    this.units[indexB] = temp;
  }

  moveUnitUp(index: number) {
    this.swapUnits(index, index - 1);
  }

  moveUnitDown(index: number) {
    this.swapUnits(index, index + 1);
  }

  removeUnit(index: number) {
    if (index < 0 || index >= this.units.length) {
      throw new Error('Index out of bounds');
    }
    this.units.splice(index, 1);
  }

  addUnit(unit: ServiceUnit) {
    this.units.push(unit);
  }

  getUnitsByType<T>(type: ServiceUnitType): T[] {
    return this.units.filter((unit) => unit.type === type).map((unit) => unit as T);
  }
}

export type SerializedService = {
  title: string;
  slug: string | undefined;
  worshipLeader: string | null;
  date: string;
  isDeleted: boolean;
  units: SerializedServiceUnit[];
};

export function getDefaultTitle(worshipLeader: string | null, date: Date) {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const worshipLeaderString = worshipLeader ? ` (${worshipLeader})` : '';
  return `${year}-${month}-${day}${worshipLeaderString}`;
}