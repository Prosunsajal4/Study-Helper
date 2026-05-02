# Study Assistant

An AI-powered study assistant web application that helps students prepare for exams by uploading study materials, generating highlights, and creating practice questions using Claude AI.

## Features

- **Document Upload**: Upload PDF and DOCX files (max 20MB)
- **AI-Powered Highlights**: Automatically extract important points from documents using Claude AI
- **Question Generation**: Generate CT (Class Test) and Term exam questions tailored to your content
- **Question Patterns**: Upload question patterns to improve question relevance
- **Exam Sessions**: Compile questions into printable exam papers
- **Subject Management**: Organize documents by subject
- **Document Management**: View, filter, and manage all uploaded documents

## Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB Atlas
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **File Processing**: pdf-parse (PDF), mammoth (DOCX)
- **File Upload**: multer
- **Styling**: Plain CSS (no frameworks)

## Prerequisites

- Node.js 16 or higher
- MongoDB Atlas account
- Anthropic API key

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd "c:/Users/prosu/OneDrive/Documents/Study Helper"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Open `.env.local` and update the following:
   ```
   ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here
   MONGODB_URI=mongodb+srv://AccessUser:6uv33P9ydsh93VRi@prosun.7xdyt.mongodb.net/?retryWrites=true&w=majority&appName=Prosun
   ```
   
   Replace `your_actual_anthropic_api_key_here` with your Anthropic API key from https://console.anthropic.com/

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Create a Subject
- On the dashboard, click "Add Subject"
- Enter subject name (e.g., "Mathematics")
- Optionally add a subject code (e.g., "MATH101")
- Click "Add Subject"

### 2. Upload Documents
- Navigate to the Upload page
- Select an existing subject or create a new one
- Choose document type:
  - **Study Material**: Lecture notes, slides, etc.
  - **Question Pattern**: Previous year question papers
  - **Textbook**: Reference materials
- Upload a PDF or DOCX file (max 20MB)
- Wait for text extraction to complete

### 3. Generate Highlights
- Go to a document detail page
- Click "Generate Highlights"
- AI will extract important points with importance levels (high/medium)
- Color-coded: Yellow (high importance), Blue (medium importance)

### 4. Generate Questions
- On a document detail page, click:
  - "Generate CT Questions" for class test questions (10 questions, 2-5 marks)
  - "Generate Term Questions" for term exam questions (15 questions, 5-10 marks)
- Questions include answers, marks, and type (short/long/MCQ)
- If a question pattern exists for the subject, it will be used as reference

### 5. Browse and Filter
- **Questions Page**: View all generated questions, filter by subject and exam type
- **Highlights Page**: Browse all highlights, search by keyword or topic
- **Documents Page**: View all documents in a table, filter by subject and type

### 6. Create Exam Sessions
- On the Questions page, select multiple question sets
- Click "Create Exam Session"
- Enter a title (e.g., "Midterm Exam - Mathematics")
- View and print the compiled exam paper

## Project Structure

```
/
├── pages/
│   ├── index.js                    # Dashboard
│   ├── upload.js                   # Upload page
│   ├── documents.js                # All documents
│   ├── questions.js                # Questions browser
│   ├── highlights.js               # Highlights browser
│   ├── subjects/[id].js            # Subject detail
│   ├── documents/[id].js           # Document detail
│   ├── exam-sessions/[id].js       # Printable exam
│   ├── _app.js                     # App wrapper
│   └── api/
│       ├── subjects.js             # Subjects CRUD
│       ├── upload.js               # File upload
│       ├── documents.js            # Documents list
│       ├── documents/[id].js       # Document detail/delete
│       ├── highlights.js           # Highlights list
│       ├── highlights/generate.js  # Generate highlights
│       ├── questions.js            # Questions list
│       ├── questions/generate.js   # Generate questions
│       ├── exam-sessions.js        # Create exam session
│       └── exam-sessions/[id].js   # Get exam session
├── lib/
│   ├── db.js                       # MongoDB connection
│   ├── claude.js                   # Anthropic API helper
│   └── parseFile.js                # PDF/DOCX parsing
├── styles/
│   └── globals.css                 # Global styles
├── public/
│   └── uploads/                    # Uploaded files
├── .env.local                      # Environment variables
├── package.json                    # Dependencies
└── README.md                       # This file
```

## MongoDB Collections

- **subjects**: Subject information (name, code)
- **documents**: Uploaded files metadata and extracted text
- **highlights**: Generated highlights with importance levels
- **questions**: Generated question sets
- **questionPatterns**: Question pattern documents
- **examSessions**: Compiled exam papers

## API Endpoints

### Subjects
- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Create new subject

### Documents
- `POST /api/upload` - Upload document (multipart/form-data)
- `GET /api/documents?subjectId=&docType=` - List documents with filters
- `GET /api/documents/[id]` - Get document with highlights and questions
- `DELETE /api/documents/[id]` - Delete document

### Highlights
- `POST /api/highlights/generate` - Generate highlights for document
- `GET /api/highlights?subjectId=&documentId=` - List highlights with filters

### Questions
- `POST /api/questions/generate` - Generate questions for document
- `GET /api/questions?subjectId=&examType=` - List questions with filters

### Exam Sessions
- `POST /api/exam-sessions` - Create exam session
- `GET /api/exam-sessions/[id]` - Get exam session for printing

## Tips for Best Results

1. **Upload Question Patterns First**: Before generating questions, upload previous year question papers as "Question Pattern" documents. This helps the AI generate more relevant questions.

2. **Use Textbooks for Better Highlights**: Upload textbooks or comprehensive reference materials to get more complete and accurate highlights.

3. **Organize by Subject**: Create separate subjects for each course/subject to keep documents organized.

4. **Review Generated Content**: Always review AI-generated highlights and questions for accuracy before using them for study.

5. **Combine Multiple Documents**: You can select question sets from multiple documents when creating an exam session.

## Troubleshooting

### File Upload Fails
- Ensure file is PDF or DOCX format
- Check file size is under 20MB
- Verify MongoDB connection is working

### AI Generation Fails
- Check ANTHROPIC_API_KEY is set correctly in .env.local
- Verify you have available API credits with Anthropic
- Check the document has extractable text

### MongoDB Connection Issues
- Verify MONGODB_URI is correct
- Check your IP is whitelisted in MongoDB Atlas
- Ensure database user has correct permissions

## License

This project is for educational purposes.

## Support

For issues or questions, please check the troubleshooting section above.
