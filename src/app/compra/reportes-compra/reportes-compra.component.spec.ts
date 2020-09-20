import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesCompraComponent } from './reportes-compra.component';

describe('ReportesCompraComponent', () => {
  let component: ReportesCompraComponent;
  let fixture: ComponentFixture<ReportesCompraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportesCompraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
