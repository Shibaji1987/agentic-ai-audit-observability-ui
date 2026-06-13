import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex min-h-[60vh] items-center justify-center">
      <section class="w-full max-w-xl rounded border border-slate-800 bg-slate-900 p-8 text-center">
        <div class="text-sm font-semibold uppercase text-amber-300">Access restricted</div>
        <h1 class="mt-3 text-2xl font-semibold text-white">Your role cannot perform this action.</h1>
        <p class="mt-3 text-sm leading-6 text-slate-400">
          The backend has also blocked this operation. Contact an administrator if your responsibilities require access.
        </p>
        <a routerLink="/dashboard" class="mt-6 inline-flex rounded bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950">
          Return to Dashboard
        </a>
      </section>
    </div>
  `
})
export class ForbiddenComponent {}
