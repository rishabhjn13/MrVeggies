import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  limit,
  where,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { ProductSchema } from "@/types/database";

// 1. The Data Converter
const productConverter: FirestoreDataConverter<ProductSchema> = {
  toFirestore(product: ProductSchema): DocumentData {
    return { ...product };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): ProductSchema {
    return snapshot.data() as ProductSchema;
  },
};

// 2. Collection Reference
const productsRef = collection(db, "products").withConverter(productConverter);

/** --- CRUD FUNCTIONS --- **/

// WRITE
export const createProduct = async (product: ProductSchema) => {
  const docRef = doc(productsRef, product.product_id);
  return await setDoc(docRef, product);
};

// READ (Single)
export const getProduct = async (productId: string) => {
  const docRef = doc(productsRef, productId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : null;
};

// UPDATE
export const updateProduct = async (
  productId: string,
  data: Partial<ProductSchema>,
) => {
  const docRef = doc(productsRef, productId);
  return await updateDoc(docRef, data);
};

// DELETE
export const deleteProduct = async (productId: string) => {
  const docRef = doc(productsRef, productId);
  return await deleteDoc(docRef);
};

/** --- SPECIALIZED FUNCTIONS --- **/

// READ N ENTRIES
export const read_n = async (n: number) => {
  const q = query(productsRef, limit(n));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};

/** * READ QUERY (Search by Title)
 * Note: Firestore "search" is case-sensitive and prefix-based.
 * For advanced fuzzy search, consider using Algolia or ElasticSearch.
 */
export const read_query = async (productTitle: string) => {
  const q = query(
    productsRef,
    where("product_name", ">=", productTitle),
    where("product_name", "<=", productTitle + "\uf8ff"),
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};

export const fetchAllProducts = async (): Promise<ProductSchema[]> => {
  const querySnapshot = await getDocs(productsRef);
  return querySnapshot.docs.map((doc) => doc.data());
};
