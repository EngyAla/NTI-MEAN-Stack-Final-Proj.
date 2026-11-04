import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type LanguageCode = 'en' | 'ar';

interface TranslationsResponse {
  success: boolean;
  lang: LanguageCode;
  count: number;
  data: Record<string, string>;
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'aurelia_lang';

  // In-memory cache for translations per language: Map<'en' | 'ar', Record<string, string>>
  private cache = new Map<LanguageCode, Record<string, string>>();

  currentLang = signal<LanguageCode>(this.getInitialLanguage());
  translations = signal<Record<string, string>>({});
  isLoading = signal<boolean>(false);

  currentDirection = computed<'ltr' | 'rtl'>(() => (this.currentLang() === 'ar' ? 'rtl' : 'ltr'));
  isRtl = computed<boolean>(() => this.currentLang() === 'ar');

  // Trigger signal for components to reactively reload dynamic content when language changes
  languageChanged = signal<number>(0);

  initialize(): Observable<Record<string, string>> {
    return this.loadTranslations(this.currentLang());
  }

  constructor() {
    // Apply document attributes on start and changes
    effect(() => {
      const lang = this.currentLang();
      const dir = this.currentDirection();
      this.updateDocumentAttributes(lang, dir);
    });

    // Initial load
    // this.loadTranslations(this.currentLang()).subscribe();
  }

  /**
   * Set and switch active language
   */
  setLanguage(lang: LanguageCode) {
    if (lang === this.currentLang() && Object.keys(this.translations()).length > 0) {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Could not persist language to localStorage', e);
    }

    this.currentLang.set(lang);
    this.loadTranslations(lang).subscribe({
      next: () => {
        this.languageChanged.update((c) => c + 1);
      },
      error: (err) => console.error('Failed to load translations for', lang, err),
    });
  }

  /**
   * Toggle between English and Arabic
   */
  toggleLanguage() {
    const nextLang = this.currentLang() === 'en' ? 'ar' : 'en';
    this.setLanguage(nextLang);
  }

  /**
   * Load translations from backend or cache
   */
  loadTranslations(lang: LanguageCode): Observable<Record<string, string>> {
    if (this.cache.has(lang)) {
      const cached = this.cache.get(lang)!;
      this.translations.set(cached);
      return of(cached);
    }

    this.isLoading.set(true);
    return this.http.get<TranslationsResponse>(`${environment.apiUrl}/translations/${lang}`).pipe(
      map((res) => (res && res.data ? res.data : {})),
      tap((dict) => {
        this.cache.set(lang, dict);
        this.translations.set(dict);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        console.error(`Error loading translations for ${lang}`, err);
        return of({});
      })
    );
  }

  /**
   * Lookup translation key
   */
  translate(key: string, defaultText?: string): string {
    const dict = this.translations();
    if (dict && dict[key]) {
      return dict[key];
    }
    return defaultText !== undefined ? defaultText : key;
  }

  private getInitialLanguage(): LanguageCode {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) as LanguageCode;
      if (stored === 'en' || stored === 'ar') {
        return stored;
      }
    } catch {}
    return 'en';
  }

  private updateDocumentAttributes(lang: LanguageCode, dir: 'ltr' | 'rtl') {
    if (typeof document !== 'undefined') {
      const htmlEl = document.documentElement;
      htmlEl.setAttribute('lang', lang);
      htmlEl.setAttribute('dir', dir);
      if (dir === 'rtl') {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
    }
  }
}
