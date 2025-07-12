// src/entities/Product.ts

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  origin: string;
  category: string;
  fileId: number;
}

export const products: Product[] = [];
let prodId = 1;

export function createProduct(data: Omit<Product, "id">): Product {
  const product: Product = { id: prodId++, ...data };
  products.push(product);
  return product;
}
