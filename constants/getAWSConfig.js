import awsmobile from './aws-config'
import {Env} from '../env'
import { Buffer } from "buffer";


export const getAWSConfig = async () => {
    if (Env.AWS_AMPLIFY_CONFIG) {
        const jsonString = Buffer.from(Env.AWS_AMPLIFY_CONFIG, 'base64').toString()
        return JSON.parse(jsonString)
    }
    return Env.AWS_AMPLIFY_CONFIG || awsmobile
}