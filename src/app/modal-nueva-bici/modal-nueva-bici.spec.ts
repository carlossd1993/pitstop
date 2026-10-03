import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalNuevaBici } from './modal-nueva-bici';

describe('ModalNuevaBici', () => {
  let component: ModalNuevaBici;
  let fixture: ComponentFixture<ModalNuevaBici>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNuevaBici],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalNuevaBici);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
