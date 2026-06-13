import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EngineStatusStore } from '../../core/state/engine-status.store';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopNavComponent } from '../top-nav/top-nav.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopNavComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  private readonly engineStatusStore = inject(EngineStatusStore);

  constructor() {
    void this.engineStatusStore.load();
  }
}
