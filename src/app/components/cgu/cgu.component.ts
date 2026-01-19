import {Component, OnInit, Renderer2, DOCUMENT, inject, ChangeDetectionStrategy} from '@angular/core';


@Component({
    selector: 'app-cgu',
    templateUrl: './cgu.component.html',
    styleUrls: ['./cgu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CguComponent implements OnInit {
  private document = inject<Document>(DOCUMENT);
  private renderer = inject(Renderer2);

  constructor() {
    this.renderer.addClass(this.document.body, 'bg-light');
  }

  ngOnInit(): void {}
}
