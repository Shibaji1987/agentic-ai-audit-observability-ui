import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EngineStatusStore } from '../../core/state/engine-status.store';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [NgClass],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css'
})
export class TopNavComponent {
  readonly authService = inject(AuthService);
  readonly engineStatusStore = inject(EngineStatusStore);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
