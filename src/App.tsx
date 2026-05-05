<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>RMI & Mifotra — Examination Platform</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
:root {
  --bg: #F4F5FA;
  --surface: #FFFFFF;
  --surface2: #F8F9FC;
  --border: #E3E6F0;
  --blue: #2563EB;
  --blue-dk: #1D4ED8;
  --blue-lt: #EFF4FF;
  --gold: #F59E0B;
  --green: #059669;
  --green-lt: #ECFDF5;
  --red: #DC2626;
  --red-lt: #FEF2F2;
  --amber: #D97706;
  --amber-lt: #FFFBEB;
  --purple: #7C3AED;
  --purple-lt: #F5F3FF;
  --text: #0F172A;
  --text2: #475569;
  --text3: #94A3B8;
  --r: 14px;
  --r-lg: 20px;
  --sh: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(37,99,235,.07);
  --sh-lg: 0 8px 40px rgba(37,99,235,.14);
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
.mono{font-family:'DM Mono',monospace;}

/* Nav */
nav{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;box-shadow:0 1px 8px rgba(0,0,0,.04);}
.brand{display:flex;align-items:center;gap:10px;cursor:pointer;}
.brand-logo{width:36px;height:36px;background:var(--blue);border-radius:10px;display:flex;align-items:center;justify-content:center;}
.brand-logo svg{color:#fff;}
.brand-name{font-weight:800;font-size:17px;letter-spacing:-.3px;}
.brand-name span{color:var(--blue);}
main{max-width:1080px;margin:0 auto;padding:28px 24px;width:100%;}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:var(--r);font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;cursor:pointer;border:none;transition:all .16s;text-decoration:none;}
.btn:disabled{opacity:.45;cursor:not-allowed;}
.btn-primary{background:var(--blue);color:#fff;box-shadow:0 2px 8px rgba(37,99,235,.3);}
.btn-primary:hover:not(:disabled){background:var(--blue-dk);transform:translateY(-1px);box-shadow:0 4px 16px rgba(37,99,235,.4);}
.btn-ghost{background:transparent;color:var(--text2);border:1.5px solid var(--border);}
.btn-ghost:hover:not(:disabled){background:var(--surface2);}
.btn-green{background:var(--green);color:#fff;}
.btn-green:hover:not(:disabled){background:#047857;}
.btn-red{background:var(--red-lt);color:var(--red);border:1px solid #FCA5A5;}
.btn-red:hover:not(:disabled){background:#FEE2E2;}
.btn-sm{padding:7px 14px;font-size:12px;border-radius:10px;}
.btn-full{width:100%;justify-content:center;}

/* Inputs */
.inp{width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:var(--r);font-family:'DM Sans',sans-serif;font-size:14px;background:var(--surface);color:var(--text);outline:none;transition:border .14s,box-shadow .14s;}
.inp:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1);}
textarea.inp{resize:vertical;min-height:90px;line-height:1.6;}
.lbl{font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px;display:block;}
.fg{display:flex;flex-direction:column;gap:3px;}

/* Cards */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:28px;box-shadow:var(--sh);}

/* Landing */
.landing{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:72vh;gap:36px;text-align:center;}
.landing h1{font-size:48px;font-weight:800;letter-spacing:-1.5px;line-height:1.08;}
.landing h1 span{color:var(--blue);}
.landing p{color:var(--text2);font-size:17px;max-width:440px;line-height:1.6;}
.role-cards{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:520px;width:100%;}
.role-card{background:var(--surface);border:2px solid var(--border);border-radius:var(--r-lg);padding:32px 20px;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:10px;}
.role-card:hover{border-color:var(--blue);box-shadow:var(--sh-lg);transform:translateY(-2px);}
.role-icon{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;}
.role-card h3{font-size:17px;font-weight:800;}
.role-card p{font-size:12px;color:var(--text2);text-align:center;}

/* Auth */
.auth-wrap{display:flex;align-items:center;justify-content:center;min-height:72vh;}
.auth-card{width:100%;max-width:420px;}
.auth-icon{width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;}

/* Msgs */
.err{background:var(--red-lt);color:var(--red);padding:10px 14px;border-radius:var(--r);font-size:13px;font-weight:600;border:1px solid #FCA5A5;}
.suc{background:var(--green-lt);color:var(--green);padding:10px 14px;border-radius:var(--r);font-size:13px;font-weight:600;}
.info-box{background:var(--blue-lt);border:1px solid #BFDBFE;border-radius:var(--r);padding:12px 16px;font-size:13px;color:var(--blue-dk);font-weight:500;}
.warn-box{background:var(--amber-lt);border:1px solid #FDE68A;border-radius:var(--r);padding:14px 16px;display:flex;gap:10px;align-items:flex-start;}

/* Dashboard */
.dash-hdr{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;margin-bottom:28px;}
.dash-hdr h1{font-size:26px;font-weight:800;letter-spacing:-.5px;}
.dash-hdr p{color:var(--text2);font-size:13px;margin-top:3px;}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:28px;}
.stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:18px;}
.stat-icon{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;font-size:18px;}
.stat-val{font-size:26px;font-weight:800;}
.stat-lbl{font-size:11px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.6px;}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:20px;}
.panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;}
.ph{padding:18px 22px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;}
.ph h3{font-size:14px;font-weight:800;}
.pb{max-height:340px;overflow-y:auto;}
.exam-row{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;border-bottom:1px solid var(--surface2);transition:background .1s;}
.exam-row:hover{background:var(--surface2);}
.exam-row:last-child{border-bottom:none;}
.exam-row h4{font-size:13px;font-weight:700;}
.exam-row span{font-size:11px;color:var(--text3);}
.live-badge{font-size:10px;font-weight:800;color:var(--red);display:flex;align-items:center;gap:4px;text-transform:uppercase;letter-spacing:1px;}
.live-dot{width:7px;height:7px;background:var(--red);border-radius:50%;animation:pulse 1.5s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.vrow{padding:11px 18px;border-bottom:1px solid var(--surface2);}
.vrow:last-child{border-bottom:none;}
.vrow .vname{font-size:12px;font-weight:700;}
.vrow .vreason{font-size:11px;color:var(--red);font-weight:600;margin-top:2px;}
.vrow img{width:80px;height:56px;object-fit:cover;border-radius:7px;margin-top:6px;border:1px solid var(--border);}

/* Table */
.tbl-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;}
table{width:100%;border-collapse:collapse;}
th{padding:12px 16px;text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.9px;color:var(--text3);background:var(--surface2);}
td{padding:12px 16px;font-size:13px;border-top:1px solid var(--border);}
tr:hover td{background:var(--surface2);}
.pill{display:inline-block;padding:3px 9px;border-radius:6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;}
.pill-blue{background:var(--blue-lt);color:var(--blue);}
.pill-amber{background:var(--amber-lt);color:var(--amber);}
.pill-green{background:var(--green-lt);color:var(--green);}
.pill-red{background:var(--red-lt);color:var(--red);}
.pill-purple{background:var(--purple-lt);color:var(--purple);}

/* Create Exam */
.create-wrap{max-width:820px;margin:0 auto;}
.step-bar{display:flex;align-items:center;gap:0;margin-bottom:32px;}
.step{display:flex;align-items:center;gap:8px;flex:1;}
.step-num{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;border:2px solid var(--border);background:var(--surface);color:var(--text3);}
.step.active .step-num{background:var(--blue);color:#fff;border-color:var(--blue);}
.step.done .step-num{background:var(--green);color:#fff;border-color:var(--green);}
.step-lbl{font-size:12px;font-weight:700;color:var(--text3);}
.step.active .step-lbl{color:var(--blue);}
.step.done .step-lbl{color:var(--green);}
.step-line{flex:1;height:2px;background:var(--border);margin:0 8px;}
.step-line.done{background:var(--green);}

/* Upload zone */
.upload-zone{border:2px dashed var(--border);border-radius:var(--r-lg);padding:48px 24px;text-align:center;cursor:pointer;transition:all .18s;background:var(--surface2);}
.upload-zone:hover,.upload-zone.dragover{border-color:var(--blue);background:var(--blue-lt);}
.upload-zone .uz-icon{font-size:40px;margin-bottom:12px;}
.upload-zone h3{font-size:16px;font-weight:800;margin-bottom:6px;}
.upload-zone p{font-size:13px;color:var(--text2);}
.upload-zone input{display:none;}

/* Format config */
.format-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.format-card{background:var(--surface2);border:2px solid var(--border);border-radius:var(--r);padding:18px;cursor:pointer;transition:all .15s;}
.format-card.sel{border-color:var(--blue);background:var(--blue-lt);}
.format-card h4{font-size:13px;font-weight:800;margin-bottom:3px;}
.format-card p{font-size:11px;color:var(--text2);}
.qtype-row{display:flex;align-items:center;justify-content:space-between;background:var(--surface2);border-radius:var(--r);padding:14px 16px;margin-bottom:8px;}
.qtype-row h4{font-size:13px;font-weight:700;}
.qtype-row p{font-size:11px;color:var(--text2);}
.num-ctrl{display:flex;align-items:center;gap:8px;}
.num-ctrl button{width:28px;height:28px;border-radius:7px;border:1.5px solid var(--border);background:var(--surface);cursor:pointer;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;transition:all .12s;}
.num-ctrl button:hover{border-color:var(--blue);color:var(--blue);}
.num-ctrl span{font-size:14px;font-weight:800;min-width:28px;text-align:center;}
.q-preview{background:var(--surface2);border-radius:var(--r);padding:14px 16px;margin-bottom:8px;border-left:3px solid var(--blue);}
.q-preview h4{font-size:13px;font-weight:700;margin-bottom:4px;}
.q-preview p{font-size:12px;color:var(--text2);}
.q-preview .ans{font-size:11px;color:var(--green);font-weight:600;margin-top:4px;}

/* Exam link display */
.link-display{background:var(--surface2);border:1.5px dashed var(--border);border-radius:var(--r);padding:20px;text-align:center;position:relative;}
.link-url{font-family:'DM Mono',monospace;font-size:13px;color:var(--blue);word-break:break-all;font-weight:500;}

/* Student waiting */
.wait-wrap{display:flex;align-items:center;justify-content:center;min-height:72vh;}
.wait-card{max-width:460px;width:100%;text-align:center;}
.wait-pulse{width:80px;height:80px;border-radius:24px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:36px;animation:bob 2s ease-in-out infinite;}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

/* Exam layout */
.exam-layout{display:grid;grid-template-columns:1fr 300px;gap:20px;}
.exam-main{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:26px;}
.exam-topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;}
.q-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.qlbl{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.7px;}
.progress-bar{width:120px;height:5px;background:var(--border);border-radius:99px;overflow:hidden;margin-top:5px;}
.progress-fill{height:100%;background:var(--blue);border-radius:99px;transition:width .4s;}
.timer{display:flex;align-items:center;gap:7px;font-family:'DM Mono',monospace;font-weight:500;font-size:17px;padding:7px 14px;border-radius:10px;}
.timer-ok{background:var(--surface2);color:var(--text);}
.timer-warn{background:var(--red-lt);color:var(--red);animation:pulse 1s infinite;}
.q-text{font-size:20px;font-weight:700;line-height:1.45;margin-bottom:22px;letter-spacing:-.3px;}
.mcq-btn{display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 18px;border-radius:11px;border:2px solid var(--border);background:var(--surface);cursor:pointer;transition:all .14s;font-size:14px;font-weight:600;text-align:left;margin-bottom:8px;}
.mcq-btn:hover{border-color:var(--blue);background:var(--blue-lt);}
.mcq-btn.sel{border-color:var(--blue);background:var(--blue-lt);color:var(--blue-dk);}
.mcq-check{width:22px;height:22px;border-radius:50%;border:2px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;}
.mcq-check.chk{background:var(--blue);border-color:var(--blue);color:#fff;}
.tf-row{display:flex;gap:10px;}
.tf-btn{flex:1;padding:14px;border-radius:11px;font-weight:800;font-size:15px;cursor:pointer;border:2px solid var(--border);background:var(--surface);transition:all .14s;}
.tf-btn.sel-t{border-color:var(--green);background:var(--green-lt);color:var(--green);}
.tf-btn.sel-f{border-color:var(--red);background:var(--red-lt);color:var(--red);}
.exam-footer{display:flex;justify-content:space-between;align-items:center;margin-top:24px;padding-top:18px;border-top:1px solid var(--border);}
.hint-box{background:var(--amber-lt);border:1px solid #FDE68A;border-radius:var(--r);padding:12px 14px;font-size:13px;color:var(--amber);margin-top:10px;}
/* Sidebar */
.exam-sidebar{display:flex;flex-direction:column;gap:14px;}
.side-panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:18px;}
.side-panel h3{font-size:13px;font-weight:800;margin-bottom:11px;}
.cam-feed{aspect-ratio:4/3;background:#0F172A;border-radius:10px;overflow:hidden;position:relative;}
.cam-feed video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1);}
.cam-live{position:absolute;top:7px;right:7px;background:rgba(0,0,0,.55);backdrop-filter:blur(3px);display:flex;align-items:center;gap:4px;padding:3px 7px;border-radius:5px;font-size:10px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.8px;}
.viol-bars{display:flex;gap:5px;margin:9px 0;}
.viol-bar{flex:1;height:7px;border-radius:4px;background:var(--border);transition:background .4s;}
.viol-bar.hit-r{background:var(--red);}
.viol-bar.hit-a{background:var(--amber);}

/* Result */
.result-wrap{display:flex;align-items:center;justify-content:center;min-height:72vh;}
.result-card{max-width:500px;width:100%;text-align:center;}
.result-scores{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;background:var(--surface2);border-radius:var(--r);padding:20px;margin:18px 0;}
.rs-item{text-align:center;}
.rs-val{font-size:32px;font-weight:800;line-height:1;}
.rs-lbl{font-size:10px;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.7px;margin-top:3px;}
.pass-badge{display:inline-block;padding:6px 18px;border-radius:99px;font-weight:800;font-size:12px;margin-bottom:18px;}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;padding:18px;}
.modal{background:var(--surface);border-radius:24px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 20px 72px rgba(0,0,0,.22);}
.mh{padding:24px 24px 0;display:flex;justify-content:space-between;align-items:flex-start;}
.mh h2{font-size:20px;font-weight:800;}
.mb{padding:20px 24px;}
.mf{padding:0 24px 24px;display:flex;gap:10px;}
.mclose{background:var(--surface2);border:none;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:17px;display:flex;align-items:center;justify-content:center;color:var(--text2);}

/* Toast */
#toast-container{position:fixed;top:76px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;}
.toast{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 16px;font-size:13px;font-weight:600;box-shadow:var(--sh-lg);max-width:320px;display:flex;align-items:center;gap:9px;animation:slideIn .25s ease;pointer-events:all;}
.toast-success{border-left:4px solid var(--green);}
.toast-error{border-left:4px solid var(--red);}
.toast-warn{border-left:4px solid var(--gold);}
.toast-info{border-left:4px solid var(--blue);}
.toast-loading{border-left:4px solid var(--text3);}
@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}

/* Spinner */
.spin{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--blue);border-radius:50%;animation:spinA .7s linear infinite;flex-shrink:0;}
@keyframes spinA{to{transform:rotate(360deg)}}
.ai-loading{background:var(--blue-lt);border:1px solid #BFDBFE;border-radius:var(--r);padding:12px 16px;display:flex;align-items:center;gap:10px;font-size:13px;color:var(--blue-dk);font-weight:600;}

/* Cam blocked */
.cam-blocked{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;text-align:center;gap:14px;}

/* Icons */
.icon-btn{background:transparent;border:none;cursor:pointer;padding:7px;border-radius:7px;color:var(--text3);transition:all .14s;display:flex;align-items:center;}
.icon-btn:hover{background:var(--surface2);color:var(--text);}
.link-btn{background:none;border:none;cursor:pointer;color:var(--blue);font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;text-decoration:underline;}
.divider{border:none;border-top:1px solid var(--border);margin:6px 0;}

/* Teacher exam manager */
.exam-manage-row{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);}
.exam-manage-row:last-child{border-bottom:none;}
.exam-manage-row:hover{background:var(--surface2);}
.status-active{background:var(--green-lt);color:var(--green);}
.status-waiting{background:var(--amber-lt);color:var(--amber);}

/* AI topic modal */
.tab-row{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;}
.tab-btn{padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:1.5px solid var(--border);background:var(--surface);font-family:'DM Sans',sans-serif;transition:all .14s;}
.tab-btn.active{background:var(--blue);color:#fff;border-color:var(--blue);}

/* Instructions */
.instr-wrap{display:flex;align-items:center;justify-content:center;min-height:72vh;}
.instr-card{max-width:640px;width:100%;}
.instr-hero{background:var(--blue);color:#fff;border-radius:var(--r);padding:24px;text-align:center;margin-bottom:20px;}
.instr-hero h2{font-size:20px;font-weight:800;}
.instr-hero p{color:rgba(255,255,255,.7);font-size:13px;margin-top:3px;}
.instr-meta{display:flex;justify-content:center;gap:18px;margin-top:10px;font-size:12px;color:rgba(255,255,255,.8);flex-wrap:wrap;}
.rules{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;}
.rule{background:var(--surface2);border-radius:var(--r);padding:14px;display:flex;gap:10px;}
.rule-icon{width:32px;height:32px;border-radius:9px;background:var(--surface);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;}
.rule h4{font-size:12px;font-weight:800;}
.rule p{font-size:11px;color:var(--text2);margin-top:2px;}

/* No select */
.no-sel{user-select:none;-webkit-user-select:none;}

/* Scrollbar */
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}

/* AI eval card */
.ai-eval-card{background:var(--blue-lt);border:1px solid #BFDBFE;border-radius:var(--r);padding:14px;margin-bottom:10px;}
.ai-eval-card h4{font-size:12px;font-weight:700;margin-bottom:7px;}
.ai-feedback{font-size:12px;color:var(--blue-dk);font-style:italic;margin-top:5px;}
.student-ans{font-size:12px;color:var(--text2);background:rgba(255,255,255,.7);padding:7px 10px;border-radius:7px;margin-top:7px;}

@media(max-width:768px){
  main{padding:16px;}
  .role-cards{grid-template-columns:1fr;}
  .landing h1{font-size:32px;}
  .stats{grid-template-columns:1fr;}
  .two-col{grid-template-columns:1fr;}
  .exam-layout{grid-template-columns:1fr;}
  .rules{grid-template-columns:1fr;}
  .format-grid{grid-template-columns:1fr;}
  .result-scores{grid-template-columns:1fr;}
}
</style>
</head>
<body>
<div id="toast-container"></div>
<div id="app"></div>

<script>
// ═══════════════ STATE ═══════════════
let S = {
  view: 'landing',
  teachers: JSON.parse(localStorage.getItem('_t')||'{}'),
  currentTeacher: JSON.parse(localStorage.getItem('_ct')||'null'),
  exams: JSON.parse(localStorage.getItem('_ex')||'[]'),
  submissions: JSON.parse(localStorage.getItem('_su')||'[]'),
  violations: JSON.parse(localStorage.getItem('_vi')||'[]'),
  // Exam creation
  createStep: 1,
  pendingExam: null,
  uploadedContent: '',
  uploadedFileName: '',
  generatedQA: [],
  examFormat: { mcq:5, essay:2, short:3, tf:3, listing:2, marksPerMCQ:1, marksPerEssay:10, marksPerShort:3, marksPerTF:1, marksPerListing:3, totalDuration:60, answerStyle:'' },
  // Auth
  authError: '',
  regForm: {name:'',email:'',password:'',school:'',subjects:['']},
  loginForm: {email:'',password:''},
  // Student
  studentName: '',
  currentExam: null,
  currentSub: null,
  waitingExamId: null,
  waitPollInterval: null,
  // Exam progress
  currentQIdx: 0,
  answers: {},
  timeLeft: 0,
  gazeViols: 0,
  otherViols: 0,
  isSubmitting: false,
  aiHint: null,
  isLoadingHint: false,
  // UI
  selectedSub: null,
  aiGenerating: false,
  activeModal: null,
  topicInput: '',
  topicQType: 'mcq',
};

let videoEl=null, canvasEl=null, mediaStream=null;
let timerInterval=null, proctoringInterval=null;
let isSubmittingFlag=false, cameraBlocked=false;

// ═══════════════ PERSIST ═══════════════
function save(){
  localStorage.setItem('_t',JSON.stringify(S.teachers));
  localStorage.setItem('_ct',JSON.stringify(S.currentTeacher));
  localStorage.setItem('_ex',JSON.stringify(S.exams));
  localStorage.setItem('_su',JSON.stringify(S.submissions));
  localStorage.setItem('_vi',JSON.stringify(S.violations));
}

// ═══════════════ TOAST ═══════════════
function toast(msg,type='info',dur=4000){
  const ic={success:'✅',error:'❌',warn:'⚠️',info:'ℹ️',loading:'⏳'};
  const c=document.getElementById('toast-container');
  const t=document.createElement('div');
  t.className=`toast toast-${type}`;
  t.innerHTML=`<span>${ic[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  if(dur>0)setTimeout(()=>t.remove(),dur);
  return t;
}

// ═══════════════ HELPERS ═══════════════
function genId(){return Math.random().toString(36).substring(2,11);}
function esc(s){if(!s&&s!==0)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function calcMax(qs){return qs.reduce((a,q)=>a+(q.points||1),0);}
function qLabel(t){return{mcq:'Multiple Choice',essay:'Essay',short_answer:'Short Answer',listing:'Listing',true_false:'True / False'}[t]||t;}
function badgeCls(t){return{mcq:'pill-blue',essay:'pill-red',short_answer:'pill-purple',listing:'pill-amber',true_false:'pill-green'}[t]||'pill-blue';}
function getExamLink(examId){return window.location.href.split('?')[0]+'?exam='+examId;}
function getExamIdFromURL(){return new URLSearchParams(window.location.search).get('exam');}

// ═══════════════ AI ═══════════════
async function callAI(prompt,sys,jsonMode=false){
  const r=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,
      system:sys||'You are an expert educational AI assistant.',
      messages:[{role:'user',content:prompt}]})
  });
  if(!r.ok)throw new Error('AI API error: '+r.status);
  const d=await r.json();
  return d.content.map(b=>b.text||'').join('');
}

async function aiExtractQA(content, format){
  const sys=`You are an expert educator. Extract or generate exam questions with answers from the given content.
RESPOND ONLY WITH VALID JSON — no markdown, no backticks, no preamble.`;
  const prompt=`From this content, create exam questions in the following format:
- ${format.mcq} Multiple Choice questions (4 options each, mark correct answer index 0-3)
- ${format.essay} Essay questions (with detailed rubric/model answer)
- ${format.short} Short Answer questions (with model answer)
- ${format.tf} True/False questions
- ${format.listing} Listing questions (with list of expected items)

Marks per question: MCQ=${format.marksPerMCQ}, Essay=${format.marksPerEssay}, Short=${format.marksPerShort}, TF=${format.marksPerTF}, Listing=${format.marksPerListing}

Additional teacher instructions: "${format.answerStyle||'Standard exam questions'}"

CONTENT:
${content.substring(0,4000)}

Respond ONLY with this JSON structure:
{
  "questions": [
    {"id":"q1","type":"mcq","text":"...","options":["A","B","C","D"],"correctOptionIndex":0,"points":${format.marksPerMCQ}},
    {"id":"q2","type":"essay","text":"...","idealAnswer":"rubric/key points...","points":${format.marksPerEssay}},
    {"id":"q3","type":"short_answer","text":"...","idealAnswer":"model answer","points":${format.marksPerShort}},
    {"id":"q4","type":"true_false","text":"statement","correctAnswer":true,"points":${format.marksPerTF}},
    {"id":"q5","type":"listing","text":"List...","listItems":["item1","item2","item3"],"points":${format.marksPerListing}}
  ]
}`;
  const raw=await callAI(prompt,sys);
  const clean=raw.replace(/```json|```/g,'').trim();
  const parsed=JSON.parse(clean);
  return parsed.questions.map(q=>({...q,id:genId()}));
}

async function aiGenerateFromTopic(topic,qtype,count,format){
  const sys=`You are an expert question generator. RESPOND ONLY WITH VALID JSON — no markdown, no backticks.`;
  const typeMap={
    mcq:`{"id":"","type":"mcq","text":"...","options":["A","B","C","D"],"correctOptionIndex":0,"points":${format.marksPerMCQ}}`,
    essay:`{"id":"","type":"essay","text":"...","idealAnswer":"key points / rubric","points":${format.marksPerEssay}}`,
    short_answer:`{"id":"","type":"short_answer","text":"...","idealAnswer":"model answer","points":${format.marksPerShort}}`,
    true_false:`{"id":"","type":"true_false","text":"statement","correctAnswer":true,"points":${format.marksPerTF}}`,
    listing:`{"id":"","type":"listing","text":"List...","listItems":["item1","item2","item3"],"points":${format.marksPerListing}}`
  };
  const prompt=`Generate ${count} ${qLabel(qtype)} questions about this topic:

TOPIC: "${topic}"
INSTRUCTIONS: "${format.answerStyle||''}"

Respond ONLY with a JSON array of question objects:
[${typeMap[qtype]}, ...]`;
  const raw=await callAI(prompt,sys);
  const clean=raw.replace(/```json|```/g,'').trim();
  const parsed=JSON.parse(clean);
  return (Array.isArray(parsed)?parsed:[]).map(q=>({...q,id:genId(),type:qtype}));
}

async function aiGradeSubmission(exam, answers){
  const sys=`You are a strict but fair examiner. Grade each student answer carefully.
RESPOND ONLY WITH VALID JSON — no markdown, no backticks.`;
  let score=0;
  let evals={};
  // Auto-grade MCQ & T/F
  exam.questions.forEach(q=>{
    if(q.type==='mcq'&&answers[q.id]===q.correctOptionIndex)score+=(q.points||1);
    if(q.type==='true_false'&&answers[q.id]===q.correctAnswer)score+=(q.points||1);
  });
  // AI grade open questions
  const openQs=exam.questions.filter(q=>['essay','short_answer','listing'].includes(q.type));
  for(const q of openQs){
    const ans=answers[q.id]||'';
    const mp=q.points||1;
    const prompt=`Grade this student answer:
Question: "${q.text}"
Type: ${q.type}
Model Answer/Rubric: "${q.type==='listing'?JSON.stringify(q.listItems):q.idealAnswer||''}"
Student's Answer: "${ans}"
Max Points: ${mp}

Respond ONLY with JSON: {"score":<0 to ${mp}>,"feedback":"<specific feedback>","understanding":"<brief assessment>"}`;
    try{
      const raw=await callAI(prompt,sys);
      const clean=raw.replace(/```json|```/g,'').trim();
      const ev=JSON.parse(clean);
      evals[q.id]={score:Math.min(mp,Math.max(0,ev.score||0)),feedback:ev.feedback||'',understanding:ev.understanding||'',maxScore:mp};
      score+=evals[q.id].score;
    }catch(e){
      evals[q.id]={score:0,feedback:'AI grading unavailable.',understanding:'',maxScore:mp};
    }
  }
  return{score,evals};
}

async function aiGetHint(qText,soFar){
  return await callAI(`Student is answering: "${qText}"\nWhat they've written: "${soFar}"\nGive a helpful 2-3 sentence hint without revealing the answer.`,'You are a helpful tutor.');
}

async function aiAnalyzeProctoring(b64){
  const r=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:100,
      messages:[{role:'user',content:[
        {type:'image',source:{type:'base64',media_type:'image/jpeg',data:b64}},
        {type:'text',text:'Is this person looking away from the screen or not visible? Answer ONLY with JSON: {"lookingAway":true/false,"reason":"brief reason"}'}
      ]}]})
  });
  if(!r.ok)return{lookingAway:false};
  const d=await r.json();
  const text=d.content.map(b=>b.text||'').join('');
  try{const c=text.replace(/```json|```/g,'').trim();return JSON.parse(c);}catch{return{lookingAway:false};}
}

// ═══════════════ AUTH ═══════════════
function registerTeacher(f){
  const{name,email,password,school,subjects}=f;
  if(!name.trim()||!email.trim()||!password.trim()||!school.trim())return'All fields are required.';
  if(password.length<6)return'Password must be at least 6 characters.';
  if(!/\S+@\S+\.\S+/.test(email))return'Invalid email.';
  const validSubs=subjects.filter(s=>s.trim());
  if(validSubs.length===0)return'Add at least one subject.';
  const k=email.toLowerCase().trim();
  if(S.teachers[k])return'Email already registered.';
  const t={id:genId(),name:name.trim(),email:k,password,school:school.trim(),subjects:validSubs};
  S.teachers[k]=t;
  S.currentTeacher={id:t.id,name:t.name,email:k,school:t.school,subjects:t.subjects};
  save();return null;
}
function loginTeacher(email,password){
  const k=email.toLowerCase().trim();
  const t=S.teachers[k];
  if(!t)return'No account found. Please register.';
  if(t.password!==password)return'Wrong password.';
  S.currentTeacher={id:t.id,name:t.name,email:k,school:t.school,subjects:t.subjects};
  save();return null;
}

// ═══════════════ VIOLATIONS ═══════════════
function logViolation(reason,shot,isGaze=false){
  if(isSubmittingFlag)return;
  if(isGaze){S.gazeViols++;toast(`👁 Look-away detected! ${S.gazeViols}/3`,'warn',3000);}
  else{S.otherViols++;toast(`⚠ Violation #${S.otherViols}: ${reason}`,'warn',3000);}
  if(S.currentSub){
    const v={id:genId(),subId:S.currentSub.id,examId:S.currentExam?.id,teacherId:S.currentExam?.teacherId,studentName:S.studentName,reason,screenshot:shot||null,isGaze,ts:Date.now()};
    S.violations.push(v);
    const sub=S.submissions.find(s=>s.id===S.currentSub.id);
    if(sub)sub.violations=(S.otherViols+S.gazeViols);
    save();renderApp();
  }
  if(isGaze&&S.gazeViols>=3){toast('3 look-aways! Auto-submitted.','error',0);submitExam();}
  if(!isGaze&&S.otherViols>=3){toast('3 violations! Auto-submitted.','error',0);submitExam();}
}

function captureFrame(){
  if(!videoEl||!canvasEl)return null;
  const ctx=canvasEl.getContext('2d');
  if(!ctx)return null;
  ctx.drawImage(videoEl,0,0,320,240);
  return canvasEl.toDataURL('image/jpeg',0.5).split(',')[1];
}

async function runProctoringCheck(){
  if(S.view!=='student-exam'||isSubmittingFlag)return;
  const b64=captureFrame();
  if(!b64)return;
  try{const r=await aiAnalyzeProctoring(b64);if(r.lookingAway)logViolation(r.reason||'Looking away',b64,true);}
  catch(e){console.warn('Proctoring check failed',e);}
}

async function startProctoring(){
  stopProctoring();
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    mediaStream=stream;cameraBlocked=false;
    if(videoEl)videoEl.srcObject=stream;
    try{await document.documentElement.requestFullscreen?.();}catch{}
    proctoringInterval=setInterval(runProctoringCheck,14000);
    renderApp();
  }catch{cameraBlocked=true;renderApp();toast('Camera access REQUIRED!','error',0);}
}

function stopProctoring(){
  if(mediaStream){mediaStream.getTracks().forEach(t=>t.stop());mediaStream=null;}
  if(videoEl)videoEl.srcObject=null;
  clearInterval(proctoringInterval);proctoringInterval=null;
  clearInterval(timerInterval);timerInterval=null;
  try{if(document.fullscreenElement)document.exitFullscreen();}catch{}
}

// ═══════════════ SUBMIT EXAM ═══════════════
async function submitExam(){
  if(isSubmittingFlag)return;
  isSubmittingFlag=true;S.isSubmitting=true;
  stopProctoring();
  const exam=S.currentExam,sub=S.currentSub;
  if(!exam||!sub){isSubmittingFlag=false;S.isSubmitting=false;return;}
  const loadT=toast('AI is reading and grading your answers...','loading',0);
  try{
    const{score,evals}=await aiGradeSubmission(exam,{...S.answers});
    const maxScore=calcMax(exam.questions);
    const totalViols=S.gazeViols+S.otherViols;
    const idx=S.submissions.findIndex(s=>s.id===sub.id);
    if(idx!==-1){
      S.submissions[idx]={...S.submissions[idx],answers:{...S.answers},status:'submitted',score,maxScore,aiEvaluations:evals,violations:totalViols,submittedAt:Date.now()};
      S.currentSub=S.submissions[idx];
    }
    save();
  }catch(e){console.error('Grading error',e);}
  loadT.remove();
  S.isSubmitting=false;
  setView('exam-result');
  toast('Exam submitted!','success');
}

// ═══════════════ TIMER ═══════════════
function startTimer(){
  clearInterval(timerInterval);
  if(!S.currentExam)return;
  const perQ=Math.floor((S.currentExam.durationMinutes*60)/S.currentExam.questions.length);
  S.timeLeft=perQ;
  timerInterval=setInterval(()=>{
    S.timeLeft--;updateTimerEl();
    if(S.timeLeft<=0){clearInterval(timerInterval);advanceQuestion();}
  },1000);
}
function updateTimerEl(){
  const el=document.getElementById('timer-display');
  if(!el)return;
  const m=Math.floor(S.timeLeft/60),s=S.timeLeft%60;
  el.textContent=`${m}:${s.toString().padStart(2,'0')}`;
  el.parentElement.className=`timer ${S.timeLeft<10?'timer-warn':'timer-ok'}`;
}
function advanceQuestion(){
  if(!S.currentExam)return;
  const next=S.currentQIdx+1;
  if(next<S.currentExam.questions.length){
    S.currentQIdx=next;S.aiHint=null;
    const perQ=Math.floor((S.currentExam.durationMinutes*60)/S.currentExam.questions.length);
    S.timeLeft=perQ;startTimer();renderApp();
  }else{submitExam();}
}

// ═══════════════ EXAM GUARDS ═══════════════
let guardsBound=false;
function attachGuards(){
  if(guardsBound)return;guardsBound=true;
  document.addEventListener('visibilitychange',onVis);
  document.addEventListener('fullscreenchange',onFull);
  document.addEventListener('copy',onClip);
  document.addEventListener('paste',onClip);
  document.addEventListener('cut',onClip);
  document.addEventListener('contextmenu',onCtx);
  document.addEventListener('keydown',onKey);
}
function removeGuards(){
  guardsBound=false;
  document.removeEventListener('visibilitychange',onVis);
  document.removeEventListener('fullscreenchange',onFull);
  document.removeEventListener('copy',onClip);
  document.removeEventListener('paste',onClip);
  document.removeEventListener('cut',onClip);
  document.removeEventListener('contextmenu',onCtx);
  document.removeEventListener('keydown',onKey);
}
function onVis(){if(document.hidden&&S.view==='student-exam')logViolation('Switched tab or minimized');}
function onFull(){if(!document.fullscreenElement&&S.view==='student-exam'){logViolation('Exited fullscreen');setTimeout(()=>{try{document.documentElement.requestFullscreen?.();}catch{}},500);}}
function onClip(e){if(S.view==='student-exam'){e.preventDefault();toast('Copy/Paste disabled!','error',2500);logViolation('Copy/Paste/Cut attempt');}}
function onCtx(e){if(S.view==='student-exam')e.preventDefault();}
function onKey(e){
  if(S.view!=='student-exam')return;
  if((e.ctrlKey||e.metaKey)&&['c','v','x','u','s','p','a','f'].includes(e.key.toLowerCase())){
    e.preventDefault();
    if(['c','v','x'].includes(e.key.toLowerCase())){toast('Shortcut disabled!','error',2000);logViolation(`Ctrl+${e.key.toUpperCase()}`);}
  }
  if([112,116,122].includes(e.keyCode)){e.preventDefault();logViolation(`F${e.keyCode-111} pressed`);}
  if(e.key==='PrintScreen'){e.preventDefault();logViolation('Screenshot attempt');toast('Screenshots disabled!','error',2000);}
}

// ═══════════════ NAV ═══════════════
function setView(v){
  S.view=v;
  if(v==='student-exam'){
    setTimeout(()=>{
      videoEl=document.getElementById('proctor-video');
      canvasEl=document.getElementById('proctor-canvas');
      startProctoring();startTimer();attachGuards();
    },200);
  }
  renderApp();
}

// ═══════════════ RENDER ═══════════════
function renderApp(){
  const app=document.getElementById('app');
  app.innerHTML=buildNav()+`<main>`+buildView()+`</main>`+buildModal();
  bindDomEvents();
  if(S.view==='student-exam'){
    videoEl=document.getElementById('proctor-video');
    canvasEl=document.getElementById('proctor-canvas');
    if(videoEl&&mediaStream)videoEl.srcObject=mediaStream;
  }
}

function buildNav(){
  const t=S.currentTeacher;
  return `<nav>
    <div class="brand" onclick="goHome()">
      <div class="brand-logo">${ico('shield')}</div>
      <span class="brand-name">RMI <span>&</span> Mifotra</span>
    </div>
    ${t?`<div style="display:flex;align-items:center;gap:10px;">
      <div style="text-align:right;">
        <div style="font-size:13px;font-weight:700;">${esc(t.name)}</div>
        <div style="font-size:11px;color:var(--text3);">${esc(t.school||'')}</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="doLogout()">Logout</button>
    </div>`:''}
  </nav>`;
}

function buildView(){
  const views={
    landing:buildLanding,
    'teacher-register':buildRegister,
    'teacher-login':buildLogin,
    'teacher-dashboard':buildDashboard,
    'create-exam':buildCreateExam,
    'student-join':buildStudentJoin,
    'student-waiting':buildStudentWaiting,
    'student-instructions':buildInstructions,
    'student-exam':buildStudentExam,
    'exam-result':buildResult,
  };
  return (views[S.view]||buildLanding)();
}

// ─── LANDING ───
function buildLanding(){
  return `<div class="landing">
    <div>
      <h1>Smart Exams for<br><span>Modern Education</span></h1>
      <p>Upload your materials. AI generates questions, proctors students, and grades answers automatically.</p>
    </div>
    <div class="role-cards">
      <div class="role-card" onclick="setView('student-join')">
        <div class="role-icon" style="background:var(--blue-lt);">👨‍🎓</div>
        <h3>I'm a Student</h3>
        <p>Join exam using the link your teacher shared</p>
      </div>
      <div class="role-card" onclick="setView('teacher-login')">
        <div class="role-icon" style="background:var(--amber-lt);">👩‍🏫</div>
        <h3>I'm a Teacher</h3>
        <p>Create AI-powered exams from your materials</p>
      </div>
    </div>
  </div>`;
}

// ─── REGISTER ───
function buildRegister(){
  const f=S.regForm;
  return `<div class="auth-wrap"><div class="card auth-card">
    <div class="auth-icon" style="background:var(--blue);">👩‍🏫</div>
    <h2 style="text-align:center;font-size:20px;font-weight:800;margin-bottom:20px;">Create Teacher Account</h2>
    ${S.authError?`<div class="err" style="margin-bottom:14px;">${esc(S.authError)}</div>`:''}
    <div style="display:flex;flex-direction:column;gap:12px;">
      <input class="inp" id="rn" type="text" placeholder="Full Name *" value="${esc(f.name)}" oninput="S.regForm.name=this.value"/>
      <input class="inp" id="re" type="email" placeholder="Email *" value="${esc(f.email)}" oninput="S.regForm.email=this.value"/>
      <input class="inp" id="rp" type="password" placeholder="Password (min 6) *" value="${esc(f.password)}" oninput="S.regForm.password=this.value"/>
      <input class="inp" id="rs" type="text" placeholder="School / Institution *" value="${esc(f.school)}" oninput="S.regForm.school=this.value"/>
      <div>
        <div class="lbl">Subjects *</div>
        ${f.subjects.map((s,i)=>`<div style="display:flex;gap:6px;margin-bottom:7px;">
          <input class="inp" style="font-size:13px;padding:9px 12px;" placeholder="e.g. Mathematics" value="${esc(s)}" oninput="S.regForm.subjects[${i}]=this.value"/>
          ${f.subjects.length>1?`<button class="icon-btn" onclick="S.regForm.subjects.splice(${i},1);renderApp()">✕</button>`:''}
        </div>`).join('')}
        <button class="link-btn" onclick="S.regForm.subjects.push('');renderApp()">+ Add subject</button>
      </div>
      <button class="btn btn-primary btn-full" onclick="doRegister()">Create Account</button>
      <button class="link-btn" style="text-align:center;" onclick="S.authError='';setView('teacher-login')">Already have an account? Login</button>
      <button class="link-btn" style="color:var(--text3);text-align:center;" onclick="setView('landing')">← Back</button>
    </div>
  </div></div>`;
}

// ─── LOGIN ───
function buildLogin(){
  return `<div class="auth-wrap"><div class="card auth-card">
    <div class="auth-icon" style="background:var(--gold);color:#fff;">🔑</div>
    <h2 style="text-align:center;font-size:20px;font-weight:800;margin-bottom:20px;">Teacher Login</h2>
    ${S.authError?`<div class="err" style="margin-bottom:14px;">${esc(S.authError)}</div>`:''}
    <div style="display:flex;flex-direction:column;gap:12px;">
      <input class="inp" id="le" type="email" placeholder="Email" value="${esc(S.loginForm.email)}" oninput="S.loginForm.email=this.value"/>
      <input class="inp" id="lp" type="password" placeholder="Password" value="${esc(S.loginForm.password)}" oninput="S.loginForm.password=this.value" onkeydown="if(event.key==='Enter')doLogin()"/>
      <button class="btn btn-primary btn-full" onclick="doLogin()">Login</button>
      <button class="link-btn" style="text-align:center;" onclick="S.authError='';setView('teacher-register')">New teacher? Create account</button>
      <button class="link-btn" style="color:var(--text3);text-align:center;" onclick="setView('landing')">← Back</button>
    </div>
  </div></div>`;
}

// ─── DASHBOARD ───
function buildDashboard(){
  const t=S.currentTeacher;
  const myExams=S.exams.filter(e=>e.teacherId===t.id);
  const mySubs=S.submissions.filter(s=>myExams.some(e=>e.id===s.examId));
  const myViols=S.violations.filter(v=>v.teacherId===t.id);
  const active=mySubs.filter(s=>s.status==='in-progress').length;
  return `<div>
    <div class="dash-hdr">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, <strong>${esc(t.name)}</strong>${t.school?' · '+esc(t.school):''}${t.subjects?.length?' · '+t.subjects.map(esc).join(', '):''}</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-red btn-sm" onclick="clearAllData()">🗑 Clear Data</button>
        <button class="btn btn-primary" onclick="startCreateExam()">+ Create Exam</button>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-icon" style="background:var(--blue-lt);">📋</div><div class="stat-val">${myExams.length}</div><div class="stat-lbl">Exams Created</div></div>
      <div class="stat"><div class="stat-icon" style="background:var(--green-lt);">👥</div><div class="stat-val">${active}</div><div class="stat-lbl">Active Now</div></div>
      <div class="stat"><div class="stat-icon" style="background:var(--amber-lt);">⚠️</div><div class="stat-val">${myViols.length}</div><div class="stat-lbl">Violations</div></div>
    </div>
    <div class="two-col">
      <!-- Exams list -->
      <div class="panel">
        <div class="ph"><h3>Your Exams</h3><span style="font-size:11px;color:var(--text3);font-weight:700;">${myExams.length} total</span></div>
        <div class="pb">
          ${myExams.length===0?`<div style="padding:36px;text-align:center;color:var(--text3);">No exams yet. Create one!</div>`:''}
          ${myExams.map(ex=>`<div class="exam-manage-row">
            <div>
              <div style="font-size:13px;font-weight:700;">${esc(ex.title)}</div>
              <div style="font-size:11px;color:var(--text3);">${ex.questions.length} questions · ${ex.durationMinutes} min · ${calcMax(ex.questions)} pts</div>
            </div>
            <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
              <span class="pill ${ex.active?'status-active':'status-waiting'}">${ex.active?'Active':'Waiting'}</span>
              <button class="btn btn-sm ${ex.active?'btn-red':'btn-green'}" onclick="toggleActive('${ex.id}')">${ex.active?'Deactivate':'Activate'}</button>
              <button class="btn btn-ghost btn-sm" onclick="copyLink('${ex.id}')">📋 Link</button>
              <button class="btn btn-ghost btn-sm" onclick="dlCSV('${ex.id}')">⬇ CSV</button>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <!-- Violations -->
      <div class="panel">
        <div class="ph">
          <h3>Proctoring Alerts</h3>
          <div class="live-badge"><div class="live-dot"></div>Live</div>
        </div>
        <div class="pb">
          ${myViols.length===0?`<div style="padding:36px;text-align:center;color:var(--text3);">No violations.</div>`:''}
          ${myViols.slice(0,20).map(v=>`<div class="vrow">
            <div style="display:flex;justify-content:space-between;">
              <div class="vname">${esc(v.studentName)}</div>
              <div style="font-size:10px;color:var(--text3);">${new Date(v.ts).toLocaleTimeString()}</div>
            </div>
            <div class="vreason">${esc(v.reason)}${v.isGaze?' 👁':''}</div>
            ${v.screenshot?`<img src="data:image/jpeg;base64,${v.screenshot}" alt=""/>`:''}
          </div>`).join('')}
        </div>
      </div>
    </div>
    <!-- Submissions table -->
    <div class="tbl-wrap" style="margin-top:4px;">
      <div class="ph"><h3>Student Submissions</h3><span style="font-size:11px;color:var(--text3);font-weight:700;">${mySubs.length} total</span></div>
      <div style="overflow-x:auto;">
        <table>
          <thead><tr><th>Student</th><th>Exam</th><th>Status</th><th>Score</th><th>Violations</th><th>Action</th></tr></thead>
          <tbody>
            ${mySubs.length===0?`<tr><td colspan="6" style="text-align:center;padding:36px;color:var(--text3);">No submissions yet.</td></tr>`:''}
            ${mySubs.map(sub=>{
              const ex=myExams.find(e=>e.id===sub.examId);
              return `<tr>
                <td><div style="font-weight:700;">${esc(sub.studentName)}</div></td>
                <td>${esc(ex?.title||'?')}</td>
                <td><span class="pill ${sub.status==='submitted'?'pill-blue':'pill-amber'}">${sub.status}</span></td>
                <td style="font-weight:800;color:var(--blue);">${sub.score||0} / ${sub.maxScore||0}</td>
                <td style="font-weight:700;color:${sub.violations>0?'var(--red)':'var(--green)'};">${sub.violations||0}</td>
                <td><button class="link-btn" onclick="viewSub('${sub.id}')">Details</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

// ─── CREATE EXAM (multi-step) ───
function startCreateExam(){
  S.createStep=1;
  S.pendingExam=null;
  S.uploadedContent='';
  S.uploadedFileName='';
  S.generatedQA=[];
  S.examFormat={mcq:5,essay:2,short:3,tf:3,listing:2,marksPerMCQ:1,marksPerEssay:10,marksPerShort:3,marksPerTF:1,marksPerListing:3,totalDuration:60,answerStyle:''};
  setView('create-exam');
}

function buildCreateExam(){
  const steps=[
    {n:1,label:'Content'},
    {n:2,label:'Format'},
    {n:3,label:'Generate'},
    {n:4,label:'Publish'}
  ];
  const stepBar=`<div class="step-bar">
    ${steps.map((st,i)=>`
      <div class="step ${S.createStep>st.n?'done':S.createStep===st.n?'active':''}">
        <div class="step-num">${S.createStep>st.n?'✓':st.n}</div>
        <div class="step-lbl">${st.label}</div>
      </div>
      ${i<steps.length-1?`<div class="step-line ${S.createStep>st.n?'done':''}"></div>`:''}
    `).join('')}
  </div>`;

  let content='';
  if(S.createStep===1)content=buildStep1();
  else if(S.createStep===2)content=buildStep2();
  else if(S.createStep===3)content=buildStep3();
  else if(S.createStep===4)content=buildStep4();

  return `<div class="create-wrap">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:26px;">
      <button class="btn btn-ghost btn-sm" onclick="setView('teacher-dashboard')">← Dashboard</button>
      <h2 style="font-size:22px;font-weight:800;">Create New Exam</h2>
    </div>
    ${stepBar}
    <div class="card">${content}</div>
  </div>`;
}

function buildStep1(){
  return `<div>
    <h3 style="font-size:17px;font-weight:800;margin-bottom:6px;">Step 1: Add Content</h3>
    <p style="color:var(--text2);font-size:13px;margin-bottom:20px;">Upload a document, paste text, or describe a topic. AI will generate questions and answers from it.</p>

    <!-- Upload zone -->
    <div class="upload-zone" id="upload-zone" onclick="document.getElementById('file-input').click()" 
      ondragover="event.preventDefault();this.classList.add('dragover')" 
      ondragleave="this.classList.remove('dragover')"
      ondrop="handleFileDrop(event)">
      <div class="uz-icon">📄</div>
      <h3>${S.uploadedFileName?esc(S.uploadedFileName):'Upload Document'}</h3>
      <p>${S.uploadedFileName?`File loaded (${S.uploadedContent.length} chars)`:'PDF, Word, or text file · Drag & drop or click to browse'}</p>
      <input type="file" id="file-input" accept=".txt,.pdf,.doc,.docx" onchange="handleFileSelect(event)"/>
    </div>

    <div style="display:flex;align-items:center;gap:12px;margin:16px 0;">
      <div style="flex:1;height:1px;background:var(--border);"></div>
      <span style="font-size:12px;font-weight:700;color:var(--text3);">OR</span>
      <div style="flex:1;height:1px;background:var(--border);"></div>
    </div>

    <div class="fg" style="margin-bottom:14px;">
      <label class="lbl">Paste text / topic description</label>
      <textarea class="inp" style="min-height:130px;" placeholder="Paste your textbook content, notes, or describe the topic (e.g. 'Chapter 3: Photosynthesis – the process by which plants convert sunlight...')" oninput="S.uploadedContent=this.value">${esc(S.uploadedContent)}</textarea>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:16px;">
      <div class="info-box" style="flex:1;">📝 You can also use AI to generate questions from a topic — just describe it in the text box above.</div>
    </div>

    <div style="display:flex;justify-content:flex-end;">
      <button class="btn btn-primary" onclick="goStep2()" ${!S.uploadedContent.trim()?'disabled':''}>Continue to Format →</button>
    </div>
  </div>`;
}

function buildStep2(){
  const f=S.examFormat;
  const qtypes=[
    {key:'mcq',label:'Multiple Choice',desc:'4 options, auto-graded',marks:'marksPerMCQ',count:'mcq'},
    {key:'essay',label:'Essay',desc:'Long form, AI graded',marks:'marksPerEssay',count:'essay'},
    {key:'short',label:'Short Answer',desc:'Brief answer, AI graded',marks:'marksPerShort',count:'short'},
    {key:'tf',label:'True / False',desc:'Binary, auto-graded',marks:'marksPerTF',count:'tf'},
    {key:'listing',label:'Listing',desc:'List items, AI graded',marks:'marksPerListing',count:'listing'},
  ];
  return `<div>
    <h3 style="font-size:17px;font-weight:800;margin-bottom:6px;">Step 2: Configure Exam Format</h3>
    <p style="color:var(--text2);font-size:13px;margin-bottom:20px;">Set how many questions of each type and their marks. Then describe the expected answer style.</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;">
      <div class="fg">
        <label class="lbl">Exam Title *</label>
        <input class="inp" type="text" placeholder="e.g. Biology Final Exam" id="exam-title-inp" value="${esc(S.examFormat.title||'')}" oninput="S.examFormat.title=this.value"/>
      </div>
      <div class="fg">
        <label class="lbl">Total Duration (minutes)</label>
        <input class="inp" type="number" min="5" value="${f.totalDuration}" oninput="S.examFormat.totalDuration=parseInt(this.value)||60"/>
      </div>
    </div>

    <div class="lbl" style="margin-bottom:10px;">Question Types & Marks</div>
    ${qtypes.map(qt=>`<div class="qtype-row">
      <div>
        <h4>${qt.label}</h4>
        <p>${qt.desc}</p>
      </div>
      <div style="display:flex;align-items:center;gap:16px;">
        <div>
          <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px;">COUNT</div>
          <div class="num-ctrl">
            <button onclick="S.examFormat['${qt.count}']=Math.max(0,(S.examFormat['${qt.count}']||0)-1);renderApp()">−</button>
            <span>${f[qt.count]||0}</span>
            <button onclick="S.examFormat['${qt.count}']=(S.examFormat['${qt.count}']||0)+1;renderApp()">+</button>
          </div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px;">MARKS EACH</div>
          <div class="num-ctrl">
            <button onclick="S.examFormat['${qt.marks}']=Math.max(1,(S.examFormat['${qt.marks}']||1)-1);renderApp()">−</button>
            <span>${f[qt.marks]||1}</span>
            <button onclick="S.examFormat['${qt.marks}']=(S.examFormat['${qt.marks}']||1)+1;renderApp()">+</button>
          </div>
        </div>
      </div>
    </div>`).join('')}

    <div class="fg" style="margin-top:16px;margin-bottom:6px;">
      <label class="lbl">Answer Style Instructions (optional)</label>
      <textarea class="inp" style="min-height:80px;" placeholder="e.g. Questions should be based on real-world applications. Essays should require 3+ paragraphs. Focus on chapters 1-5." oninput="S.examFormat.answerStyle=this.value">${esc(f.answerStyle||'')}</textarea>
    </div>

    <div class="info-box" style="margin-bottom:16px;">
      📊 Total questions: ${(f.mcq||0)+(f.essay||0)+(f.short||0)+(f.tf||0)+(f.listing||0)} · 
      Total marks: ${(f.mcq||0)*(f.marksPerMCQ||1)+(f.essay||0)*(f.marksPerEssay||10)+(f.short||0)*(f.marksPerShort||3)+(f.tf||0)*(f.marksPerTF||1)+(f.listing||0)*(f.marksPerListing||3)}
    </div>

    <div style="display:flex;gap:10px;justify-content:space-between;">
      <button class="btn btn-ghost" onclick="S.createStep=1;renderApp()">← Back</button>
      <button class="btn btn-primary" onclick="goStep3()" ${!S.examFormat.title?.trim()?'disabled':''}>Generate Questions →</button>
    </div>
  </div>`;
}

function buildStep3(){
  const qa=S.generatedQA;
  return `<div>
    <h3 style="font-size:17px;font-weight:800;margin-bottom:6px;">Step 3: Review Generated Questions</h3>
    <p style="color:var(--text2);font-size:13px;margin-bottom:18px;">AI has generated the questions and answers below. Review them before publishing.</p>

    ${S.aiGenerating?`<div class="ai-loading"><div class="spin"></div>AI is generating questions and answers from your content…</div>`:''}

    ${!S.aiGenerating&&qa.length===0?`<div style="text-align:center;padding:40px;color:var(--text3);">
      <div style="font-size:32px;margin-bottom:8px;">🤖</div>
      <p style="font-weight:700;">Click "Generate" to create questions from your content.</p>
      <button class="btn btn-primary" style="margin-top:14px;" onclick="doGenerate()">Generate Questions</button>
    </div>`:''}

    ${qa.length>0?`
      <div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;font-weight:700;color:var(--text2);">${qa.length} questions · ${calcMax(qa)} total marks</span>
        <button class="btn btn-ghost btn-sm" onclick="doGenerate()">🔄 Regenerate</button>
      </div>
      <div style="max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding-right:4px;">
        ${qa.map((q,i)=>`<div class="q-preview">
          <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;">
            <span style="font-size:11px;font-weight:800;color:var(--text3);">#${i+1}</span>
            <span class="pill ${badgeCls(q.type)}">${qLabel(q.type)}</span>
            <span style="font-size:11px;font-weight:700;color:var(--text3);">${q.points} pt${q.points>1?'s':''}</span>
          </div>
          <h4>${esc(q.text)}</h4>
          ${q.type==='mcq'?`<p style="font-size:11px;color:var(--text2);">Options: ${(q.options||[]).map((o,oi)=>`${oi===q.correctOptionIndex?'<strong>':''}${esc(o)}${oi===q.correctOptionIndex?'</strong>':''}`).join(' | ')}</p>`:''}
          ${q.type==='true_false'?`<p style="font-size:11px;color:var(--text2);">Answer: ${q.correctAnswer?'True':'False'}</p>`:''}
          ${['essay','short_answer'].includes(q.type)?`<div class="ans">Model: ${esc((q.idealAnswer||'').substring(0,100))}${(q.idealAnswer||'').length>100?'…':''}</div>`:''}
          ${q.type==='listing'?`<div class="ans">Items: ${(q.listItems||[]).map(esc).join(', ')}</div>`:''}
        </div>`).join('')}
      </div>`:''}

    <div style="display:flex;gap:10px;justify-content:space-between;margin-top:18px;">
      <button class="btn btn-ghost" onclick="S.createStep=2;renderApp()">← Back</button>
      <button class="btn btn-primary" onclick="goStep4()" ${qa.length===0||S.aiGenerating?'disabled':''}>Publish Exam →</button>
    </div>
  </div>`;
}

function buildStep4(){
  const exam=S.pendingExam;
  if(!exam)return`<div>Error publishing exam.</div>`;
  const link=getExamLink(exam.id);
  return `<div style="text-align:center;">
    <div style="font-size:56px;margin-bottom:12px;">🎉</div>
    <h3 style="font-size:22px;font-weight:800;margin-bottom:6px;">Exam Published!</h3>
    <p style="color:var(--text2);font-size:14px;margin-bottom:24px;">Share this link with your students. Activate the exam when ready.</p>

    <div class="link-display" style="margin-bottom:18px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--text3);margin-bottom:8px;">Student Exam Link</div>
      <div class="link-url">${esc(link)}</div>
      <button style="margin-top:12px;padding:8px 16px;border-radius:8px;border:1.5px solid var(--border);background:var(--surface);cursor:pointer;font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;" onclick="copyLink('${exam.id}')">📋 Copy Link</button>
    </div>

    <div class="info-box" style="margin-bottom:18px;text-align:left;">
      <strong>How it works:</strong><br/>
      1. Students open the link and enter their name<br/>
      2. They wait until you <strong>Activate</strong> the exam from your dashboard<br/>
      3. Once activated, all waiting students can begin<br/>
      4. AI proctors them and grades automatically when they finish
    </div>

    <div style="display:flex;gap:10px;justify-content:center;">
      <button class="btn btn-green" onclick="toggleActive('${exam.id}');setView('teacher-dashboard')">✓ Activate Now & Go to Dashboard</button>
      <button class="btn btn-ghost" onclick="setView('teacher-dashboard')">Go to Dashboard</button>
    </div>
  </div>`;
}

// ─── STUDENT JOIN ───
function buildStudentJoin(){
  return `<div class="auth-wrap"><div class="card" style="max-width:420px;width:100%;">
    <div style="text-align:center;font-size:48px;margin-bottom:14px;">👨‍🎓</div>
    <h2 style="text-align:center;font-size:20px;font-weight:800;margin-bottom:20px;">Join Exam</h2>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <input class="inp" id="sn" type="text" placeholder="Your Full Name" value="${esc(S.studentName)}" oninput="S.studentName=this.value"/>
      <div class="info-box">Your teacher will send you a link. Open that link to join the exam, or enter the full exam URL above.</div>
      <button class="btn btn-primary btn-full" onclick="doJoinByLink()">Join Exam</button>
      <button class="link-btn" style="color:var(--text3);text-align:center;" onclick="setView('landing')">← Back</button>
    </div>
  </div></div>`;
}

// ─── STUDENT WAITING ───
function buildStudentWaiting(){
  const exam=S.currentExam;
  if(!exam)return'<div>Error.</div>';
  // Auto-poll for activation
  if(!S.waitPollInterval){
    S.waitPollInterval=setInterval(()=>{
      const updated=S.exams.find(e=>e.id===exam.id);
      if(updated&&updated.active){
        clearInterval(S.waitPollInterval);S.waitPollInterval=null;
        S.currentExam=updated;
        toast('Exam has started!','success');
        setView('student-instructions');
      }
    },3000);
  }
  return `<div class="wait-wrap"><div class="wait-card">
    <div class="wait-pulse" style="background:var(--blue-lt);">⏳</div>
    <h2 style="font-size:22px;font-weight:800;margin-bottom:8px;">Waiting for Exam to Start</h2>
    <p style="color:var(--text2);margin-bottom:20px;">Hello, <strong>${esc(S.studentName)}</strong>! The teacher will activate the exam shortly. Please stay on this page.</p>
    <div class="card" style="background:var(--surface2);">
      <div style="font-size:13px;font-weight:700;margin-bottom:4px;">${esc(exam.title)}</div>
      <div style="font-size:12px;color:var(--text3);">${exam.questions.length} questions · ${exam.durationMinutes} min · ${calcMax(exam.questions)} pts</div>
    </div>
    <div class="ai-loading" style="margin-top:16px;"><div class="spin"></div>Checking for activation every 3 seconds…</div>
  </div></div>`;
}

// ─── INSTRUCTIONS ───
function buildInstructions(){
  const exam=S.currentExam;
  if(!exam)return'<div>Error.</div>';
  return `<div class="instr-wrap"><div class="card instr-card">
    <div class="instr-hero">
      <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:1px;">You are about to take</div>
      <h2 style="margin-top:5px;">${esc(exam.title)}</h2>
      <p>by ${esc(exam.teacherName)}</p>
      <div class="instr-meta">
        <span>${exam.questions.length} Questions</span><span>·</span>
        <span>${exam.durationMinutes} Minutes</span><span>·</span>
        <span>${calcMax(exam.questions)} Marks</span>
      </div>
    </div>
    <div class="rules">
      ${[
        {e:'👁',t:'Stay Focused',d:'3 look-aways = auto-submit'},
        {e:'🚫',t:'No Tab Switching',d:'Leaving window is a violation'},
        {e:'✂️',t:'No Copy/Paste',d:'Clipboard is disabled'},
        {e:'📷',t:'Camera Always On',d:'Face must be visible'},
        {e:'⌨️',t:'No Shortcuts',d:'Ctrl+C, F12 all disabled'},
        {e:'🖱️',t:'No Right-Click',d:'Context menu is off'},
      ].map(r=>`<div class="rule">
        <div class="rule-icon">${r.e}</div>
        <div><h4>${r.t}</h4><p>${r.d}</p></div>
      </div>`).join('')}
    </div>
    <div class="warn-box" style="margin-bottom:16px;">
      <span style="font-size:18px;flex-shrink:0;">⚠️</span>
      <div>
        <h4 style="font-weight:800;color:var(--red);margin-bottom:3px;">AI Gaze Detection Active</h4>
        <p style="font-size:12px;color:var(--red);">3 look-aways trigger automatic submission even if unfinished.</p>
      </div>
    </div>
    <button class="btn btn-primary btn-full" style="padding:16px;" onclick="setView('student-exam')">I Understand — Start Exam →</button>
  </div></div>`;
}

// ─── STUDENT EXAM ───
function buildStudentExam(){
  const exam=S.currentExam;
  if(!exam)return'<div>Error.</div>';
  if(cameraBlocked)return`<div class="cam-blocked">
    <div style="font-size:56px;">📷</div>
    <h2 style="font-size:20px;font-weight:800;">Camera Required</h2>
    <p style="color:var(--text2);">Allow camera access to take this exam.</p>
    <button class="btn btn-primary" onclick="cameraBlocked=false;startProctoring()">Retry Camera</button>
  </div>`;

  const q=exam.questions[S.currentQIdx];
  const m=Math.floor(S.timeLeft/60),sc=S.timeLeft%60;
  const timeStr=`${m}:${sc.toString().padStart(2,'0')}`;
  const prog=((S.currentQIdx+1)/exam.questions.length)*100;

  return `<div class="exam-layout no-sel">
    <div class="exam-main">
      <div class="exam-topbar">
        <div>
          <div class="q-meta">
            <span class="qlbl">Q ${S.currentQIdx+1} / ${exam.questions.length}</span>
            <span class="pill ${badgeCls(q.type)}">${qLabel(q.type)}</span>
            <span style="background:var(--surface2);color:var(--text2);font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;border:1px solid var(--border);">${q.points} pt${q.points>1?'s':''}</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${prog}%"></div></div>
        </div>
        <div class="timer timer-ok"><span>⏱</span><span id="timer-display">${timeStr}</span></div>
      </div>
      <div class="q-text">${esc(q.text)}</div>
      ${buildAnswerInput(q)}
      ${q.type==='essay'?`<div style="margin-top:12px;">
        <button class="btn btn-ghost btn-sm" onclick="getHint()" ${S.isLoadingHint?'disabled':''}>💡 ${S.isLoadingHint?'Loading…':'Get Hint'}</button>
        ${S.aiHint?`<div class="hint-box" style="margin-top:10px;"><strong>💡 Hint:</strong> ${esc(S.aiHint)}</div>`:''}
      </div>`:''}
      ${S.isSubmitting?`<div class="ai-loading" style="margin-top:16px;"><div class="spin"></div>AI is grading your exam…</div>`:''}
      <div class="exam-footer">
        <button class="btn btn-red btn-sm" onclick="if(confirm('Submit now?'))submitExam()" ${S.isSubmitting?'disabled':''}>Submit Early</button>
        <button class="btn btn-primary" onclick="nextQ()" ${!hasAns(q)||S.isSubmitting?'disabled':''}>${S.currentQIdx===exam.questions.length-1?'Finish →':'Next →'}</button>
      </div>
    </div>
    <div class="exam-sidebar">
      <div class="side-panel">
        <h3>📷 Live Proctoring</h3>
        <div class="cam-feed">
          <video id="proctor-video" autoplay muted playsinline></video>
          <div class="cam-live"><div class="live-dot"></div>LIVE</div>
        </div>
        <canvas id="proctor-canvas" style="display:none;" width="320" height="240"></canvas>
        <p style="font-size:11px;color:var(--text3);margin-top:7px;">AI monitoring gaze &amp; behaviour.</p>
      </div>
      <div class="side-panel">
        <h3>👁 Gaze Violations</h3>
        <div class="viol-bars">${[1,2,3].map(i=>`<div class="viol-bar ${S.gazeViols>=i?'hit-r':''}"></div>`).join('')}</div>
        <p style="font-size:12px;color:var(--text2);">${S.gazeViols===0?'All clear':S.gazeViols>=3?'⚠ Max!':S.gazeViols+'/3 — '+(3-S.gazeViols)+' left'}</p>
      </div>
      <div class="side-panel">
        <h3>⚠ Other Violations</h3>
        <div class="viol-bars">${[1,2,3].map(i=>`<div class="viol-bar ${S.otherViols>=i?'hit-a':''}"></div>`).join('')}</div>
        <p style="font-size:12px;color:var(--text2);">${S.otherViols===0?'No violations':S.otherViols+'/3'}</p>
      </div>
    </div>
  </div>`;
}

function buildAnswerInput(q){
  const ans=S.answers[q.id];
  switch(q.type){
    case 'mcq':return`<div>${(q.options||[]).map((opt,oi)=>`
      <button class="mcq-btn ${ans===oi?'sel':''}" onclick="setAns('${q.id}',${oi})">
        <span>${esc(opt)}</span>
        <div class="mcq-check ${ans===oi?'chk':''}">${ans===oi?'✓':''}</div>
      </button>`).join('')}</div>`;
    case 'true_false':return`<div class="tf-row">
      <button class="tf-btn ${ans===true?'sel-t':''}" onclick="setAns('${q.id}',true)">✓ True</button>
      <button class="tf-btn ${ans===false?'sel-f':''}" onclick="setAns('${q.id}',false)">✗ False</button>
    </div>`;
    case 'short_answer':return`<input class="inp" type="text" placeholder="Your answer…" value="${esc(ans||'')}" oninput="setAns('${q.id}',this.value)" style="font-size:15px;padding:13px 16px;"/>`;
    case 'listing':return`<div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:7px;font-style:italic;">List each item on a new line. AI checks each one.</p>
      <textarea class="inp" style="min-height:150px;font-size:14px;line-height:1.8;" placeholder="Item 1&#10;Item 2&#10;Item 3…" oninput="setAns('${q.id}',this.value)">${esc(ans||'')}</textarea>
    </div>`;
    case 'essay':return`<div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:7px;font-style:italic;">Write a full answer. AI reads your essay and grades it.</p>
      <textarea class="inp" style="min-height:190px;font-size:14px;line-height:1.7;" placeholder="Your essay…" oninput="setAns('${q.id}',this.value)">${esc(ans||'')}</textarea>
    </div>`;
  }return'';
}

function hasAns(q){
  const a=S.answers[q.id];
  if(a===undefined||a===null||a==='')return false;
  if(q.type==='true_false')return typeof a==='boolean';
  return String(a).trim().length>0;
}

// ─── RESULT ───
function buildResult(){
  const sub=S.currentSub,exam=S.currentExam;
  if(!sub||!exam)return'<div>Error.</div>';
  const max=sub.maxScore||calcMax(exam.questions);
  const pct=max>0?Math.round(sub.score/max*100):0;
  const passed=pct>=50;
  return `<div class="result-wrap"><div class="card result-card">
    <div style="font-size:56px;margin-bottom:12px;">${passed?'🏆':'📋'}</div>
    <h2 style="font-size:26px;font-weight:800;letter-spacing:-.5px;">Exam Completed!</h2>
    <p style="color:var(--text2);margin-top:4px;">Well done, ${esc(S.studentName)}.</p>
    <div class="result-scores">
      <div class="rs-item"><div class="rs-val" style="color:var(--blue);">${sub.score}</div><div class="rs-lbl">Score</div></div>
      <div class="rs-item" style="border-left:1px solid var(--border);border-right:1px solid var(--border);"><div class="rs-val">${max}</div><div class="rs-lbl">Max</div></div>
      <div class="rs-item"><div class="rs-val" style="color:${passed?'var(--green)':'var(--red)'};">${pct}%</div><div class="rs-lbl">Grade</div></div>
    </div>
    <span class="pass-badge ${passed?'pill-green':'pill-red'}">${passed?'✓ PASSED':'✗ DID NOT PASS'}</span>
    <div style="text-align:left;background:var(--surface2);border-radius:var(--r);padding:14px;margin-bottom:18px;">
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);">
        <span style="font-size:13px;color:var(--text2);">Gaze violations:</span>
        <span style="font-weight:700;color:${S.gazeViols>0?'var(--red)':'var(--green)'};">${S.gazeViols}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;">
        <span style="font-size:13px;color:var(--text2);">Other violations:</span>
        <span style="font-weight:700;color:${S.otherViols>0?'var(--red)':'var(--green)'};">${S.otherViols}</span>
      </div>
    </div>
    <button class="btn btn-primary btn-full" onclick="removeGuards();stopProctoring();clearInterval(S.waitPollInterval);S.waitPollInterval=null;setView('landing')">Return to Home</button>
  </div></div>`;
}

// ─── MODAL (submission detail) ───
function buildModal(){
  if(!S.selectedSub)return'';
  const sub=S.selectedSub;
  const exam=S.exams.find(e=>e.id===sub.examId);
  const myViols=S.violations.filter(v=>v.subId===sub.id);
  const max=sub.maxScore||0;
  const pct=max>0?Math.round(sub.score/max*100):0;
  return `<div class="modal-overlay" onclick="if(event.target===this)closeSub()">
    <div class="modal">
      <div style="background:var(--blue);color:#fff;padding:22px 24px;display:flex;justify-content:space-between;align-items:flex-start;border-radius:24px 24px 0 0;">
        <div>
          <div style="font-size:20px;font-weight:800;">${esc(sub.studentName)}</div>
          <div style="color:rgba(255,255,255,.7);font-size:13px;margin-top:2px;">${esc(exam?.title||'?')}</div>
        </div>
        <button style="background:rgba(255,255,255,.2);border:none;color:#fff;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;" onclick="closeSub()">✕</button>
      </div>
      <div class="mb">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;">
          ${[
            {val:`${sub.score}/${max}`,lbl:'Score',col:'var(--blue)'},
            {val:`${pct}%`,lbl:'Grade',col:pct>=50?'var(--green)':'var(--red)'},
            {val:sub.violations||0,lbl:'Violations',col:sub.violations>0?'var(--red)':'var(--green)'},
          ].map(s=>`<div style="background:var(--surface2);border-radius:var(--r);padding:14px;text-align:center;">
            <div style="font-size:20px;font-weight:800;color:${s.col};">${s.val}</div>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--text3);margin-top:3px;">${s.lbl}</div>
          </div>`).join('')}
        </div>
        ${sub.aiEvaluations&&Object.keys(sub.aiEvaluations).length>0?`
          <h4 style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">AI Evaluations</h4>
          ${Object.entries(sub.aiEvaluations).map(([qId,ev])=>{
            const q=exam?.questions.find(q=>q.id===qId);
            return `<div class="ai-eval-card">
              <h4>${esc(q?.text||'Question')}</h4>
              <div style="display:flex;gap:7px;">
                <span style="background:var(--surface);border-radius:5px;padding:3px 9px;font-size:12px;font-weight:800;color:var(--blue);">Score: ${ev.score}/${ev.maxScore}</span>
              </div>
              <p class="ai-feedback">${esc(ev.feedback||'')}</p>
              <div class="student-ans"><strong>Student:</strong> ${esc(sub.answers?.[qId]||'No answer')}</div>
            </div>`;
          }).join('')}
        `:''}
        <h4 style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:14px 0 10px;">Violations (${myViols.length})</h4>
        ${myViols.length===0?`<div style="text-align:center;padding:18px;color:var(--text3);font-style:italic;">None recorded.</div>`:''}
        ${myViols.map((v,i)=>`<div style="background:var(--surface2);border-radius:var(--r);overflow:hidden;margin-bottom:8px;">
          <div style="padding:12px 14px;">
            <div style="font-weight:700;color:var(--red);font-size:12px;">#${i+1}: ${esc(v.reason)}${v.isGaze?' 👁':''}</div>
            <div style="font-size:10px;color:var(--text3);">${new Date(v.ts).toLocaleTimeString()}</div>
          </div>
          ${v.screenshot?`<div style="padding:0 14px 12px;"><img src="data:image/jpeg;base64,${v.screenshot}" style="width:100%;max-width:260px;border-radius:7px;border:1px solid var(--border);"/></div>`:''}
        </div>`).join('')}
      </div>
      <div class="mf"><button class="btn btn-primary btn-full" onclick="closeSub()">Close</button></div>
    </div>
  </div>`;
}

function bindDomEvents(){
  // File drag/drop is handled inline
}

// ═══════════════ ACTIONS ═══════════════
window.goHome=()=>{stopProctoring();removeGuards();clearInterval(S.waitPollInterval);S.waitPollInterval=null;S.authError='';setView('landing');};
window.doLogout=()=>{S.currentTeacher=null;save();setView('landing');toast('Logged out','info');};
window.doRegister=()=>{
  const err=registerTeacher(S.regForm);
  if(err){S.authError=err;renderApp();return;}
  S.authError='';S.regForm={name:'',email:'',password:'',school:'',subjects:['']};
  toast(`Welcome, ${S.currentTeacher.name}!`,'success');setView('teacher-dashboard');
};
window.doLogin=()=>{
  const err=loginTeacher(S.loginForm.email,S.loginForm.password);
  if(err){S.authError=err;renderApp();return;}
  S.authError='';toast(`Welcome back, ${S.currentTeacher.name}!`,'success');setView('teacher-dashboard');
};

// File handling
window.handleFileDrop=async(e)=>{
  e.preventDefault();document.getElementById('upload-zone')?.classList.remove('dragover');
  const file=e.dataTransfer.files[0];
  if(file)await readFile(file);
};
window.handleFileSelect=async(e)=>{
  const file=e.target.files[0];
  if(file)await readFile(file);
};
async function readFile(file){
  S.uploadedFileName=file.name;
  if(file.type==='text/plain'||file.name.endsWith('.txt')){
    S.uploadedContent=await file.text();
    renderApp();toast(`Loaded: ${file.name}`,'success');
  }else{
    // For PDF/doc — read as text if possible, otherwise tell user to paste
    try{
      const text=await file.text();
      S.uploadedContent=text;
      renderApp();toast(`Loaded: ${file.name}`,'success');
    }catch{
      toast('For PDF/Word files, please copy-paste the text content into the text box below.','warn',6000);
      S.uploadedFileName='';renderApp();
    }
  }
}

window.goStep2=()=>{
  if(!S.uploadedContent.trim()){toast('Add content first','error');return;}
  S.createStep=2;renderApp();
};
window.goStep3=async()=>{
  const title=S.examFormat.title?.trim();
  if(!title){toast('Enter exam title','error');return;}
  S.createStep=3;S.generatedQA=[];
  renderApp();
  await doGenerate();
};
window.doGenerate=async()=>{
  S.aiGenerating=true;renderApp();
  try{
    const qs=await aiExtractQA(S.uploadedContent,S.examFormat);
    S.generatedQA=qs;
    toast(`Generated ${qs.length} questions!`,'success');
  }catch(e){
    console.error(e);toast('AI generation failed. Check connection.','error');
  }
  S.aiGenerating=false;renderApp();
};
window.goStep4=()=>{
  if(S.generatedQA.length===0){toast('Generate questions first','error');return;}
  const exam={
    id:genId(),
    title:S.examFormat.title,
    durationMinutes:S.examFormat.totalDuration,
    questions:S.generatedQA,
    teacherId:S.currentTeacher.id,
    teacherName:S.currentTeacher.name,
    active:false,
    createdAt:Date.now(),
  };
  S.exams.push(exam);S.pendingExam=exam;save();
  S.createStep=4;renderApp();
};

// Student join via URL param or manual
window.doJoinByLink=()=>{
  const name=document.getElementById('sn')?.value?.trim()||'';
  if(!name){toast('Enter your name','error');return;}
  S.studentName=name;
  const examId=getExamIdFromURL();
  if(examId){
    joinExam(examId);
  }else{
    toast('Please open the exam link your teacher sent you.','warn');
  }
};
function joinExam(examId){
  const exam=S.exams.find(e=>e.id===examId);
  if(!exam){toast('Exam not found. Ask your teacher for the correct link.','error');return;}
  S.currentExam=exam;
  S.currentQIdx=0;S.answers={};S.gazeViols=0;S.otherViols=0;
  isSubmittingFlag=false;S.aiHint=null;
  const sub={id:genId(),examId:exam.id,examTeacherId:exam.teacherId,studentName:S.studentName,answers:{},violations:0,status:'in-progress',score:0,maxScore:calcMax(exam.questions),createdAt:Date.now()};
  S.submissions.push(sub);S.currentSub=sub;save();
  if(exam.active){setView('student-instructions');}
  else{setView('student-waiting');}
}

window.toggleActive=(id)=>{
  const ex=S.exams.find(e=>e.id===id);
  if(ex){ex.active=!ex.active;save();toast(ex.active?'Exam activated! Students can now begin.':'Exam deactivated.','success');renderApp();}
};
window.copyLink=(id)=>{
  const link=getExamLink(id);
  navigator.clipboard.writeText(link).then(()=>toast('Link copied to clipboard!','success'));
};
window.dlCSV=(examId)=>{
  const ex=S.exams.find(e=>e.id===examId);
  const subs=S.submissions.filter(s=>s.examId===examId);
  if(!ex||subs.length===0){toast('No submissions yet','info');return;}
  const hdr=['Student','Score','Max','%','Violations','Status'];
  const rows=subs.map(s=>[s.studentName,s.score,s.maxScore||0,s.maxScore?Math.round(s.score/s.maxScore*100):0,s.violations||0,s.status]);
  const csv=[hdr,...rows].map(r=>r.join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=`results_${ex.title.replace(/\s+/g,'_')}.csv`;
  a.click();toast('Downloaded!','success');
};
window.clearAllData=()=>{
  if(!confirm('Delete ALL data? Cannot be undone.'))return;
  S.exams=[];S.submissions=[];S.violations=[];
  ['_ex','_su','_vi'].forEach(k=>localStorage.removeItem(k));
  toast('Cleared','success');renderApp();
};
window.viewSub=(id)=>{S.selectedSub=S.submissions.find(s=>s.id===id)||null;renderApp();};
window.closeSub=()=>{S.selectedSub=null;renderApp();};
window.startCreateExam=startCreateExam;
window.setAns=(id,val)=>{S.answers[id]=val;renderApp();};
window.nextQ=()=>{
  const q=S.currentExam?.questions[S.currentQIdx];
  if(!q||!hasAns(q)){toast('Please answer this question','warn');return;}
  advanceQuestion();
};
window.submitExam=submitExam;
window.getHint=async()=>{
  const q=S.currentExam?.questions[S.currentQIdx];
  if(!q)return;
  S.isLoadingHint=true;renderApp();
  try{S.aiHint=await aiGetHint(q.text,S.answers[q.id]||'');}
  catch{S.aiHint='Could not load hint.';}
  S.isLoadingHint=false;renderApp();
};

// ═══════════════ ICONS ═══════════════
function ico(n){
  const ic={
    shield:`<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4 6v6c0 5.5 3.6 10.7 8 12 4.4-1.3 8-6.5 8-12V6l-8-4z"/></svg>`,
  };
  return ic[n]||'';
}

// ═══════════════ INIT ═══════════════
// Check if opened via exam link
const urlExamId=getExamIdFromURL();
if(urlExamId){
  // Student landed via exam link
  if(S.currentTeacher){
    // Teacher accidentally opened student link — show dashboard
    S.view='teacher-dashboard';
  } else {
    S.view='student-join';
  }
} else if(S.currentTeacher){
  S.view='teacher-dashboard';
}

renderApp();

// Close menus on outside click
document.addEventListener('click',e=>{
  const m=document.getElementById('add-menu');
  if(m&&!e.target.closest('[onclick*="toggleAddMenu"]')&&!e.target.closest('#add-menu'))m.style.display='none';
});

// Handle student joining after name entry when URL has exam ID
const _origJoin=window.doJoinByLink;
window.doJoinByLink=()=>{
  const name=document.getElementById('sn')?.value?.trim()||'';
  if(!name){toast('Enter your name','error');return;}
  S.studentName=name;
  const examId=getExamIdFromURL();
  if(examId){joinExam(examId);}
  else{toast('Please open the exam link your teacher sent you.','warn');}
};
</script>
</body>
</html>
