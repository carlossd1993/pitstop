import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DetalleBici } from './detalle-bici';

describe('DetalleBici', () => {
  let component: DetalleBici;
  let fixture: ComponentFixture<DetalleBici>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleBici],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleBici);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
