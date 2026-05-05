<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>RMI & Mifotra — Secure Examination Platform</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>
<style>
  :root {
    --bg: #F0F2F8;
    --surface: #FFFFFF;
    --surface2: #F7F8FC;
    --border: #E2E6F0;
    --blue: #1A56DB;
    --blue-dark: #1240A8;
    --blue-light: #EBF0FF;
    --gold: #F0A500;
    --green: #0B8A50;
    --green-light: #E3F5EC;
    --red: #D42B3A;
    --red-light: #FDECEA;
    --amber: #C47A00;
    --amber-light: #FEF3DC;
    --purple: #6B21A8;
    --purple-light: #F3E8FF;
    --text: #0F1624;
    --text2: #4B5570;
    --text3: #8792A8;
    --radius: 16px;
    --radius-lg: 24px;
    --shadow: 0 4px 24px rgba(26,86,219,0.08);
    --shadow-lg: 0 8px 40px rgba(26,86,219,0.15);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sora', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; }
  .mono { font-family: 'JetBrains Mono', monospace; }

  /* ── Layout ── */
  .app { min-height: 100vh; display: flex; flex-direction: column; }
  nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
  .nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; }
  .nav-logo { background: var(--blue); width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .nav-logo svg { color: var(--gold); }
  .nav-title { font-weight: 900; font-size: 18px; letter-spacing: -0.5px; }
  main { flex: 1; padding: 32px; max-width: 1100px; margin: 0 auto; width: 100%; }

  /* ── Buttons ── */
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: var(--radius); font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: all 0.18s; text-decoration: none; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-primary { background: var(--blue); color: #fff; box-shadow: 0 4px 16px rgba(26,86,219,0.3); }
  .btn-primary:hover:not(:disabled) { background: var(--blue-dark); box-shadow: 0 6px 24px rgba(26,86,219,0.4); transform: translateY(-1px); }
  .btn-ghost { background: transparent; color: var(--text2); border: 1.5px solid var(--border); }
  .btn-ghost:hover:not(:disabled) { background: var(--surface2); }
  .btn-danger { background: var(--red-light); color: var(--red); border: 1px solid #FAC5C8; }
  .btn-danger:hover:not(:disabled) { background: #FBDCDE; }
  .btn-gold { background: var(--gold); color: #fff; }
  .btn-gold:hover:not(:disabled) { background: #D49200; }
  .btn-sm { padding: 8px 16px; font-size: 12px; border-radius: 10px; }
  .btn-full { width: 100%; justify-content: center; }

  /* ── Forms ── */
  .input { width: 100%; padding: 13px 16px; border: 1.5px solid var(--border); border-radius: var(--radius); font-family: 'Sora', sans-serif; font-size: 14px; background: var(--surface); color: var(--text); transition: border 0.15s, box-shadow 0.15s; outline: none; }
  .input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(26,86,219,0.1); }
  .input-mono { font-family: 'JetBrains Mono', monospace; letter-spacing: 4px; text-align: center; font-size: 20px; font-weight: 700; }
  textarea.input { resize: vertical; min-height: 100px; line-height: 1.6; }
  .label { font-size: 12px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; display: block; }
  .form-group { display: flex; flex-direction: column; gap: 4px; }
  .error-msg { background: var(--red-light); color: var(--red); padding: 12px 16px; border-radius: var(--radius); font-size: 13px; font-weight: 600; border: 1px solid #FAC5C8; }
  .success-msg { background: var(--green-light); color: var(--green); padding: 12px 16px; border-radius: var(--radius); font-size: 13px; font-weight: 600; }

  /* ── Cards ── */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow); }
  .card-sm { padding: 20px; border-radius: var(--radius); }

  /* ── Landing ── */
  .landing { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; gap: 40px; text-align: center; }
  .landing-hero h1 { font-size: 52px; font-weight: 900; letter-spacing: -2px; line-height: 1.05; }
  .landing-hero p { font-size: 18px; color: var(--text2); margin-top: 12px; max-width: 480px; }
  .landing-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; max-width: 580px; }
  .landing-card { background: var(--surface); border: 2px solid var(--border); border-radius: var(--radius-lg); padding: 36px 24px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .landing-card:hover { border-color: var(--blue); box-shadow: var(--shadow-lg); transform: translateY(-3px); }
  .landing-card-icon { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; }
  .landing-card h3 { font-size: 18px; font-weight: 800; }
  .landing-card p { font-size: 13px; color: var(--text2); }
  .badge-blue { background: var(--blue); color: #fff; }
  .badge-gold { background: var(--gold); color: #fff; }

  /* ── Auth ── */
  .auth-wrap { display: flex; align-items: center; justify-content: center; min-height: 70vh; }
  .auth-card { width: 100%; max-width: 440px; }
  .auth-icon { width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .subject-row { display: flex; gap: 8px; align-items: center; }
  .subject-row input { flex: 1; }

  /* ── Dashboard ── */
  .dash-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; }
  .dash-title h1 { font-size: 30px; font-weight: 900; letter-spacing: -1px; }
  .dash-title p { color: var(--text2); margin-top: 4px; font-size: 14px; }
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
  .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .stat-val { font-size: 28px; font-weight: 900; }
  .stat-label { font-size: 12px; color: var(--text3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .panel-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .panel-header h3 { font-size: 15px; font-weight: 800; }
  .panel-body { max-height: 380px; overflow-y: auto; }
  .exam-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--surface2); transition: background 0.1s; }
  .exam-row:hover { background: var(--surface2); }
  .exam-row:last-child { border-bottom: none; }
  .exam-info h4 { font-size: 14px; font-weight: 700; }
  .exam-info span { font-size: 12px; color: var(--text3); }
  .code-pill { background: var(--blue-light); color: var(--blue); font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 14px; padding: 6px 12px; border-radius: 8px; letter-spacing: 3px; display: flex; align-items: center; gap: 6px; }
  .viol-row { padding: 12px 20px; border-bottom: 1px solid var(--surface2); }
  .viol-row:last-child { border-bottom: none; }
  .viol-name { font-size: 13px; font-weight: 700; }
  .viol-reason { font-size: 12px; color: var(--red); font-weight: 600; margin-top: 2px; }
  .viol-shot { width: 80px; height: 56px; object-fit: cover; border-radius: 8px; margin-top: 8px; border: 1px solid var(--border); }
  .live-badge { font-size: 10px; font-weight: 800; color: var(--red); text-transform: uppercase; letter-spacing: 1.5px; display: flex; align-items: center; gap: 4px; }
  .live-dot { width: 7px; height: 7px; background: var(--red); border-radius: 50%; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* ── Submissions table ── */
  .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  th { padding: 14px 18px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); background: var(--surface2); }
  td { padding: 14px 18px; font-size: 13px; border-top: 1px solid var(--border); }
  tr:hover td { background: var(--surface2); }
  .status-pill { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; }
  .status-submitted { background: var(--blue-light); color: var(--blue); }
  .status-progress { background: var(--amber-light); color: var(--amber); }

  /* ── Create Exam ── */
  .create-wrap { max-width: 860px; margin: 0 auto; }
  .create-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
  .create-header h1 { font-size: 28px; font-weight: 900; }
  .q-editor { background: var(--surface2); border: 1.5px solid var(--border); border-radius: var(--radius); padding: 20px; position: relative; }
  .q-editor-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
  .q-num { background: var(--blue-light); color: var(--blue); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; flex-shrink: 0; }
  .type-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; border: 1px solid; }
  .type-mcq { background: #EBF5FF; color: #1A56DB; border-color: #C3D9FF; }
  .type-essay { background: #FFF0F1; color: #C0392B; border-color: #FAC5C8; }
  .type-short { background: #F3E8FF; color: #6B21A8; border-color: #DDD0FF; }
  .type-listing { background: var(--amber-light); color: var(--amber); border-color: #F9DFA8; }
  .type-tf { background: var(--green-light); color: var(--green); border-color: #A8E5C8; }
  .pts-ctrl { display: inline-flex; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 3px 8px; }
  .pts-ctrl button { background: none; border: none; cursor: pointer; color: var(--text3); font-size: 16px; line-height: 1; padding: 0 2px; transition: color 0.15s; }
  .pts-ctrl button:hover { color: var(--blue); }
  .pts-val { font-size: 12px; font-weight: 800; color: var(--text); min-width: 40px; text-align: center; }
  .toolbar { display: flex; flex-wrap: wrap; gap: 8px; }
  .toolbar-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1.5px solid; transition: all 0.15s; background: var(--surface); }
  .mcq-opt { display: flex; align-items: center; gap: 8px; }
  .mcq-opt input[type=radio] { accent-color: var(--blue); width: 16px; height: 16px; }
  .tf-row { display: flex; gap: 12px; }
  .tf-btn { flex: 1; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 16px; cursor: pointer; border: 2px solid var(--border); background: var(--surface); transition: all 0.15s; }
  .tf-btn.selected-true { border-color: var(--green); background: var(--green-light); color: var(--green); }
  .tf-btn.selected-false { border-color: var(--red); background: var(--red-light); color: var(--red); }
  .q-list { display: flex; flex-direction: column; gap: 16px; max-height: 620px; overflow-y: auto; padding-right: 4px; }
  .q-empty { border: 2px dashed var(--border); border-radius: var(--radius); padding: 48px; text-align: center; color: var(--text3); }
  .q-total { font-size: 12px; color: var(--text3); font-weight: 600; }

  /* ── Student Join ── */
  .join-wrap { display: flex; align-items: center; justify-content: center; min-height: 70vh; }

  /* ── Instructions ── */
  .instr-wrap { display: flex; align-items: center; justify-content: center; min-height: 70vh; }
  .instr-card { max-width: 660px; width: 100%; }
  .instr-hero { background: var(--blue); color: #fff; border-radius: var(--radius); padding: 28px; text-align: center; margin-bottom: 24px; }
  .instr-hero h2 { font-size: 22px; font-weight: 900; }
  .instr-hero p { color: rgba(255,255,255,0.75); font-size: 13px; margin-top: 4px; }
  .instr-meta { display: flex; justify-content: center; gap: 20px; margin-top: 12px; font-size: 13px; color: rgba(255,255,255,0.85); flex-wrap: wrap; }
  .rules-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .rule-item { background: var(--surface2); border-radius: var(--radius); padding: 16px; display: flex; gap: 12px; }
  .rule-icon { background: var(--surface); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .rule-item h4 { font-size: 13px; font-weight: 800; }
  .rule-item p { font-size: 12px; color: var(--text2); margin-top: 2px; }
  .warning-box { background: var(--red-light); border: 1px solid #FAC5C8; border-radius: var(--radius); padding: 18px; display: flex; gap: 12px; margin-bottom: 20px; }

  /* ── Student Exam ── */
  .exam-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
  .exam-main { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; }
  .exam-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .q-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .q-label { font-size: 12px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; }
  .progress-bar { width: 160px; height: 6px; background: var(--border); border-radius: 999px; overflow: hidden; margin-top: 6px; }
  .progress-fill { height: 100%; background: var(--blue); border-radius: 999px; transition: width 0.4s; }
  .timer { display: flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 18px; padding: 8px 16px; border-radius: 10px; }
  .timer-ok { background: var(--surface2); color: var(--text); }
  .timer-warn { background: var(--red-light); color: var(--red); animation: pulse 1s infinite; }
  .q-text { font-size: 22px; font-weight: 700; line-height: 1.4; margin-bottom: 24px; letter-spacing: -0.5px; }
  .mcq-opt-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 16px 20px; border-radius: 12px; border: 2px solid var(--border); background: var(--surface); cursor: pointer; transition: all 0.15s; font-size: 15px; font-weight: 600; text-align: left; }
  .mcq-opt-btn:hover { border-color: var(--blue); background: var(--blue-light); }
  .mcq-opt-btn.selected { border-color: var(--blue); background: var(--blue-light); color: var(--blue-dark); }
  .mcq-check { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .mcq-check.checked { background: var(--blue); border-color: var(--blue); }
  .opts-list { display: flex; flex-direction: column; gap: 10px; }
  .exam-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border); }
  .hint-box { background: var(--amber-light); border: 1px solid #F9DFA8; border-radius: var(--radius); padding: 14px 16px; font-size: 13px; color: var(--amber); margin-top: 12px; position: relative; }
  /* Sidebar */
  .exam-sidebar { display: flex; flex-direction: column; gap: 16px; }
  .cam-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
  .cam-panel h3 { font-size: 14px; font-weight: 800; margin-bottom: 12px; }
  .cam-feed { aspect-ratio: 4/3; background: #0F1624; border-radius: 12px; overflow: hidden; position: relative; }
  .cam-feed video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
  .cam-live { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; gap: 5px; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
  .gaze-bars { display: flex; gap: 6px; margin: 10px 0; }
  .gaze-bar { flex: 1; height: 8px; border-radius: 4px; background: var(--border); transition: background 0.4s; }
  .gaze-bar.hit { background: var(--red); }
  .viol-bars { display: flex; gap: 6px; margin: 10px 0; }
  .viol-bar { flex: 1; height: 8px; border-radius: 4px; background: var(--border); transition: background 0.4s; }
  .viol-bar.hit { background: var(--amber); }

  /* ── Result ── */
  .result-wrap { display: flex; align-items: center; justify-content: center; min-height: 70vh; }
  .result-card { max-width: 520px; width: 100%; text-align: center; }
  .result-icon { width: 80px; height: 80px; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .result-scores { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; background: var(--surface2); border-radius: var(--radius); padding: 24px; margin: 20px 0; }
  .result-score-item { text-align: center; }
  .result-score-val { font-size: 36px; font-weight: 900; line-height: 1; }
  .result-score-label { font-size: 11px; color: var(--text3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 4px; }
  .pass-badge { display: inline-block; padding: 8px 20px; border-radius: 99px; font-weight: 800; font-size: 13px; margin-bottom: 20px; }
  .pass-yes { background: var(--green-light); color: var(--green); }
  .pass-no { background: var(--red-light); color: var(--red); }

  /* ── Modal ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
  .modal { background: var(--surface); border-radius: 28px; max-width: 580px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 80px rgba(0,0,0,0.25); }
  .modal-header { padding: 28px 28px 0; display: flex; justify-content: space-between; align-items: flex-start; }
  .modal-header h2 { font-size: 22px; font-weight: 900; }
  .modal-body { padding: 24px 28px; }
  .modal-footer { padding: 0 28px 28px; display: flex; gap: 12px; }
  .modal-close { background: var(--surface2); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; color: var(--text2); }
  .code-display { background: var(--blue-light); border: 2px dashed var(--border); border-radius: var(--radius); padding: 28px; text-align: center; position: relative; margin: 16px 0; }
  .code-big { font-family: 'JetBrains Mono', monospace; font-size: 48px; font-weight: 900; color: var(--blue); letter-spacing: 8px; }

  /* ── Submission Detail Modal ── */
  .sub-hero { background: var(--blue); color: #fff; padding: 24px 28px; display: flex; justify-content: space-between; align-items: flex-start; }
  .sub-scores { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 20px; }
  .sub-score-box { background: var(--surface2); border-radius: var(--radius); padding: 16px; text-align: center; }
  .sub-score-val { font-size: 22px; font-weight: 900; }
  .sub-score-label { font-size: 10px; color: var(--text3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 4px; }
  .ai-eval-card { background: var(--blue-light); border: 1px solid #C3D9FF; border-radius: var(--radius); padding: 16px; margin-bottom: 12px; }
  .ai-eval-card h4 { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
  .ai-feedback { font-size: 12px; color: var(--blue-dark); font-style: italic; margin-top: 6px; }
  .student-ans { font-size: 12px; color: var(--text2); background: rgba(255,255,255,0.6); padding: 8px 12px; border-radius: 8px; margin-top: 8px; }

  /* ── Toast ── */
  #toast-container { position: fixed; top: 80px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
  .toast { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 18px; font-size: 13px; font-weight: 600; box-shadow: var(--shadow-lg); max-width: 340px; display: flex; align-items: center; gap: 10px; animation: slideIn 0.3s ease; pointer-events: all; }
  .toast-success { border-left: 4px solid var(--green); }
  .toast-error { border-left: 4px solid var(--red); }
  .toast-warn { border-left: 4px solid var(--gold); }
  .toast-info { border-left: 4px solid var(--blue); }
  .toast-loading { border-left: 4px solid var(--text3); }
  @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }

  /* ── Loading ── */
  .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; }

  /* ── AI Generating ── */
  .ai-loading { background: var(--blue-light); border: 1px solid #C3D9FF; border-radius: var(--radius); padding: 14px 18px; display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--blue-dark); font-weight: 600; }

  /* ── Misc ── */
  .divider { border: none; border-top: 1px solid var(--border); margin: 8px 0; }
  .icon-btn { background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 8px; color: var(--text3); transition: all 0.15s; display: flex; align-items: center; }
  .icon-btn:hover { background: var(--surface2); color: var(--text); }
  .link-btn { background: none; border: none; cursor: pointer; color: var(--blue); font-size: 13px; font-weight: 700; font-family: 'Sora', sans-serif; text-decoration: underline; }
  .cam-blocked { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; gap: 16px; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* Responsive */
  @media (max-width: 768px) {
    main { padding: 16px; }
    nav { padding: 12px 16px; }
    .landing-cards { grid-template-columns: 1fr; }
    .landing-hero h1 { font-size: 34px; }
    .stats-grid { grid-template-columns: 1fr; }
    .two-col { grid-template-columns: 1fr; }
    .exam-layout { grid-template-columns: 1fr; }
    .rules-grid { grid-template-columns: 1fr; }
  }

  /* No select during exam */
  .no-select { user-select: none; -webkit-user-select: none; }
</style>
</head>
<body>
<div id="toast-container"></div>
<div id="app"></div>

<script>
// ═══════════════════════════════════════════
// CONFIG — paste your Anthropic API key here
// ═══════════════════════════════════════════
const ANTHROPIC_API_KEY = ''; // Leave empty — calls go via Anthropic API proxy in Claude artifacts

// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
let state = {
  view: 'landing',
  // Auth
  teachers: JSON.parse(localStorage.getItem('rmi_teachers') || '{}'),
  currentTeacher: JSON.parse(localStorage.getItem('rmi_current_teacher') || 'null'),
  // Data
  exams: JSON.parse(localStorage.getItem('rmi_exams') || '[]'),
  submissions: JSON.parse(localStorage.getItem('rmi_submissions') || '[]'),
  violations: JSON.parse(localStorage.getItem('rmi_violations') || '[]'),
  // Exam session
  currentExam: null,
  currentSubmission: null,
  studentName: '',
  // Exam progress
  currentQIdx: 0,
  answers: {},
  timeLeft: 0,
  gazeViolations: 0,
  otherViolations: 0,
  isSubmitting: false,
  aiHint: null,
  // UI
  selectedSubmission: null,
  newExamCode: null,
  newExamId: null,
  authError: '',
  regForm: { name:'', email:'', password:'', school:'', subjects:[''] },
  loginForm: { email:'', password:'' },
  aiGenerating: false,
};

// Camera / proctoring
let videoEl = null;
let canvasEl = null;
let mediaStream = null;
let timerInterval = null;
let proctoringInterval = null;
let isSubmittingFlag = false;
let cameraBlocked = false;

// ═══════════════════════════════════════════
// PERSIST
// ═══════════════════════════════════════════
function save() {
  localStorage.setItem('rmi_teachers', JSON.stringify(state.teachers));
  localStorage.setItem('rmi_current_teacher', JSON.stringify(state.currentTeacher));
  localStorage.setItem('rmi_exams', JSON.stringify(state.exams));
  localStorage.setItem('rmi_submissions', JSON.stringify(state.submissions));
  localStorage.setItem('rmi_violations', JSON.stringify(state.violations));
}

// ═══════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════
function toast(msg, type='info', duration=4000) {
  const icons = { success:'✅', error:'❌', warn:'⚠️', info:'ℹ️', loading:'⏳' };
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  if (duration > 0) setTimeout(() => t.remove(), duration);
  return t;
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
function genId() { return Math.random().toString(36).substring(2, 11); }
function calcMax(questions) { return questions.reduce((s,q)=>s+(q.points||1),0); }

// ═══════════════════════════════════════════
// ANTHROPIC AI
// ═══════════════════════════════════════════
async function callAI(prompt, systemPrompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt || 'You are an expert educational AI assistant.',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const data = await response.json();
  return data.content.map(b => b.text || '').join('');
}

async function aiGradeAnswer(questionText, questionType, idealAnswer, studentAnswer, maxPts) {
  const system = `You are a strict but fair examiner. Grade student answers objectively. 
ALWAYS respond with valid JSON only, no markdown, no backticks.`;
  const prompt = `Grade this student answer.

Question: "${questionText}"
Question Type: ${questionType}
Model Answer / Rubric: "${idealAnswer}"
Student's Answer: "${studentAnswer}"
Maximum Points: ${maxPts}

Evaluate what the student actually wrote. Read their answer carefully and judge:
- Accuracy and correctness
- Completeness  
- Understanding shown

Respond ONLY with this JSON (no markdown):
{"score": <number 0 to ${maxPts}>, "feedback": "<specific feedback mentioning what they got right and wrong>", "understanding": "<brief assessment of their understanding>"}`;

  const raw = await callAI(prompt, system);
  const clean = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return { score: Math.min(maxPts, Math.max(0, parsed.score)), feedback: parsed.feedback, understanding: parsed.understanding, maxScore: maxPts };
}

async function aiGradeEssay(questionText, rubric, studentAnswer, maxPts) {
  const system = `You are an expert essay grader. Read what the student wrote and evaluate it against the rubric.
ALWAYS respond with valid JSON only, no markdown, no backticks.`;
  const prompt = `Grade this essay answer.

Question: "${questionText}"
Rubric / Key Points: "${rubric}"
Student's Full Essay: "${studentAnswer}"
Maximum Points: ${maxPts}

Read the student's essay carefully. Evaluate:
1. Coverage of key topics (do they cover what the rubric asks?)
2. Accuracy of information
3. Depth of explanation
4. Clarity of writing

Respond ONLY with this JSON:
{"score": <0 to ${maxPts}>, "feedback": "<detailed feedback referencing what they wrote>", "strengths": "<what they did well>", "improvements": "<what was missing>"}`;

  const raw = await callAI(prompt, system);
  const clean = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return { score: Math.min(maxPts, Math.max(0, parsed.score)), feedback: parsed.feedback, strengths: parsed.strengths, improvements: parsed.improvements, maxScore: maxPts };
}

async function aiGradeListing(questionText, idealItems, studentAnswer, maxPts) {
  const system = `You are a listing question grader. Check each expected item against what the student wrote.
ALWAYS respond with valid JSON only, no markdown, no backticks.`;
  const studentItems = studentAnswer.split('\n').filter(s => s.trim());
  const prompt = `Grade this listing question.

Question: "${questionText}"
Expected Items (teacher's answer key): ${JSON.stringify(idealItems)}
Student Listed: ${JSON.stringify(studentItems)}
Maximum Points: ${maxPts}

For each expected item, check if the student mentioned it (exact or semantic match — synonyms count).
Count matched items and calculate a proportional score.

Respond ONLY with this JSON:
{"score": <0 to ${maxPts}>, "matched": <number matched>, "total_expected": ${idealItems.length}, "feedback": "<which items were correct, which were missing>"}`;

  const raw = await callAI(prompt, system);
  const clean = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return { score: Math.min(maxPts, Math.max(0, parsed.score)), feedback: parsed.feedback, matched: parsed.matched, total: idealItems.length, maxScore: maxPts };
}

async function aiGenerateQuestions(content, qType, count=5) {
  const typeInstructions = {
    mcq: `Generate ${count} multiple-choice questions with 4 options each. Mark the correct answer.`,
    essay: `Generate ${count} essay questions with a detailed rubric (key points to cover).`,
    short_answer: `Generate ${count} short-answer questions with a model answer.`,
    listing: `Generate ${count} listing questions where students list multiple items. Include 3-5 expected items.`,
    true_false: `Generate ${count} True/False questions. Each must have a clear true or false answer.`
  };

  const system = `You are an expert question generator. Create high-quality exam questions.
ALWAYS respond with valid JSON array only, no markdown, no backticks.`;

  const prompt = `Generate questions from this content:

CONTENT: "${content.substring(0, 3000)}"

${typeInstructions[qType]}

Respond ONLY with a JSON array in this format:
For MCQ: [{"text":"question?","options":["A","B","C","D"],"correctOptionIndex":0,"points":1}]
For Essay: [{"text":"question?","idealAnswer":"rubric/key points...","points":10}]
For Short Answer: [{"text":"question?","idealAnswer":"model answer","points":2}]
For Listing: [{"text":"question?","listItems":["item1","item2","item3"],"points":3}]
For True/False: [{"text":"statement?","correctAnswer":true,"points":1}]`;

  const raw = await callAI(prompt, system);
  const clean = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  return parsed.map(q => ({ ...q, id: genId(), type: qType }));
}

async function aiGetHint(questionText, studentSoFar) {
  const system = `You are a helpful study assistant. Give a helpful hint without giving away the answer.`;
  const prompt = `Student is answering: "${questionText}"
What they've written so far: "${studentSoFar}"
Give a brief, encouraging hint (2-3 sentences) that helps them think about what to include without giving the answer.`;
  return await callAI(prompt, system);
}

async function aiAnalyzeProctoring(base64Image) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
          { type: 'text', text: 'Is this person looking away from the screen or not visible? Answer ONLY with JSON: {"lookingAway": true/false, "reason": "brief reason"}' }
        ]
      }]
    })
  });
  if (!response.ok) return { lookingAway: false };
  const data = await response.json();
  const text = data.content.map(b=>b.text||'').join('');
  try {
    const clean = text.replace(/```json|```/g,'').trim();
    return JSON.parse(clean);
  } catch { return { lookingAway: false }; }
}

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════
function registerTeacher(form) {
  const { name, email, password, school, subjects } = form;
  if (!name.trim() || !email.trim() || !password.trim() || !school.trim()) return 'All fields are required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email address.';
  const validSubs = subjects.filter(s=>s.trim());
  if (validSubs.length === 0) return 'Add at least one subject.';
  const emailKey = email.toLowerCase().trim();
  if (state.teachers[emailKey]) return 'Email already registered. Please login.';
  const id = genId();
  const teacher = { id, name: name.trim(), email: emailKey, password, school: school.trim(), subjects: validSubs };
  state.teachers[emailKey] = teacher;
  state.currentTeacher = { id, name: teacher.name, email: emailKey, school: teacher.school, subjects: teacher.subjects };
  save();
  return null;
}

function loginTeacher(email, password) {
  const emailKey = email.toLowerCase().trim();
  const teacher = state.teachers[emailKey];
  if (!teacher) return 'No account found for this email. Please register first.';
  if (teacher.password !== password) return 'Wrong password. Please try again.';
  state.currentTeacher = { id: teacher.id, name: teacher.name, email: emailKey, school: teacher.school, subjects: teacher.subjects };
  save();
  return null;
}

// ═══════════════════════════════════════════
// CREATE EXAM
// ═══════════════════════════════════════════
function createExam(examData) {
  const code = genCode();
  const id = genId();
  const exam = { ...examData, id, sessionCode: code, teacherId: state.currentTeacher.id, teacherName: state.currentTeacher.name, createdAt: Date.now() };
  state.exams.push(exam);
  save();
  return { id, code };
}

// ═══════════════════════════════════════════
// VIOLATIONS
// ═══════════════════════════════════════════
function logViolation(reason, screenshot, isGaze=false) {
  if (isSubmittingFlag) return;
  if (isGaze) {
    state.gazeViolations++;
    toast(`👁 Look-away detected! ${state.gazeViolations}/3`, 'warn', 3000);
  } else {
    state.otherViolations++;
    toast(`⚠ Violation #${state.otherViolations}: ${reason}`, 'warn', 3000);
  }
  if (state.currentSubmission) {
    const v = { id: genId(), submissionId: state.currentSubmission.id, examId: state.currentExam?.id, teacherId: state.currentExam?.teacherId, studentName: state.studentName, reason, screenshot: screenshot||null, isGaze, timestamp: Date.now() };
    state.violations.push(v);
    // Update submission violations count
    const sub = state.submissions.find(s=>s.id===state.currentSubmission.id);
    if (sub) sub.violations = (state.otherViolations + state.gazeViolations);
    save();
    renderApp();
  }
  if (isGaze && state.gazeViolations >= 3) {
    toast('3 look-aways reached! Exam auto-submitted!', 'error', 0);
    submitExam();
  }
  if (!isGaze && state.otherViolations >= 3) {
    toast('3 violations reached! Exam auto-submitted!', 'error', 0);
    submitExam();
  }
}

function captureFrame() {
  if (!videoEl || !canvasEl) return null;
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(videoEl, 0, 0, 320, 240);
  return canvasEl.toDataURL('image/jpeg', 0.5).split(',')[1];
}

async function runProctoringCheck() {
  if (state.view !== 'student-exam' || isSubmittingFlag) return;
  const b64 = captureFrame();
  if (!b64) return;
  try {
    const result = await aiAnalyzeProctoring(b64);
    if (result.lookingAway) logViolation(result.reason || 'Looking away', b64, true);
  } catch (e) { console.warn('Proctoring check failed', e); }
}

async function startProctoring() {
  stopProctoring();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    mediaStream = stream;
    cameraBlocked = false;
    if (videoEl) videoEl.srcObject = stream;
    try { await document.documentElement.requestFullscreen?.(); } catch {}
    proctoringInterval = setInterval(runProctoringCheck, 12000);
    renderApp();
  } catch {
    cameraBlocked = true;
    renderApp();
    toast('Camera access REQUIRED for this exam!', 'error', 0);
  }
}

function stopProctoring() {
  if (mediaStream) { mediaStream.getTracks().forEach(t=>t.stop()); mediaStream = null; }
  if (videoEl) videoEl.srcObject = null;
  clearInterval(proctoringInterval); proctoringInterval = null;
  clearInterval(timerInterval); timerInterval = null;
  try { if (document.fullscreenElement) document.exitFullscreen(); } catch {}
}

// ═══════════════════════════════════════════
// SUBMIT
// ═══════════════════════════════════════════
async function submitExam() {
  if (isSubmittingFlag) return;
  isSubmittingFlag = true;
  state.isSubmitting = true;
  stopProctoring();

  const exam = state.currentExam;
  const sub = state.currentSubmission;
  if (!exam || !sub) { isSubmittingFlag = false; state.isSubmitting = false; return; }

  const finalAnswers = { ...state.answers };
  let score = 0;
  let aiEvals = {};

  // Auto-grade MCQ & T/F
  exam.questions.forEach(q => {
    if (q.type === 'mcq' && finalAnswers[q.id] === q.correctOptionIndex) score += (q.points||1);
    if (q.type === 'true_false' && finalAnswers[q.id] === q.correctAnswer) score += (q.points||1);
  });

  // AI grade open questions
  const openQs = exam.questions.filter(q => ['essay','short_answer','listing'].includes(q.type));
  if (openQs.length > 0) {
    const loadT = toast('AI is reading and evaluating student answers...', 'loading', 0);
    try {
      for (const q of openQs) {
        const ans = finalAnswers[q.id] || '';
        const maxPts = q.points || (q.type==='essay'?10 : q.type==='listing'?(q.listItems?.length||3) : 2);
        let ev;
        try {
          if (q.type === 'essay') {
            ev = await aiGradeEssay(q.text, q.idealAnswer||'', ans, maxPts);
          } else if (q.type === 'short_answer') {
            ev = await aiGradeAnswer(q.text, q.type, q.idealAnswer||'', ans, maxPts);
          } else {
            ev = await aiGradeListing(q.text, q.listItems||[], ans, maxPts);
          }
        } catch(e) {
          console.error('AI grade error for question', q.id, e);
          ev = { score: 0, feedback: 'AI grading unavailable for this answer.', maxScore: maxPts };
        }
        aiEvals[q.id] = ev;
        score += ev.score;
      }
    } catch(e) {
      console.error('AI grading failed', e);
    } finally {
      loadT.remove();
    }
  }

  const maxScore = calcMax(exam.questions);
  const totalViolations = state.gazeViolations + state.otherViolations;

  // Update submission
  const subIdx = state.submissions.findIndex(s=>s.id===sub.id);
  if (subIdx !== -1) {
    state.submissions[subIdx] = { ...state.submissions[subIdx], answers: finalAnswers, status: 'submitted', score, maxScore, aiEvaluations: aiEvals, violations: totalViolations, submittedAt: Date.now() };
    state.currentSubmission = state.submissions[subIdx];
  }
  save();
  state.isSubmitting = false;
  setView('exam-result');
  toast('Exam submitted successfully!', 'success');
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
function setView(v) {
  state.view = v;
  if (v === 'student-exam') {
    setTimeout(() => {
      videoEl = document.getElementById('proctor-video');
      canvasEl = document.getElementById('proctor-canvas');
      startProctoring();
      startTimer();
      attachExamGuards();
    }, 200);
  } else if (v !== 'student-exam') {
    // Remove exam guards when leaving
  }
  renderApp();
}

function startTimer() {
  clearInterval(timerInterval);
  if (!state.currentExam) return;
  const perQ = Math.floor((state.currentExam.durationMinutes * 60) / state.currentExam.questions.length);
  state.timeLeft = perQ;
  timerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimerDisplay();
    if (state.timeLeft <= 0) {
      clearInterval(timerInterval);
      advanceQuestion();
    }
  }, 1000);
}

function advanceQuestion() {
  if (!state.currentExam) return;
  const nextIdx = state.currentQIdx + 1;
  if (nextIdx < state.currentExam.questions.length) {
    state.currentQIdx = nextIdx;
    state.aiHint = null;
    const perQ = Math.floor((state.currentExam.durationMinutes * 60) / state.currentExam.questions.length);
    state.timeLeft = perQ;
    startTimer();
    renderApp();
  } else {
    submitExam();
  }
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-display');
  if (!el) return;
  const m = Math.floor(state.timeLeft/60);
  const s = state.timeLeft%60;
  el.textContent = `${m}:${s.toString().padStart(2,'0')}`;
  el.parentElement.className = `timer ${state.timeLeft < 10 ? 'timer-warn' : 'timer-ok'}`;
}

// ═══════════════════════════════════════════
// EXAM GUARDS (anti-cheat)
// ═══════════════════════════════════════════
let guardsBound = false;
function attachExamGuards() {
  if (guardsBound) return;
  guardsBound = true;

  // Tab switch
  document.addEventListener('visibilitychange', onVisibilityChange);
  // Fullscreen exit
  document.addEventListener('fullscreenchange', onFullscreenChange);
  // Copy/paste/cut
  document.addEventListener('copy', onCopyPaste);
  document.addEventListener('paste', onCopyPaste);
  document.addEventListener('cut', onCopyPaste);
  // Right click
  document.addEventListener('contextmenu', onContextMenu);
  // Keyboard shortcuts
  document.addEventListener('keydown', onKeyDown);
}

function removeExamGuards() {
  guardsBound = false;
  document.removeEventListener('visibilitychange', onVisibilityChange);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  document.removeEventListener('copy', onCopyPaste);
  document.removeEventListener('paste', onCopyPaste);
  document.removeEventListener('cut', onCopyPaste);
  document.removeEventListener('contextmenu', onContextMenu);
  document.removeEventListener('keydown', onKeyDown);
}

function onVisibilityChange() {
  if (document.hidden && state.view === 'student-exam') {
    logViolation('Switched tab or minimized window');
  }
}
function onFullscreenChange() {
  if (!document.fullscreenElement && state.view === 'student-exam') {
    logViolation('Exited fullscreen mode');
    // Try to re-enter fullscreen
    setTimeout(() => { try { document.documentElement.requestFullscreen?.(); } catch {} }, 500);
  }
}
function onCopyPaste(e) {
  if (state.view === 'student-exam') {
    e.preventDefault();
    toast('Copy / Paste is disabled during the exam!', 'error', 3000);
    logViolation('Attempted copy / paste / cut');
  }
}
function onContextMenu(e) {
  if (state.view === 'student-exam') e.preventDefault();
}
function onKeyDown(e) {
  if (state.view !== 'student-exam') return;
  // Block common cheat shortcuts
  if ((e.ctrlKey || e.metaKey) && ['c','v','x','u','s','p','a','f'].includes(e.key.toLowerCase())) {
    e.preventDefault();
    if (['c','v','x'].includes(e.key.toLowerCase())) {
      toast('Keyboard shortcut disabled!', 'error', 2000);
      logViolation(`Used keyboard shortcut: Ctrl+${e.key.toUpperCase()}`);
    }
  }
  // Block F12, F5, F11
  if ([112,116,122].includes(e.keyCode)) {
    e.preventDefault();
    logViolation(`Pressed restricted key: F${e.keyCode-111}`);
  }
  // Block PrintScreen
  if (e.key === 'PrintScreen') {
    e.preventDefault();
    logViolation('Attempted screenshot (PrintScreen)');
    toast('Screenshots are disabled!', 'error', 3000);
  }
}

// ═══════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════
function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = buildApp();
  bindEvents();
  // Re-attach video after re-render during exam
  if (state.view === 'student-exam') {
    videoEl = document.getElementById('proctor-video');
    canvasEl = document.getElementById('proctor-canvas');
    if (videoEl && mediaStream) videoEl.srcObject = mediaStream;
  }
}

function buildNav() {
  const t = state.currentTeacher;
  return `<nav>
    <div class="nav-brand" onclick="goHome()">
      <div class="nav-logo">${svgShield()}</div>
      <span class="nav-title">RMI & Mifotra</span>
    </div>
    ${t ? `<div style="display:flex;align-items:center;gap:12px;">
      <div style="text-align:right;display:none;" class="sm-show">
        <div style="font-size:14px;font-weight:700;">${esc(t.name)}</div>
        <div style="font-size:12px;color:var(--text3);">${esc(t.school||'')}</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="doLogout()">Logout</button>
    </div>` : ''}
  </nav>`;
}

function buildApp() {
  const views = {
    landing: buildLanding,
    'teacher-register': buildRegister,
    'teacher-login': buildLogin,
    'teacher-dashboard': buildDashboard,
    'create-exam': buildCreateExam,
    'student-join': buildStudentJoin,
    'student-instructions': buildInstructions,
    'student-exam': buildStudentExam,
    'exam-result': buildResult,
  };
  const content = (views[state.view] || buildLanding)();
  const modal = buildModal();
  return `${buildNav()}<main>${content}</main>${modal}`;
}

// ── LANDING ──
function buildLanding() {
  return `<div class="landing">
    <div class="landing-hero">
      <h1>Secure Digital<br>Examinations</h1>
      <p>AI-powered proctoring and grading for modern education. RMI & Mifotra.</p>
    </div>
    <div class="landing-cards">
      <div class="landing-card" onclick="setView('student-join')">
        <div class="landing-card-icon badge-blue">${svgUser()}</div>
        <h3>I'm a Student</h3>
        <p>Join exam with session code</p>
      </div>
      <div class="landing-card" onclick="setView('teacher-login')">
        <div class="landing-card-icon badge-gold">${svgBook()}</div>
        <h3>I'm a Teacher</h3>
        <p>Login or create account</p>
      </div>
    </div>
  </div>`;
}

// ── REGISTER ──
function buildRegister() {
  const f = state.regForm;
  return `<div class="auth-wrap"><div class="card auth-card">
    <div class="auth-icon" style="background:var(--blue)">${svgUserPlus()}</div>
    <h2 style="text-align:center;font-size:22px;font-weight:900;margin-bottom:24px;">Create Teacher Account</h2>
    ${state.authError ? `<div class="error-msg" style="margin-bottom:16px;">${esc(state.authError)}</div>` : ''}
    <div style="display:flex;flex-direction:column;gap:14px;">
      <input class="input" id="reg-name" type="text" placeholder="Full Name *" value="${esc(f.name)}"/>
      <input class="input" id="reg-email" type="email" placeholder="Email Address *" value="${esc(f.email)}"/>
      <input class="input" id="reg-password" type="password" placeholder="Password (min 6 chars) *" value="${esc(f.password)}"/>
      <input class="input" id="reg-school" type="text" placeholder="School / Institution *" value="${esc(f.school)}"/>
      <div>
        <div class="label">Subjects *</div>
        <div id="subjects-list">${f.subjects.map((s,i)=>`
          <div class="subject-row" style="margin-bottom:8px;" id="subj-row-${i}">
            <input class="input" style="font-size:13px;padding:10px 14px;" placeholder="e.g. Mathematics" value="${esc(s)}" oninput="updateSubject(${i},this.value)"/>
            ${f.subjects.length > 1 ? `<button class="icon-btn" onclick="removeSubject(${i})">✕</button>` : ''}
          </div>`).join('')}
        </div>
        <button class="link-btn" onclick="addSubject()">+ Add subject</button>
      </div>
      <button class="btn btn-primary btn-full" id="reg-btn" onclick="doRegister()">Create Account</button>
      <button class="link-btn" style="text-align:center;margin-top:4px;" onclick="state.authError='';setView('teacher-login')">Already have an account? Login</button>
      <button class="link-btn" style="color:var(--text3);text-align:center;" onclick="setView('landing')">Back to Home</button>
    </div>
  </div></div>`;
}

// ── LOGIN ──
function buildLogin() {
  const f = state.loginForm;
  return `<div class="auth-wrap"><div class="card auth-card">
    <div class="auth-icon" style="background:var(--gold)">${svgBook()}</div>
    <h2 style="text-align:center;font-size:22px;font-weight:900;margin-bottom:24px;">Teacher Login</h2>
    ${state.authError ? `<div class="error-msg" style="margin-bottom:16px;">${esc(state.authError)}</div>` : ''}
    <div style="display:flex;flex-direction:column;gap:14px;">
      <input class="input" id="login-email" type="email" placeholder="Email Address" value="${esc(f.email)}"/>
      <input class="input" id="login-password" type="password" placeholder="Password" value="${esc(f.password)}" onkeydown="if(event.key==='Enter')doLogin()"/>
      <button class="btn btn-primary btn-full" onclick="doLogin()">Login</button>
      <button class="link-btn" style="text-align:center;" onclick="state.authError='';setView('teacher-register')">New teacher? Create account</button>
      <button class="link-btn" style="color:var(--text3);text-align:center;" onclick="setView('landing')">Back to Home</button>
    </div>
  </div></div>`;
}

// ── DASHBOARD ──
function buildDashboard() {
  const t = state.currentTeacher;
  const myExams = state.exams.filter(e=>e.teacherId===t.id);
  const mySubs = state.submissions.filter(s=>myExams.some(e=>e.id===s.examId));
  const myViols = state.violations.filter(v=>v.teacherId===t.id);
  const activeStudents = mySubs.filter(s=>s.status==='in-progress').length;

  return `<div>
    <div class="dash-header">
      <div class="dash-title">
        <h1>Dashboard</h1>
        <p>Welcome, <strong>${esc(t.name)}</strong>${t.school?` · ${esc(t.school)}`:''}${t.subjects?.length?` · ${t.subjects.map(esc).join(', ')}`:''}
        </p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-danger btn-sm" onclick="clearAllData()">🗑 Clear All Data</button>
        <button class="btn btn-primary" onclick="setView('create-exam')">+ Create Exam</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--blue-light)">${svgBook()}</div>
        <div class="stat-val">${myExams.length}</div>
        <div class="stat-label">Total Exams</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--purple-light)">${svgUser()}</div>
        <div class="stat-val">${activeStudents}</div>
        <div class="stat-label">Active Students</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--amber-light)">${svgAlert()}</div>
        <div class="stat-val">${myViols.length}</div>
        <div class="stat-label">Violations Flagged</div>
      </div>
    </div>

    <div class="two-col">
      <!-- Exams -->
      <div class="panel">
        <div class="panel-header"><h3>Your Exams</h3><span style="font-size:11px;color:var(--text3);font-weight:700;">${myExams.length} exams</span></div>
        <div class="panel-body">
          ${myExams.length === 0 ? `<div style="padding:48px;text-align:center;color:var(--text3);">No exams yet.</div>` :
          myExams.map(exam => `
            <div class="exam-row">
              <div class="exam-info">
                <h4>${esc(exam.title)}</h4>
                <span>${exam.questions.length} Q · ${exam.durationMinutes} min · ${calcMax(exam.questions)} pts</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <button class="icon-btn" title="Download CSV" onclick="downloadResults('${exam.id}')">⬇</button>
                <div class="code-pill">${exam.sessionCode} <button class="icon-btn" style="padding:2px;" onclick="copyCode('${exam.sessionCode}')">📋</button></div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Violations -->
      <div class="panel">
        <div class="panel-header">
          <div style="display:flex;align-items:center;gap:8px;">${svgAlert()} <h3>Live Proctoring Alerts</h3></div>
          <div class="live-badge"><div class="live-dot"></div> Live</div>
        </div>
        <div class="panel-body">
          ${myViols.length === 0 ? `<div style="padding:48px;text-align:center;color:var(--text3);">No violations detected.</div>` :
          myViols.slice(0,20).map(v=>`
            <div class="viol-row">
              <div style="display:flex;justify-content:space-between;">
                <div class="viol-name">${esc(v.studentName)}</div>
                <div style="font-size:11px;color:var(--text3);">${new Date(v.timestamp).toLocaleTimeString()}</div>
              </div>
              <div class="viol-reason">${esc(v.reason)} ${v.isGaze?'👁':''}</div>
              ${v.screenshot ? `<img class="viol-shot" src="data:image/jpeg;base64,${v.screenshot}" alt="screenshot"/>` : ''}
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Submissions -->
    <div class="table-wrap">
      <div class="panel-header" style="padding:20px 24px;"><h3>All Student Submissions</h3><span style="font-size:11px;color:var(--text3);font-weight:700;">${mySubs.length} total</span></div>
      <div style="overflow-x:auto;">
        <table>
          <thead><tr><th>Student</th><th>Exam</th><th>Status</th><th>Score</th><th>Violations</th><th>Action</th></tr></thead>
          <tbody>
            ${mySubs.length === 0 ? `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text3);">No submissions yet.</td></tr>` :
            mySubs.map(sub => {
              const exam = myExams.find(e=>e.id===sub.examId);
              return `<tr>
                <td><div style="font-weight:700;">${esc(sub.studentName)}</div></td>
                <td>${esc(exam?.title||'?')}</td>
                <td><span class="status-pill ${sub.status==='submitted'?'status-submitted':'status-progress'}">${sub.status}</span></td>
                <td style="font-weight:900;color:var(--blue);">${sub.score||0} / ${sub.maxScore||0}</td>
                <td style="font-weight:700;color:${sub.violations>0?'var(--red)':'var(--blue)'};">${sub.violations||0}</td>
                <td><button class="link-btn" onclick="viewSubmission('${sub.id}')">View</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

// ── CREATE EXAM ──
// We store pending questions in window.pendingQuestions
let pendingExam = { title:'', duration:60, questions:[] };

function buildCreateExam() {
  const qs = pendingExam.questions;
  const totalPts = calcMax(qs);
  return `<div class="create-wrap">
    <div class="create-header">
      <button class="icon-btn" onclick="setView('teacher-dashboard');pendingExam={title:'',duration:60,questions:[]};">← Back</button>
      <h1>Create New Exam</h1>
    </div>
    <div class="card" style="margin-bottom:24px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <div class="form-group">
          <label class="label">Exam Title *</label>
          <input class="input" id="exam-title" type="text" placeholder="e.g. Final Mathematics 101" value="${esc(pendingExam.title)}" oninput="pendingExam.title=this.value"/>
        </div>
        <div class="form-group">
          <label class="label">Duration (minutes)</label>
          <input class="input" id="exam-duration" type="number" min="5" value="${pendingExam.duration}" oninput="pendingExam.duration=parseInt(this.value)||30"/>
        </div>
      </div>
      <div style="background:var(--blue-light);border:1px solid #C3D9FF;border-radius:var(--radius);padding:14px 16px;display:flex;align-items:center;gap:10px;font-size:13px;color:var(--blue-dark);font-weight:600;margin-bottom:24px;">
        📷 Camera proctoring always enabled. AI gaze detection auto-submits after 3 look-away violations.
      </div>

      <!-- Questions -->
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <h3 style="font-weight:900;">Questions (${qs.length})</h3>
          ${qs.length > 0 ? `<span class="q-total">Total: ${totalPts} pts</span>` : ''}
        </div>
        <div class="toolbar">
          <button class="toolbar-btn" style="color:var(--blue);border-color:#C3D9FF;" onclick="openAiModal('mcq')">🤖 AI MCQ</button>
          <button class="toolbar-btn" style="color:#6B21A8;border-color:#DDD0FF;" onclick="openAiModal('essay')">🤖 AI Essay</button>
          <button class="toolbar-btn" style="color:var(--amber);border-color:#F9DFA8;" onclick="openAiModal('listing')">🤖 AI Listing</button>
          <button class="toolbar-btn" style="color:var(--green);border-color:#A8E5C8;" onclick="openAiModal('short_answer')">🤖 AI Short</button>
          <button class="toolbar-btn" style="color:var(--gold);border-color:#F9DFA8;" onclick="openAiModal('true_false')">🤖 AI T/F</button>
          <div style="position:relative;display:inline-block;">
            <button class="toolbar-btn" style="color:var(--amber);border-color:#F9DFA8;" onclick="toggleAddMenu()">＋ Manual</button>
            <div id="add-menu" style="display:none;position:absolute;right:0;top:calc(100%+4px);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);z-index:50;min-width:180px;box-shadow:var(--shadow-lg);">
              ${['mcq','true_false','short_answer','listing','essay'].map(qt=>`
                <button style="width:100%;text-align:left;padding:10px 16px;background:none;border:none;cursor:pointer;font-family:Sora,sans-serif;font-size:13px;font-weight:600;transition:background 0.1s;" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background='none'" onclick="addManualQuestion('${qt}');document.getElementById('add-menu').style.display='none';">${qTypeLabel(qt)}</button>`).join('')}
            </div>
          </div>
        </div>
      </div>

      ${state.aiGenerating ? `<div class="ai-loading" style="margin-bottom:16px;"><div class="spinner"></div>AI is generating questions...</div>` : ''}

      <div class="q-list" id="q-list">
        ${qs.length === 0 ? `<div class="q-empty"><div style="font-size:32px;margin-bottom:8px;">📝</div><p style="font-weight:700;">No questions yet</p><p style="font-size:13px;margin-top:4px;">Use AI generation or add manually</p></div>` :
        qs.map((q,i) => buildQEditor(q,i)).join('')}
      </div>

      <button class="btn btn-primary btn-full" style="margin-top:24px;" onclick="finalizeExam()" ${!pendingExam.title.trim()||qs.length===0?'disabled':''}>
        Finalize & Generate Session Code
      </button>
    </div>

    <!-- AI Modal -->
    ${buildAiModal()}
  </div>`;
}

function buildQEditor(q, idx) {
  const typeCls = { mcq:'type-mcq', essay:'type-essay', short_answer:'type-short', listing:'type-listing', true_false:'type-tf' };
  return `<div class="q-editor" id="qe-${q.id}">
    <div class="q-editor-header">
      <div class="q-num">${idx+1}</div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
          <span class="type-badge ${typeCls[q.type]||''}">${qTypeLabel(q.type)}</span>
          <div class="pts-ctrl">
            <button onclick="adjustPts('${q.id}',-1)">−</button>
            <span class="pts-val">${q.points||1} pt${(q.points||1)>1?'s':''}</span>
            <button onclick="adjustPts('${q.id}',+1)">+</button>
          </div>
        </div>
        <input class="input" style="font-size:14px;padding:10px 14px;" type="text" placeholder="Question text..." value="${esc(q.text)}" oninput="updateQ('${q.id}','text',this.value)"/>
      </div>
      <button class="icon-btn" style="color:var(--text3);" onclick="removeQ('${q.id}')">✕</button>
    </div>

    ${q.type === 'mcq' ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-left:44px;">
        ${(q.options||['','','','']).map((opt,oi)=>`
          <div class="mcq-opt">
            <input type="radio" name="correct-${q.id}" ${q.correctOptionIndex===oi?'checked':''} onchange="updateQ('${q.id}','correctOptionIndex',${oi})"/>
            <input class="input" style="font-size:13px;padding:8px 12px;" type="text" value="${esc(opt)}" placeholder="Option ${oi+1}${q.correctOptionIndex===oi?' ✓ correct':''}" oninput="updateQOption('${q.id}',${oi},this.value)"/>
          </div>`).join('')}
        <p style="font-size:11px;color:var(--text3);grid-column:span 2;">Click radio for correct answer.</p>
      </div>` : ''}

    ${q.type === 'true_false' ? `
      <div class="tf-row" style="padding-left:44px;">
        <button class="tf-btn ${q.correctAnswer===true?'selected-true':''}" onclick="updateQ('${q.id}','correctAnswer',true)">✓ True</button>
        <button class="tf-btn ${q.correctAnswer===false?'selected-false':''}" onclick="updateQ('${q.id}','correctAnswer',false)">✗ False</button>
      </div>` : ''}

    ${q.type === 'short_answer' ? `
      <div style="padding-left:44px;">
        <div class="label" style="margin-bottom:6px;">Model Answer (AI reads student answer + this to grade)</div>
        <input class="input" style="font-size:13px;padding:10px 14px;" type="text" placeholder="Expected answer..." value="${esc(q.idealAnswer||'')}" oninput="updateQ('${q.id}','idealAnswer',this.value)"/>
      </div>` : ''}

    ${q.type === 'listing' ? `
      <div style="padding-left:44px;">
        <div class="label" style="margin-bottom:8px;">Expected Items (AI checks student list against these)</div>
        ${(q.listItems||[]).map((item,li)=>`
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:12px;color:var(--text3);width:18px;">${li+1}.</span>
            <input class="input" style="flex:1;font-size:13px;padding:8px 12px;" type="text" value="${esc(item)}" placeholder="Item ${li+1}" oninput="updateQListItem('${q.id}',${li},this.value)"/>
            ${li>0?`<button class="icon-btn" onclick="removeListItem('${q.id}',${li})">✕</button>`:''}
          </div>`).join('')}
        <button class="link-btn" onclick="addListItem('${q.id}')">+ Add item</button>
      </div>` : ''}

    ${q.type === 'essay' ? `
      <div style="padding-left:44px;">
        <div class="label" style="margin-bottom:6px;">Rubric / Key Topics (AI reads student's full essay + this rubric)</div>
        <textarea class="input" style="min-height:80px;font-size:13px;" placeholder="Describe what a good answer should cover..." oninput="updateQ('${q.id}','idealAnswer',this.value)">${esc(q.idealAnswer||'')}</textarea>
      </div>` : ''}
  </div>`;
}

let aiModalType = 'mcq';
function buildAiModal() {
  return `<div id="ai-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);z-index:300;display:none;align-items:center;justify-content:center;padding:20px;">
    <div style="background:var(--surface);border-radius:28px;max-width:520px;width:100%;padding:32px;box-shadow:0 24px 80px rgba(0,0,0,0.25);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h3 style="font-size:20px;font-weight:900;">Generate Questions with AI</h3>
        <button class="modal-close" onclick="closeAiModal()">✕</button>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
        ${['mcq','essay','short_answer','listing','true_false'].map(qt=>`
          <button id="aitype-${qt}" style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid var(--border);background:var(--surface);font-family:Sora,sans-serif;transition:all 0.15s;" onclick="setAiType('${qt}')">${qTypeLabel(qt)}</button>`).join('')}
      </div>
      <div style="margin-bottom:16px;">
        <label class="label">Paste topic, text or content</label>
        <textarea class="input" id="ai-input" style="min-height:120px;" placeholder="Paste your content here, or describe a topic (e.g. 'Photosynthesis in plants')..."></textarea>
      </div>
      <div style="display:flex;gap:12px;">
        <button class="btn btn-ghost" style="flex:1;" onclick="closeAiModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1;" onclick="doAiGenerate()">Generate Questions</button>
      </div>
    </div>
  </div>`;
}

// ── STUDENT JOIN ──
function buildStudentJoin() {
  return `<div class="join-wrap"><div class="card" style="max-width:440px;width:100%;">
    <div style="background:var(--blue);width:64px;height:64px;border-radius:18px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">${svgPlay()}</div>
    <h2 style="text-align:center;font-size:22px;font-weight:900;margin-bottom:24px;">Join Exam Session</h2>
    <div style="display:flex;flex-direction:column;gap:14px;">
      <input class="input" id="s-name" type="text" placeholder="Your Full Name" value="${esc(state.studentName)}"/>
      <input class="input input-mono" id="s-code" type="text" placeholder="XXXXXX" maxlength="6" value="" onkeydown="if(event.key==='Enter')doJoinExam()"/>
      <button class="btn btn-primary btn-full" onclick="doJoinExam()">Join Session</button>
      <button class="link-btn" style="color:var(--text3);text-align:center;" onclick="setView('landing')">Back to Home</button>
    </div>
  </div></div>`;
}

// ── INSTRUCTIONS ──
function buildInstructions() {
  const exam = state.currentExam;
  if (!exam) return '<div>Error: no exam loaded.</div>';
  return `<div class="instr-wrap"><div class="card instr-card">
    <div class="instr-hero">
      <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:1px;">You are about to take</div>
      <h2 style="margin-top:6px;">${esc(exam.title)}</h2>
      <p>Prepared by ${esc(exam.teacherName)}</p>
      <div class="instr-meta">
        <span>${exam.questions.length} Questions</span><span>·</span>
        <span>${exam.durationMinutes} Minutes</span><span>·</span>
        <span>${calcMax(exam.questions)} Total Marks</span>
      </div>
    </div>
    <div class="rules-grid">
      ${[
        {icon:'👁', title:'Stay Focused', desc:'3 look-aways = instant submission.'},
        {icon:'🚫', title:'No Tab Switching', desc:'Leaving the window is a violation.'},
        {icon:'✂️', title:'No Copy/Paste', desc:'Clipboard is completely disabled.'},
        {icon:'📷', title:'Camera Always On', desc:'Your face must be visible at all times.'},
        {icon:'⌨️', title:'No Shortcuts', desc:'Ctrl+C, F12, PrintScreen all disabled.'},
        {icon:'🖱️', title:'No Right-Click', desc:'Context menu is disabled.'},
      ].map(r=>`<div class="rule-item">
        <div class="rule-icon">${r.icon}</div>
        <div><h4>${r.title}</h4><p>${r.desc}</p></div>
      </div>`).join('')}
    </div>
    <div class="warning-box">
      <span style="font-size:20px;flex-shrink:0;">⚠️</span>
      <div>
        <h4 style="font-weight:800;color:var(--red);margin-bottom:4px;">AI Gaze Detection Active</h4>
        <p style="font-size:13px;color:var(--red);line-height:1.5;">The AI continuously monitors where you are looking. <strong>3 look-aways trigger automatic submission</strong>, even if unfinished. Stay looking at the screen at all times.</p>
      </div>
    </div>
    <button class="btn btn-primary btn-full" style="padding:18px;" onclick="setView('student-exam')">
      I Understand — Start Exam →
    </button>
  </div></div>`;
}

// ── STUDENT EXAM ──
function buildStudentExam() {
  const exam = state.currentExam;
  if (!exam) return '<div>Error.</div>';
  if (cameraBlocked) {
    return `<div class="cam-blocked">
      <div style="background:var(--red-light);width:80px;height:80px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:36px;">📷</div>
      <h2 style="font-size:22px;font-weight:900;">Camera Required</h2>
      <p style="color:var(--text2);max-width:340px;">Camera access is required to take this exam. Please allow camera access and try again.</p>
      <button class="btn btn-primary" onclick="retryCam()">Grant Camera Access & Retry</button>
    </div>`;
  }

  const q = exam.questions[state.currentQIdx];
  const progress = ((state.currentQIdx+1)/exam.questions.length)*100;
  const m = Math.floor(state.timeLeft/60);
  const s = state.timeLeft%60;
  const timeStr = `${m}:${s.toString().padStart(2,'0')}`;
  const timeCls = state.timeLeft < 10 ? 'timer-warn' : 'timer-ok';

  return `<div class="exam-layout no-select">
    <!-- Main -->
    <div class="exam-main">
      <div class="exam-topbar">
        <div>
          <div class="q-meta">
            <span class="q-label">Question ${state.currentQIdx+1} of ${exam.questions.length}</span>
            <span class="type-badge type-${q.type==='short_answer'?'short':q.type==='true_false'?'tf':q.type}">${qTypeLabel(q.type)}</span>
            <span style="background:var(--surface2);color:var(--text2);font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;border:1px solid var(--border);">${q.points||1} pt${(q.points||1)>1?'s':''}</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
        </div>
        <div class="${timeCls} timer"><span>⏱</span><span id="timer-display">${timeStr}</span></div>
      </div>

      <div class="q-text">${esc(q.text)}</div>
      ${buildAnswerInput(q)}

      ${q.type === 'essay' ? `
        <div style="margin-top:16px;">
          <button class="btn btn-ghost btn-sm" onclick="getHint()" ${state.isLoadingHint?'disabled':''}>
            💡 ${state.isLoadingHint?'Loading hint...':'Get AI Hint (no score impact)'}
          </button>
          ${state.aiHint ? `<div class="hint-box" style="margin-top:12px;">
            <button style="position:absolute;top:10px;right:10px;background:none;border:none;cursor:pointer;color:var(--amber);font-size:16px;" onclick="state.aiHint=null;renderApp()">✕</button>
            <strong>💡 Hint:</strong> ${esc(state.aiHint)}
          </div>` : ''}
        </div>` : ''}

      ${state.isSubmitting ? `<div class="ai-loading" style="margin-top:20px;"><div class="spinner"></div>AI is grading your answers...</div>` : ''}

      <div class="exam-footer">
        <button class="btn btn-ghost btn-sm" onclick="if(confirm('Submit exam now?'))submitExam()" ${state.isSubmitting?'disabled':''}>
          Submit Early
        </button>
        <button class="btn btn-primary" onclick="nextQuestion()" ${!hasAnswer(q)||state.isSubmitting?'disabled':''}>
          ${state.currentQIdx===exam.questions.length-1?'Finish Exam':'Next Question'} →
        </button>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="exam-sidebar">
      <div class="cam-panel">
        <h3>📷 Live Proctoring</h3>
        <div class="cam-feed">
          <video id="proctor-video" autoplay muted playsinline></video>
          <div class="cam-live"><div class="live-dot"></div>LIVE</div>
        </div>
        <canvas id="proctor-canvas" style="display:none;" width="320" height="240"></canvas>
        <p style="font-size:11px;color:var(--text3);margin-top:8px;">AI monitoring gaze & environment.</p>
      </div>
      <div class="cam-panel">
        <h3>👁 Gaze Monitor</h3>
        <div class="gaze-bars">
          ${[1,2,3].map(i=>`<div class="gaze-bar ${state.gazeViolations>=i?'hit':''}"></div>`).join('')}
        </div>
        <p style="font-size:12px;color:var(--text2);">
          ${state.gazeViolations===0?'No look-aways detected.':state.gazeViolations>=3?'⚠ Max reached!':
          `${state.gazeViolations}/3 — ${3-state.gazeViolations} remaining`}
        </p>
      </div>
      <div class="cam-panel">
        <h3>⚠ Other Violations</h3>
        <div class="viol-bars">
          ${[1,2,3].map(i=>`<div class="viol-bar ${state.otherViolations>=i?'hit':''}"></div>`).join('')}
        </div>
        <p style="font-size:12px;color:var(--text2);">
          ${state.otherViolations===0?'No violations.':
          `${state.otherViolations}/3 — tab switch, copy/paste, shortcuts`}
        </p>
      </div>
    </div>
  </div>`;
}

function buildAnswerInput(q) {
  const ans = state.answers[q.id];
  switch(q.type) {
    case 'mcq': return `<div class="opts-list">
      ${(q.options||[]).map((opt,oi)=>`
        <button class="mcq-opt-btn ${ans===oi?'selected':''}" onclick="setAnswer('${q.id}',${oi})">
          <span>${esc(opt)}</span>
          <div class="mcq-check ${ans===oi?'checked':''}">${ans===oi?'✓':''}</div>
        </button>`).join('')}
    </div>`;
    case 'true_false': return `<div class="tf-row">
      <button class="tf-btn ${ans===true?'selected-true':''}" onclick="setAnswer('${q.id}',true)">✓ True</button>
      <button class="tf-btn ${ans===false?'selected-false':''}" onclick="setAnswer('${q.id}',false)">✗ False</button>
    </div>`;
    case 'short_answer': return `<input class="input" type="text" placeholder="Type your short answer..." value="${esc(ans||'')}" oninput="setAnswer('${q.id}',this.value)" style="font-size:16px;padding:14px 18px;"/>`;
    case 'listing': return `<div>
      <p style="font-size:13px;color:var(--text2);margin-bottom:8px;font-style:italic;">List each item on a new line. AI will check each one.</p>
      <textarea class="input" style="min-height:160px;font-size:15px;line-height:1.8;" placeholder="Item 1&#10;Item 2&#10;Item 3&#10;..." oninput="setAnswer('${q.id}',this.value)">${esc(ans||'')}</textarea>
    </div>`;
    case 'essay': return `<div>
      <p style="font-size:13px;color:var(--text2);margin-bottom:8px;font-style:italic;">Write a detailed answer. AI will read your full essay and grade it.</p>
      <textarea class="input" style="min-height:200px;font-size:15px;line-height:1.7;" placeholder="Type your essay here..." oninput="setAnswer('${q.id}',this.value)">${esc(ans||'')}</textarea>
    </div>`;
  }
  return '';
}

function hasAnswer(q) {
  const a = state.answers[q.id];
  if (a===undefined||a===null||a==='') return false;
  if (q.type==='true_false') return typeof a==='boolean';
  return String(a).trim().length>0;
}

// ── RESULT ──
function buildResult() {
  const sub = state.currentSubmission;
  const exam = state.currentExam;
  if (!sub||!exam) return '<div>Error.</div>';
  const maxScore = sub.maxScore||calcMax(exam.questions);
  const pct = maxScore>0?Math.round((sub.score/maxScore)*100):0;
  const passed = pct>=50;
  return `<div class="result-wrap"><div class="card result-card">
    <div class="result-icon" style="background:${passed?'var(--blue)':'var(--red-light)'};">
      <span style="font-size:36px;">${passed?'🏆':'📋'}</span>
    </div>
    <h2 style="font-size:28px;font-weight:900;letter-spacing:-1px;">Exam Completed!</h2>
    <p style="color:var(--text2);margin-top:4px;">Well done, ${esc(state.studentName)}.</p>
    <div class="result-scores">
      <div class="result-score-item">
        <div class="result-score-val" style="color:var(--blue);">${sub.score}</div>
        <div class="result-score-label">Score</div>
      </div>
      <div class="result-score-item" style="border-left:1px solid var(--border);border-right:1px solid var(--border);">
        <div class="result-score-val">${maxScore}</div>
        <div class="result-score-label">Max</div>
      </div>
      <div class="result-score-item">
        <div class="result-score-val" style="color:${passed?'var(--green)':'var(--red)'};">${pct}%</div>
        <div class="result-score-label">Grade</div>
      </div>
    </div>
    <span class="pass-badge ${passed?'pass-yes':'pass-no'}">${passed?'✓ PASSED':'✗ DID NOT PASS'}</span>
    <div style="text-align:left;background:var(--surface2);border-radius:var(--radius);padding:16px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);">
        <span style="font-size:13px;color:var(--text2);">Gaze violations:</span>
        <span style="font-weight:700;color:${state.gazeViolations>0?'var(--red)':'var(--green)'};">${state.gazeViolations}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;">
        <span style="font-size:13px;color:var(--text2);">Other violations:</span>
        <span style="font-weight:700;color:${state.otherViolations>0?'var(--red)':'var(--green)'};">${state.otherViolations}</span>
      </div>
    </div>
    <button class="btn btn-primary btn-full" onclick="removeExamGuards();stopProctoring();setView('landing');">Return to Home</button>
  </div></div>`;
}

// ── MODALS ──
function buildModal() {
  if (!state.selectedSubmission) return '';
  const sub = state.selectedSubmission;
  const exam = state.exams.find(e=>e.id===sub.examId);
  const myViols = state.violations.filter(v=>v.submissionId===sub.id);
  return `<div class="modal-overlay" onclick="if(event.target===this)closeSubModal()">
    <div class="modal">
      <div class="sub-hero">
        <div>
          <div style="font-size:22px;font-weight:900;">${esc(sub.studentName)}</div>
          <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:2px;">${esc(exam?.title||'?')}</div>
        </div>
        <button style="background:rgba(255,255,255,0.2);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:18px;" onclick="closeSubModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="sub-scores">
          <div class="sub-score-box"><div class="sub-score-val" style="color:var(--blue);">${sub.score}/${sub.maxScore||0}</div><div class="sub-score-label">Score</div></div>
          <div class="sub-score-box"><div class="sub-score-val" style="color:${sub.violations>0?'var(--red)':'var(--green)'};">${sub.violations||0}</div><div class="sub-score-label">Violations</div></div>
          <div class="sub-score-box"><div class="sub-score-val" style="font-size:14px;font-weight:800;">${sub.status}</div><div class="sub-score-label">Status</div></div>
        </div>

        ${sub.aiEvaluations && Object.keys(sub.aiEvaluations).length > 0 ? `
          <h4 style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">AI Evaluations</h4>
          ${Object.entries(sub.aiEvaluations).map(([qId,ev])=>{
            const q = exam?.questions.find(q=>q.id===qId);
            return `<div class="ai-eval-card">
              <h4>${esc(q?.text||'Question')}</h4>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <span style="background:var(--surface);border-radius:6px;padding:4px 10px;font-size:12px;font-weight:800;color:var(--blue);">Score: ${ev.score}/${ev.maxScore}</span>
                <span style="background:var(--surface);border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;color:var(--text2);">${q?.type||''}</span>
              </div>
              <p class="ai-feedback">${esc(ev.feedback||'')}</p>
              <div class="student-ans"><strong>Student's Answer:</strong> ${esc(sub.answers?.[qId]||'No answer provided')}</div>
            </div>`;
          }).join('')}` : ''}

        <h4 style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:16px 0 12px;">Violation History</h4>
        ${myViols.length===0?`<div style="text-align:center;padding:20px;color:var(--text3);font-style:italic;">No violations recorded.</div>`:
        myViols.map((v,i)=>`<div style="background:var(--surface2);border-radius:var(--radius);overflow:hidden;margin-bottom:10px;">
          <div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <div style="font-weight:700;color:var(--red);font-size:13px;">#${i+1}: ${esc(v.reason)} ${v.isGaze?'👁':''}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px;">${new Date(v.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
          ${v.screenshot?`<div style="padding:0 16px 14px;"><img src="data:image/jpeg;base64,${v.screenshot}" style="width:100%;max-width:280px;border-radius:8px;border:1px solid var(--border);"/></div>`:''}
        </div>`).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary btn-full" onclick="closeSubModal()">Close</button>
      </div>
    </div>
  </div>`;
}

// ─── Session Code Modal ───
function showCodeModal(code, examId) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">
    <div class="modal-header"><h2>🎉 Exam Published!</h2><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button></div>
    <div class="modal-body">
      <p style="color:var(--text2);font-size:14px;">Share this code with your students.</p>
      <div class="code-display">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:8px;">Session Code</div>
        <div class="code-big">${code}</div>
        <button style="position:absolute;top:12px;right:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:6px 10px;cursor:pointer;font-size:12px;" onclick="navigator.clipboard.writeText('${code}');toast('Code copied!','success')">📋 Copy</button>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary btn-full" onclick="this.closest('.modal-overlay').remove();setView('teacher-dashboard')">Go to Dashboard</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

// ═══════════════════════════════════════════
// BIND EVENTS
// ═══════════════════════════════════════════
function bindEvents() {
  // Bind register form changes
  const rname = document.getElementById('reg-name');
  if (rname) {
    rname.addEventListener('input', e => state.regForm.name = e.target.value);
    document.getElementById('reg-email').addEventListener('input', e => state.regForm.email = e.target.value);
    document.getElementById('reg-password').addEventListener('input', e => state.regForm.password = e.target.value);
    const rs = document.getElementById('reg-school');
    if (rs) rs.addEventListener('input', e => state.regForm.school = e.target.value);
  }
}

// ═══════════════════════════════════════════
// ACTION HANDLERS (called from HTML)
// ═══════════════════════════════════════════
window.goHome = () => { stopProctoring(); removeExamGuards(); state.aiHint=null; state.authError=''; setView('landing'); };
window.doLogout = () => { state.currentTeacher=null; save(); setView('landing'); toast('Logged out','info'); };

window.doRegister = () => {
  const err = registerTeacher(state.regForm);
  if (err) { state.authError=err; renderApp(); return; }
  state.authError=''; state.regForm={name:'',email:'',password:'',school:'',subjects:['']};
  toast(`Welcome, ${state.currentTeacher.name}!`,'success');
  setView('teacher-dashboard');
};

window.doLogin = () => {
  const email = document.getElementById('login-email')?.value||'';
  const password = document.getElementById('login-password')?.value||'';
  state.loginForm = {email, password};
  const err = loginTeacher(email, password);
  if (err) { state.authError=err; renderApp(); return; }
  state.authError='';
  toast(`Welcome back, ${state.currentTeacher.name}!`,'success');
  setView('teacher-dashboard');
};

window.addSubject = () => { state.regForm.subjects.push(''); renderApp(); };
window.removeSubject = (i) => { state.regForm.subjects.splice(i,1); renderApp(); };
window.updateSubject = (i,v) => state.regForm.subjects[i]=v;

window.addManualQuestion = (type) => {
  const q = { id:genId(), type, text:'', points: type==='essay'?10:type==='listing'?3:1 };
  if (type==='mcq') { q.options=['','','','']; q.correctOptionIndex=0; }
  if (type==='true_false') q.correctAnswer=true;
  if (['short_answer','essay'].includes(type)) q.idealAnswer='';
  if (type==='listing') { q.listItems=['','','']; }
  pendingExam.questions.push(q);
  renderApp();
};

window.removeQ = (id) => { pendingExam.questions=pendingExam.questions.filter(q=>q.id!==id); renderApp(); };
window.updateQ = (id,key,val) => { const q=pendingExam.questions.find(q=>q.id===id); if(q) q[key]=val; };
window.updateQOption = (id,oi,val) => { const q=pendingExam.questions.find(q=>q.id===id); if(q&&q.options) q.options[oi]=val; };
window.updateQListItem = (id,li,val) => { const q=pendingExam.questions.find(q=>q.id===id); if(q&&q.listItems) q.listItems[li]=val; };
window.adjustPts = (id,delta) => { const q=pendingExam.questions.find(q=>q.id===id); if(q) { q.points=Math.max(1,(q.points||1)+delta); renderApp(); } };
window.addListItem = (id) => { const q=pendingExam.questions.find(q=>q.id===id); if(q) { q.listItems.push(''); q.points=(q.listItems.length); renderApp(); } };
window.removeListItem = (id,li) => { const q=pendingExam.questions.find(q=>q.id===id); if(q) { q.listItems.splice(li,1); q.points=q.listItems.length||1; renderApp(); } };
window.toggleAddMenu = () => { const m=document.getElementById('add-menu'); if(m) m.style.display=m.style.display==='none'||!m.style.display?'block':'none'; };
window.openAiModal = (type) => { aiModalType=type; const m=document.getElementById('ai-modal'); if(m){m.style.display='flex';} setActiveAiType(type); };
window.closeAiModal = () => { const m=document.getElementById('ai-modal'); if(m) m.style.display='none'; };
window.setAiType = (type) => { aiModalType=type; setActiveAiType(type); };
function setActiveAiType(type) {
  ['mcq','essay','short_answer','listing','true_false'].forEach(t=>{
    const btn=document.getElementById(`aitype-${t}`);
    if(btn) {
      btn.style.background=t===type?'var(--blue)':'var(--surface)';
      btn.style.color=t===type?'#fff':'inherit';
      btn.style.borderColor=t===type?'var(--blue)':'var(--border)';
    }
  });
}

window.doAiGenerate = async () => {
  const input=document.getElementById('ai-input')?.value?.trim();
  if(!input){toast('Please enter some content','error');return;}
  window.closeAiModal();
  state.aiGenerating=true; renderApp();
  try {
    const generated=await aiGenerateQuestions(input, aiModalType);
    pendingExam.questions.push(...generated);
    toast(`Generated ${generated.length} ${qTypeLabel(aiModalType)} questions!`,'success');
  } catch(e) {
    console.error(e);
    toast('AI generation failed. Check your connection or try again.','error');
  } finally {
    state.aiGenerating=false; renderApp();
  }
};

window.finalizeExam = async () => {
  const title = document.getElementById('exam-title')?.value?.trim()||pendingExam.title.trim();
  const dur = parseInt(document.getElementById('exam-duration')?.value)||pendingExam.duration;
  if(!title||pendingExam.questions.length===0){toast('Add title and questions first','error');return;}
  const {id,code}=createExam({title,durationMinutes:dur,questions:pendingExam.questions,type:'mixed',cameraRequired:true});
  pendingExam={title:'',duration:60,questions:[]};
  showCodeModal(code,id);
};

window.doJoinExam = () => {
  const name=document.getElementById('s-name')?.value?.trim()||'';
  const code=document.getElementById('s-code')?.value?.trim().toUpperCase()||'';
  if(!name||!code){toast('Enter your name and session code','error');return;}
  const exam=state.exams.find(e=>e.sessionCode===code);
  if(!exam){toast('Invalid session code. Please check and try again.','error');return;}
  state.studentName=name;
  state.currentExam=exam;
  state.currentQIdx=0;
  state.answers={};
  state.gazeViolations=0;
  state.otherViolations=0;
  isSubmittingFlag=false;
  state.aiHint=null;
  // Create submission
  const sub={id:genId(),examId:exam.id,examTeacherId:exam.teacherId,studentName:name,answers:{},violations:0,status:'in-progress',score:0,maxScore:calcMax(exam.questions),createdAt:Date.now()};
  state.submissions.push(sub);
  state.currentSubmission=sub;
  save();
  setView('student-instructions');
};

window.setAnswer = (qId,val) => { state.answers[qId]=val; };
window.nextQuestion = () => {
  const exam=state.currentExam;
  if(!exam)return;
  const q=exam.questions[state.currentQIdx];
  if(!hasAnswer(q)){toast('Please answer this question first','warn');return;}
  advanceQuestion();
};
window.submitExam = submitExam;
window.retryCam = () => { cameraBlocked=false; startProctoring(); };
window.getHint = async () => {
  const exam=state.currentExam;
  if(!exam)return;
  const q=exam.questions[state.currentQIdx];
  state.isLoadingHint=true; renderApp();
  try {
    const hint=await aiGetHint(q.text, state.answers[q.id]||'');
    state.aiHint=hint;
  } catch { state.aiHint='Could not load hint. Please try again.'; }
  state.isLoadingHint=false; renderApp();
};

window.viewSubmission = (id) => {
  state.selectedSubmission=state.submissions.find(s=>s.id===id)||null;
  renderApp();
};
window.closeSubModal = () => { state.selectedSubmission=null; renderApp(); };
window.copyCode = (code) => { navigator.clipboard.writeText(code); toast('Code copied!','success'); };
window.downloadResults = (examId) => {
  const exam=state.exams.find(e=>e.id===examId);
  const subs=state.submissions.filter(s=>s.examId===examId);
  if(!exam||subs.length===0){toast('No submissions yet','info');return;}
  const headers=['Student','Score','Max','%','Violations','Status'];
  const rows=subs.map(s=>[s.studentName,s.score,s.maxScore||0,s.maxScore?Math.round(s.score/s.maxScore*100):0,s.violations||0,s.status]);
  const csv=[headers,...rows].map(r=>r.join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=`results_${exam.title.replace(/\s+/g,'_')}.csv`;
  a.click();
  toast('Results downloaded!','success');
};
window.clearAllData = () => {
  if(!confirm('Delete ALL exams, submissions and violations? This cannot be undone.'))return;
  state.exams=[];state.submissions=[];state.violations=[];
  localStorage.removeItem('rmi_exams');localStorage.removeItem('rmi_submissions');localStorage.removeItem('rmi_violations');
  toast('All data cleared','success');
  renderApp();
};

// ═══════════════════════════════════════════
// ICON SVGs
// ═══════════════════════════════════════════
function svgShield(){return`<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4 6v6c0 5.5 3.6 10.7 8 12 4.4-1.3 8-6.5 8-12V6l-8-4z"/></svg>`;}
function svgUser(){return`<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;}
function svgBook(){return`<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;}
function svgAlert(){return`<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;}
function svgPlay(){return`<svg width="28" height="28" fill="white" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;}
function svgUserPlus(){return`<svg width="24" height="24" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`;}

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
function esc(s){if(!s&&s!==0)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function qTypeLabel(t){const m={mcq:'Multiple Choice',essay:'Essay',short_answer:'Short Answer',listing:'Listing',true_false:'True / False'};return m[t]||t;}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
// Auto-login if session exists
if (state.currentTeacher) state.view = 'teacher-dashboard';

renderApp();

// Close add-menu on outside click
document.addEventListener('click', e => {
  const menu = document.getElementById('add-menu');
  if (menu && !e.target.closest('[onclick*="toggleAddMenu"]') && !e.target.closest('#add-menu')) {
    menu.style.display = 'none';
  }
});
</script>
</body>
</html>
