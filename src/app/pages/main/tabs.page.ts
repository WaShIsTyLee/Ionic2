import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from 'src/app/models/user.model';
import { addIcons } from 'ionicons';
import { homeOutline, personOutline, hardwareChipOutline, logOut, logOutOutline, person, pulse, home } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,  // 👈 Esto es clave
  imports: [
    CommonModule,
    RouterModule,
    IonicModule
  ],
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss']
})
export class TabsPage implements OnInit {
  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);
  router = inject(Router);

  user: User;

  constructor() {
    addIcons({ home, person ,pulse, logOutOutline });
    this.user = this.utilsService.getLocalStoredUser()!;
  }

  ngOnInit() {}

  signOut() {
    this.firebaseService.signOut().then(() => {
      this.router.navigate(['/auth']).then(() => {
        window.location.reload();
      });
    });
  }
}
