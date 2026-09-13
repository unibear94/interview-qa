'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const TYPES = [
  { key: 'contract_dept', label: '계약학과' },
  { key: 'university', label: '일반대학' },
  { key: 'company', label: '일반기업' },
];

export default function InterviewLogPage() {
  const [type, setType] = useState('contract_dept');
  const [orgName, setOrgName] = useState('');
  const [deptTrack, setDeptTrack] = useState('');
  const [date, setDate] = useState('');
  const [wasPressured, setWasPressured] = useState('no');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('로그인이 필요해요.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('interview_reviews').insert({
      user_id: user.id,
      interview_type: type,
      org_name: orgName,
      department_track: deptTrack,
      atmosphere_note: note,
      was_pressured: wasPressured === 'yes',
      free_note: note,
    });
    setSaving(false);
    if (error) alert('저장 실패: ' + error.message);
    else {
      alert('면접 후기가 저장됐어요!');
      setOrgName(''); setDeptTrack(''); setDate(''); setNote('');
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 16 }}>면접 다녀왔어요</h2>
      <div className="tabs">
        {TYPES.map((t) => (
          <div key={t.key} className={`tab ${type === t.key ? 'active' : ''}`} onClick={() => setType(t.key)}>
            {t.label}
          </div>
        ))}
      </div>

      <div className="field">
        <label>{type === 'university' ? '대학명' : '기업명'}</label>
        <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="예: 연세대학교, 삼성전자" />
      </div>
      <div className="field">
        <label>{type === 'university' ? '학과 / 전형' : '직무'}</label>
        <input value={deptTrack} onChange={(e) => setDeptTrack(e.target.value)} placeholder="예: 경영학과 학생부종합, SW개발" />
      </div>
      <div className="field">
        <label>면접 날짜</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="field">
        <label>압박 질문 여부</label>
        <select value={wasPressured} onChange={(e) => setWasPressured(e.target.value)}>
          <option value="no">아니요</option>
          <option value="yes">네</option>
        </select>
      </div>
      <div className="field">
        <label>분위기 / 메모</label>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="분위기, 소요 시간 등 자유롭게 기록하세요" />
      </div>

      <button style={{ width: '100%' }} onClick={handleSave} disabled={saving}>
        {saving ? '저장 중...' : '저장하기'}
      </button>
    </div>
  );
}
