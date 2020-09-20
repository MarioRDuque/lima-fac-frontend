import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompraFormularioComponent } from './compra-formulario.component';

describe('CompraFormularioComponent', () => {
  let component: CompraFormularioComponent;
  let fixture: ComponentFixture<CompraFormularioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompraFormularioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompraFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
