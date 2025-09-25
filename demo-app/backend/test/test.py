import os
import sys
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
print('sys.path:', sys.path[-1])

if __name__ == "__main__":
    # tests
    import os, glob
    from app.utils.embeddings import chunk_by_tokens, get_tokenizer
    from app.utils.pdf_parser import parse_pdf, extract_text_from_pdf, extract_images_from_pdf
    surveys_dir = os.path.join(os.path.dirname(__file__), '../surveys')
    # pdf_path = os.path.join(surveys_dir, 'survey_db_N21524.pdf')
    pdf_path = os.path.join(surveys_dir, 'survey_db_N5899.pdf')
    # text = extract_text_from_pdf(pdf_path)
    text = parse_pdf(pdf_path)
    print('text: ', text)  # Print first 500 characters
    chunks = chunk_by_tokens(text.content[0], get_tokenizer('openai'))
    print(f'Chunked into {len(chunks)} chunks. First chunk:\n{chunks[0]}')
    # print('text type:', type(text))
    # images = extract_images_from_pdf(pdf_path)
    # metadata = extract_metadata_from_pdf(pdf_path)

    # print("Extracted Text:", text[:500])  # Print first 500 characters
    # print("Number of Images Extracted:", len(images))
    # print("Metadata:", metadata)
    # for pdf_file in glob.glob(os.path.join(surveys_dir, '*.pdf')):
    #     print(f'Processing {pdf_file}...')
    #     text = extract_text_from_pdf(pdf_file)
    #     print(f'Extracted Text from {pdf_file}:', text[:500])  # Print first 500 characters 
    #     print('\n\n')