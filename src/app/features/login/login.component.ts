import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  username = 'analyst';
  password = 'Analyst@12345';

  async login(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(this.authService.login({
        username: this.username,
        password: this.password
      }));

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      this.error.set(this.toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      return 'Invalid username or password.';
    }

    if (error instanceof HttpErrorResponse) {
      return `Authentication service unavailable (${error.status}).`;
    }

    return 'Unable to sign in. Verify the backend is running.';
  }
}
