import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Router } from 'express';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// In-memory storage for documents (you can replace with database)
let documents: Array<{
  id: number;
  title: string;
  category: 'policy' | 'handbook' | 'guideline' | 'evaluation';
  filename: string;
  originalName: string;
  uploadDate: string;
  description?: string;
}> = [];

let nextId = 1;

// Get all documents
router.get('/api/documents', (req, res) => {
  res.json(documents);
});

// Upload document
router.post('/api/documents/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { title, category, description } = req.body;

  const document = {
    id: nextId++,
    title,
    category,
    filename: req.file.filename,
    originalName: req.file.originalname,
    uploadDate: new Date().toISOString(),
    description
  };

  documents.push(document);
  res.json(document);
});

// Download document
router.get('/api/documents/:id/download', (req, res) => {
  const doc = documents.find(d => d.id === parseInt(req.params.id));
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const filePath = path.join('uploads/documents', doc.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath, doc.originalName);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Delete document
router.delete('/api/documents/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const docIndex = documents.findIndex(d => d.id === id);
  
  if (docIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const doc = documents[docIndex];
  const filePath = path.join('uploads/documents', doc.filename);
  
  // Delete file from filesystem
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  documents.splice(docIndex, 1);
  res.json({ success: true });
});

export default router;