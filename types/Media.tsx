export interface MediaType {
    uri: string, type: 'image' | 'video' | undefined, awsId?: string;
}


export interface Category {
    name: string;
    emoji: string;
}