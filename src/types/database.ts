export interface ProductSchema {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  discounted_price: string;
  actual_price: string;
  discount_percentage: string;
  rating: string;
  rating_count: string;
  about_product: string;
  img_link: string;
  product_link: string;
  user_id: string;
  user_name: string;
  review_id: string;
  review_title: string;
  review_content: string;
}
interface CartItem {
  product_id: string;
  product_name: string;
  discounted_price: string;
  actual_price: string;
  quantity: number;
  img_link?: string;
}
interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
}
export type { CartItem, CartSidebarProps };