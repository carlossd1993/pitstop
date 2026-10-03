import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-detalle-bici',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './detalle-bici.html',
  styleUrl: './detalle-bici.scss',
})
export class DetalleBiciComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  bici = signal<any | null>(null);
  cargando = signal<boolean>(true);

  ngOnInit() {
    this.cargarDetalle();
  }

  async cargarDetalle() {
    const idParam = this.route.snapshot.paramMap.get('id');

    try {
      const url = this.location.prepareExternalUrl('/data/bicicletas.json');
      const respuesta = await fetch(url);
      const datos = await respuesta.json();
      const arrayBicis: any[] = Array.isArray(datos) ? datos : datos.bicicletas || [];

      const encontrada = arrayBicis.find(
        (b) => b.id?.toString() === idParam
      );
      this.bici.set(encontrada || null);
    } catch (error) {
      console.error('Error al cargar detalle de bicicleta:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}

export { DetalleBiciComponent as DetalleBici };
