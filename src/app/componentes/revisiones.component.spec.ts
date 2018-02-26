import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionesComponent } from './revisiones.component';

describe('RevisionesComponent', () => {
  let component: RevisionesComponent;
  let fixture: ComponentFixture<RevisionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevisionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
