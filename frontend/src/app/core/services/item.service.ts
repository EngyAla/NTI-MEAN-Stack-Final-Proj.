import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Item } from '../models/ecommerce.model';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

export interface CartValidationResult {
  success: boolean;
  allAvailable: boolean;
  items: Array<{
    itemId: string;
    name?: string;
    available: boolean;
    message: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/items`;

  getItems(filters?: {
    category?: string;
    search?: string;
    featured?: boolean;
    sort?: string;
  }): Observable<Item[]> {
    let params = new HttpParams();

    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.featured !== undefined) params = params.set('featured', String(filters.featured));
    if (filters?.sort) params = params.set('sort', filters.sort);

    return this.http
      .get<ApiResponse<Item[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  getManagerItems(filters?: {
    category?: string;
    search?: string;
    sort?: string;
  }): Observable<Item[]> {
    let params = new HttpParams();

    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.sort) params = params.set('sort', filters.sort);

    return this.http
      .get<ApiResponse<Item[]>>(`${this.baseUrl}/manager/all`, { params })
      .pipe(map((res) => res.data));
  }

  getItem(id: string): Observable<Item> {
    return this.http
      .get<ApiResponse<Item>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  getItemsByCategory(categoryId: string): Observable<Item[]> {
    return this.http
      .get<ApiResponse<Item[]>>(`${this.baseUrl}/category/${categoryId}`)
      .pipe(map((res) => res.data));
  }

  validateCart(cartItems: Array<{ itemId: string; quantity: number }>): Observable<CartValidationResult> {
    return this.http.post<CartValidationResult>(`${this.baseUrl}/validate-cart`, { items: cartItems });
  }

  createItem(itemData: Partial<Item>): Observable<Item> {
    return this.http
      .post<ApiResponse<Item>>(this.baseUrl, itemData)
      .pipe(map((res) => res.data));
  }

  updateItem(id: string, itemData: Partial<Item>): Observable<Item> {
    return this.http
      .put<ApiResponse<Item>>(`${this.baseUrl}/${id}`, itemData)
      .pipe(map((res) => res.data));
  }

  deleteItem(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
