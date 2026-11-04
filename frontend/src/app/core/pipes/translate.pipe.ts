import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Re-evaluates automatically when signal updates in LanguageService
})
export class TranslatePipe implements PipeTransform {
  private languageService = inject(LanguageService);

  transform(key: string, defaultText?: string): string {
    if (!key) return '';
    return this.languageService.translate(key, defaultText);
  }
}
