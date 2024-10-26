import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular'
import { Note } from '../Interfaces/notes.interface';
import { NotesController } from '../Controllers/notes.controller';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButtons, IonIcon, IonButton, IonLabel } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-update-note-popup',
  templateUrl: './add-update-note-popup.component.html',
  styleUrls: ['./add-update-note-popup.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, IonButtons, IonInput, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, FormsModule],
})
export class AddUpdateNotePopupComponent  implements OnInit {

  @Input() note: Note
  @Input() folder_id: number
  noteTitle: string = ''
  noteText: string = ''

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private noteController: NotesController
  ) {}

  ngOnInit() {
    if (this.note) {
      this.loadNoteData(this.note);
    }
  }

  loadNoteData(data: Note) {
    this.noteTitle = data.title
    this.noteText = data.text
  }

  async saveNote() {
    let myNote: Note = { id: 0, title: '', text: '', folder_id: 0 }
    if (this.note) {
      myNote.id = this.note.id
      myNote.title = this.noteTitle
      myNote.text = this.noteText
      myNote.folder_id = this.folder_id
      this.noteController.updateNote(myNote);
      await this.showToast('Actualizado correctamente');
    } else {
      myNote.title = this.noteTitle
      myNote.text = this.noteText
      myNote.folder_id = this.folder_id
      console.log(myNote)
      this.noteController.addNote(myNote);
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
