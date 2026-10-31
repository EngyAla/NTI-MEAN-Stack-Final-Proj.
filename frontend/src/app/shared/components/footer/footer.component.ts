import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="luxury-footer">
      <div class="container footer-main">
        <!-- Col 1: Brand Story -->
        <div class="footer-col brand-col">
          <div class="footer-brand">
            <span class="brand-title">AURELIA</span>
            <span class="brand-subtitle">ATELIER</span>
          </div>
          <p class="brand-desc">
            An independent maison celebrating timeless aesthetics, artisan leathercraft, and Swiss horological mastery. Every accessory is thoughtfully sculpted for everyday elegance.
          </p>
          <div class="concierge-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>Personal Telephone Concierge: +1 (800) 482-3542</span>
          </div>
        </div>

        <!-- Col 2: The Collections -->
        <div class="footer-col">
          <h4 class="col-title">Collections</h4>
          <ul class="footer-links">
            <li><a routerLink="/shop" [queryParams]="{ category: 'handbags' }">Handbags & Leathercraft</a></li>
            <li><a routerLink="/shop" [queryParams]="{ category: 'timepieces' }">Fine Timepieces</a></li>
            <li><a routerLink="/shop" [queryParams]="{ category: 'jewelry' }">Haute Joaillerie</a></li>
            <li><a routerLink="/shop" [queryParams]="{ category: 'eyewear' }">Designer Eyewear</a></li>
            <li><a routerLink="/shop" [queryParams]="{ category: 'belts' }">Artisan Belts</a></li>
            <li><a routerLink="/shop" [queryParams]="{ category: 'silk' }">Silk & Accents</a></li>
          </ul>
        </div>

        <!-- Col 3: Client Care -->
        <div class="footer-col">
          <h4 class="col-title">Client Care</h4>
          <ul class="footer-links">
            <li><a routerLink="/shop">Bespoke Concierge</a></li>
            <li><a routerLink="/favorites">Saved Wishlist</a></li>
            <li><a routerLink="/cart">Shopping Bag</a></li>
            <li><a routerLink="/manager/login">Private Atelier Management</a></li>
            <li><span class="muted-link">Phone Order Confirmation Policy</span></li>
            <li><span class="muted-link">Authenticity Guarantee</span></li>
          </ul>
        </div>

        <!-- Col 4: Atelier Newsletter -->
        <div class="footer-col newsletter-col">
          <h4 class="col-title">Atelier Gazette</h4>
          <p class="newsletter-desc">
            Receive private invitations to private viewings, rare horological releases, and limited leather editions.
          </p>
          <form class="newsletter-form" (submit)="$event.preventDefault()">
            <input type="email" placeholder="Enter your email address" class="newsletter-input" required />
            <button type="submit" class="btn btn-gold btn-sm">Subscribe</button>
          </form>
          <span class="privacy-note">We respect your complete privacy. Unsubscribe at any moment.</span>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="container footer-bottom-content">
          <span class="copyright">
            &copy; 2026 Aurelia Atelier S.A. All rights reserved. English edition.
          </span>
          <div class="bottom-links">
            <span class="bottom-tag">Handcrafted Quiet Luxury</span>
            <span class="dot">•</span>
            <span class="bottom-tag">Tuscan Leather</span>
            <span class="dot">•</span>
            <span class="bottom-tag">Swiss Calibers</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .luxury-footer {
        background-color: var(--color-espresso);
        color: #e5ded4;
        border-top: 1px solid rgba(194, 162, 111, 0.2);
        padding-top: 5rem;
      }

      .footer-main {
        display: grid;
        grid-template-columns: 2fr 1.2fr 1.2fr 1.8fr;
        gap: 3.5rem;
        padding-bottom: 4rem;
      }

      .footer-brand {
        display: flex;
        flex-direction: column;
        margin-bottom: 1.25rem;

        .brand-title {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: #ffffff;
        }

        .brand-subtitle {
          font-size: 0.65rem;
          letter-spacing: 0.4em;
          font-weight: 600;
          color: var(--color-gold);
          margin-top: 0.2rem;
        }
      }

      .brand-desc {
        color: #b3a99c;
        font-size: 0.9rem;
        line-height: 1.7;
        margin-bottom: 1.5rem;
        max-width: 340px;
      }

      .concierge-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.65rem 1rem;
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(194, 162, 111, 0.25);
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        color: var(--color-gold-light);
      }

      .col-title {
        font-family: var(--font-serif);
        font-size: 1.25rem;
        color: #ffffff;
        margin-bottom: 1.35rem;
        letter-spacing: 0.05em;
      }

      .footer-links {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        a {
          color: #b3a99c;
          font-size: 0.88rem;
          transition: var(--transition-fast);

          &:hover {
            color: var(--color-gold-light);
            padding-left: 4px;
          }
        }

        .muted-link {
          color: #8c8276;
          font-size: 0.88rem;
        }
      }

      .newsletter-desc {
        color: #b3a99c;
        font-size: 0.88rem;
        line-height: 1.6;
        margin-bottom: 1.25rem;
      }

      .newsletter-form {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }

      .newsletter-input {
        flex: 1;
        padding: 0.65rem 0.85rem;
        background-color: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: var(--radius-sm);
        color: #ffffff;
        font-size: 0.85rem;
        outline: none;

        &:focus {
          border-color: var(--color-gold);
        }

        &::placeholder {
          color: #8c8276;
        }
      }

      .privacy-note {
        font-size: 0.72rem;
        color: #8c8276;
        display: block;
      }

      .footer-bottom {
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding: 1.75rem 0;
        background-color: #16110e;
      }

      .footer-bottom-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #8c8276;
      }

      .bottom-links {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .bottom-tag {
        color: var(--color-gold-dark);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .dot {
        opacity: 0.3;
      }

      @media (max-width: 992px) {
        .footer-main {
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }
      }

      @media (max-width: 600px) {
        .footer-main {
          grid-template-columns: 1fr;
        }

        .footer-bottom-content {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }
      }
    `,
  ],
})
export class FooterComponent {}
