import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Router } from 'express';
import { db } from './db';
import { documents } from '@shared/schema';
import { eq } from 'drizzle-orm';

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

// Get all documents
router.get('/api/documents', async (req, res) => {
  try {
    const allDocuments = await db.select().from(documents);
    
    // Transform database documents to match frontend interface
    const transformedDocs = allDocuments.map(doc => ({
      id: doc.id,
      title: doc.title,
      category: doc.type as 'policy' | 'handbook' | 'guideline' | 'evaluation',
      filename: path.basename(doc.fileUrl),
      originalName: doc.title,
      uploadDate: doc.uploadDate.toISOString(),
      description: `${doc.type} document`
    }));
    
    res.json(transformedDocs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload document
router.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { title, category, description } = req.body;

  try {
    // Create the file URL path
    const fileUrl = `/uploads/documents/${req.file.filename}`;
    
    // Insert into database
    const [newDocument] = await db.insert(documents).values({
      title,
      type: category,
      schoolId: null, // General document not tied to specific school
      uploadDate: new Date(),
      fileUrl
    }).returning();

    // Return document in expected format
    const responseDoc = {
      id: newDocument.id,
      title: newDocument.title,
      category: newDocument.type as 'policy' | 'handbook' | 'guideline' | 'evaluation',
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploadDate: newDocument.uploadDate.toISOString(),
      description
    };

    res.json(responseDoc);
  } catch (error) {
    console.error('Error saving document to database:', error);
    
    // Clean up uploaded file if database save fails
    const filePath = path.join('uploads/documents', req.file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(500).json({ error: 'Failed to save document' });
  }
});

// Download document
router.get('/api/documents/:id/download', async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const [doc] = await db.select().from(documents).where(eq(documents.id, docId));
    
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filename = path.basename(doc.fileUrl);
    const filePath = path.join('uploads/documents', filename);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, doc.title);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Delete document
router.delete('/api/documents/:id', async (req, res) => {
  try {
    const docId = parseInt(req.params.id);
    const [doc] = await db.select().from(documents).where(eq(documents.id, docId));
    
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filename = path.basename(doc.fileUrl);
    const filePath = path.join('uploads/documents', filename);
    
    // Delete file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await db.delete(documents).where(eq(documents.id, docId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;