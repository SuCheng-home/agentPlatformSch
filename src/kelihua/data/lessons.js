import materials from './school-materials.json';

export const LESSON_UNITS = materials.units.filter((unit) => unit.lessons.length);
