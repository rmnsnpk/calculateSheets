import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateManuallyPageComponent } from './calculate-manually-page.component';

describe('CalculateManuallyPageComponent', () => {
  let component: CalculateManuallyPageComponent;
  let fixture: ComponentFixture<CalculateManuallyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculateManuallyPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculateManuallyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
