import { Component, Input, OnInit } from '@angular/core';
import { File, Entry, FileEntry } from '@ionic-native/file/ngx';
import { Platform, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Router, ActivatedRoute } from '@angular/router';

import { MediaRef } from '../model/media';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  copyFile = null;
  shouldMove = false;
  folder = '';
  directories = [];
  directoriesM = [];
  all = [];
  segmentModel = "all";
  constructor(
    private file: File,
    private plt: Platform,
    private alertCtrl: AlertController,
    private fileOpener: FileOpener,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private photoViewer: PhotoViewer,
    private strMedia: StreamingMedia
  ) {}

  ngOnInit() {
    this.folder = this.route.snapshot.paramMap.get('folder') || '';
    this.loadDocuments();
  }

  async loading() {
    const loader = await this.loadingCtrl.create({
      message: 'Yükleniyor...',
      duration: 100
    });
    await loader.present();
  }

  segmentChanged(event){
    console.log(this.segmentModel);

    console.log(event);
  }

  async loadDocuments() {
    this.loading();
    this.plt.ready().then(() => {
      this.copyFile = null;
      this.shouldMove = false;
      this.file.listDir(this.file.externalRootDirectory, this.folder).then(res => {
        for(let file of res){
          if(file.isDirectory){
            this.directories.push(file);
          }else{
            this.directoriesM.push(new MediaRef(file as FileEntry));
          }
        }
        this.all = this.directories.concat(this.directoriesM);
      });
      
     });
  }

  async createFolder() {
    let alert = await this.alertCtrl.create({
      header: 'Klasör oluşturun',
      message: 'Lütfen oluşturacağınız yeni klasörün adını girin',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Klasörüm'
        }
      ],
      buttons: [
        {
          text: 'İptal',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Oluştur',
          handler: data => {
            this.file
              .createDir(
                `${this.file.externalRootDirectory}/${this.folder}`,
                data.name,
                false
              )
              .then(() => {
                this.loadDocuments();
                this.directoriesM = [];
                this.directories = [];
              });
          }
        }
      ]
    });
    await alert.present();
  }

  async createFile() {
    let alert = await this.alertCtrl.create({
      header: 'Dosya oluşturun',
      message: 'Lütfen oluşturacağınız yeni dosyanın adını girin',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Dosyam'
        }
      ],
      buttons: [
        {
          text: 'İptal',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Oluştur',
          handler: data => {
            this.file
              .createFile(
                `${this.file.externalRootDirectory}/${this.folder}`,
                data.name,
                false
              )
              .then(() => {
                this.loadDocuments();
                this.directoriesM = [];
                this.directories = [];
              });
          }
        }
      ]
    });
    await alert.present();
  }

  async itemClickedM(media: MediaRef){
    switch(media.type){
      case 'image':
        this.photoViewer.show(media.file.toURL());
        //this.fileOpener.open(medya.file.nativeURL, 'image/jpeg');
        break;
      case 'video':
        this.strMedia.playVideo(media.file.toURL());
        break;
      case 'music':
        //this.strMedia.playAudio(media.file.toURL());
        this.fileOpener.open(media.file.toURL(), 'audio/mpeg3');
        break;
      case 'pdf':
        this.fileOpener.open(media.file.toURL(), 'application/pdf');
        break;
      case 'compressed':
        this.fileOpener.open(media.file.toURL(), 'application/rar');
        break;
      case 'app':
        this.fileOpener.open(media.file.toURL(), 'application/vnd.android.package-archive');
        break;
      case 'other':
        this.fileOpener.open(media.file.nativeURL, 'text/plain');
        break;
      default:
        break;
    }
  }

  async itemClicked(file: Entry) {
    if (this.copyFile) {
      if (!file.isDirectory) {
        let toast = await this.toastCtrl.create({
          message: 'İşlem için lütfen klasör seçin'
        });
        await toast.present();
        return;
      }
      this.finishCopy(file);
    }else {
      if (file.isFile) {
        this.fileOpener.open(file.nativeURL, 'text/plain');
      } else {
        let pathToOpen =
         this.folder != '' ? this.folder + '/' + file.name : file.name;
        let folder = encodeURIComponent(pathToOpen);
        this.router.navigateByUrl(`/home/${folder}`);
      }
    }
    
  }
  async deleteFolder(file: Entry) {
    let alert = await this.loadingCtrl.create({
      message: 'Klasör siliniyor...',
      duration: 350
    });
    let path = this.file.externalRootDirectory + this.folder;
    this.file.removeRecursively(path, file.name).then(async() => {
      await alert.present();
      this.loadDocuments();
      this.directoriesM = [];
      this.directories = [];
    });
  }
  async deleteFile(file: MediaRef) {
    let alert = await this.loadingCtrl.create({
      message: 'Dosya siliniyor...',
      duration: 350
    });
    let path = this.file.externalRootDirectory + this.folder;
    this.file.removeFile(path, file.file.name).then(async () => {
      await alert.present();
      this.loadDocuments();
      this.directoriesM = [];
      this.directories = [];
    });
  }
  startCopy(file: Entry, move = false) {
    this.copyFile = file;
    this.shouldMove = move;
  }
  async finishCopy(file: Entry){
    let alertMove = await this.loadingCtrl.create({
      message: 'Taşınıyor...',
      duration: 350
    });
    let alertCopy = await this.loadingCtrl.create({
      message: 'Kopyalanıyor...',
      duration: 350
    })

    let path = this.file.externalRootDirectory + this.folder;
    let newPath = this.file.externalRootDirectory + this.folder + '/' + file.name;

    if (this.shouldMove) {
      if (this.copyFile.isDirectory) {
        this.file
          .moveDir(path, this.copyFile.name, newPath, this.copyFile.name)
          .then(async() => {
            await alertMove.present();
            this.loadDocuments();
            this.directoriesM = [];
            this.directories = [];
          });
      } else {
        this.file
          .moveFile(path, this.copyFile.name, newPath, this.copyFile.name)
          .then(async() => {
            await alertMove.present();
            this.loadDocuments();
            this.directoriesM = [];
            this.directories = [];
          });
      }
    } else {
      if (this.copyFile.isDirectory) {
        this.file
          .copyDir(path, this.copyFile.name, newPath, this.copyFile.name)
          .then(async() => {
            await alertCopy.present();
            this.loadDocuments();
            this.directoriesM = [];
            this.directories = [];
          });
      } else {
        this.file
          .copyFile(path, this.copyFile.name, newPath, this.copyFile.name)
          .then(async() => {
            await alertCopy.present();
            this.loadDocuments();
            this.directoriesM = [];
            this.directories = [];
          });
      }
    }
  }

}
