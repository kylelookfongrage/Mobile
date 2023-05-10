import { Configuration, OpenAIApi } from 'openai'
import 'react-native-url-polyfill/auto';
import { Env } from '../env';


const configuration = new Configuration({ apiKey: Env.OPENAI_API_KEY || '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' })
const api = new OpenAIApi(configuration)
export const completePrompt = async (prompt: string) => {
    const res = await api.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0,
        max_tokens: 1000,
    })
    const choices = res.data.choices
    if (choices.length > 0) {
        if (choices[0].finish_reason !== 'stop') {
            console.log(choices)
            return null
        }
        return res.data.choices[0].text
    }
    return null;
}