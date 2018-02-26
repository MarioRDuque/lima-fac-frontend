import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CargandoComponent } from './cargando.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports:[
    CargandoComponent
  ],
  declarations: [CargandoComponent]
})
export class ComponentesModule { }
