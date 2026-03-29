import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Search, BookOpen, LogIn, LogOut } from 'lucide-react';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const ExpressionVault = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
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

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestoreからリアルタイムでデータ取得
  useEffect(() => {
    if (!user) {
      setExpressions([]);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'expressions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpressions(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('ログインエラー:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const handleAddExpression = async (e) => {
    e.preventDefault();
    if (!formData.expression.trim() || !formData.meaning.trim()) {
      alert('表現と意味は必須です');
      return;
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'expressions'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setFormData({
        expression: '',
        meaning: '',
        example: '',
        sourceUrl: '',
        sourceTimestamp: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'expressions', id));
    } catch (error) {
      console.error('削除エラー:', error);
    }
  };

  const filteredExpressions = expressions.filter(expr =>
    expr.expression.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expr.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expr.example.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('ja-JP');
  };

  if (authLoading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', textAlign: 'center', paddingTop: '100px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>読み込み中...</p>
      </div>
    );
  }

  // 未ログイン画面
  if (!user) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          textAlign: 'center',
          paddingTop: '80px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <BookOpen size={40} style={{ color: 'var(--color-text-primary)' }} />
            <h1 style={{ fontSize: '32px', fontWeight: '500', margin: '0' }}>Expression Vault</h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px', marginBottom: '40px' }}>
            SNSや記事で見つけた英語表現をさっと保存。あなただけの表現辞書。
          </p>
          <button
            onClick={handleLogin}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              backgroundColor: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-secondary)',
              borderRadius: 'var(--border-radius-lg)',
              cursor: 'pointer',
              fontSize: '16px',
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
            <LogIn size={20} />
            Googleでログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* ヘッダー */}
      <div style={{
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid var(--color-border-tertiary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={32} style={{ color: 'var(--color-text-primary)' }} />
            <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0' }}>Expression Vault</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {user.displayName}
            </span>
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt=""
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
            )}
            <button
              onClick={handleLogout}
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
                e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={14} />
              ログアウト
            </button>
          </div>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', margin: '8px 0 0', fontSize: '14px' }}>
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

                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: '12px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--color-border-tertiary)'
                }}>
                  保存: {formatDate(expr.createdAt)}
                </div>

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
          {expressions.length} 個の表現を保存中
        </p>
      </div>
    </div>
  );
};

export default ExpressionVault;
