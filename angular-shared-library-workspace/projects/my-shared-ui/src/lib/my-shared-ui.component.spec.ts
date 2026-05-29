import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySharedUiComponent } from './my-shared-ui.component';

describe('MySharedUiComponent', () => {
  let component: MySharedUiComponent;
  let fixture: ComponentFixture<MySharedUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySharedUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MySharedUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
