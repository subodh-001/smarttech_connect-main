import React from 'react';
import { Search, FileText } from 'lucide-react';
import HelpArticleCard from './HelpArticleCard';

const SearchResults = ({ query, results, isSearching, onArticleClick }) => {
  if (isSearching) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
          <span className="text-gray-600">Searching articles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Search className="h-5 w-5 text-gray-400" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Search results for “{query}”
          </h2>
          <p className="text-sm text-gray-600 mt-1">{results?.length || 0} articles found</p>
        </div>
      </div>

      {results?.length ? (
        <div className="space-y-4">
          {results.map((article) => (
            <HelpArticleCard key={article.id} article={article} onClick={onArticleClick} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-600 mb-4">We couldn’t find any content that matches your search.</p>
          <div className="text-sm text-gray-500">
            <p>Try:</p>
            <ul className="mt-2 space-y-1">
              <li>• Using different keywords</li>
              <li>• Checking your spelling</li>
              <li>• Using more general terms</li>
              <li>• Browsing through the help categories</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
