import { Noticiero } from "@/Data/Models/Noticiero";
import { GoogleGenAI, VideoCompressionQuality } from "@google/genai";
import { DurableObject } from "cloudflare:workers";
import * as lame from '@breezystack/lamejs';
import { IAudioRepository } from "@/Repositories/IAudioRepository";
import { AudioR2Repository } from "./NoticieroAudioR2Repository";
import { Mp3Buffer } from "@/Data/Trasformations/TransformWAVToMP3";
import { FINSUS_DOMAIN } from "@/Presentation/restApi/middlewares/validationJWT";
import { importPKCS8, SignJWT } from "jose";
import onError from "@/Presentation/restApi/middlewares/errorHandler";

interface HookData {
    jobId: string,
    success: boolean,
    message: string,
    timestamp: number,
}

const GOOGLE_TTS_LONG_ENDPOINT = `https://texttospeech.googleapis.com/v1beta1/projects/12345/locations/global:synthesizeLongAudio`;
const GOOGLE_AUTH_ENDPOINT = 'https://www.googleapis.com/oauth2/v4/token';


export class DurableAudioGenerator extends DurableObject<Env> {
    private readonly audioRepository: IAudioRepository;
    private authToken: string = "";
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.audioRepository = new AudioR2Repository(this.env.NOTICIEROS_STORAGE);
    }

    async startAudioGen(parts: string[], workflowId: string, audioID: string) {
        try {
            this.authToken = await this.getAuthToken();
            const reqBody = {
                input: {
                    text: "En infraestructura, la frontera entre Eagle Pass y Piedras Negras se prepara para duplicar la capacidad del Puente Internacional Número Dos, pasando de seis a doce carriles. El permiso presidencial de Estados Unidos para este proyecto fue otorgado el veinte de junio de dos mil veinticinco. Esta obra busca agilizar el cruce de transporte de carga y pasajeros, además de reducir los tiempos de espera y atender la creciente demanda del comercio exterior. Las aduanas mexicanas en Piedras Negras ya se encuentran modernizadas para esta expansión, informa El Financiero"
                },
                voice: {
                    languageCode: 'es-US',
                    name: "es-US-Chirp3-HD-Algenib"
                },
                audioConfig: {
                    audioEncoding: 'LINEAR16'
                },
                output_gcs_uri: `gs://${this.env.AUDIO_BUCKET_NAME}/${audioID}.wav`
            };

            const ttsLongResponse = await fetch(GOOGLE_TTS_LONG_ENDPOINT.replace('12345', this.env.GCP_PROJECT_NAME), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                },
                body: JSON.stringify(reqBody),
            });
            const responseJson = await ttsLongResponse.json();

            console.info(responseJson);

            const operation = responseJson as any;
            this.ctx.storage.put(operation.name, JSON.stringify({
                status: "processing",
            }))

            console.info("Generando audio en " + operation.name);

            this.pollOperation(operation.name, workflowId)

            return {
                code: 202,
                msg: "Generando audio"
            }
        } catch (e) {
            console.error("No se pudo iniciar generacion de audio");
            console.error(e);
            return {
                code: 500,
                msg: "Generando audio"
            }
        }
    }

    async pollOperation(operationName: string, workflowid: string) {
        const url = `https://texttospeech.googleapis.com/v1/${operationName}`;

        console.info("Consultando estado de audio: " + operationName);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
            }
        });
        const operationStatus = await response.json() as any;
        console.info(operationStatus);
        if (operationStatus.done) {
            console.info(`Operación ${operationName} finalizada.`);

            await this.ctx.storage.put(operationName, JSON.stringify({
                status: "completed",
            }));

            const parent = await this.env.AUDIO_GEN_WORKFLOW.get(workflowid);

            await parent.sendEvent({
                type: "audio-generated",
                payload: {
                    operation: operationName
                }
            });

        } else {
            console.info(`Operación ${operationName} en curso. Porcentaje: ${operationStatus.metadata.progressPercentage} Reintentando en 60 segundos.`);
            setTimeout(() => this.pollOperation(operationName, workflowid), 60000);
        }
    }

    async getAuthToken(): Promise<string> {
        try {
            const serviceAccountKey = JSON.parse(this.env.GCP)


            // Crear el JWT para la autenticación
            const now = Math.floor(Date.now() / 1000);
            const privateKey = await importPKCS8(serviceAccountKey.private_key, 'RS256');

            const jwt = await new SignJWT({
                scope: 'https://www.googleapis.com/auth/cloud-platform',
                aud: GOOGLE_AUTH_ENDPOINT,
                exp: now + 3600,
                iat: now,
                iss: serviceAccountKey.client_email,
                sub: serviceAccountKey.client_email,
            })
                .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
                .sign(privateKey);

            // Intercambiar el JWT por un token de acceso
            const accessTokenResponse = await fetch(GOOGLE_AUTH_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: jwt,
                }),
            });
            const responseJson = await accessTokenResponse.json() as any;
            const { access_token } = responseJson;
            return access_token;
        } catch (e: any) {
            console.error(e);
            throw new Error(e);
        }
    }

    transformToSSML(parts: string[]) {
        return parts.map((part) => {
            const [speaker, dialog] = part.split(":");
            return `
                <voice name='${speaker === "FINEAS" ? "es-US-Chirp3-HD-Algenib" : "es-US-Chirp3-HD-Algenib"}'>
                    <p><s>${dialog}</s></p>
                </voice>
            `
        });
    }
}