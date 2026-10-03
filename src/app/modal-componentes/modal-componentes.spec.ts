import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponentesComponent } from './modal-componentes';

describe('ModalComponentesComponent', () => {
  let component: ModalComponentesComponent;
  let fixture: ComponentFixture<ModalComponentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponentesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponentesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
