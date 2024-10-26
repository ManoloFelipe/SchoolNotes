import { Injectable } from '@angular/core';
import { Note } from '../Interfaces/notes.interface';
import { SqliteService } from '../services/sqlite.service';
import { CapacitorSQLite, capSQLiteChanges, capSQLiteValues } from '@capacitor-community/sqlite';
import { AppComponent } from '../app.component';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotesController {
  private dbName: string
  private dbNameReady: BehaviorSubject<boolean> = new BehaviorSubject(false)

  constructor(
    private sqlite: SqliteService,
    private appComponent: AppComponent
  ) {
  }

  async waitForDbName() {
    return new Promise<void>((resolve) => {
      if (this.dbName) {
        resolve();
      } else {
        this.sqlite.getDbName().then((dbName) => {
          if (dbName) {
            this.dbName = dbName;
            resolve();
          }
        });
      }
    });
  }
  async getNotes(folder_id: number): Promise<Note[]> {
    await this.waitForDbName()
    const sql = 'SELECT * FROM notes WHERE folder_id = ?';
    return CapacitorSQLite.query({
      database: this.dbName,
      statement: sql,
      values: [folder_id]
    }).then((response: capSQLiteValues) => {
      let notes: Note[] = []

      if(this.sqlite.isIOS && response.values.length > 0){
        response.values.shift()
      }

      for (let index = 0; index < response.values.length; index++){
        const note = response.values[index]
        notes.push(note);
      }

      return notes
    }).catch( err => Promise.reject(err))
  }

  async addNote(note: Note) {
    const sql = 'INSERT INTO notes (folder_id, title, text) VALUES (?, ?, ?)';
    return CapacitorSQLite.executeSet({
      database: this.dbName,
      set: [
        {
          statement: sql,
          values: [
            note.folder_id,
            note.title,
            note.text
          ]
        }
      ]
    }).then((changes: capSQLiteChanges) => {
      if(this.sqlite.isWeb){
        CapacitorSQLite.saveToStore({ database: this.dbName })
      }
      return changes
    }).catch( err => Promise.reject(err))
  }

  async updateNote(note: Note) {
    const sql = 'UPDATE notes SET folder_id = ?, title = ?, text = ? WHERE id = ?';
    return CapacitorSQLite.executeSet({
      database: this.sqlite.dbName,
      set: [
        {
          statement: sql,
          values: [
            note.folder_id,
            note.title,
            note.text,
            note.id
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

  async deleteNote(id: number) {
    const sql = 'DELETE FROM notes WHERE id = ?';
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
