import express from 'express';
import { HelpArticle, UserHelpInteraction } from '../models/index.js';
import { authMiddleware } from '../lib/auth.js';

const router = express.Router();

// Middleware to check authentication
const checkAuth = async (req, res, next) => {
  const user = await authMiddleware(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
};

// Get all published help articles (public route)
router.get('/published', async (req, res) => {
  try {
    const { category, tag } = req.query;
    let query = { isPublished: true };
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Filter by tag if provided
    if (tag) {
      query.tags = tag;
    }
    
    const articles = await HelpArticle.find(query)
      .populate('createdById', 'fullName')
      .sort({ viewCount: -1 });
    
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get published help article by slug (public route)
router.get('/published/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId } = req.query;
    
    const article = await HelpArticle.findOne({ slug, isPublished: true })
      .populate('createdById', 'fullName');
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Increment view count
    await article.incrementViewCount();
    
    // Record user interaction if userId provided
    if (userId) {
      try {
        await UserHelpInteraction.findOneAndUpdate(
          { userId, articleId: article._id, actionType: 'view' },
          { createdAt: new Date() },
          { upsert: true, new: true }
        );
      } catch (interactionError) {
        // Continue even if interaction recording fails
        console.error('Failed to record user interaction:', interactionError);
      }
    }
    
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark article as helpful
router.post('/helpful/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    const article = await HelpArticle.findById(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Check if user has already marked this article as helpful
    const existingInteraction = await UserHelpInteraction.findOne({
      userId: user.id,
      articleId: id,
      actionType: 'helpful'
    });
    
    if (existingInteraction) {
      return res.status(400).json({ error: 'You have already marked this article as helpful' });
    }
    
    // Increment helpful count
    await article.incrementHelpfulCount();
    
    // Record user interaction
    await UserHelpInteraction.create({
      userId: user.id,
      articleId: id,
      actionType: 'helpful',
      createdAt: new Date()
    });
    
    res.status(200).json({ message: 'Article marked as helpful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all help articles (admin only)
router.get('/', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const articles = await HelpArticle.find()
      .populate('createdById', 'fullName')
      .sort({ createdAt: -1 });
    
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get help article by ID (admin only)
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const article = await HelpArticle.findById(id)
      .populate('createdById', 'fullName');
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create help article (admin only)
router.post('/', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const articleData = req.body;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Set created by ID
    articleData.createdById = user.id;
    
    // Create slug if not provided
    if (!articleData.slug) {
      articleData.slug = articleData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    const article = new HelpArticle(articleData);
    await article.save();
    
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update help article (admin only)
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Find the article
    const article = await HelpArticle.findById(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Update slug if title changed and slug not explicitly provided
    if (updateData.title && !updateData.slug) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    // Update the article
    Object.assign(article, updateData);
    await article.save();
    
    res.status(200).json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete help article (admin only)
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Find and delete the article
    const article = await HelpArticle.findByIdAndDelete(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Delete related user interactions
    await UserHelpInteraction.deleteMany({ articleId: id });
    
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;