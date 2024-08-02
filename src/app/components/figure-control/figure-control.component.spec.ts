import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FigureControlComponent } from './figure-control.component';

describe('FigureControlComponent', () => {
  let component: FigureControlComponent;
  let fixture: ComponentFixture<FigureControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FigureControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FigureControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
