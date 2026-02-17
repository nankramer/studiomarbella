export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  image: string;
  category: "furniture" | "lighting" | "boards" | "objet";
  inStock: boolean;
};

export const products: Product[] = [
  {
    id: "sm-coffee-table-001",
    name: "Nero Coffee Table",
    description: "Solid marble top with sculpted pedestal base.",
    priceCents: 289990,
    image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80",
    category: "furniture",
    inStock: true,
  },
  {
    id: "sm-pendant-001",
    name: "Bianco Pendant",
    description: "Marble shade pendant for warm ambient lighting.",
    priceCents: 124990,
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80",
    category: "lighting",
    inStock: true,
  },
  {
    id: "sm-board-001",
    name: "Carrara Serving Board",
    description: "Hand-finished board for kitchens and entertaining.",
    priceCents: 39990,
    image: "https://images.unsplash.com/photo-1610450949065-1f2841536c88?auto=format&fit=crop&w=1200&q=80",
    category: "boards",
    inStock: true,
  },
  {
    id: "sm-objet-001",
    name: "Marbella Orb",
    description: "Collectible marble objet for shelves and consoles.",
    priceCents: 59990,
    image: "https://images.unsplash.com/photo-1523419409543-e8fe44818f95?auto=format&fit=crop&w=1200&q=80",
    category: "objet",
    inStock: true,
  },
];

export const productMap = new Map(products.map((product) => [product.id, product]));
