"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Sentence bank ───
const SENTENCES = [
  { chunks: ["The manager", "asked the team", "to finish the report", "by Friday."], q: "マネージャーはチームに何を頼んだ？", options: ["金曜までにレポートを完成させること", "チームのメンバーを金曜に集めること", "レポートの内容を金曜に確認すること"], answer: 0 },
  { chunks: ["She decided", "to take a break", "after working", "for three hours."], q: "彼女はなぜ休憩を取った？", options: ["疲れていたから", "3時間働いた後だったから", "上司に言われたから"], answer: 1 },
  { chunks: ["The train", "to Tokyo", "departs", "at nine fifteen."], q: "この文の要点は？", options: ["東京行きの電車が9:15に出発する", "東京から9:15に電車が到着する", "9:15に東京で電車に乗り換える"], answer: 0 },
  { chunks: ["Please send", "the document", "to the client", "before the meeting."], q: "何をいつまでにする？", options: ["会議後にクライアントに連絡する", "会議前にクライアントに書類を送る", "書類を会議中に確認する"], answer: 1 },
  { chunks: ["He has been", "living in Osaka", "for about", "five years."], q: "この文が伝えていることは？", options: ["彼は5年前に大阪を離れた", "彼は約5年間大阪に住んでいる", "彼は5年後に大阪に引っ越す"], answer: 1 },
  { chunks: ["The new policy", "will be applied", "to all employees", "starting next month."], q: "新しいポリシーについて正しいのは？", options: ["先月から一部の社員に適用された", "来月から全社員に適用される", "来月から新入社員のみに適用される"], answer: 1 },
  { chunks: ["Could you", "explain the difference", "between these two", "proposals?"], q: "話し手は何を求めている？", options: ["2つの提案の違いの説明", "2つの提案のどちらがいいかの判断", "新しい提案の作成"], answer: 0 },
  { chunks: ["We should", "consider the budget", "before making", "a final decision."], q: "この文の主張は？", options: ["予算を増やすべきだ", "最終決定の前に予算を考慮すべきだ", "予算の決定を先送りすべきだ"], answer: 1 },
  { chunks: ["The conference", "was attended", "by more than", "two hundred people."], q: "会議について何がわかる？", options: ["200人以上が参加した", "200人が招待された", "200人未満の参加だった"], answer: 0 },
  { chunks: ["I need to", "pick up my daughter", "from school", "at three o'clock."], q: "話し手は何をしなければならない？", options: ["3時に学校に娘を送る", "3時に学校に娘を迎えに行く", "3時に娘と学校に行く"], answer: 1 },
  { chunks: ["The restaurant", "on the corner", "is known for", "its fresh seafood."], q: "角のレストランの特徴は？", options: ["新鮮なシーフードで知られている", "角に新しくオープンした", "シーフード以外のメニューが豊富"], answer: 0 },
  { chunks: ["If it rains", "tomorrow morning,", "we will postpone", "the outdoor event."], q: "この文が意味していることは？", options: ["明日雨なら屋外イベントを延期する", "明日の朝イベントが中止になった", "雨でも屋外イベントは実施する"], answer: 0 },
  { chunks: ["The company", "is planning to", "open a new office", "in Singapore."], q: "会社の計画は？", options: ["シンガポールのオフィスを閉鎖する", "シンガポールに新しいオフィスを開く", "シンガポールから本社を移転する"], answer: 1 },
  { chunks: ["Students who", "submitted their essays", "before the deadline", "received extra credit."], q: "追加単位をもらえたのは誰？", options: ["全ての学生", "締切前にエッセイを提出した学生", "エッセイを再提出した学生"], answer: 1 },
  { chunks: ["Despite the delay,", "the project", "was completed", "within the original budget."], q: "プロジェクトについて何がわかる？", options: ["遅延があったが当初の予算内で完了した", "遅延のため予算が超過した", "予算内だったが未完成だった"], answer: 0 },
  { chunks: ["The doctor", "recommended that", "he should exercise", "at least three times a week."], q: "医者の勧めは？", options: ["週に少なくとも3回運動すること", "3週間は運動を控えること", "毎日3時間運動すること"], answer: 0 },
];

const SPEEDS = [
  { label: "ゆっくり", ms: 1800, emoji: "🐢" },
  { label: "ふつう", ms: 1200, emoji: "🚶" },
  { label: "速い", ms: 800, emoji: "🏃" },
  { label: "Versant級", ms: 500, emoji: "⚡" },
];

const P = { HOME: 0, READY: 1, FLASH: 2, QUESTION: 3, REPLAY: 4, DRILL: 5, RETEST_FLASH: 7, RETEST_Q: 8, RESULTS: 9, LOG: 10, ANALYZING: 11 };

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.92;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.find((v) => v.lang.startsWith("en") && v.name.includes("Female")) || voices.find((v) => v.lang.startsWith("en"));
  if (en) u.voice = en;
  window.speechSynthesis.speak(u);
}

// ─── localStorage helpers ───
const STORE_KEY = "chunk-flash-log";
function loadLog() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveLog(log) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(log));
  } catch (e) {
    console.error("Failed to save log:", e);
  }
}

export default function ChunkFlash() {
  const [phase, setPhase] = useState(P.HOME);
  const [spd, setSpd] = useState(1);
  const [pool, setPool] = useState([]);
  const [ci, setCi] = useState(0);
  const [chi, setChi] = useState(-1);
  const [sel, setSel] = useState(null);
  const [missed, setMissed] = useState([]);
  const [mi, setMi] = useState(0);
  const [rChi, setRChi] = useState(-1);
  const [rSel, setRSel] = useState(null);
  const [stats, setStats] = useState({ ok: 0, total: 0, rok: 0, rtotal: 0 });
  const [drillChi, setDrillChi] = useState(0);
  const [drillDone, setDrillDone] = useState(false);
  const [log, setLog] = useState([]);
  const [aiResult, setAiResult] = useState("");
  const [ttsOn, setTtsOn] = useState(true);
  const [replayCount, setReplayCount] = useState(0);
  const [aiKey, setAiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const tmr = useRef(null);
  const itemLog = useRef([]);

  useEffect(() => {
    setLog(loadLog());
    if (typeof window !== "undefined") {
      window.speechSynthesis?.getVoices();
      const saved = localStorage.getItem("chunk-flash-ai-key");
      if (saved) setAiKey(saved);
    }
  }, []);

  const s = pool[ci];
  const ms = missed[mi];

  const start = () => {
    const p = shuffle(SENTENCES).slice(0, 8);
    setPool(p); setCi(0); setMissed([]); setMi(0); setReplayCount(0);
    setStats({ ok: 0, total: 0, rok: 0, rtotal: 0 });
    itemLog.current = [];
    setPhase(P.READY);
  };

  const beginFlash = () => { setChi(0); setSel(null); setPhase(P.FLASH); };

  useEffect(() => {
    if (phase !== P.FLASH && phase !== P.REPLAY) return;
    if (!s) return;
    if (chi >= s.chunks.length) {
      if (ttsOn) speak(s.chunks.join(" "));
      setPhase(P.QUESTION);
      return;
    }
    tmr.current = setTimeout(() => setChi((p) => p + 1), SPEEDS[spd].ms);
    return () => clearTimeout(tmr.current);
  }, [phase, chi, spd, s, ttsOn]);

  const beginReplay = () => { setChi(0); setPhase(P.REPLAY); setReplayCount((p) => p + 1); };

  useEffect(() => {
    if (phase !== P.RETEST_FLASH) return;
    const t = missed[mi];
    if (!t) return;
    if (rChi >= t.chunks.length) {
      if (ttsOn) speak(t.chunks.join(" "));
      setPhase(P.RETEST_Q);
      return;
    }
    tmr.current = setTimeout(() => setRChi((p) => p + 1), SPEEDS[spd].ms);
    return () => clearTimeout(tmr.current);
  }, [phase, rChi, spd, mi, missed, ttsOn]);

  const beginRetest = (idx) => { setMi(idx); setRChi(0); setRSel(null); setPhase(P.RETEST_FLASH); };

  const answer = (i) => {
    if (sel !== null) return;
    setSel(i);
    const ok = i === s.answer;
    setStats((p) => ({ ...p, ok: p.ok + (ok ? 1 : 0), total: p.total + 1 }));
    if (!ok) setMissed((p) => [...p, s]);
    itemLog.current.push({
      sentence: s.chunks.join(" "), correct: ok, speed: SPEEDS[spd].ms,
      replays: replayCount, drilled: false, retestCorrect: null, ts: Date.now(),
    });
  };

  const retestAnswer = (i) => {
    if (rSel !== null) return;
    setRSel(i);
    const ok = i === ms.answer;
    setStats((p) => ({ ...p, rok: p.rok + (ok ? 1 : 0), rtotal: p.rtotal + 1 }));
    const idx = itemLog.current.findIndex((l) => l.sentence === ms.chunks.join(" "));
    if (idx >= 0) itemLog.current[idx].retestCorrect = ok;
  };

  const afterAnswer = () => {
    const ok = sel === s.answer;
    if (!ok) { setDrillChi(0); setDrillDone(false); setPhase(P.DRILL); }
    else goNext();
  };

  const goNext = () => {
    setSel(null); setChi(-1); setReplayCount(0);
    if (ci + 1 >= pool.length) {
      if (missed.length > 0) beginRetest(0);
      else finishSession();
    } else { setCi((p) => p + 1); setPhase(P.READY); }
  };

  const afterDrill = () => {
    const idx = itemLog.current.findIndex((l) => l.sentence === s.chunks.join(" "));
    if (idx >= 0) itemLog.current[idx].drilled = true;
    goNext();
  };

  const nextRetest = () => {
    if (mi + 1 >= missed.length) finishSession();
    else beginRetest(mi + 1);
  };

  const finishSession = () => {
    const entry = {
      date: new Date().toISOString(),
      speed: SPEEDS[spd].label,
      speedMs: SPEEDS[spd].ms,
      items: [...itemLog.current],
      stats: { ...stats },
    };
    const newLog = [...log, entry];
    setLog(newLog);
    saveLog(newLog);
    setPhase(P.RESULTS);
  };

  const runAnalysis = async () => {
    if (!aiKey) { setShowKeyInput(true); return; }
    setPhase(P.ANALYZING); setAiResult("");
    const recent = log.slice(-5);
    const prompt = `以下はある英語学習者のチャンクフラッシュトレーニングのログです。この学習者はVersantのリスニングが弱く（GSE 17、CEFR <A1）、チャンク単位の意味処理速度が主なボトルネックです。

ログを分析して、以下を簡潔に日本語で教えてください：
1. どのタイプの文で躓いているか（パターンの特定）
2. 処理が追いつかない原因の仮説
3. 次にやるべき具体的なアクション（1-2個）

ログ:
${JSON.stringify(recent, null, 2)}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": aiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      if (data.error) {
        setAiResult("APIエラー: " + (data.error.message || JSON.stringify(data.error)));
      } else {
        const text = data.content?.map((c) => c.text || "").join("\n") || "分析結果を取得できませんでした。";
        setAiResult(text);
      }
    } catch (e) {
      setAiResult("エラーが発生しました: " + e.message);
    }
    setPhase(P.LOG);
  };

  const saveApiKey = (key) => {
    setAiKey(key);
    localStorage.setItem("chunk-flash-ai-key", key);
    setShowKeyInput(false);
  };

  const exportLog = () => {
    const text = JSON.stringify(log, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `chunk-flash-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── RENDERS ───

  if (phase === P.HOME) return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={S.logo}>⚡</div>
        <h1 style={S.title}>Chunk Flash</h1>
        <p style={S.sub}>チャンク処理速度トレーニング</p>
      </div>
      <div style={S.card}>
        <Step n="1">チャンク単位でフラッシュ表示</Step>
        <Step n="2">文全体の意味を問う質問に回答</Step>
        <Step n="3">間違い → ドリル分解 → 再テスト</Step>
      </div>
      <div style={S.section}>
        <SLabel>スピード</SLabel>
        <div style={S.spdRow}>
          {SPEEDS.map((sp, i) => (
            <button key={i} onClick={() => setSpd(i)} style={{ ...S.chip, ...(spd === i ? S.chipOn : {}) }}>
              <span>{sp.emoji}</span>
              <span style={S.chipLbl}>{sp.label}</span>
              <span style={S.chipMs}>{sp.ms}ms</span>
            </button>
          ))}
        </div>
      </div>
      <div style={S.section}>
        <SLabel>読み上げ</SLabel>
        <button onClick={() => setTtsOn(!ttsOn)} style={{ ...S.ttsBtn, ...(ttsOn ? S.ttsBtnOn : {}) }}>
          {ttsOn ? "🔊 ON" : "🔇 OFF"}
        </button>
      </div>
      <button onClick={start} style={S.primary}>スタート（8問）</button>
      {log.length > 0 && (
        <button onClick={() => { setAiResult(""); setPhase(P.LOG); }} style={S.ghost}>📊 学習ログ</button>
      )}
    </div>
  );

  if (phase === P.READY) return (
    <div style={S.page}>
      <Bar v={ci / pool.length} />
      <div style={S.mid}>
        <p style={S.dim}>{ci + 1} / {pool.length}</p>
        <button onClick={beginFlash} style={S.flashBtn}>タップして表示</button>
      </div>
    </div>
  );

  if (phase === P.FLASH || phase === P.REPLAY) {
    const cks = s?.chunks || [];
    return (
      <div style={S.page}>
        <Bar v={ci / pool.length} />
        <div style={S.mid}>
          <Dots n={cks.length} active={chi} />
          <div key={`${phase}-${chi}`} style={S.chunk}>{cks[chi] || "..."}</div>
        </div>
      </div>
    );
  }

  if (phase === P.QUESTION) {
    const done = sel !== null;
    const ok = done && sel === s.answer;
    return (
      <div style={S.page}>
        <Bar v={(ci + 0.5) / pool.length} />
        <div style={S.qWrap}>
          <p style={S.qTxt}>{s.q}</p>
          <div style={S.opts}>
            {s.options.map((o, i) => {
              let st = S.opt;
              if (done) {
                if (i === s.answer) st = { ...st, ...S.optOk };
                else if (i === sel) st = { ...st, ...S.optBad };
                else st = { ...st, opacity: 0.35 };
              }
              return <button key={i} onClick={() => answer(i)} style={st} disabled={done}>{o}</button>;
            })}
          </div>
          {done && (
            <div style={S.after}>
              <Full cks={s.chunks} />
              {ttsOn && <button onClick={() => speak(s.chunks.join(" "))} style={S.tinyBtn}>🔊 もう一度聞く</button>}
              <div style={S.btnRow}>
                <button onClick={beginReplay} style={S.ghostSm}>↻ もう一回見る</button>
                <button onClick={afterAnswer} style={S.nextBtn}>{ok ? "次へ →" : "ドリルで分解 →"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === P.DRILL) {
    const cks = s.chunks;
    return (
      <div style={S.page}>
        <Bar v={(ci + 0.5) / pool.length} />
        <div style={S.qWrap}>
          <p style={S.drillH}>チャンク分解ドリル</p>
          <p style={S.drillSub}>一つずつ、頭の中でイメージを作ってください</p>
          <div style={S.drillList}>
            {cks.map((c, i) => (
              <div key={i} style={{ ...S.drillRow, opacity: i <= drillChi ? 1 : 0.15, transform: i <= drillChi ? "none" : "translateX(8px)", transition: "all 0.3s" }}>
                <span style={S.drillN}>{i + 1}</span>
                <span style={S.drillTxt}>{c}</span>
                {i === drillChi && ttsOn && <button onClick={() => speak(c)} style={S.miniSpk}>🔊</button>}
              </div>
            ))}
          </div>
          {drillChi < cks.length - 1 ? (
            <button onClick={() => setDrillChi((p) => p + 1)} style={S.nextBtn}>次のチャンク →</button>
          ) : !drillDone ? (
            <button onClick={() => { setDrillDone(true); if (ttsOn) speak(cks.join(" ")); }} style={S.nextBtn}>全体を確認 →</button>
          ) : (
            <div style={S.after}>
              <Full cks={cks} sep=" / " />
              <p style={S.drillA}>✓ {s.options[s.answer]}</p>
              <button onClick={afterDrill} style={S.nextBtn}>
                {ci + 1 >= pool.length ? (missed.length > 0 ? "再テストへ →" : "結果を見る") : "次の問題へ →"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === P.RETEST_FLASH) {
    const cks = ms?.chunks || [];
    return (
      <div style={S.page}>
        <Bar v={mi / missed.length} color="#ff9e44" />
        <div style={S.mid}>
          <p style={S.retestTag}>再テスト {mi + 1}/{missed.length}</p>
          <Dots n={cks.length} active={rChi} />
          <div key={rChi} style={S.chunk}>{cks[rChi] || "..."}</div>
        </div>
      </div>
    );
  }

  if (phase === P.RETEST_Q) {
    const done = rSel !== null;
    return (
      <div style={S.page}>
        <Bar v={(mi + 0.5) / missed.length} color="#ff9e44" />
        <div style={S.qWrap}>
          <p style={S.retestTag}>再テスト {mi + 1}/{missed.length}</p>
          <p style={S.qTxt}>{ms.q}</p>
          <div style={S.opts}>
            {ms.options.map((o, i) => {
              let st = S.opt;
              if (done) {
                if (i === ms.answer) st = { ...st, ...S.optOk };
                else if (i === rSel) st = { ...st, ...S.optBad };
                else st = { ...st, opacity: 0.35 };
              }
              return <button key={i} onClick={() => retestAnswer(i)} style={st} disabled={done}>{o}</button>;
            })}
          </div>
          {done && (
            <div style={S.after}>
              <Full cks={ms.chunks} sep=" / " />
              <button onClick={nextRetest} style={S.nextBtn}>
                {mi + 1 >= missed.length ? "結果を見る" : "次へ →"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === P.RESULTS) {
    const pct = stats.total ? Math.round((stats.ok / stats.total) * 100) : 0;
    const rpct = stats.rtotal ? Math.round((stats.rok / stats.rtotal) * 100) : null;
    const replayed = itemLog.current.filter((i) => i.replays > 0);
    const drilled = itemLog.current.filter((i) => i.drilled);
    return (
      <div style={S.page}>
        <div style={S.resWrap}>
          <div style={S.logo}>⚡</div>
          <h2 style={S.resTitle}>トレーニング完了</h2>
          <div style={S.statsRow}>
            <StatCard label="初回正答率" val={`${pct}%`} sub={`${stats.ok}/${stats.total}`} />
            <StatCard label="スピード" val={SPEEDS[spd].emoji} sub={SPEEDS[spd].label} />
            {rpct !== null && <StatCard label="再テスト" val={`${rpct}%`} sub={`${stats.rok}/${stats.rtotal}`} />}
          </div>
          {replayed.length > 0 && <p style={S.resMeta}>↻ リプレイ: {replayed.length}件</p>}
          {drilled.length > 0 && <p style={S.resMeta}>🔨 ドリル: {drilled.length}件</p>}
          {rpct !== null && rpct > pct && <p style={{ ...S.resMeta, color: "#5dcaa5" }}>ドリル後に正答率UP — 分解→再処理が効いてる</p>}
          <div style={S.advice}>
            {pct >= 80 ? "安定してる。スピードを上げてみよう。" : pct >= 50 ? "半分以上OK。もう数セッション回すと安定する。" : "この速度はまだきつい。一段下げてドリルサイクルを回そう。"}
          </div>
          <div style={S.btnCol}>
            <button onClick={start} style={S.primary}>もう一度</button>
            <button onClick={() => { setAiResult(""); setPhase(P.LOG); }} style={S.ghost}>📊 学習ログ・AI分析</button>
            <button onClick={() => setPhase(P.HOME)} style={S.ghost}>ホームに戻る</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === P.LOG || phase === P.ANALYZING) {
    return (
      <div style={S.page}>
        <div style={S.logWrap}>
          <h2 style={S.logTitle}>学習ログ</h2>
          {log.length === 0 ? <p style={S.dim}>まだデータがありません</p> : (
            <>
              <div style={S.logScroll}>
                {[...log].reverse().map((entry, idx) => {
                  const firstPct = entry.stats?.total ? Math.round((entry.stats.ok / entry.stats.total) * 100) : 0;
                  const drillCount = entry.items?.filter((i) => i.drilled).length || 0;
                  const replayCount = entry.items?.filter((i) => i.replays > 0).length || 0;
                  return (
                    <div key={idx} style={S.logEntry}>
                      <div style={S.logDate}>{new Date(entry.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                      <div style={S.logStats}>
                        <span>{entry.speed} ({entry.speedMs}ms)</span>
                        <span>正答 {firstPct}%</span>
                        {drillCount > 0 && <span>ドリル {drillCount}件</span>}
                        {replayCount > 0 && <span>リプレイ {replayCount}件</span>}
                      </div>
                      {entry.items?.filter((i) => !i.correct).map((it, j) => (
                        <div key={j} style={S.logMiss}>✗ {it.sentence}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div style={S.btnCol}>
                {showKeyInput ? (
                  <div style={S.keyInputWrap}>
                    <p style={S.keyLabel}>Anthropic APIキーを入力</p>
                    <p style={S.keyHint}>AI分析に必要です。キーはこの端末にのみ保存されます。</p>
                    <input
                      type="password" placeholder="sk-ant-..."
                      style={S.keyInput}
                      onKeyDown={(e) => { if (e.key === "Enter" && e.target.value) saveApiKey(e.target.value); }}
                    />
                    <div style={S.btnRow}>
                      <button onClick={() => setShowKeyInput(false)} style={S.ghostSm}>キャンセル</button>
                      <button onClick={(e) => {
                        const input = e.target.parentElement.parentElement.querySelector("input");
                        if (input?.value) saveApiKey(input.value);
                      }} style={S.nextBtn}>保存</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={runAnalysis} style={S.primary} disabled={phase === P.ANALYZING}>
                    {phase === P.ANALYZING ? "分析中..." : "🤖 AIに分析してもらう"}
                  </button>
                )}
                <button onClick={exportLog} style={S.ghost}>📥 ログをJSONで書き出す</button>
              </div>
              {aiResult && (
                <div style={S.aiBox}>
                  <p style={S.aiLabel}>AI分析結果</p>
                  <div style={S.aiText}>{aiResult}</div>
                </div>
              )}
            </>
          )}
          <div style={{ ...S.btnCol, marginTop: "1rem" }}>
            <button onClick={() => setPhase(P.HOME)} style={S.ghost}>← ホームに戻る</button>
            {log.length > 0 && (
              <button onClick={() => { if (confirm("全ログを削除しますか？")) { saveLog([]); setLog([]); } }} style={{ ...S.ghost, color: "#f09595", fontSize: "0.7rem" }}>ログを全削除</button>
            )}
            {aiKey && (
              <button onClick={() => { localStorage.removeItem("chunk-flash-ai-key"); setAiKey(""); }} style={{ ...S.ghost, fontSize: "0.7rem" }}>APIキーを削除</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Small components ───
function Bar({ v, color }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.04)", zIndex: 10 }}>
      <div style={{ height: "100%", width: `${Math.min(v * 100, 100)}%`, background: color || "linear-gradient(90deg,#ffd866,#ff9e44)", transition: "width 0.4s", borderRadius: "0 2px 2px 0" }} />
    </div>
  );
}

function Dots({ n, active }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", transition: "all 0.2s",
          background: i === active ? "#ffd866" : i < active ? "rgba(255,216,102,0.25)" : "rgba(255,255,255,0.08)",
          boxShadow: i === active ? "0 0 10px rgba(255,216,102,0.45)" : "none",
          transform: i === active ? "scale(1.3)" : "none",
        }} />
      ))}
    </div>
  );
}

function Full({ cks, sep = " " }) {
  return (
    <div style={S.fullBox}>
      {cks.map((c, i) => <span key={i} style={{ color: "#a09c94" }}>{c}{i < cks.length - 1 ? sep : ""}</span>)}
    </div>
  );
}

function Step({ n, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.82rem", color: "#9a968e", marginBottom: 8 }}>
      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,216,102,0.1)", color: "#ffd866", fontSize: "0.68rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
      <span>{children}</span>
    </div>
  );
}

function SLabel({ children }) {
  return <p style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#504e47", marginBottom: "0.5rem", textAlign: "center" }}>{children}</p>;
}

function StatCard({ label, val, sub }) {
  return (
    <div style={S.statCard}>
      <span style={S.statV}>{val}</span>
      <span style={S.statL}>{label}</span>
      {sub && <span style={S.statS}>{sub}</span>}
    </div>
  );
}

// ─── Styles ───
const S = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.25rem", fontFamily: "'IBM Plex Sans','Noto Sans JP',system-ui,sans-serif", background: "#0b0b11", color: "#ddd9d0" },
  hero: { textAlign: "center", marginBottom: "1.25rem" },
  logo: { fontSize: "2rem", marginBottom: "0.2rem", filter: "drop-shadow(0 0 14px rgba(255,190,60,0.3))" },
  title: { fontSize: "1.7rem", fontWeight: 700, margin: "0 0 0.1rem", letterSpacing: "-0.03em", background: "linear-gradient(135deg,#ffd866,#ff9e44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sub: { fontSize: "0.78rem", color: "#6b6860", margin: 0, letterSpacing: "0.05em" },
  card: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 14, padding: "1.1rem 1.3rem", maxWidth: 380, width: "100%", marginBottom: "1.25rem" },
  section: { maxWidth: 380, width: "100%", marginBottom: "1rem" },
  spdRow: { display: "flex", gap: 5 },
  chip: { display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "0.5rem 0.4rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 9, color: "#7a776f", cursor: "pointer", flex: 1, fontSize: "0.75rem", transition: "all 0.15s" },
  chipOn: { background: "rgba(255,216,102,0.06)", border: "1px solid rgba(255,216,102,0.22)", color: "#ffd866" },
  chipLbl: { fontSize: "0.7rem", fontWeight: 600 },
  chipMs: { fontSize: "0.55rem", opacity: 0.5 },
  ttsBtn: { padding: "0.4rem 1rem", fontSize: "0.8rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, color: "#7a776f", cursor: "pointer", display: "block", margin: "0 auto" },
  ttsBtnOn: { background: "rgba(93,202,165,0.08)", border: "1px solid rgba(93,202,165,0.25)", color: "#5dcaa5" },
  primary: { padding: "0.8rem 2.2rem", fontSize: "0.92rem", fontWeight: 600, background: "linear-gradient(135deg,#ffd866,#ff9e44)", color: "#0b0b11", border: "none", borderRadius: 12, cursor: "pointer", boxShadow: "0 4px 18px rgba(255,158,68,0.18)" },
  ghost: { padding: "0.55rem 1.2rem", fontSize: "0.8rem", background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#8a8780", cursor: "pointer", marginTop: "0.5rem" },
  ghostSm: { padding: "0.5rem 1rem", fontSize: "0.78rem", background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, color: "#8a8780", cursor: "pointer" },
  mid: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center" },
  dim: { fontSize: "0.75rem", color: "#504e47", letterSpacing: "0.08em", marginBottom: "0.7rem" },
  flashBtn: { padding: "0.75rem 2rem", fontSize: "0.88rem", fontWeight: 600, background: "rgba(255,216,102,0.07)", color: "#ffd866", border: "1px solid rgba(255,216,102,0.18)", borderRadius: 10, cursor: "pointer" },
  chunk: { fontSize: "1.7rem", fontWeight: 600, color: "#fff", textShadow: "0 0 28px rgba(255,216,102,0.1)", lineHeight: 1.4 },
  qWrap: { maxWidth: 440, width: "100%", textAlign: "center" },
  qTxt: { fontSize: "1rem", fontWeight: 600, color: "#ccc8c0", marginBottom: "1.1rem", lineHeight: 1.6 },
  opts: { display: "flex", flexDirection: "column", gap: 7, marginBottom: "0.8rem" },
  opt: { padding: "0.75rem 1rem", fontSize: "0.85rem", lineHeight: 1.5, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#b5b2aa", cursor: "pointer", textAlign: "left", transition: "all 0.15s" },
  optOk: { background: "rgba(93,202,165,0.1)", border: "1px solid rgba(93,202,165,0.3)", color: "#5dcaa5" },
  optBad: { background: "rgba(240,80,80,0.07)", border: "1px solid rgba(240,80,80,0.2)", color: "#f09595" },
  after: { marginTop: "0.8rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.7rem" },
  fullBox: { fontSize: "0.78rem", color: "#7a776f", padding: "0.6rem 0.9rem", background: "rgba(255,255,255,0.02)", borderRadius: 8, lineHeight: 1.7, fontFamily: "'IBM Plex Mono',monospace" },
  nextBtn: { padding: "0.6rem 1.5rem", fontSize: "0.82rem", fontWeight: 600, background: "rgba(255,216,102,0.07)", color: "#ffd866", border: "1px solid rgba(255,216,102,0.15)", borderRadius: 10, cursor: "pointer" },
  tinyBtn: { padding: "0.35rem 0.8rem", fontSize: "0.7rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, color: "#8a8780", cursor: "pointer" },
  btnRow: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  btnCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: "0.5rem" },
  drillH: { fontSize: "1rem", fontWeight: 700, color: "#ffd866", marginBottom: "0.3rem" },
  drillSub: { fontSize: "0.75rem", color: "#6b6860", marginBottom: "1.2rem" },
  drillList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.2rem", textAlign: "left" },
  drillRow: { display: "flex", alignItems: "center", gap: 10 },
  drillN: { width: 20, height: 20, borderRadius: "50%", background: "rgba(255,216,102,0.07)", color: "#ffd866", fontSize: "0.6rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  drillTxt: { fontSize: "1.05rem", fontWeight: 500, color: "#e0ddd5" },
  drillA: { fontSize: "0.85rem", color: "#5dcaa5", fontWeight: 600 },
  miniSpk: { padding: "2px 6px", fontSize: "0.65rem", background: "none", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, cursor: "pointer", flexShrink: 0 },
  retestTag: { fontSize: "0.72rem", color: "#ff9e44", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "0.8rem" },
  resWrap: { maxWidth: 420, width: "100%", textAlign: "center" },
  resTitle: { fontSize: "1.3rem", fontWeight: 700, margin: "0.3rem 0 1.1rem", color: "#e0ddd5" },
  statsRow: { display: "flex", gap: 7, marginBottom: "1rem", justifyContent: "center" },
  statCard: { display: "flex", flexDirection: "column", gap: 2, padding: "0.8rem 0.6rem", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", flex: 1, alignItems: "center" },
  statV: { fontSize: "1.2rem", fontWeight: 700, color: "#ffd866" },
  statL: { fontSize: "0.6rem", color: "#504e47", letterSpacing: "0.04em" },
  statS: { fontSize: "0.62rem", color: "#6b6860" },
  resMeta: { fontSize: "0.75rem", color: "#8a8780", marginBottom: "0.3rem" },
  advice: { fontSize: "0.8rem", color: "#8a8780", lineHeight: 1.7, marginBottom: "1rem", padding: "0.6rem 0.9rem", background: "rgba(255,255,255,0.015)", borderRadius: 8 },
  logWrap: { maxWidth: 460, width: "100%", textAlign: "center" },
  logTitle: { fontSize: "1.2rem", fontWeight: 700, color: "#e0ddd5", marginBottom: "1rem" },
  logScroll: { maxHeight: 320, overflowY: "auto", marginBottom: "1rem", textAlign: "left" },
  logEntry: { padding: "0.7rem 0.8rem", background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: 6, border: "1px solid rgba(255,255,255,0.03)" },
  logDate: { fontSize: "0.7rem", color: "#6b6860", marginBottom: 4 },
  logStats: { fontSize: "0.75rem", color: "#9a968e", display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 4 },
  logMiss: { fontSize: "0.72rem", color: "#f09595", opacity: 0.7, marginTop: 2, fontFamily: "'IBM Plex Mono',monospace" },
  aiBox: { marginTop: "1rem", textAlign: "left", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)" },
  aiLabel: { fontSize: "0.7rem", color: "#ffd866", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "0.5rem" },
  aiText: { fontSize: "0.82rem", color: "#b5b2aa", lineHeight: 1.75, whiteSpace: "pre-wrap" },
  keyInputWrap: { padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", maxWidth: 340, width: "100%" },
  keyLabel: { fontSize: "0.82rem", color: "#ccc8c0", fontWeight: 600, marginBottom: "0.3rem" },
  keyHint: { fontSize: "0.7rem", color: "#6b6860", marginBottom: "0.7rem", lineHeight: 1.5 },
  keyInput: { width: "100%", padding: "0.6rem 0.8rem", fontSize: "0.82rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#ddd9d0", fontFamily: "'IBM Plex Mono',monospace", marginBottom: "0.7rem", outline: "none" },
};
