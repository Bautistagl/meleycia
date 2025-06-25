// types/index.ts
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: boolean;
  description:string;
  categoria:string;
  marca:string;
  precio_oferta:number;
  imageUrl: string ;
}

export interface CarritoItem {
  id: number;
  cliente_id?: string; 
  producto_id: number;
  pedido_id?: string; 
  cantidad: number;
  precio_unitario: number;
  precio_total:number;
  descripcion:string,
  foto:string,
  marca:string,
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