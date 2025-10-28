import React, { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import HelpArticleCard from './components/HelpArticleCard';
import ContactSupport from './components/ContactSupport';
import SearchResults from './components/SearchResults';

const HelpCenter = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('home'); // 'home', 'article', 'search', 'contact'
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [helpArticles, setHelpArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using SmartTech Connect',
      icon: Book,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'booking-services',
      title: 'Booking Services',
      description: 'How to request and manage service appointments',
      icon: MessageCircle,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'account-settings',
      title: 'Account & Settings',
      description: 'Manage your profile and preferences',
      icon: Settings,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'billing',
      title: 'Billing & Payments',
      description: 'Payment methods, invoices, and billing questions',
      icon: CreditCard,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'privacy-security',
      title: 'Privacy & Security',
      description: 'Keep your account secure and understand our policies',
      icon: Shield,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Solve common issues and technical problems',
      icon: HelpCircle,
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  useEffect(() => {
    // Check mock authentication
    const userData = localStorage.getItem('smarttech_user');
    if (userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    
    fetchHelpArticles();
  }, []);

  const fetchHelpArticles = async () => {
    try {
      const response = await axios.get('/api/help-articles?published=true&limit=20&sort=-viewCount');
      setHelpArticles(response.data || []);
    } catch (error) {
      console.error('Error in fetchHelpArticles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query?.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await axios.get(`/api/help-articles/search?query=${encodeURIComponent(query)}&limit=10`);
      setSearchResults(response.data || []);
      setActiveView('search');
    } catch (error) {
      console.error('Error in handleSearch:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleArticleClick = async (article) => {
    setSelectedArticle(article);
    setActiveView('article');

    // Increment view count and record user interaction
    if (isAuthenticated && user?.id) {
      try {
        await axios.post(`/api/help-articles/${article?._id}/view`, {
          userId: user?.id
        });
      } catch (error) {
        console.error('Error incrementing article views:', error);
      }
    }
  };

  const handleArticleRating = async (articleId, isHelpful) => {
    if (!isAuthenticated || !user?.id) return;

    try {
      const actionType = isHelpful ? 'helpful' : 'not_helpful';
      await axios.post(`/api/help-articles/${articleId}/feedback`, {
        userId: user?.id,
        isHelpful
      });
      
      // Feedback is now handled by the API endpoint
    } catch (error) {
      console.error('Error in handleArticleRating:', error);
    }
  };

  const getArticlesByCategory = (categoryId) => {
    const categoryMap = {
      'getting-started': 'Getting Started',
      'booking-services': 'Platform Guide',
      'account-settings': 'Account Settings',
      'billing': 'Billing',
      'privacy-security': 'Privacy & Security',
      'troubleshooting': 'Troubleshooting'
    };
    
    return helpArticles?.filter(article => 
      article?.category === categoryMap?.[categoryId]
    ) || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} location="New York" />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} location="New York" />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Find answers to your questions and get the support you need
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                onKeyPress={(e) => {
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
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {activeView !== 'home' && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                setActiveView('home');
                setSelectedArticle(null);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Help Center</span>
            </Button>
          </div>
        )}

        {/* Content Views */}
        {activeView === 'home' && (
          <>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {helpCategories?.map((category) => {
                const IconComponent = category?.icon;
                const articles = getArticlesByCategory(category?.id);
                
                return (
                  <div
                    key={category?.id}
                    onClick={() => {
                      setActiveView('category');
                      setSelectedArticle({ category: category?.id, articles });
                    }}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-3 rounded-lg ${category?.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category?.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {category?.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-500">
                      {articles?.length || 0} articles
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Popular Articles */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Popular Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {helpArticles?.slice(0, 6)?.map((article) => (
                  <HelpArticleCard
                    key={article?.id}
                    article={article}
                    onClick={() => handleArticleClick(article)}
                  />
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <ContactSupport />
          </>
        )}

        {activeView === 'search' && (
          <SearchResults
            query={searchQuery}
            results={searchResults}
            isSearching={isSearching}
            onArticleClick={handleArticleClick}
          />
        )}

        {activeView === 'category' && selectedArticle && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {helpCategories?.find(cat => cat?.id === selectedArticle?.category)?.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedArticle?.articles?.map((article) => (
                <HelpArticleCard
                  key={article?.id}
                  article={article}
                  onClick={() => handleArticleClick(article)}
                />
              ))}
            </div>
            {selectedArticle?.articles?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No articles found in this category yet.</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'article' && selectedArticle && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <article className="max-w-4xl mx-auto">
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedArticle?.title}
                </h1>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>{selectedArticle?.view_count || 0} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(selectedArticle?.updated_at)?.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>SmartTech Support</span>
                  </div>
                </div>
              </header>

              <div className="prose max-w-none mb-8">
                {selectedArticle?.content?.split('\n')?.map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Article Rating */}
              {isAuthenticated && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Was this article helpful?
                  </h3>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => handleArticleRating(selectedArticle?.id, true)}
                      className="flex items-center space-x-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Yes, helpful</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleArticleRating(selectedArticle?.id, false)}
                      className="flex items-center space-x-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>No, not helpful</span>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedArticle?.helpful_count || 0} people found this helpful
                  </p>
                </div>
              )}
            </article>
          </div>
        )}

        {activeView === 'contact' && (
          <ContactSupport />
        )}
      </div>
    </div>
  );
};

export default HelpCenter;