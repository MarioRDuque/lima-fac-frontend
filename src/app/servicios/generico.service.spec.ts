import { TestBed, inject } from '@angular/core/testing';

import { GenericoService } from './generico.service';

describe('GenericoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenericoService]
    });
  });

  it('should be created', inject([GenericoService], (service: GenericoService<any>) => {
    expect(service).toBeTruthy();
  }));
});
