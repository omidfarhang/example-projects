import { TestBed } from '@angular/core/testing';

import { MySharedUiService } from './my-shared-ui.service';

describe('MySharedUiService', () => {
  let service: MySharedUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MySharedUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
