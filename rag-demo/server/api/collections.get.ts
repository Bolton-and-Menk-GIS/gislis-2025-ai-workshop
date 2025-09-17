import { getClient } from '~/weaviate/client'

export default defineEventHandler(async (event) => {

  // const query = getQuery(event)

  const client = await getClient();

  // try {
  //   const myCollection = client.collections.use("PDFLibrary")
  
  //   const response = await myCollection.aggregate.overAll({
  //       returnMetrics: myCollection.metrics.aggregate('file_name').text(['count', 'topOccurrencesValue'])
  //   });
      

  //   return { response: response.properties.file_name.topOccurrences }
  try {
    const collections = await client.collections.listAll()
    return collections.map(collection => ({ name: collection.name, properties: collection.properties }))
  }catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
})