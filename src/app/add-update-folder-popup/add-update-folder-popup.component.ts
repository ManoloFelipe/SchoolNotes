import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular'
import { Folder } from '../Interfaces/folders.interface';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButtons, IonIcon, IonButton, IonLabel } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { FolderController } from '../Controllers/folders.controller';

@Component({
  selector: 'app-add-update-folder-popup',
  templateUrl: './add-update-folder-popup.component.html',
  styleUrls: ['./add-update-folder-popup.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, IonButtons, IonInput, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, FormsModule],
})
export class AddUpdateFolderPopupComponent implements OnInit{

  @Input() folder: Folder
  @Input() parent_id: number
  folderName: string = ""

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private folderController: FolderController
  ) {}

  ngOnInit() {
    if (this.folder) {
      this.loadFolderData(this.folder)
    }
  }

  loadFolderData(data: Folder) {
    this.folderName = data.name
  }

  async saveFolder() {
    let myFolder: Folder = { id: 0, name: '', parent_id: 0 }
    if (this.folder) {
      myFolder.id = this.folder.id
      myFolder.name = this.folderName
      myFolder.parent_id = this.parent_id === undefined ? this.folder.parent_id : this.parent_id
      this.folderController.updateFolder(myFolder);
      await this.showToast('Actualizado correctamente');
    } else {
      myFolder.name = this.folderName,
      myFolder.parent_id = this.parent_id === undefined ? null : this.parent_id
      this.folderController.addFolder(myFolder);
      await this.showToast('Agregado correctamente');
    }
    this.close();
  }

  close() {
    this.modalController.dismiss();
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
