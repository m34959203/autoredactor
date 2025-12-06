import { useState } from 'react';
import { Edit2, Eye, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
  onUpdate: (id: string, data: { title?: string; author?: string }) => void;
  onDelete: (id: string) => void;
  onPreview?: (id: string) => void;
}

export function ArticleCard({ article, onUpdate, onDelete, onPreview }: ArticleCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(article.title || '');
  const [editAuthor, setEditAuthor] = useState(article.author || '');

  const handleSave = () => {
    onUpdate(article.id, {
      title: editTitle,
      author: editAuthor,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(article.title || '');
    setEditAuthor(article.author || '');
    setIsEditing(false);
  };

  const languageBadge = article.language === 'latin' ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
      LAT
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
      CYR
    </span>
  );

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 cursor-move text-muted-foreground">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {languageBadge}
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm font-semibold border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Автор"
                />
              </div>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Название статьи"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                {languageBadge}
                <h3 className="font-semibold text-sm">{article.author || 'Unknown Author'}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                "{article.title || 'Untitled'}"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {article.filename} • {article.ai_confidence ? `${Math.round(article.ai_confidence * 100)}% confidence` : ''}
              </p>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            {onPreview && (
              <Button size="sm" variant="ghost" onClick={() => onPreview(article.id)}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onDelete(article.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
