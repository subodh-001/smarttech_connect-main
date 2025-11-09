import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import {
  Search,
  Book,
  MessageCircle,
  Settings,
  CreditCard,
  Shield,
  HelpCircle,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  User,
  ArrowLeft,
  FileQuestion,
} from 'lucide-react';
import HelpArticleCard from './components/HelpArticleCard';
import ContactSupport from './components/ContactSupport';
import SearchResults from './components/SearchResults';
import { useAuth } from '../../contexts/MongoAuthContext';

const CATEGORY_CONFIG = {
  'getting-started': {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using SmartTech Connect',
    icon: Book,
    color: 'bg-blue-100 text-blue-600',
  },
  'booking-services': {
    id: 'booking-services',
    title: 'Booking Services',
    description: 'How to request and manage service appointments',
    icon: MessageCircle,
    color: 'bg-green-100 text-green-600',
  },
  'account-settings': {
    id: 'account-settings',
    title: 'Account & Settings',
    description: 'Manage your profile and preferences',
    icon: Settings,
    color: 'bg-purple-100 text-purple-600',
  },
  billing: {
    id: 'billing',
    title: 'Billing & Payments',
    description: 'Payment methods, invoices, and billing questions',
    icon: CreditCard,
    color: 'bg-yellow-100 text-yellow-600',
  },
  'privacy-security': {
    id: 'privacy-security',
    title: 'Privacy & Security',
    description: 'Keep your account secure and understand our policies',
    icon: Shield,
    color: 'bg-red-100 text-red-600',
  },
  troubleshooting: {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Solve common issues and technical problems',
    icon: HelpCircle,
    color: 'bg-gray-100 text-gray-600',
  },
};

const getFeedbackFingerprint = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const storageKey = 'smarttech_help_feedback_fingerprint';
  let fingerprint = window.localStorage.getItem(storageKey);
  if (!fingerprint) {
    fingerprint = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(storageKey, fingerprint);
  }
  return fingerprint;
};

const HelpCenter = () => {
  const { user, userProfile } = useAuth();
  const resolvedUser = userProfile || user;

  const [activeView, setActiveView] = useState('home');
  const [categories, setCategories] = useState(Object.values(CATEGORY_CONFIG));
  const [popularArticles, setPopularArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryArticles, setCategoryArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingState, setLoadingState] = useState({ initial: true, category: false, article: false });
  const [isSearching, setIsSearching] = useState(false);
  const [pageError, setPageError] = useState(null);

  const feedbackFingerprint = useMemo(() => getFeedbackFingerprint(), []);

  const mergeCategoryMeta = useCallback((incomingCategories = []) => {
    const overrides = incomingCategories.reduce((acc, item) => {
      if (item?.id) {
        acc[item.id] = item;
      }
      return acc;
    }, {});

    setCategories(
      Object.values(CATEGORY_CONFIG).map((category) => ({
        ...category,
        articleCount: overrides[category.id]?.articleCount ?? 0,
        totalViews: overrides[category.id]?.totalViews ?? 0,
      }))
    );
  }, []);

  useEffect(() => {
    const loadInitialContent = async () => {
      setPageError(null);
      try {
        const [categoryResponse, articleResponse] = await Promise.all([
          axios.get('/api/help-center/categories'),
          axios.get('/api/help-center/articles', {
            params: { published: true, limit: 24, sort: ['-viewCount', '-updatedAt'] },
          }),
        ]);

        if (categoryResponse?.data?.categories) {
          mergeCategoryMeta(categoryResponse.data.categories);
        }

        if (articleResponse?.data?.items) {
          setPopularArticles(articleResponse.data.items);
        }
      } catch (error) {
        console.error('Error loading help center content:', error);
        setPageError('Unable to load help center content right now. Please try again in a moment.');
      } finally {
        setLoadingState((prev) => ({ ...prev, initial: false }));
      }
    };

    loadInitialContent();
  }, [mergeCategoryMeta]);

  const resetView = () => {
    setActiveView('home');
    setSelectedArticle(null);
    setSelectedCategoryId(null);
    setCategoryArticles([]);
    setSearchQuery('');
    setSearchResults([]);
    setPageError(null);
  };

  const handleSearch = async (query) => {
    const trimmed = query?.trim();
    if (!trimmed) {
      setSearchResults([]);
      setActiveView('home');
      return;
    }

    setIsSearching(true);
    setPageError(null);
    try {
      const response = await axios.get('/api/help-center/search', {
        params: { query: trimmed, limit: 12 },
      });
      setSearchResults(response?.data?.items || []);
      setActiveView('search');
    } catch (error) {
      console.error('Error searching help center articles:', error);
      setPageError('Search is unavailable right now. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  const loadCategoryArticles = useCallback(async (categoryId) => {
    setSelectedCategoryId(categoryId);
    setActiveView('category');
    setCategoryArticles([]);
    setLoadingState((prev) => ({ ...prev, category: true }));
    setPageError(null);

    try {
      const response = await axios.get('/api/help-center/articles', {
        params: {
          category: categoryId,
          published: true,
          sort: ['-updatedAt'],
          limit: 24,
        },
      });
      setCategoryArticles(response?.data?.items || []);
    } catch (error) {
      console.error('Error loading category articles:', error);
      setPageError('Unable to load articles for this category.');
    } finally {
      setLoadingState((prev) => ({ ...prev, category: false }));
    }
  }, []);

  const fetchArticleDetail = useCallback(async (articleRef) => {
    if (!articleRef) return null;
    if (articleRef.contentSections) return articleRef;

    try {
      if (articleRef.slug) {
        const response = await axios.get(`/api/help-center/articles/${articleRef.slug}`);
        return response?.data || articleRef;
      }
      if (articleRef.id) {
        const response = await axios.get(`/api/help-center/articles/id/${articleRef.id}`);
        return response?.data || articleRef;
      }
    } catch (error) {
      console.error('Error fetching article detail:', error);
    }
    return articleRef;
  }, []);

  const handleArticleOpen = useCallback(
    async (article) => {
      if (!article) return;
      setLoadingState((prev) => ({ ...prev, article: true }));
      setPageError(null);

      try {
        const detailedArticle = await fetchArticleDetail(article);
        setSelectedArticle(detailedArticle);
        setActiveView('article');

        if (detailedArticle?.id) {
          axios
            .post(`/api/help-center/articles/${detailedArticle.id}/view`)
            .catch((err) => console.warn('Failed to record article view', err));

          setPopularArticles((prev) =>
            prev.map((item) =>
              item.id === detailedArticle.id ? { ...item, viewCount: (item.viewCount || 0) + 1 } : item
            )
          );
        }
      } catch (error) {
        console.error('Error opening article:', error);
        setPageError('Unable to open this article right now.');
      } finally {
        setLoadingState((prev) => ({ ...prev, article: false }));
      }
    },
    [fetchArticleDetail]
  );

  const handleArticleRating = async (articleId, isHelpful) => {
    if (!articleId) return;
    try {
      const response = await axios.post(`/api/help-center/articles/${articleId}/feedback`, {
        isHelpful,
        fingerprint: feedbackFingerprint,
      });

      if (response?.data) {
        setSelectedArticle(response.data);
        setPopularArticles((prev) =>
          prev.map((item) => (item.id === response.data.id ? { ...item, ...response.data } : item))
        );
      }
    } catch (error) {
      console.error('Error recording article feedback:', error);
    }
  };

  if (loadingState.initial) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={resolvedUser} location="Bangalore" />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={resolvedUser} location="Bangalore" />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 mb-6">
            Find answers to your questions and get the support you need
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                onKeyDown={(e) => {
                  if (e?.key === 'Enter') {
                    handleSearch(searchQuery);
                  }
                }}
                icon={Search}
                className="text-lg py-4"
              />
              <Button
                onClick={() => handleSearch(searchQuery)}
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </div>

        {pageError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {pageError}
          </div>
        )}

        {activeView !== 'home' && (
          <div className="mb-6">
            <Button variant="ghost" onClick={resetView} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Help Center</span>
            </Button>
          </div>
        )}

        {activeView === 'home' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => loadCategoryArticles(category.id)}
                    className="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.articleCount || 0} articles • {category.totalViews || 0} views
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularArticles.slice(0, 6).map((article) => (
                  <HelpArticleCard key={article.id} article={article} onClick={handleArticleOpen} />
                ))}
                {popularArticles.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-6">
                    <FileQuestion className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                    No articles available yet. Please check back soon.
                  </div>
                )}
              </div>
            </div>

            <ContactSupport user={resolvedUser} />
          </>
        )}

        {activeView === 'search' && (
          <SearchResults
            query={searchQuery}
            results={searchResults}
            isSearching={isSearching}
            onArticleClick={handleArticleOpen}
          />
        )}

        {activeView === 'category' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {categories.find((cat) => cat.id === selectedCategoryId)?.title || 'Category'}
            </h2>

            {loadingState.category ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
                Loading articles...
              </div>
            ) : categoryArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryArticles.map((article) => (
                  <HelpArticleCard key={article.id} article={article} onClick={handleArticleOpen} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No articles found in this category yet.</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'article' && selectedArticle && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            {loadingState.article ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
                Loading article...
              </div>
            ) : (
              <article className="max-w-4xl mx-auto">
                <header className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>{selectedArticle.viewCount || 0} views</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {selectedArticle.estimatedReadMinutes
                          ? `${selectedArticle.estimatedReadMinutes} min read`
                          : 'Quick read'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>SmartTech Support Team</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(selectedArticle.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </header>

                {selectedArticle.summary && (
                  <p className="mb-6 text-lg text-gray-700 leading-relaxed">{selectedArticle.summary}</p>
                )}

                <div className="space-y-8">
                  {selectedArticle.contentSections?.length ? (
                    selectedArticle.contentSections.map((section, idx) => (
                      <section key={`${section.heading || idx}-${idx}`}>
                        {section.heading && (
                          <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.heading}</h2>
                        )}
                        {section.body && (
                          <p className="text-gray-700 leading-7 whitespace-pre-line">{section.body}</p>
                        )}
                        {section.bullets?.length ? (
                          <ul className="mt-3 list-disc list-inside space-y-2 text-gray-700">
                            {section.bullets.map((bullet, bulletIdx) => (
                              <li key={bulletIdx}>{bullet}</li>
                            ))}
                          </ul>
                        ) : null}
                      </section>
                    ))
                  ) : (
                    <p className="text-gray-700 leading-7">
                      We are updating this article with more detailed steps. Please check back soon.
                    </p>
                  )}
                </div>

                <div className="border-t pt-6 mt-10">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Was this article helpful?</h3>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => handleArticleRating(selectedArticle.id, true)}
                      className="flex items-center space-x-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Yes, helpful</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleArticleRating(selectedArticle.id, false)}
                      className="flex items-center space-x-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>No, not helpful</span>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedArticle.helpfulCount || 0} people found this helpful
                  </p>
                </div>
              </article>
            )}
          </div>
        )}

        {activeView === 'contact' && <ContactSupport user={resolvedUser} />}
      </div>
    </div>
  );
};

export default HelpCenter;

