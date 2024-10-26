import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonButtons,
  IonIcon,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonRow,
  IonGrid,
  IonCol, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  trashOutline,
} from 'ionicons/icons';
import { ModalController, NavController, AlertController } from '@ionic/angular';
import { Folder } from '../Interfaces/folders.interface';
import { AddUpdateFolderPopupComponent } from '../add-update-folder-popup/add-update-folder-popup.component';
import { FolderController } from '../Controllers/folders.controller';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonLabel,
    IonButton,
    IonIcon,
    IonButtons,
    IonInput,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCol,
    IonRow,
    IonGrid,
    CommonModule,
    FormsModule,
    AddUpdateFolderPopupComponent
  ],
})
export class MainPage implements OnInit {
  folders: Folder[] = [];

  constructor(
    private modalController: ModalController,
    private folderController: FolderController,
    private appComponent: AppComponent,
    private navController: NavController,
    private alertController: AlertController
  ) {
    addIcons({ addOutline, createOutline, trashOutline });
  }

  ngOnInit() {
    this.appComponent.dbReadyEvent.subscribe((dbReady) => {
      if (dbReady) {
        this.getFolders();
      }
    });
  }

  getFolders() {
    this.folderController
      .getFolders()
      .then((folders: Folder[]) => {
        this.folders = folders;
        console.log(this.folders);
      })
      .catch((err) => {
        console.error(err);
        console.error('error al leer');
      });
  }

  async presentAddFolderPopup(folderData?: Folder) {
    const modal = await this.modalController.create({
      component: AddUpdateFolderPopupComponent,
      componentProps: { folder: folderData },
    });

    modal.onDidDismiss().then(() => {
      this.getFolders();
    });

    return await modal.present();
  }

  async deleteFolder(folder: Folder) {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: `¿Estás seguro de que quieres eliminar el curso "${folder.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.folderController.deleteFolder(folder.id)
            this.getFolders()
          }
        }
      ]
    });

    await alert.present();
  }

  navigateToNotes(folder: Folder) {
    this.navController.navigateForward(`/notes/${folder.id}`);
  }
}
