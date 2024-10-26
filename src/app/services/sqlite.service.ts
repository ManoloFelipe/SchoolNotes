import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { JsonSQLite } from 'jeep-sqlite/dist/types/interfaces/interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  public dbReady: BehaviorSubject<boolean>
  public isWeb: boolean
  public isIOS: boolean
  public dbName: string

  constructor(
    private http: HttpClient
  ) {
    this.dbReady = new BehaviorSubject(false)
    this.isWeb = false
    this.isIOS = false
    this.dbName = ''
  }

  async init() {
    const info = await Device.getInfo();
    const sqlite = CapacitorSQLite as any;

    if (info.platform === 'android') {
      try {
        await sqlite.requestPermissions();
      } catch (error) {
        console.error("Esta app necesita permisos para funcionar", error);
      }
    } else if (info.platform === 'web') {
      try {
        this.isWeb = true;
        await sqlite.initWebStore();
      } catch (error) {
        console.error('Error durante initWebStore:', error);
      }
    } else if (info.platform === 'ios') {
      this.isIOS = true;
    }

    try {
      await this.setupDatabase();
    } catch (error) {
      console.error('Error durante la configuración de la base de datos:', error);
    }
  }


  async setupDatabase(){
    console.log('inicia configuracion de db');

    const dbSetup = await Preferences.get({key : 'first_setup_key'})
    if (!dbSetup.value){
      this.downloadDatabase();
    }else{
      this.dbName = await this.getDbName()
      await CapacitorSQLite.createConnection({ database: this.dbName })
      await CapacitorSQLite.open({ database: this.dbName })
      this.dbReady.next(true);
    }
  }

  downloadDatabase(){
    this.http.get('assets/db/db.json').subscribe(
      async (jsonExport: JsonSQLite) => {
        const jsonstring = JSON.stringify(jsonExport)
        const isValid = await CapacitorSQLite.isJsonValid({
          jsonstring
        })

        if(isValid.result){
          this.dbName = jsonExport.database
          await CapacitorSQLite.importFromJson({ jsonstring })
          await CapacitorSQLite.createConnection({ database: this.dbName })
          await CapacitorSQLite.open({ database: this.dbName })

          await Preferences.set({ key: 'first_setup_key', value: '1' })
          await Preferences.set({ key: 'dbname', value: this.dbName })

          this.dbReady.next(true);
        }
      }
    )
  }

  async getDbName(){
    if (!this.dbName){
      const dbname = await Preferences.get({key : 'dbname'})
      if (dbname.value){
        this.dbName = dbname.value
      }
    }

    return this.dbName
  }

}
