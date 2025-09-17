import 'dotenv/config'
import weaviate, { type Collection, type WeaviateClient} from 'weaviate-client'

export const weaviateURL = process.env.WEAVIATE_URL as string
export const weaviateKey = process.env.WEAVIATE_API_KEY as string
export const openaiKey = process.env.OPENAI_API_KEY as string
export const cohereKey = process.env.COHERE_API_KEY as string

export const providers = ['openAI', 'cohere']
export type Provider = typeof providers[number]

export const createClient = async (provider: Provider='openAI')=> {

  const embeddings = provider === 'cohere' 
    ? { "X-Cohere-Api-Key" : cohereKey }
    : { 'X-OpenAI-Api-Key': openaiKey } 
  
  console.log('connection url: ', weaviateURL)
  console.log('embeddings provider: ', embeddings)
  const client = await weaviate.connectToWeaviateCloud(weaviateURL, {
    authCredentials: new weaviate.ApiKey(weaviateKey),
    headers: {
       ...embeddings as any
      
    }
  })
  const conn = await client.getConnectionDetails()
  console.log('connection details: ', conn)
  return client
}

export const getClient = async (provider: Provider='openAI') => {
  try {
    const client = await createClient(provider)
      console.log(`We are connected! ${await client.isReady()}`);
      return client
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export const createCollection = async (client: WeaviateClient, collectionName: string, deleteIfExists=false) => {
  if (deleteIfExists) {
    try {
      await client.collections.delete(collectionName)
      console.log('existing collection deleted')
    } catch (error) {
      console.error('error deleting existing collection')
    }
  }
  try {
    if (await client.collections.exists(collectionName) == false){
      const collection = await client.collections.create({
          name: collectionName,
          // Define your VoyageAI vectorizer 
          vectorizers:
            weaviate.configure.vectorizer.text2VecWeaviate(),
          //   generative: weaviate.configure.generative.cohere(),
            generative: weaviate.configure.generative.openAI()
      });
      return collection

    } else {
      return client.collections.use(collectionName)!
    }
  } catch(err){
    throw err
  }
}


