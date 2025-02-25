import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonAvatar, IonButton, IonIcon, IonLabel, IonItem, IonSkeletonText, IonList, IonItemOption, IonItemOptions, IonChip, IonItemSliding, IonCard, IonRefresher, IonRefresherContent, IonFab, IonInput } from '@ionic/angular/standalone';
import { UtilsService } from 'src/app/services/utils.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { User } from 'src/app/models/user.model';
import { addIcons } from 'ionicons';
import { cameraOutline, personOutline, personCircleOutline } from 'ionicons/icons';
import { HeaderComponent } from "../../../shared/components/header/header.component";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonFab, IonRefresherContent, IonRefresher, IonCard, IonItemSliding, IonChip, IonItemOptions, IonItemOption, IonList, IonSkeletonText, IonItem, IonLabel, IonIcon, IonButton, IonAvatar, IonContent, CommonModule, FormsModule, HeaderComponent, IonInput],
})
export class ProfilePage implements OnInit {
  utilsService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  supabaseService = inject(SupabaseService);
  nuevoNombre: string = '';
  
  constructor() {
    this.user = this.utilsService.getLocalStoredUser()!;
    addIcons({personCircleOutline, cameraOutline, personOutline});
  }

  user: User;

  ngOnInit() {}

  async takeImage() {
    const dataUrl = (await this.utilsService.takePicture('imagen de perfil')).dataUrl;
    const loading = await this.utilsService.loading();
    await loading.present();

    const path: string = `users/${this.user.uid}`;

    if (this.user.image) {
      const oldImagePath = await this.supabaseService.getFilePath(this.user.image)
      await this.supabaseService.deleteFile(oldImagePath!);
    }
    let imagePath = `${this.user.uid}/profile${Date.now()}`;
    
    const imageUrl = await this.supabaseService.uploadImage(imagePath, dataUrl!);
    this.user.image = imageUrl;
    this.firebaseService
      .updateDocument(path, { image: this.user.image })
      .then(async () => {
        this.utilsService.saveInLocalStorage('user', this.user);
        this.utilsService.presentToast({
          message: 'Imagen actualizada exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      })
      .catch((error) => {
        this.utilsService.presentToast({
          message: error.message,
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  async cambiarNombre() {
    if (!this.nuevoNombre.trim()) {
      this.utilsService.presentToast({
        message: 'El nombre no puede estar vacío',
        duration: 2000,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
      return;
    }
  
    const path: string = `users/${this.user.uid}`;
    this.user.name = this.nuevoNombre;
    
    const loading = await this.utilsService.loading();
    await loading.present();
  
    this.firebaseService
      .updateDocument(path, { name: this.user.name })
      .then(() => {
        this.utilsService.saveInLocalStorage('user', this.user);
        this.utilsService.presentToast({
          message: 'Nombre actualizado exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      })
      .catch((error) => {
        this.utilsService.presentToast({
          message: error.message,
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  async deleteImage() {
    const alert = await this.utilsService.presentAlert({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar la imagen de perfil?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.utilsService.loading();
            await loading.present();
  
            try {
              const imagePath = await this.supabaseService.getFilePath(this.user.image!)
              const deleted = await this.supabaseService.deleteFile(imagePath!);
  
              if (deleted) {
                const path: string = `users/${this.user.uid}`;
                this.user.image = null; 
  
                await this.firebaseService.updateDocument(path, { image: null });
  
                this.utilsService.saveInLocalStorage('user', this.user);
  
                this.utilsService.presentToast({
                  message: 'Imagen eliminada exitosamente',
                  duration: 1500,
                  color: 'success',
                  position: 'middle',
                  icon: 'checkmark-circle-outline',
                });
              } else {
                this.utilsService.presentToast({
                  message: 'Error al eliminar la imagen.',
                  duration: 2500,
                  color: 'danger',
                  position: 'middle',
                  icon: 'alert-circle-outline',
                });
              }
            } catch (error: unknown) {
              if (error instanceof Error) {
                this.utilsService.presentToast({
                  message: error.message,  
                  duration: 2500,
                  color: 'danger',
                  position: 'middle',
                  icon: 'alert-circle-outline',
                });
              } else {
                
                this.utilsService.presentToast({
                  message: 'Ocurrió un error desconocido',
                  duration: 2500,
                  color: 'danger',
                  position: 'middle',
                  icon: 'alert-circle-outline',
                });
              }
            } finally {
              loading.dismiss();
            }
          },
        },
      ],
    });
  }
  
}  
