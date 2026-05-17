import { DecimalPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { ToolExecution } from '../../../core/models/tool-execution.model';
import { JsonViewerComponent } from '../json-viewer/json-viewer.component';
import { ToolExecutionStatus, ToolStatusBadgeComponent } from '../tool-status-badge/tool-status-badge.component';

@Component({
  selector: 'app-tool-trace-card',
  standalone: true,
  imports: [JsonViewerComponent, ToolStatusBadgeComponent, DecimalPipe],
  templateUrl: './tool-trace-card.component.html'
})
export class ToolTraceCardComponent {
  execution = input.required<ToolExecution>();
  index = input(0);
  readonly expanded = signal(false);
  readonly status = computed<ToolExecutionStatus>(() => {
    const status = this.execution().status;
    if (status) {
      return status;
    }

    return this.execution().success === false ? 'FAILED' : 'SUCCESS';
  });
  readonly confidence = computed(() => this.execution().confidence ?? 0);
  readonly inputData = computed(() => this.execution().input ?? { summary: this.execution().inputSummary ?? 'N/A' });
  readonly outputData = computed(() => this.execution().output ?? { summary: this.execution().outputSummary ?? 'N/A' });
  readonly subtitle = computed(() => this.execution().reasoning ?? this.execution().inputSummary ?? this.execution().executedAt ?? 'Tool execution trace');

  toggleExpanded(): void {
    this.expanded.update((value) => !value);
  }
}
