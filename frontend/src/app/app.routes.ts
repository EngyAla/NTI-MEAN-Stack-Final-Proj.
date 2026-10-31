import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Storefront (with Public Header & Footer layout)
  {
    path: '',
    loadComponent: () =>
      import('./features/public/public-layout.component').then(
        (m) => m.PublicLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'shop',
        loadComponent: () =>
          import('./features/public/shop/shop.component').then(
            (m) => m.ShopComponent
          ),
      },
      {
        path: 'item/:id',
        loadComponent: () =>
          import('./features/public/item-details/item-details.component').then(
            (m) => m.ItemDetailsComponent
          ),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('./features/public/favorites/favorites.component').then(
            (m) => m.FavoritesComponent
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/public/cart/cart.component').then(
            (m) => m.CartComponent
          ),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/public/checkout/checkout.component').then(
            (m) => m.CheckoutComponent
          ),
      },
    ],
  },

  // Manager Authentication
  {
    path: 'manager/login',
    loadComponent: () =>
      import('./features/manager/login/login.component').then(
        (m) => m.ManagerLoginComponent
      ),
  },

  // Manager Protected Console (with Dashboard Sidebar layout)
  {
    path: 'manager',
    loadComponent: () =>
      import('./features/manager/manager-layout.component').then(
        (m) => m.ManagerLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/manager/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/manager/categories/categories-manager.component').then(
            (m) => m.CategoriesManagerComponent
          ),
      },
      {
        path: 'items',
        loadComponent: () =>
          import('./features/manager/items/items-manager.component').then(
            (m) => m.ItemsManagerComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/manager/orders/orders-manager.component').then(
            (m) => m.OrdersManagerComponent
          ),
      },
    ],
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: '',
  },
];
