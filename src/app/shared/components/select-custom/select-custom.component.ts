import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface SelectorOption {
  Id: number | string;
  Name: string;
}

@Component({
    selector: 'app-select-custom',
    imports: [
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        CommonModule
    ],
    standalone:true,
    templateUrl: './select-custom.component.html',
    styleUrls: ['./select-custom.component.scss']
})
export class SelectCustomComponent   {

  @Input() label: string = '';
  @Input() options: SelectorOption[] = [];
  @Input() disabled: boolean = false;
  
  @Output() selectionChange = new EventEmitter<number | string>();

  onSelectionChange(event: any): void {
    
    this.selectionChange.emit(event.value);
  }
}
