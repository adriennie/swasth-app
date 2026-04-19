import AsyncStorage from '@react-native-async-storage/async-storage';

export type Key =
  | 'global_product_catalog'
  | 'distributor_orders_to_admin'
  | 'distributor_stock_items'
  | 'admin_pharmacies'
  | 'pharmacy_stores'
  | 'pharmacy_auth'
  | 'user_auth';

export async function getJSON<T = any>(key: Key): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export async function setJSON(key: Key, value: any) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function pushToList<T = any>(key: Key, item: T) {
  const list = ((await getJSON<T[]>(key)) || []) as T[];
  list.unshift(item);
  await setJSON(key, list);
  return list;
}

export async function removeFromList<T = any>(key: Key, predicate: (t: T) => boolean) {
  const list = ((await getJSON<T[]>(key)) || []) as T[];
  const next = list.filter((x) => !predicate(x));
  await setJSON(key, next);
  return next;
}
