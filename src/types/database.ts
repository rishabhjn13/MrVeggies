export interface ProductSchema {
  id: string;
  product_id: string;
  product_name: string;
  mrp: string;
  price : string;
  category: string;
  brand: string;
  margin_percentage: string;
  max_stock_level: string;
  min_stock_level: string;
  shelf_life_days: string
}
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}
interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
}
export type { CartItem, CartSidebarProps };