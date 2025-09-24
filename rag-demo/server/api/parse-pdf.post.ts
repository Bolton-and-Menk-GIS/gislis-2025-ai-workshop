// import { connectToDB, createCollection } from '../../config/weaviate.js';
// @ts-ignore
// import pdf from 'pdf-parse/lib/pdf-parse.js'
import { PDFParser } from 'pdfnano'
import { createWorker } from 'tesseract.js';
import { exec as execCb } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import path from 'path';

const exec = promisify(execCb);

const doOCR = async (pdfBuffer: Buffer, fileName: string)=> {
  // Save PDF to a temp file
  const tempDir = '/tmp';
  const tempPdfPath = path.join(tempDir, `${Date.now()}_${fileName}`);
  await fs.writeFile(tempPdfPath, Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer, 'base64'));

  try {
    // Convert PDF to PNG images (one per page)
    const outputImageBase = path.join(tempDir, `page_${Date.now()}`);
    await exec(`pdftoppm -png "${tempPdfPath}" "${outputImageBase}"`);

    // Find all generated images
    const files = await fs.readdir(tempDir);
    const imageFiles = files.filter(f => f.startsWith(path.basename(outputImageBase)) && f.endsWith('.png'));

    let fullText = '';
    const worker = await createWorker('eng');
    for (const imageFile of imageFiles) {
      const imagePath = path.join(tempDir, imageFile);
      const { data: { text } } = await worker.recognize(imagePath);
      fullText += text + '\n';
      await fs.unlink(imagePath); // Clean up image
    }
    await worker.terminate();
    await fs.unlink(tempPdfPath); // Clean up PDF

    return { text: fullText.trim() };
  } catch (error: any) {
    console.warn('OCR Error: ', error)
    await fs.unlink(tempPdfPath).catch(() => {});
    return { error: error.message || 'OCR failed' };
  }
}
  


export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    // const client = await connectToDB();

    try {
        // Check if request body contains PDF buffer
        if (!body.pdfBuffer) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No PDF buffer provided in request body',
            })
        }

        const pdfBuffer = Buffer.from(body.pdfBuffer);

        // Validate that the input is actually a Buffer
        if (!Buffer.isBuffer(pdfBuffer)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid input: pdfBuffer must be a Buffer',
            })
        }

        // await client.collections.delete('PDFLibrary')
        // let myCollection = await createCollection(client, `PDF_${body.fileName.split('.pdf')[0]}`.replace(/-/g, '_'), false)
        
        // // handle text
        // let loadingTask = await pdf(pdfBuffer);
        // let pdfDocument = loadingTask.text;
        const parser = new PDFParser();
        const result = await parser.parseBuffer(pdfBuffer)
        let pdfDocument = (result?.text ?? '').trim()

        // Fallback to OCR if no text found
        if (!pdfDocument?.length) {
            console.warn('No text extracted with pdf-parse. Attempting OCR fallback...');
            pdfDocument = (await doOCR(pdfBuffer, body.fileName)).text ?? ''
        }

        if (!pdfDocument.length) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No text could be extracted from the PDF, even with OCR.'
            })
        }

        return {
            statusCode: 200,
            statusMessage: 'Text extracted',
            data: pdfDocument
        }

        // const chunkSize = 100;
        // const overlapSize = 5;

        // const textWords = pdfDocument.replace(/\s+/g, ' ').split(' ');

        // let chunks = [];
        // // Chunking
        // for (let i = 0; i < textWords.length; i += chunkSize) {
        //     let chunk = textWords.slice(Math.max(i - overlapSize, 0), i + chunkSize).join(' ');
        //     chunks.push(chunk);
        // }

        // // Debug: log first chunk
        // if (chunks.length > 0) {
        //     console.log('First chunk:', chunks[0]);
        // } else {
        //     console.warn('No chunks were created from the PDF text.');
        // }

        // const list = [];

        // for (const [index, chunk] of chunks.entries()) {
        //     const obj = {
        //         properties: {
        //             chunk: chunk,
        //             chunk_index: index,
        //             file_name: body.fileName,
        //         },
        //     };

        //     list.push(obj);
        // }

        // const importResult = await myCollection.data.insertMany(list)
        // console.info("Imported!", importResult.uuids)

        // // Return success response with UUIDs
        // return {
        //     success: true,
        //     message: 'PDF successfully Imported!',
        //     data: importResult.uuids
        // };

    } catch (error) {
        // Log error for debugging (you might want to use a proper logger in production)
        console.error('Error converting PDF to base64:', error);

        // Return error response
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error while parsing PDF',
        })
    }
})
