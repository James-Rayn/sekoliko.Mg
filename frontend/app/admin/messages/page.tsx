'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function MessagesPage() {
  const [inbox, setInbox] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const [composeForm, setComposeForm] = useState({
    receiverId: '',
    subject: '',
    body: '',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    targetRole: '',
    expiresAt: '',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [inboxRes, sentRes, announcementsRes] = await Promise.all([
        api.get('/messages/inbox'),
        api.get('/messages/sent'),
        api.get('/messages/announcements'),
      ]);
      setInbox(inboxRes.data.messages);
      setSent(sentRes.data.messages);
      setAnnouncements(announcementsRes.data.announcements);
    } catch (err) {
      console.error('Erreur chargement messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/messages', composeForm);
      setShowComposeModal(false);
      setComposeForm({ receiverId: '', subject: '', body: '' });
      fetchAll();
    } catch (err: any) {
      console.error('Erreur envoi:', err.response?.data);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/messages/announcements', {
        ...announcementForm,
        targetRole: announcementForm.targetRole || undefined,
        expiresAt: announcementForm.expiresAt || undefined,
      });
      setShowAnnouncementModal(false);
      setAnnouncementForm({ title: '', content: '', targetRole: '', expiresAt: '' });
      fetchAll();
    } catch (err: any) {
      console.error('Erreur annonce:', err.response?.data);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.delete(`/messages/announcements/${id}`);
      fetchAll();
    } catch (err) {
      console.error('Erreur suppression');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/messages/read-all');
      fetchAll();
    } catch (err) {
      console.error('Erreur mark read');
    }
  };

  const unreadCount = inbox.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">

      {/* Modal Composer */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                ✉️ Nouveau message
              </h2>
              <button onClick={() => setShowComposeModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSendMessage} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Destinataire *
                </label>
                <input
                  type="text"
                  value={composeForm.receiverId}
                  onChange={(e) => setComposeForm({ ...composeForm, receiverId: e.target.value })}
                  placeholder="ID de l'utilisateur"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet *
                </label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  placeholder="Sujet du message"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={composeForm.body}
                  onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowComposeModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Annuler</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">📤 Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Annonce */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                📢 Nouvelle annonce
              </h2>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="Titre de l'annonce"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
                  <select
                    value={announcementForm.targetRole}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, targetRole: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  >
                    <option value="">Tout le monde</option>
                    <option value="TEACHER">Enseignants</option>
                    <option value="STUDENT">Élèves</option>
                    <option value="PARENT">Parents</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expire le</label>
                  <input
                    type="date"
                    value={announcementForm.expiresAt}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAnnouncementModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Annuler</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">📢 Publier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Messagerie</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount} message(s) non lu(s)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            📢 Annonce
          </button>
          <button
            onClick={() => setShowComposeModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            ✉️ Nouveau message
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {[
            { key: 'inbox', label: `📥 Reçus (${inbox.length})` },
            { key: 'sent', label: `📤 Envoyés (${sent.length})` },
            { key: 'announcements', label: `📢 Annonces (${announcements.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">

          {/* Boîte de réception */}
          {activeTab === 'inbox' && (
            <div>
              {inbox.length > 0 && unreadCount > 0 && (
                <div className="flex justify-end mb-3">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ✅ Tout marquer comme lu
                  </button>
                </div>
              )}
              {inbox.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  Boîte de réception vide
                </p>
              ) : (
                <div className="space-y-2">
                  {inbox.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 rounded-xl cursor-pointer transition border ${
                        !msg.isRead
                          ? 'bg-blue-50 border-blue-100'
                          : 'bg-gray-50 border-gray-100'
                      } hover:shadow-sm`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!msg.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                            <p className={`text-sm font-medium text-gray-800 truncate ${!msg.isRead ? 'font-semibold' : ''}`}>
                              {msg.subject}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            De : {msg.sender?.email}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {msg.body}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages envoyés */}
          {activeTab === 'sent' && (
            <div className="space-y-2">
              {sent.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  Aucun message envoyé
                </p>
              ) : (
                sent.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {msg.subject}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          À : {msg.receiver?.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-md">
                          {msg.body}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Annonces */}
          {activeTab === 'announcements' && (
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  Aucune annonce publiée
                </p>
              ) : (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 bg-orange-50 rounded-xl border border-orange-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-800">{ann.title}</p>
                          {ann.targetRole && (
                            <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">
                              {ann.targetRole}
                            </span>
                          )}
                          {!ann.targetRole && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              Tout le monde
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{ann.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Publié le{' '}
                          {new Date(ann.publishedAt).toLocaleDateString('fr-FR')}
                          {ann.expiresAt &&
                            ` • Expire le ${new Date(ann.expiresAt).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="ml-4 text-red-400 hover:text-red-600 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal lecture message */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {selectedMessage.subject}
              </h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-400 mb-4">
                De : {selectedMessage.sender?.email} •{' '}
                {new Date(selectedMessage.createdAt).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {selectedMessage.body}
              </p>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}