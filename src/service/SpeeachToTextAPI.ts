import speech, { SpeechClient } from "@google-cloud/speech";

class SpeaachToTextAPI{

    constructor(
        private client:SpeechClient = new speech.SpeechClient()
    ){}

    public async transcribeAudio(content:string):Promise<string>{

        const config = {
          encoding: 6,
          sampleRateHertz: 16000,
          languageCode: 'pt-BR',
        };
      
        const audio = {
          content: content,
        };
      
        const request = {
          config: config,
          audio: audio,
        };
      
        
        try{

            const [operation] = await this.client.longRunningRecognize(request);
            
            // Get a Promise representation of the final result of the job
            const [response] = await operation.promise();
            const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
            console.log(`Transcription: ${transcription}`);

            return transcription;
        }catch( error ){
            console.error(`Error in transcribeAudio ${error}`);
            throw new Error(error);
        }
    }
}


export { SpeaachToTextAPI}