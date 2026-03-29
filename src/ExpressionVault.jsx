import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Search, BookOpen } from 'lucide-react';

const ExpressionVault = () => {
  const [expressions, setExpressions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    expression: '',
    meaning: '',
    example: '',
    sourceUrl: '',
    sourceTimestamp: ''
  });
  const [showForm, setShowForm] = useState(false);

  // ローカルストレージから読み込み
  useEffect(() => {
    const saved = localStorage.getItem('expressionVault');
    if (saved) {
      setExpressions(JSON.parse(saved));
    }
  }, []);

  // ローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('expressionVault', JSON.stringify(expressions));
  }, [expressions]);

  const handleAddExpression = (e) => {
    e.preventDefault();
    if (!formData.expression.trim() || !formData.meaning.trim()) {
      alert('表現と意味は必須です');
      return;
    }

    const newExpression = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toLocaleString('ja-JP')
    };

    setExpressions([newExpression, ...expressions]);
    setFormData({
      expression: '',
      meaning: '',
      example: '',
      sourceUrl: '',
      sourceTimestamp: ''
    });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setExpressions(expressions.filter(expr => expr.id !== id));
  };

  const filteredExpressions = expressions.filter(expr =>
    expr.expression.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expr.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expr.example.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* ヘッダー */}
      <div style={{
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid var(--color-border-tertiary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <BookOpen size={32} style={{ color: 'var(--color-text-primary)' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0' }}>Expression Vault</h1>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', margin: '0', fontSize: '14px' }}>
          SNSや記事で見つけた英語表現をさっと保存。あなただけの表現辞書。
        </p>
      </div>

      {/* 検索バー */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--color-text-secondary)'
          }} />
          <input
            type="text"
            placeholder="表現や意味で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '1px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              fontSize: '14px',
              boxSizing: 'border-box',
              backgroundColor: 'var(--color-background-primary)'
            }}
          />
        </div>
      </div>

      {/* 追加ボタン */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-secondary)',
            borderRadius: 'var(--border-radius-lg)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--color-text-primary)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-background-tertiary)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
          }}
        >
          <Plus size={18} />
          {showForm ? '閉じる' : '新しい表現を追加'}
        </button>
      </div>

      {/* フォーム */}
      {showForm && (
        <div style={{
          backgroundColor: 'var(--color-background-secondary)',
          padding: '20px',
          borderRadius: 'var(--border-radius-lg)',
          marginBottom: '24px',
          border: '1px solid var(--color-border-tertiary)'
        }}>
          <form onSubmit={handleAddExpression}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                表現 *
              </label>
              <input
                type="text"
                placeholder="例：get my act together"
                value={formData.expression}
                onChange={(e) => setFormData({ ...formData, expression: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--color-background-primary)'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                意味・解説 *
              </label>
              <textarea
                placeholder="例：態勢を整える、真面目に取り組む"
                value={formData.meaning}
                onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--color-background-primary)',
                  fontFamily: 'var(--font-sans)',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                使用例
              </label>
              <textarea
                placeholder="例：I need to get my act together before the exam."
                value={formData.example}
                onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--color-background-primary)',
                  fontFamily: 'var(--font-sans)',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                  出典URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--color-background-primary)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                  タイムスタンプ
                </label>
                <input
                  type="text"
                  placeholder="例：2:45, 00:30:15"
                  value={formData.sourceTimestamp}
                  onChange={(e) => setFormData({ ...formData, sourceTimestamp: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--color-background-primary)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--color-background-primary)',
                  border: '1px solid var(--color-border-secondary)',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--color-text-primary)'
                }}
              >
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 表現一覧 */}
      <div>
        {filteredExpressions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--color-text-secondary)'
          }}>
            <p style={{ margin: '0', fontSize: '16px' }}>
              {expressions.length === 0
                ? '表現がまだありません。新しい表現を追加しましょう！'
                : '検索に一致する表現がありません'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredExpressions.map((expr) => (
              <div
                key={expr.id}
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--color-background-secondary)',
                  borderRadius: 'var(--border-radius-lg)',
                  border: '1px solid var(--color-border-tertiary)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
                }}
              >
                {/* 表現 */}
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    margin: '0',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {expr.expression}
                  </h3>
                </div>

                {/* 意味 */}
                <div style={{ marginBottom: '12px' }}>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    margin: '0 0 4px 0',
                    fontWeight: '500'
                  }}>
                    意味
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--color-text-primary)',
                    margin: '0',
                    lineHeight: '1.6'
                  }}>
                    {expr.meaning}
                  </p>
                </div>

                {/* 使用例 */}
                {expr.example && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--color-text-secondary)',
                      margin: '0 0 4px 0',
                      fontWeight: '500'
                    }}>
                      使用例
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                      margin: '0',
                      lineHeight: '1.6',
                      fontStyle: 'italic',
                      backgroundColor: 'var(--color-background-primary)',
                      padding: '8px 12px',
                      borderRadius: 'var(--border-radius-md)'
                    }}>
                      "{expr.example}"
                    </p>
                  </div>
                )}

                {/* 出典 */}
                {(expr.sourceUrl || expr.sourceTimestamp) && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      margin: '0',
                      lineHeight: '1.4'
                    }}>
                      {expr.sourceUrl && (
                        <>
                          <span style={{ fontWeight: '500' }}>出典:</span> <a href={expr.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-primary)' }}>Link</a>
                        </>
                      )}
                      {expr.sourceUrl && expr.sourceTimestamp && ' • '}
                      {expr.sourceTimestamp && (
                        <>
                          <span style={{ fontWeight: '500' }}>時刻:</span> {expr.sourceTimestamp}
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* メタ情報 */}
                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: '12px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--color-border-tertiary)'
                }}>
                  保存: {expr.createdAt}
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => handleDelete(expr.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border-tertiary)',
                    borderRadius: 'var(--border-radius-md)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-background-primary)';
                    e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
                  }}
                >
                  <Trash2 size={14} />
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フッター */}
      <div style={{
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid var(--color-border-tertiary)',
        fontSize: '12px',
        color: 'var(--color-text-tertiary)',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0' }}>
          {expressions.length} 個の表現を保存中 • データはブラウザに保存されます
        </p>
      </div>
    </div>
  );
};

export default ExpressionVault;
