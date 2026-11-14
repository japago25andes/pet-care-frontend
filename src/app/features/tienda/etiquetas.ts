export const CATEGORIAS = [
  { valor: 'alimento', texto: 'Alimento', icono: 'nutrition' },
  { valor: 'medicamento', texto: 'Medicamento', icono: 'medication' },
  { valor: 'accesorio', texto: 'Accesorio', icono: 'sell' },
  { valor: 'higiene', texto: 'Higiene', icono: 'soap' },
  { valor: 'juguete', texto: 'Juguete', icono: 'toys' },
  { valor: 'otro', texto: 'Otro', icono: 'category' },
] as const;

export type CategoriaProducto = (typeof CATEGORIAS)[number]['valor'];

export function iconoCategoria(categoria: string | null): string {
  return CATEGORIAS.find((c) => c.valor === categoria)?.icono ?? 'category';
}
