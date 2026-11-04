import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, LanguageCode } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-switch-wrapper">
      <button
        type="button"
        class="lang-pill"
        (click)="switchLanguage(otherLang)"
        [title]="otherLang === 'ar' ? 'التحويل إلى العربية' : 'Switch to English'"
        aria-label="Switch Language"
      >
        <span class="globe-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </span>
        <span class="current-label">{{ currentLang === 'ar' ? 'العربية' : 'English' }}</span>
        <span class="arrow-indicator">&rlarr;</span>
        <span class="target-label">{{ otherLang === 'ar' ? 'العربية' : 'English' }}</span>
      </button>
    </div>
  `,
  styles: [
    `
      .lang-switch-wrapper {
        display: inline-flex;
        align-items: center;
      }

      .lang-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.75rem;
        border-radius: var(--radius-full);
        border: 1px solid var(--color-border);
        background-color: rgba(255, 255, 255, 0.85);
        color: var(--color-espresso);
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition-fast);
        line-height: 1;

        &:hover {
          background-color: #ffffff;
          border-color: var(--color-gold);
          color: var(--color-gold-dark);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .globe-icon {
          display: flex;
          align-items: center;
          color: var(--color-gold-dark);
        }

        .current-label {
          font-weight: 700;
        }

        .arrow-indicator {
          opacity: 0.4;
          font-size: 0.75rem;
        }

        .target-label {
          color: var(--color-gold-dark);
        }
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  languageService = inject(LanguageService);

  get currentLang(): LanguageCode {
    return this.languageService.currentLang();
  }

  get otherLang(): LanguageCode {
    return this.currentLang === 'en' ? 'ar' : 'en';
  }

  switchLanguage(lang: LanguageCode) {
    this.languageService.setLanguage(lang);
  }
}
