import React from 'react';
import { Eye, Clock, ChevronRight } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'Recently updated';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    return 'Recently updated';
  }
};

const getPreviewText = (article) => {
  if (article?.summary) return article.summary;
  const sectionBody = article?.contentSections?.find((section) => section?.body)?.body;
  return sectionBody || '';
};

const HelpArticleCard = ({ article, onClick }) => {
  const preview = getPreviewText(article);

  return (
    <button
      type="button"
      onClick={() => onClick?.(article)}
      className="group text-left p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-start justify-between space-x-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {article?.title}
          </h3>

          {preview ? (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{preview}</p>
          ) : null}

          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{article?.viewCount || 0} views</span>
            </div>

            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(article?.updatedAt || article?.createdAt)}</span>
            </div>

            {article?.categoryLabel && (
              <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                {article.categoryLabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>
    </button>
  );
};

export default HelpArticleCard;
