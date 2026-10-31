import { Injectable, computed, inject, signal } from '@angular/core';
import { Item, CartItem } from '../models/ecommerce.model';
import { ItemService, CartValidationResult } from './item.service';
import { ToastService } from './toast.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private itemService = inject(ItemService);
  private toastService = inject(ToastService);
  private readonly STORAGE_KEY = 'aurelia_cart';

  items = signal<CartItem[]>(this.loadCartFromStorage());

  cartCount = computed(() => {
    return this.items().reduce((acc, curr) => acc + curr.quantity, 0);
  });

  subtotal = computed(() => {
    return this.items().reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  });

  totalPrice = computed(() => {
    return this.subtotal(); // Complimentary luxury concierge delivery
  });

  constructor() {}

  addToCart(item: Item, quantity = 1) {
    if (quantity <= 0) return;

    this.items.update((current) => {
      const existingIndex = current.findIndex((ci) => ci.item._id === item._id);
      let updated: CartItem[];

      if (existingIndex > -1) {
        updated = current.map((ci, index) =>
          index === existingIndex
            ? { ...ci, quantity: ci.quantity + quantity }
            : ci
        );
      } else {
        updated = [...current, { item, quantity }];
      }

      this.saveCartToStorage(updated);
      return updated;
    });

    this.toastService.success(`Added "${item.name}" to your shopping bag.`);
  }

  updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    this.items.update((current) => {
      const updated = current.map((ci) =>
        ci.item._id === itemId ? { ...ci, quantity: newQuantity } : ci
      );
      this.saveCartToStorage(updated);
      return updated;
    });
  }

  incrementQuantity(itemId: string) {
    const found = this.items().find((ci) => ci.item._id === itemId);
    if (found) {
      this.updateQuantity(itemId, found.quantity + 1);
    }
  }

  decrementQuantity(itemId: string) {
    const found = this.items().find((ci) => ci.item._id === itemId);
    if (found) {
      if (found.quantity > 1) {
        this.updateQuantity(itemId, found.quantity - 1);
      } else {
        this.removeFromCart(itemId);
      }
    }
  }

  removeFromCart(itemId: string) {
    this.items.update((current) => {
      const itemToRemove = current.find((ci) => ci.item._id === itemId);
      const updated = current.filter((ci) => ci.item._id !== itemId);
      this.saveCartToStorage(updated);
      if (itemToRemove) {
        this.toastService.show(`Removed "${itemToRemove.item.name}" from shopping bag.`, 'info');
      }
      return updated;
    });
  }

  clearCart() {
    this.items.set([]);
    this.saveCartToStorage([]);
  }

  validateCartStock(): Observable<CartValidationResult> {
    const payload = this.items().map((ci) => ({
      itemId: ci.item._id,
      quantity: ci.quantity,
    }));
    return this.itemService.validateCart(payload);
  }

  private loadCartFromStorage(): CartItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveCartToStorage(items: CartItem[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }
}
