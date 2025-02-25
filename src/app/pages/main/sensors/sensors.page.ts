import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SensorService } from 'src/app/services/sensor.service';
import { Position } from '@capacitor/geolocation';
import { Subscription } from 'rxjs';

// 👉 Importar el plugin de batería
import { BatteryStatus } from '@awesome-cordova-plugins/battery-status/ngx';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.page.html',
  styleUrls: ['./sensors.page.scss'],
  standalone: true,
  imports: [
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
  ],
  providers: [BatteryStatus] // Agregar el proveedor del plugin
})
export class SensorsPage implements OnInit, OnDestroy {
  sensorService = inject(SensorService);
  batteryStatus = inject(BatteryStatus); // Inyectar el servicio de batería

  private accelerometerDataSubscription: Subscription | null = null;
  private orientationDataSubscription: Subscription | null = null;
  private coordinatesSubscription: Subscription | null = null;
  private batterySubscription: Subscription | null = null; // Nueva suscripción de batería

  accelerometerData: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
  orientationData: { alpha: number; beta: number; gamma: number } = {
    alpha: 0,
    beta: 0,
    gamma: 0,
  };
  position: Position | null = null;

  batteryLevel: number | null = null; // Variable para guardar el nivel de batería
  isPlugged: boolean | null = null; // Variable para saber si está cargando

  constructor() {}

  ngOnInit() {
    this.sensorService.startWatchingGPS();
    this.sensorService.startListeningToMotion();

    // 📡 Suscribirse al acelerómetro
    this.accelerometerDataSubscription = this.sensorService
      .getAccelerometerData()
      .subscribe((data) => {
        this.accelerometerData = data;
      });

    // 🔄 Suscribirse a la orientación del dispositivo
    this.orientationDataSubscription = this.sensorService
      .getOrientationData()
      .subscribe((data) => {
        this.orientationData = data;
      });

    // 📍 Suscribirse a la ubicación
    this.coordinatesSubscription = this.sensorService
      .getCurrentCoordinates()
      .subscribe((data) => {
        this.position = data;
      });

    // ⚡ Suscribirse a los cambios de batería
    this.batterySubscription = this.batteryStatus.onChange().subscribe(status => {
      this.batteryLevel = status.level; // Guardar el nivel de batería (0-100)
      this.isPlugged = status.isPlugged; // Saber si está cargando
    });
  }

  ngOnDestroy() {
    // ❌ Desuscribirse de todos los observables
    this.accelerometerDataSubscription?.unsubscribe();
    this.orientationDataSubscription?.unsubscribe();
    this.coordinatesSubscription?.unsubscribe();
    this.batterySubscription?.unsubscribe(); // Desuscribirse del estado de la batería

    // ⛔ Detener sensores si es necesario
    this.sensorService.stopListeningToMotion();
    this.sensorService.stopWatchingGPS();
  }
}
