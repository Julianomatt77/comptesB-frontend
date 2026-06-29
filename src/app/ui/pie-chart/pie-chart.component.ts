import {
  Component,
  ChangeDetectionStrategy,
  input,
  effect,
  ElementRef,
  viewChild,
  OnDestroy,
} from '@angular/core';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';

Chart.register(PieController, ArcElement, Tooltip, Legend);

export interface ChartDataItem {
  name: string;
  value: number;
}

const CHART_COLORS = [
  '#5AA454', '#A10A28', '#C7B42C', '#AAAAAA',
  '#2196F3', '#FF5722', '#9C27B0', '#00BCD4',
  '#8BC34A', '#FF9800', '#607D8B', '#E91E63',
];

@Component({
  selector: 'app-pie-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [style.height.px]="height()" [style.width]="'100%'">
      <canvas #chartCanvas aria-label="Graphique des dépenses par catégorie" role="img"></canvas>
    </div>
  `,
})
export class PieChartComponent implements OnDestroy {
  readonly data = input<ChartDataItem[]>([]);
  readonly height = input<number>(400);

  private readonly chartCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chartInstance: Chart | null = null;

  constructor() {
    effect(() => {
      const filtered = this.data().filter(d => d.value > 0);
      this.renderChart(filtered);
    });
  }

  private renderChart(data: ChartDataItem[]): void {
    const canvas = this.chartCanvas().nativeElement;

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    if (!data.length) return;

    this.chartInstance = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: CHART_COLORS.slice(0, data.length),
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // ← clé : respecte la hauteur du conteneur CSS
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed as number;
                return ` ${ctx.label} : ${val.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€`;
              },
            },
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
  }
}
