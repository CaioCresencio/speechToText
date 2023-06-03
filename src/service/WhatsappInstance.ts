import { create, Whatsapp } from "venom-bot";
import fs from 'fs';
import mime from 'mime-types';
import { SpeaachToTextAPI } from "./SpeeachToTextAPI";

class WhatsappInstance{
    
    private client:Whatsapp;

    constructor(){}
   
    async init(){

        const config = {
            logQR:true,
            headless:true,
        }

        return await create(`my-instance`,  (base64Qrimg, asciiQR, attempts, urlCode) => {}, undefined, config)
        .then( (client) => {
            this.client = client;
            this.listening();
            return true;
        })
        .catch( (error)  => {       
            console.error(error);
            return false;
        });

    }

    private listening(){

        console.log("Start listening messages...");

        this.client.onAnyMessage(message => {
           
            if( message.type === 'ptt'){

                const getFile = new Promise( async (resolve, reject) => {

                    const buffer = await this.client.decryptFile(message);
                    
                    const fileName = `audio.${mime.extension(message.mimetype)}`;

                    this.sendMessage(message.from, "Tentando transcrever...");

                    fs.writeFile(fileName, buffer, (err) => {
                        if( err ) return;

                        const audioContent64 = buffer.toString('base64');

                        const speeachToText = new SpeaachToTextAPI();

                        speeachToText.transcribeAudio(audioContent64).then( res =>{
                            this.sendMessage(message.from, res);
                        })
                    });
                });

                getFile.then( res => {
                    console.log(res)

                }).catch( error =>{
                    console.log(error)
                });
               
            }
        })
    }


    public async sendMessage(from:string, message:string){

        return await this.client
            .sendText(from, message)
            .then((result) => {
                console.log('Result: ', result); //return object success
                return true;
            })
            .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
                return false;
            });
    }

}

export { WhatsappInstance }