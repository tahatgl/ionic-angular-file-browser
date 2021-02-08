import { FileEntry } from '@ionic-native/file/ngx';

export class MediaRef {
    name:string;
    extension:string;
    file:FileEntry;
    type:string;
    icon:string;

    constructor(file: FileEntry){
        this.file = file;

        this.name = file.name;
        let extension = this.name.substr(file.name.lastIndexOf('.') + 1);
        this.extension = extension.toUpperCase();

        if(this.extension == 'JPG' || this.extension == 'JPEG' || this.extension == 'PNG' || this.extension == 'WEBP'){
            this.type = 'image';
        }else if(this.extension == 'MP4' || this.extension == 'AVI' || this.extension == 'MKV'){
            this.type = 'video';
        }else if(this.extension == 'MP3' || this.extension == 'WAV'){
            this.type = 'music';
        }else if(this.extension == 'RAR' || this.extension == 'ZIP'){
            this.type = 'compressed';
        }else if(this.extension == 'PDF'){
            this.type = 'pdf';
        }else if(this.extension == 'APK'){
            this.type = 'app';
        }else{
            this.type = 'other';
        }

        switch(this.type){
            case 'image':
                this.icon = 'images-sharp';
                break;
            case 'video':
                this.icon = 'videocam';
                break;
            case 'music':
                this.icon = 'musical-notes';
                break;
            case 'compressed':
                this.icon = 'library-outline';
                break;
            case 'pdf':
                this.icon = 'document-text-outline';
                break;
            case 'app':
                this.icon = 'apps-outline';
                break;
            case 'other':
                this.icon = 'document';
                break;
            default:
                break;
        }
    }
}