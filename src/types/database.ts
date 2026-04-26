export interface ProductSchema {
  product_id: string;
  product_name: string;
  category: string;
  discounted_price: number;
  actual_price: number;
  rating: number;
  rating_count: number;
  about_product: string;
  user_id: string[];
  user_name: string[];
  review_id: string[];
  review_title: string[];
  review_content: string[];
  img_link: string;
  product_link: string;
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