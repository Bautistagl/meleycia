// types/index.ts
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: boolean;
  description: string;
  categoria: string;
  marca: string;
  precio_oferta: number | null; // <-- Missing in your map
  imageUrl: string;
  destacado: boolean;
  codigo: string;
}

export interface CarritoItem {
  id: number;
  cliente_id?: string;
  producto_id: number;
  pedido_id?: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  descripcion: string;
  foto: string;
  marca: string;
  codigo: string;
  producto: Producto; // Para hacer joins y tener la info del producto
}

export interface Pedido {
  id: number;
  created_at: string;
  estado: string;
  observaciones: string | null; // Allow null as per your schema (text type can be null)
  cliente_id: string; // uuid in Supabase is typically string in TS
  total: number;
  items_carrito: CarritoItem[]; // This will hold the joined data
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono:number;
}
export interface Brand {
  id?: string;
  name: string;
  description: string;
  website?: string;
  logo?: File | null;
  country?: string;
  foundedYear?: number;
}

export interface BrandFormData {
  marca: string;
}
export interface CatFormData {
  nombre: string;
}

export interface FormErrors {
  name?: string;
  description?: string;
  website?: string;
  logo?: string;
  country?: string;
  foundedYear?: string;
}
