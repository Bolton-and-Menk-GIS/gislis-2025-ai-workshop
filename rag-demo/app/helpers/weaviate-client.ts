import { shallowRef, ref } from 'vue'
import { Deferred } from './promise';
import weaviate, { type WeaviateClient, type Collections, vectors, generative } from 'weaviate-client';

export interface CreateCollectionOptions<T = any> {
  vectorizers?: Parameters<typeof vectors.text2VecOllama>[0];
  generative?: Parameters<typeof generative.ollama>[0];
  data?: T[];
}

const defaultWeaviateUrl = process.env.WEAVIATE_URL ?? 'https://localhost:8443'
const defaultApiEndpoint = process.env.WEAVIATE_API_ENDPOINT ?? 'http://host.docker.internal:11434'

const defaultVectorizers: CreateCollectionOptions['vectorizers'] = {
  apiEndpoint: defaultApiEndpoint,
  model: 'nomic-embed-text'
}

const defaultGenerative: CreateCollectionOptions['generative'] = {
  apiEndpoint: defaultApiEndpoint,
  model: 'llama3.2'
}

export const useWeaviateClient = (url=defaultWeaviateUrl)=> {
  const isReady = ref(false)
  const client = shallowRef<WeaviateClient>() 

  const clientPromise = new Deferred<WeaviateClient>()
  // console.log('URL::', url)
  // weaviate.connectToLocal({ host: 'https://localhost', port: 8443, grpcPort: 50051, } as any)
  // weaviate.client({
  //   connectionParams: {
  //     http: {
  //       host: 'localhost',
  //       port: 8443,
  //       secure: true,
  //     },
  //     grpc: {
  //       // host: 'localhost',
  //       port: 50051,
  //       secure: true
  //     }
  //   } 
  // })
  // weaviate.connectToWeaviateCloud(url, { })
  // weaviate.connectToLocal({ port: 8443,  })
  // weaviate.connectToCustom({
  //   httpPort: 8443,
  //   httpSecure: true,
  //   grpcHost: 'localhost',
  //   grpcPort: 50051,
  //   grpcSecure: true
  // })
  weaviate.connectToLocal({ skipInitChecks: true })
  .then((_client)=> {
    _client.isReady().then(()=> {
      clientPromise.resolve(_client)
      client.value = _client
      isReady.value = true
      console.log('client is ready')
    })

  })
  
  const getClient = async ()=> await clientPromise.promise

  const createCollection = async (name: string, opts?: CreateCollectionOptions) => {
    await getClient()
    const collection = await client.value!.collections.create({
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

    const { data=[] } = opts ?? {}
    if (data.length){
      await collection.data.insertMany(data)
    }
    return collection
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

const test = async ()=> {
  const { client, createCollection, clientPromise } = useWeaviateClient()
  // await clientPromise.promise
  const file = await fetch(
    'https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny.json'
  );
  const data = file.json()
  const collection = await createCollection('test3', { data })
  const query = await collection.query.nearText('biology', { 
    limit: 2
  })
  console.log(JSON.stringify(query, null, 2))
}

void test()