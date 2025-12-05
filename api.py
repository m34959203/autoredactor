from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import tempfile
import shutil
from pathlib import Path
import sys

# Add parent directory to path to import autoeditor
sys.path.insert(0, os.path.dirname(__file__))
from autoeditor import JournalEditor

# Configure Flask to serve React build
app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
CORS(app)

ALLOWED_EXTENSIONS = {'docx', 'pdf'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Journal Editor API is running'})

@app.route('/api/build-journal', methods=['POST'])
def build_journal():
    try:
        # Check if files are present
        if 'articles' not in request.files:
            return jsonify({'error': 'No articles files provided'}), 400

        articles = request.files.getlist('articles')
        if not articles or articles[0].filename == '':
            return jsonify({'error': 'No articles selected'}), 400

        # Validate articles are .docx
        for article in articles:
            if not allowed_file(article.filename) or not article.filename.endswith('.docx'):
                return jsonify({'error': f'Invalid file: {article.filename}. Only .docx files allowed for articles'}), 400

        # Create temporary directories
        temp_dir = tempfile.mkdtemp()
        articles_dir = os.path.join(temp_dir, 'articles')
        output_dir = os.path.join(temp_dir, 'output')
        os.makedirs(articles_dir)
        os.makedirs(output_dir)

        try:
            # Save article files
            for article in articles:
                filename = secure_filename(article.filename)
                article.save(os.path.join(articles_dir, filename))

            # Handle optional files
            title_page = None
            first_pages = None
            end_pages = None

            if 'title_page' in request.files and request.files['title_page'].filename:
                title_file = request.files['title_page']
                if allowed_file(title_file.filename) and title_file.filename.endswith('.pdf'):
                    title_page = os.path.join(temp_dir, 'title.pdf')
                    title_file.save(title_page)

            if 'first_pages' in request.files and request.files['first_pages'].filename:
                first_file = request.files['first_pages']
                if allowed_file(first_file.filename) and first_file.filename.endswith('.pdf'):
                    first_pages = os.path.join(temp_dir, 'first.pdf')
                    first_file.save(first_pages)

            if 'end_pages' in request.files and request.files['end_pages'].filename:
                end_file = request.files['end_pages']
                if allowed_file(end_file.filename) and end_file.filename.endswith('.pdf'):
                    end_pages = os.path.join(temp_dir, 'end.pdf')
                    end_file.save(end_pages)

            # Create editor and build journal
            editor = JournalEditor(
                articles_dir=articles_dir,
                output_dir=output_dir,
                title_page=title_page,
                first_pages=first_pages,
                end_pages=end_pages
            )

            output_filename = 'journal.pdf'
            result_path = editor.build_journal(output_filename)

            # Send file back to client
            return send_file(
                result_path,
                mimetype='application/pdf',
                as_attachment=True,
                download_name='journal.pdf'
            )

        finally:
            # Cleanup temp directory
            shutil.rmtree(temp_dir, ignore_errors=True)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve React frontend for all non-API routes"""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
