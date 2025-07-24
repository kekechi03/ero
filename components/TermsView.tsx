import React, { useState, useEffect } from 'react';

interface TermsContent {
  title: string;
  intro: string;
  content: Array<{
    section: string;
    items: string[];
  }>;
}

const TermsView: React.FC = () => {
  const [termsData, setTermsData] = useState<TermsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const response = await fetch('/data/terms.json');
        if (!response.ok) {
          throw new Error('利用規約データの読み込みに失敗しました');
        }
        const data = await response.json();
        setTermsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    loadTerms();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
          <div className="text-red-600">
            <h2 className="text-xl font-bold mb-4">エラー</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!termsData) {
    return null;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">{termsData.title}</h1>
        <div className="prose">
          <p>{termsData.intro}</p>
          {termsData.content.map((section, index) => (
            <div key={index}>
              <h2>{section.section}</h2>
              {section.items.length === 1 ? (
                <p>{section.items[0]}</p>
              ) : (
                <ol>
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            background: 'linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)',
            color: '#faf8f3',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'Georgia, serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          戻る
        </button>
      </div>
    </div>
  );
};

export default TermsView;
