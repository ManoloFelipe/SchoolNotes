import { Injectable } from '@angular/core';
import { Folder } from '../Interfaces/folders.interface';
import { SqliteService } from '../services/sqlite.service';
import { CapacitorSQLite, capSQLiteChanges, capSQLiteValues } from '@capacitor-community/sqlite';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AppComponent } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class FolderController {
  private dbName: string
  private dbNameReady: BehaviorSubject<boolean> = new BehaviorSubject(false)

  constructor(
    private sqlite: SqliteService,
    private appComponent: AppComponent
  ) {
    this.initializeDatabase()
  }

  async initializeDatabase(){
    this.appComponent.dbReadyEvent.subscribe(async(dbReady) => {
      if (dbReady) {
        try {
          await firstValueFrom(this.sqlite.dbReady);
          this.dbName = await this.sqlite.getDbName();
          console.log('Base de datos inicializada correctamente', this.dbName);
          this.dbNameReady.next(true)
        } catch (error) {
          console.error('Error al inicializar la base de datos:', error);
        }
      }
    })
  }

  async waitForDbName() {
    return new Promise<void>((resolve) => {
      if (this.dbName) {
        resolve();
      } else {
        this.dbNameReady.subscribe((ready) => {
          if (ready) {
            resolve();
          }
        });
      }
    });
  }

  // Métodos CRUD para 'folders'
  async getFolders(): Promise<Folder[]> {
    await this.waitForDbName()
    const sql = 'SELECT * FROM folders';
    return CapacitorSQLite.query({
      database: this.dbName,
      statement: sql,
      values: []
    }).then((response: capSQLiteValues) => {
      let folders: Folder[] = []

      if(this.sqlite.isIOS && response.values.length > 0){
        response.values.shift()
      }

      for (let index = 0; index < response.values.length; index++){
        const folder = response.values[index]
        folders.push(folder);
      }

      return folders
    }).catch( err => Promise.reject(err))
  }

  async getFoldersXParent(parent_id: number): Promise<Folder[]> {
    const sql = 'SELECT * FROM folders WHERE parent_id = ?';
    return CapacitorSQLite.query({
      database: this.dbName,
      statement: sql,
      values: [parent_id]
    }).then((response: capSQLiteValues) => {
      let folders: Folder[] = []

      if(this.sqlite.isIOS && response.values.length > 0){
        response.values.shift()
      }

      for (let index = 0; index < response.values.length; index++){
        const folder = response.values[index]
        folders.push(folder);
      }

      return folders
    }).catch( err => Promise.reject(err))
  }

  async addFolder(folder: Folder) {
    const sql = 'INSERT INTO folders (name, parent_id) VALUES (?, ?)'
    return CapacitorSQLite.executeSet({
      database: this.dbName,
      set: [
        {
          statement: sql,
          values: [folder.name, folder.parent_id ?? null]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      if(this.sqlite.isWeb){
        CapacitorSQLite.saveToStore({ database: this.dbName })
      }
      return changes
    }).catch( err => Promise.reject(err))
  }

  async updateFolder(folder: Folder) {
    const sql = 'UPDATE folders SET name = ?, parent_id = ? WHERE id = ?';
    return CapacitorSQLite.executeSet({
      database: this.sqlite.dbName,
      set: [
        {
          statement: sql,
          values: [
            folder.name,
            folder.parent_id ?? null,
            folder.id
          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      if (this.sqlite.isWeb) {
        CapacitorSQLite.saveToStore({ database: this.sqlite.dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err))
  }

  async deleteFolder(id: number) {
    const sql = 'DELETE FROM folders WHERE id = ?';
    return CapacitorSQLite.executeSet({
      database: this.sqlite.dbName,
      set: [
        {
          statement: sql,
          values: [
            id
          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      if (this.sqlite.isWeb) {
        CapacitorSQLite.saveToStore({ database: this.sqlite.dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err))
  }
}
