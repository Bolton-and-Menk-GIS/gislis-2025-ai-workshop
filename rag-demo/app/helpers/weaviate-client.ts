import { shallowRef, ref } from 'vue'
import { Deferred } from './promise';
import weaviate, { type WeaviateClient, type Collections, vectors, generative } from 'weaviate-client';

export interface CreateCollectionOptions {
  vectorizers: Parameters<typeof vectors.text2VecOllama>[0],
  generative: Parameters<typeof generative.ollama>[0]
}

const defaultWeaviateUrl = process.env.WEAVIATE_URL ?? 'http://host.docker.internal:11434'

const defaultVectorizers: CreateCollectionOptions['vectorizers'] = {
  apiEndpoint: defaultWeaviateUrl,
  model: 'nomic-embed-text'
}

const defaultGenerative: CreateCollectionOptions['generative'] = {
  apiEndpoint: defaultWeaviateUrl,
  model: 'llama3.2'
}

export const useWeaviateClient = ()=> {
  const isReady = ref(false)
  const client = shallowRef<WeaviateClient>() 

  const clientPromise = new Deferred<WeaviateClient>()

  weaviate.connectToLocal().then((_client)=> {
    clientPromise.resolve(_client)
    client.value = _client
    isReady.value = true
  })
  
  const getClient = async ()=> await clientPromise.promise

  const createCollection = async (name: string, opts?: CreateCollectionOptions) => {
    await getClient()
    await client.value!.collections.create({
      name,
      // Configure the Ollama embedding integration
      vectorizers: vectors.text2VecOllama({
        ...defaultVectorizers,
        ...opts?.vectorizers ?? {}
      }),
      
      // Configure the Ollama generative integration
      generative: generative.ollama({
        ...defaultGenerative,
        ...opts?.generative ?? {}                    
      }),
    });
  }

  const close = async ()=> {
    await getClient()
    client.value?.close()
  }

  return {
    isReady,
    client,
    close,
    clientPromise,
    createCollection,
  }

}