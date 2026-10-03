import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponenteBiciComponent } from './componente-bici';

describe('ComponenteBiciComponent', () => {
  let component: ComponenteBiciComponent;
  let fixture: ComponentFixture<ComponenteBiciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponenteBiciComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponenteBiciComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
