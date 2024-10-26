import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output, output } from '@angular/core';
import { Device } from '@capacitor/device';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';

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
} from '@ionic/angular/standalone';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { SqliteService } from './services/sqlite.service';
import { HttpClientModule } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FolderController } from './Controllers/folders.controller';
import { NotesController } from './Controllers/notes.controller';
import { AddUpdateFolderPopupComponent } from './add-update-folder-popup/add-update-folder-popup.component';
import { AddUpdateNotePopupComponent } from './add-update-note-popup/add-update-note-popup.component';

jeepSqlite(window);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  providers: [SqliteService, ModalController, FolderController, NotesController],
  imports: [
    IonApp,
    IonRouterOutlet,
    CommonModule,
    HttpClientModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonInput,
    IonButtons,
    IonIcon,
    IonButton,
    FormsModule,
    AddUpdateFolderPopupComponent,
    AddUpdateNotePopupComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  @Output() dbReadyEvent = new EventEmitter<boolean>()
  public isWeb: boolean;
  public load: boolean;

  constructor(private platform: Platform, private sqlite: SqliteService) {
    this.isWeb = false;
    this.load = false;
    this.initApp();
  }

  initApp() {
    this.platform.ready().then(async () => {
      const info = await Device.getInfo();
      this.isWeb = info.platform == 'web';

      await this.sqlite.init();
      this.sqlite.dbReady.subscribe((load) => {
        this.load = load
        this.dbReadyEvent.emit(this.load)
      });
    });
  }
}
