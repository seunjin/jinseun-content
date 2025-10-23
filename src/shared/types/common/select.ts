export type SelectOption<TValue extends string | number = string> = {
  id?: number;
  label: string;
  value: TValue;
};
