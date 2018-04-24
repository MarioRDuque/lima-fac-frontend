import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesVentaComponent } from './reportes-venta.component';

describe('ReportesVentaComponent', () => {
  let component: ReportesVentaComponent;
  let fixture: ComponentFixture<ReportesVentaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportesVentaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
