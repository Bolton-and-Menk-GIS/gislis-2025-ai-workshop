import os
import sys
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
print('sys.path:', sys.path[-1])

legal = """That part of the Northeast Quarter of the Southeast Quarter of Section 19,
    112 North, Range 23 West, Village of Heidelberg, Le Sueur County,
    Minnesota described as follows: Commencing at the East Quarter of
    Section 19: thence South 01 degrees 42 minutes 10 seconds East
    (assumed bearing) on the East line of the Southeast Quarter, 495.00 feet
    to the point of beginning; thence South 89 degrees 03 minutes 17
    seconds West parallel to the North line of the Southeast Quarter, 1320.00
    feet; thence North 01 degrees 42 minutes 10 seconds West parallel to the
    East line of the Southeast Quarter, 165.00 feet; thence North 89 degrees
    03 minutes 17 seconds East parallel to the North line of the Southeast
    Quarter, 568.96 feet; thence South 01 degrees 42 minutes 10 seconds
    East parallel to the East line of the Southeast Quarter,145.00 feet; thence
    North 89 degrees 03 minutes 17 seconds East parallel to the North line of
    the Southeast Quarter, 751.04 feet to the East line of the Southeast
    Quarter; thence South 01 degrees 42 minutes 10 seconds East on said
    East line, 20.00 feet to the point of beginning.
    """

# EXAMPLE WHERE:
where = "FRSTDIVNO = '19' AND RANGENO = '023' AND TWNSHPNO = '112' AND QSEC IN ('NE','SE')"
where = "FRSTDIVNO = '19' AND RANGENO = '023' AND TWNSHPNO = '112' AND QSEC ='SE'"
where = "FRSTDIVNO = '19' AND RANGENO = '023' AND TWNSHPNO = '112'"

if __name__ == "__main__":
    # tests
    import asyncio
    import os, glob
    from app.utils.embeddings import chunk_by_tokens, get_tokenizer
    from app.utils.pdf_parser import parse_pdf, extract_text_from_pdf, extract_images_from_pdf
    from app.utils.survey import get_survey_info
    # surveys_dir = os.path.join(os.path.dirname(__file__), '../surveys')
    # # pdf_path = os.path.join(surveys_dir, 'survey_db_N21524.pdf')
    # pdf_path = os.path.join(surveys_dir, 'survey_db_N5899.pdf')
    # # text = extract_text_from_pdf(pdf_path)
    # text = parse_pdf(pdf_path)
    # print('text: ', text)  # Print first 500 characters
    # chunks = chunk_by_tokens(text.content[0], get_tokenizer('openai'))
    # print(f'Chunked into {len(chunks)} chunks. First chunk:\n{chunks[0]}')
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

    async def main():
        import json
        survey = await get_survey_info(legal)
        # print('Survey Info:', survey.model_dump_json(indent=2))
        print('Survey Info:', json.dumps(survey, indent=2) if isinstance(survey, dict) else survey.model_dump_json(indent=2))
    
    asyncio.run(main())