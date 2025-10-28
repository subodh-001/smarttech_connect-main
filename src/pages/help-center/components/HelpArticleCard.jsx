import React from 'react';
import { Eye, Clock, ChevronRight } from 'lucide-react';

const HelpArticleCard = ({ article, onClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 120) => {
    if (!content || content?.length <= maxLength) return content;
    return content?.substring(0, maxLength)?.trim() + '...';
  };

  return (
    <div
      onClick={() => onClick?.(article)}
      className="group p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
    >
      <div className="flex items-start justify-between space-x-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {article?.title}
          </h3>
          
          {article?.content && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {truncateContent(article?.content)}
            </p>
          )}
          
          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{article?.view_count || 0} views</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(article?.updated_at || article?.created_at)}</span>
            </div>
            
            {article?.category && (
              <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                {article?.category}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default HelpArticleCard;