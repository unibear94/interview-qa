'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { extractYoutubeId } from '../../lib/youtube';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [org, setOrg] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  async function loadVideos() {
    const { data } = await supabase.from('reference_videos').select('*').order('created_at', { ascending: false });
    setVideos(data || []);
  }

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase.from('admins').select('email').eq('email', user.email).maybeSingle();
    setIsAdmin(!!data);
  }

  useEffect(() => {
    loadVideos();
    checkAdmin();
  }, []);

  async function handleAdd() {
    const youtube_id = extractYoutubeId(url);
    if (!youtube_id) {
      alert('올바른 유튜브 링크를 입력해주세요.');
      return;
    }
    const { error } = await supabase.from('reference_videos').insert({
      youtube_url: url,
      youtube_id,
      title,
      org_name: org,
    });
    if (error) alert('등록 실패: ' + error.message);
    else {
      setUrl(''); setTitle(''); setOrg('');
      loadVideos();
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 16 }}>참고영상</h2>

      {videos.length === 0 && <p style={{ color: '#888' }}>등록된 영상이 없어요.</p>}

      {videos.map((v) => (
        <div key={v.id} className="card">
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: 8 }}>
            <iframe
              src={`https://www.youtube.com/embed/${v.youtube_id}`}
              title={v.title}
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, borderRadius: 8 }}
            />
          </div>
          <p className="card-title">{v.title}</p>
          <p className="card-meta">{v.org_name}</p>
        </div>
      ))}

      {isAdmin && (
        <div className="card" style={{ marginTop: 20 }}>
          <p className="card-title">영상 등록</p>
          <div className="field">
            <label>유튜브 링크</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div className="field">
            <label>영상 제목</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>관련 기업/대학 (선택)</label>
            <input value={org} onChange={(e) => setOrg(e.target.value)} />
          </div>
          <button style={{ width: '100%' }} onClick={handleAdd}>영상 등록</button>
        </div>
      )}
    </div>
  );
}
