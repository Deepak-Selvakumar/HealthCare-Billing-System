import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBillDialogComponent } from './add-bill-dialog.component';

describe('AddBillDialogComponent', () => {
  let component: AddBillDialogComponent;
  let fixture: ComponentFixture<AddBillDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBillDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBillDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
