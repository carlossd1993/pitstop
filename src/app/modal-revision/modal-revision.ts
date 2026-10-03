import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RevisionData {
  fecha: string;
  km: number;
  mecanico: string;
  descripcion: string;
}

@Component({
  selector: 'app-modal-revision',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-revision.html',
  styleUrl: './modal-revision.scss',
})
export class ModalRevisionComponent implements OnInit {
  @Input() kmActuales: number = 0;
  @Output() revisionGuardada = new EventEmitter<RevisionData>();

  fechaHoy: string = '';
  mecanicoSesion: string = '';

  ngOnInit() {
    this.fechaHoy = new Date().toISOString().substring(0, 10);
    this.mecanicoSesion = localStorage.getItem('mecanicoSesion') || 'Carlos';
  }

  guardar(fechaTxt: string, kmTxt: string, mecanicoTxt: string, descTxt: string) {
    const nuevaRevision: RevisionData = {
      fecha: fechaTxt || this.fechaHoy,
      km: Number(kmTxt) || this.kmActuales,
      mecanico: mecanicoTxt.trim() || this.mecanicoSesion,
      descripcion: descTxt.trim() || 'Revisión periódica y mantenimiento general.'
    };

    console.log('📋 Nueva revisión anotada para el JSON:', nuevaRevision);
    this.revisionGuardada.emit(nuevaRevision);
  }
}

export { ModalRevisionComponent as ModalRevision };
