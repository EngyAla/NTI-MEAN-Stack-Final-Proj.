import { Injectable, computed, inject, signal } from '@angular/core';
import { Item } from '../models/ecommerce.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private toastService = inject(ToastService);
  private readonly STORAGE_KEY = 'aurelia_favorites';

  favorites = signal<Item[]>(this.loadFavoritesFromStorage());

  favoriteCount = computed(() => this.favorites().length);

  constructor() {}

  isFavorite(itemId: string): boolean {
    return this.favorites().some((item) => item._id === itemId);
  }

  toggleFavorite(item: Item) {
    if (this.isFavorite(item._id)) {
      this.removeFavorite(item._id);
    } else {
      this.addFavorite(item);
    }
  }

  addFavorite(item: Item) {
    if (this.isFavorite(item._id)) return;

    this.favorites.update((current) => {
      const updated = [item, ...current];
      this.saveFavoritesToStorage(updated);
      return updated;
    });

    this.toastService.success(`Added "${item.name}" to your wishlist.`);
  }

  removeFavorite(itemId: string) {
    this.favorites.update((current) => {
      const removed = current.find((item) => item._id === itemId);
      const updated = current.filter((item) => item._id !== itemId);
      this.saveFavoritesToStorage(updated);
      if (removed) {
        this.toastService.show(`Removed "${removed.name}" from your wishlist.`, 'info');
      }
      return updated;
    });
  }

  private loadFavoritesFromStorage(): Item[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveFavoritesToStorage(items: Item[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }
}
