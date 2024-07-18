export interface Item {
  id: string;
  title: string | null;
  index: number;
  level: number;
  isOpen: boolean;
}

export enum AbovePart {
  NONE,
  ABOVE,
  MIDDLE,
  BELOW,
}
