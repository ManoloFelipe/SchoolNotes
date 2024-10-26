import { Component, OnInit } from '@angular/core';
import { Note } from '../Interfaces/notes.interface';
import { ActivatedRoute } from '@angular/router';
import { NotesController } from '../Controllers/notes.controller';
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
  IonCol,
  IonLabel,
  IonBackButton
} from '@ionic/angular/standalone';
import { ModalController, AlertController } from '@ionic/angular'
import { AddUpdateNotePopupComponent } from '../add-update-note-popup/add-update-note-popup.component';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  trashOutline,
} from 'ionicons/icons';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.scss'],
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
    IonBackButton,
    CommonModule,
    FormsModule,
    AddUpdateNotePopupComponent
  ],
})
export class NotesPage  implements OnInit {
  notes: Note[] = []
  folderId: number;

  constructor(
    private route: ActivatedRoute,
    private notesController: NotesController,
    private modalController: ModalController,
    private alertController: AlertController,
    private appComponent: AppComponent
  ) {
    addIcons({ addOutline, createOutline, trashOutline });
   }

  ngOnInit() {
    this.folderId = +this.route.snapshot.paramMap.get('folderId')
    this.getNotes()
  }

  async getNotes(){
    this.notesController
      .getNotes(this.folderId)
      .then((notes: Note[]) => {
        this.notes = notes;
        console.log(this.notes);
      })
      .catch((err) => {
        console.error(err);
        console.error('error al leer');
      });
  }

  async presentAddNotePopup(noteData?: Note) {
    const modal = await this.modalController.create({
      component: AddUpdateNotePopupComponent,
      componentProps: { note: noteData, folder_id: this.folderId },
    });

    modal.onDidDismiss().then(() => {
      this.getNotes();
    });

    return await modal.present();
  }

  async deleteNote(note: Note) {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: `¿Estás seguro de que quieres eliminar la nota "${note.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.notesController.deleteNote(note.id)
            this.getNotes()
          }
        }
      ]
    });

    await alert.present();
  }

}
