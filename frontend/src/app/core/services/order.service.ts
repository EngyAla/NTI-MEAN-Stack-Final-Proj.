import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, CustomerInfo } from '../models/ecommerce.model';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

export interface CreateOrderPayload {
  customer: CustomerInfo;
  items: Array<{ item: string; quantity: number }>;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/orders`;

  createOrder(payload: CreateOrderPayload): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.baseUrl, payload);
  }

  getOrders(status?: string, search?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (status && status !== 'all') params = params.set('status', status);
    if (search && search.trim()) params = params.set('search', search.trim());

    return this.http
      .get<ApiResponse<Order[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  getOrder(id: string): Observable<Order> {
    return this.http
      .get<ApiResponse<Order>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  updateOrderStatus(id: string, status: 'opened' | 'closed'): Observable<Order> {
    return this.http
      .patch<ApiResponse<Order>>(`${this.baseUrl}/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }

  updateOrderNotes(id: string, internalNotes: string): Observable<Order> {
    return this.http
      .patch<ApiResponse<Order>>(`${this.baseUrl}/${id}/notes`, { internalNotes })
      .pipe(map((res) => res.data));
  }
}
