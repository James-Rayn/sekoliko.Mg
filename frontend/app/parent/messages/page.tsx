'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function ParentMessagesPage() {
  const [inbox, setInbox] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({
    receiverId: '',
    subject: '',
    body: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/messages/inbox'),
      api.get('/messages/announcements'),
    ])
      .then(([inboxRes, annRes]) => {
        setInbox(inboxRes.data.messages);
        setAnnouncements(annRes.data.announcements);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/messages', composeForm);
      setShowCompose(false);
      setComposeForm({ receiverId: '', subject: '', body: '' });
      const res = await api.get('/messages/sent');
    } catch (err: any) {
      console.error('Erreur envoi:', err.response?.data);
    }
  };

  const handleMarkAllRead = async () => {
    await api.patch('/messages/read-all');
    const res = await api.get('/messages/inbox');
    setInbox(res.data.messages);
  };

  const unreadCount = inbox.filter((m) => !m.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-5xl animate-pulse">✉️</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Modal composer */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">✉️ Nouveau message</h2>
              <button onClick={() => setShowCompose(false)} className="text-gray-400">✕</button>
            </div>
            <form onSubmit={handleSend} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Destinataire *</label>
                <input
                  type="text"
                  value={composeForm.receiverId}
                  onChange={(e) => setComposeForm({ ...composeForm, receiverId: e.target.value })}
                  placeholder="ID de l'enseignant ou admin"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  value={composeForm.body}
                  onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCompose(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Annuler</button>
                <button type="submit" className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">📤 Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal lecture */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{selectedMessage.subject}</h2>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400">✕</button>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-400 mb-4">
                De : {selectedMessage.sender?.email} •{' '}
                {new Date(selectedMessage.createdAt).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-gray-700 leading-relaxed">{selectedMessage.body}</p>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedMessage(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Fermer</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Messagerie</h1>
          <p className="text-gray-500 text-sm mt-1">{unreadCount} message(s) non lu(s)</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          ✉️ Nouveau message
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'inbox', label: `📥 Messages (${inbox.length})` },
            { key: 'announcements', label: `📢 Annonces (${announcements.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'border-b-2 border-orange-600 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'inbox' && (
            <div>
              {unreadCount > 0 && (
                <div className="flex justify-end mb-3">
                  <button onClick={handleMarkAllRead} className="text-sm text-orange-600 hover:underline">
                    ✅ Tout marquer comme lu
                  </button>
                </div>
              )}
              {inbox.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Boîte vide</p>
              ) : (
                <div className="space-y-2">
                  {inbox.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 rounded-xl cursor-pointer border transition ${
                        !msg.isRead ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'
                      } hover:shadow-sm`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!msg.isRead && <span className="w-2 h-2 bg-orange-600 rounded-full" />}
                            <p className={`text-sm text-gray-800 truncate ${!msg.isRead ? 'font-semibold' : ''}`}>
                              {msg.subject}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">De : {msg.sender?.email}</p>
                          <p className="text-xs text-gray-400 mt-1 truncate">{msg.body}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Aucune annonce</p>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="font-medium text-gray-800">{ann.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(ann.publishedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}