import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibroRevisionesComponent } from './libro-revisiones';

describe('LibroRevisionesComponent', () => {
  let component: LibroRevisionesComponent;
  let fixture: ComponentFixture<LibroRevisionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibroRevisionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LibroRevisionesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
