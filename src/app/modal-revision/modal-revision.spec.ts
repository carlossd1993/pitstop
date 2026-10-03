import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalRevisionComponent } from './modal-revision';

describe('ModalRevisionComponent', () => {
  let component: ModalRevisionComponent;
  let fixture: ComponentFixture<ModalRevisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRevisionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalRevisionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
