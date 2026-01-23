import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-home-card',
  imports: [],
  templateUrl: './home-card.component.html',
  styleUrl: './home-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeCardComponent {
  readonly imagePath = input<string>("");
  readonly alt = input<string>("");
  readonly title = input<string>("");
  readonly texte = input<string>("");
}
