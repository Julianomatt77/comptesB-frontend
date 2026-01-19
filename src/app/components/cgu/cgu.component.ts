import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'app-cgu',
    templateUrl: './cgu.component.html',
    styleUrls: ['./cgu.component.css']
})
export class CguComponent implements OnInit {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {
    this.renderer.addClass(this.document.body, 'bg-light');
  }

  ngOnInit(): void {}
}
