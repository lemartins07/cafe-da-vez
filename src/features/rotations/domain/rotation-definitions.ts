export type RotationDefinition = {
  name: string;
  type: 'MAKE_COFFEE' | 'BUY_COFFEE';
};

export const rotationDefinitions: readonly RotationDefinition[] = [
  { name: 'Preparar café', type: 'MAKE_COFFEE' },
  { name: 'Comprar café', type: 'BUY_COFFEE' },
];
