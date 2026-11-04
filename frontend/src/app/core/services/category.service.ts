import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/ecommerce.model';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/categories`;

  getCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(this.baseUrl).pipe(map((res) => res.data));
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(`${this.baseUrl}/${id}`).pipe(map((res) => res.data));
  }

  createCategory(category: any): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(this.baseUrl, category).pipe(map((res) => res.data));
  }

  updateCategory(id: string, category: any): Observable<Category> {
    return this.http.put<ApiResponse<Category>>(`${this.baseUrl}/${id}`, category).pipe(map((res) => res.data));
  }

  deleteCategory(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
