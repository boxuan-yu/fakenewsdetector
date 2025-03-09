from flask import Flask, request, jsonify
import requests
import os
from flask_cors import CORS
from PIL import Image

# Import the files
from webscraping import scrape_website
from utils import LLM, NewsAPI

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

llm = LLM()
news = NewsAPI()

@app.route('/scrape', methods=['GET'])
def scrape_endpoint():
    # Retrieve the 'url' parameter from the query string
    input_url = request.args.get('url')
    
    # If no URL provided, return 400 Bad Request
    if not input_url:
        return jsonify({"error": "No 'url' query parameter provided"}), 400
    
    try:
        # Use the scrape_website function from webscraping.py
        _, summary = scrape_website(input_url)
        
        # Build input string
        output_string = "Article summary:"
        output_string += ''.join(summary)

        # Call the LLM function to extract keywords
        keywords = llm.extract_keywords_from_summary(summary)
        
        # Call the news function to get matched sources
        news_sources = news.get_news_sources(keywords)
        
        articles = [
            {
                "source_name": article["source"]["name"],
                "title": article["title"],
                "url": article["url"],
                "publishedAt": article["publishedAt"],
            }
            for article in news_sources["articles"]
        ]
    
        return jsonify({
            'extracted_content': keywords,
            'matched_sources': articles
        }), 200    
    
    except requests.exceptions.RequestException as e:
        # Handle any request-related exceptions
        return jsonify({"error": str(e)}), 500

@app.route('/image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Open the image for processing
    image = Image.open(file_path)

    # Call the LLM function to extract keywords from image text
    keywords = llm.extract_keywords_from_image(image)

    # Call the news function to get matched sources
    news_sources = news.get_news_sources(keywords)

    articles = [
        {
            "source_name": article["source"]["name"],
            "title": article["title"],
            "url": article["url"],
            "publishedAt": article["publishedAt"],
        }
        for article in news_sources["articles"]
    ]

    return jsonify({
        'extracted_content': keywords,
        'matched_sources': articles
    }), 200    

if __name__ == "main":
    # Start the Flask development server
    app.run(host="127.0.0.1", debug=True)