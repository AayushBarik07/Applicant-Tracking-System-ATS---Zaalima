from flask import Flask, request, jsonify
import requests
import fitz  # PyMuPDF
from docx import Document
import io
import os

app = Flask(__name__)

@app.route('/parse', methods=['POST'])
def parse_resume():
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({"error": "Missing 'url' in request body"}), 400
        
    url = data['url']
    filename = data.get('filename', 'unknown.pdf').lower()
    
    try:
        # Download the file from the presigned S3 URL
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        file_bytes = response.content
        extracted_text = ""
        
        # Check extension
        if filename.endswith('.pdf') or url.split('?')[0].endswith('.pdf'):
            # Parse PDF
            pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                extracted_text += page.get_text()
                
        elif filename.endswith('.docx') or url.split('?')[0].endswith('.docx'):
            # Parse DOCX
            doc = Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                extracted_text += para.text + "\n"
        else:
            return jsonify({"error": "Unsupported file format. Must be .pdf or .docx"}), 400
            
        if not extracted_text.strip():
            return jsonify({"error": "Could not extract any text from the document"}), 422
            
        return jsonify({"text": extracted_text.strip()}), 200
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to download file from S3: {str(e)}"}), 502
    except Exception as e:
        return jsonify({"error": f"Failed to parse document: {str(e)}"}), 500

if __name__ == '__main__':
    # Run on port 5001 so it doesn't conflict with Node.js on 5000
    app.run(port=5001, debug=True)
