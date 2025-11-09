import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import HelpArticle from '../models/HelpArticle.js';

const router = express.Router();

const categoryMeta = {
  'getting-started': {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using SmartTech Connect',
    icon: 'Book',
  },
  'booking-services': {
    id: 'booking-services',
    title: 'Booking Services',
    description: 'How to request and manage service appointments',
    icon: 'MessageCircle',
  },
  'account-settings': {
    id: 'account-settings',
    title: 'Account & Settings',
    description: 'Manage your profile and preferences',
    icon: 'Settings',
  },
  billing: {
    id: 'billing',
    title: 'Billing & Payments',
    description: 'Payment methods, invoices, and billing questions',
    icon: 'CreditCard',
  },
  'privacy-security': {
    id: 'privacy-security',
    title: 'Privacy & Security',
    description: 'Keep your account secure and understand our policies',
    icon: 'Shield',
  },
  troubleshooting: {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Solve common issues and technical problems',
    icon: 'HelpCircle',
  },
};

const optionalAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      req.user = decoded;
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth
  } finally {
    next();
  }
};

const formatArticle = (articleDoc) => {
  if (!articleDoc) return null;
  const article = typeof articleDoc.toObject === 'function' ? articleDoc.toObject() : articleDoc;
  const category = categoryMeta[article.category] || { id: article.category, title: article.category };

  return {
    id: article._id?.toString(),
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    category: category.id,
    categoryLabel: category.title,
    categoryDescription: category.description,
    categoryIcon: category.icon,
    audience: article.audience,
    tags: article.tags,
    keywords: article.keywords,
    published: article.published,
    featured: article.featured,
    estimatedReadMinutes: article.estimatedReadMinutes,
    viewCount: article.viewCount ?? 0,
    helpfulCount: article.helpfulCount ?? 0,
    notHelpfulCount: article.notHelpfulCount ?? 0,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    contentSections: (article.contentSections || []).map((section) => ({
      heading: section.heading,
      body: section.body,
      bullets: section.bullets || [],
      icon: section.icon,
    })),
  };
};

const applySort = (query, sortParam) => {
  if (!sortParam) {
    return query.sort({ featured: -1, viewCount: -1, updatedAt: -1 });
  }

  const sortFields = Array.isArray(sortParam) ? sortParam : [sortParam];
  const sortConfig = {};
  sortFields.forEach((field) => {
    const direction = field.startsWith('-') ? -1 : 1;
    const key = field.replace(/^[-+]/, '');
    sortConfig[key] = direction;
  });
  return query.sort(sortConfig);
};

router.get('/categories', async (req, res) => {
  try {
    const counts = await HelpArticle.aggregate([
      { $match: { published: true } },
      {
        $group: {
          _id: '$category',
          totalViews: { $sum: '$viewCount' },
          articleCount: { $sum: 1 },
        },
      },
    ]);

    const countMap = counts.reduce((acc, item) => {
      acc[item._id] = item;
      return acc;
    }, {});

    const categories = Object.values(categoryMeta).map((category) => ({
      ...category,
      articleCount: countMap[category.id]?.articleCount || 0,
      totalViews: countMap[category.id]?.totalViews || 0,
    }));

    res.json({ categories });
  } catch (error) {
    console.error('Failed to load help center categories', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

router.get('/articles', async (req, res) => {
  try {
    const {
      category,
      published = 'true',
      featured,
      audience,
      limit = '20',
      sort,
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (published !== undefined) filter.published = published === 'true';
    if (featured !== undefined) filter.featured = featured === 'true';
    if (audience) {
      filter.$or = [
        { audience: audience },
        { audience: { $in: ['all'] } },
      ];
    }

    let query = HelpArticle.find(filter);
    query = applySort(query, sort);

    const safeLimit = Math.min(parseInt(limit, 10) || 20, 100);
    query = query.limit(safeLimit);

    const articles = await query.lean();
    res.json({ items: articles.map(formatArticle) });
  } catch (error) {
    console.error('Failed to load help center articles', error);
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

router.get('/articles/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await HelpArticle.findOne({ slug, published: true }).lean();
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(formatArticle(article));
  } catch (error) {
    console.error('Failed to load help center article', error);
    res.status(500).json({ error: 'Failed to load article' });
  }
});

router.get('/articles/id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid article id' });
    }
    const article = await HelpArticle.findById(id).lean();
    if (!article || !article.published) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(formatArticle(article));
  } catch (error) {
    console.error('Failed to load help center article by id', error);
    res.status(500).json({ error: 'Failed to load article' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query = '', limit = '10' } = req.query;
    if (!query.trim()) {
      return res.json({ items: [] });
    }

    const parsedLimit = Math.min(parseInt(limit, 10) || 10, 50);
    const textMatches = await HelpArticle.find(
      {
        $text: { $search: query },
        published: true,
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' }, viewCount: -1 })
      .limit(parsedLimit)
      .lean();

    // Fallback to partial matches when text search returns nothing
    const results = textMatches.length
      ? textMatches
      : await HelpArticle.find({
          published: true,
          $or: [
            { title: new RegExp(query, 'i') },
            { summary: new RegExp(query, 'i') },
            { tags: new RegExp(query, 'i') },
          ],
        })
          .limit(parsedLimit)
          .lean();

    res.json({ items: results.map(formatArticle) });
  } catch (error) {
    console.error('Failed to search help center articles', error);
    res.status(500).json({ error: 'Failed to search articles' });
  }
});

router.post('/articles/:id/view', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid article id' });
    }

    const article = await HelpArticle.findByIdAndUpdate(
      id,
      {
        $inc: { viewCount: 1 },
        $set: { lastViewedAt: new Date() },
      },
      { new: true }
    );

    if (!article || !article.published) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(formatArticle(article));
  } catch (error) {
    console.error('Failed to record help center view', error);
    res.status(500).json({ error: 'Failed to record view' });
  }
});

router.post('/articles/:id/feedback', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isHelpful, fingerprint } = req.body || {};

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({ error: 'isHelpful must be a boolean' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid article id' });
    }

    const article = await HelpArticle.findById(id);
    if (!article || !article.published) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const now = new Date();
    let identifierMatched = false;
    const userId = req.user?.sub && mongoose.Types.ObjectId.isValid(req.user.sub)
      ? new mongoose.Types.ObjectId(req.user.sub)
      : undefined;

    if (userId || fingerprint) {
      const entryIndex = article.feedbackEntries.findIndex((entry) => {
        if (userId && entry.userId && entry.userId.equals(userId)) return true;
        if (!userId && fingerprint && entry.fingerprint === fingerprint) return true;
        return false;
      });

      if (entryIndex !== -1) {
        identifierMatched = true;
        const existingEntry = article.feedbackEntries[entryIndex];
        if (existingEntry.isHelpful !== isHelpful) {
          if (existingEntry.isHelpful) {
            article.helpfulCount = Math.max(0, (article.helpfulCount || 0) - 1);
          } else {
            article.notHelpfulCount = Math.max(0, (article.notHelpfulCount || 0) - 1);
          }
          existingEntry.isHelpful = isHelpful;
          existingEntry.submittedAt = now;
          article.feedbackEntries[entryIndex] = existingEntry;
        } else {
          return res.json(formatArticle(article));
        }
      }
    }

    if (!identifierMatched) {
      article.feedbackEntries.push({
        userId: userId || undefined,
        fingerprint: !userId ? fingerprint : undefined,
        isHelpful,
        submittedAt: now,
      });
    }

    if (isHelpful) {
      article.helpfulCount = (article.helpfulCount || 0) + 1;
    } else {
      article.notHelpfulCount = (article.notHelpfulCount || 0) + 1;
    }

    await article.save();
    res.json(formatArticle(article));
  } catch (error) {
    console.error('Failed to record help center feedback', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

export default router;

