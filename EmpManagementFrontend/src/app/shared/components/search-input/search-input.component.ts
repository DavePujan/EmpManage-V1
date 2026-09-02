import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="input-group has-leading-icon has-trailing-action">
      <span class="input-icon">
        <app-icon name="search" [size]="18"></app-icon>
      </span>
      <input
        type="text"
        class="form-control"
        [placeholder]="placeholder"
        [ngModel]="searchTerm"
        (ngModelChange)="onSearchChange($event)"
        [attr.aria-label]="placeholder"
      />
      @if (searchTerm) {
        <span class="input-action" (click)="clearSearch()" title="Clear search">
          <app-icon name="x" [size]="16"></app-icon>
        </span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class SearchInputComponent implements OnDestroy {
  @Input() placeholder: string = 'Search...';
  @Input() debounceMs: number = 300;
  @Output() searchChange = new EventEmitter<string>();

  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private sub: Subscription;

  constructor() {
    this.sub = this.searchSubject
      .pipe(debounceTime(this.debounceMs), distinctUntilChanged())
      .subscribe(value => {
        this.searchChange.emit(value);
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
