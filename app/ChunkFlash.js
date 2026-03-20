"use client";

import { useState, useEffect, useRef } from "react";

// ─── Sentence banks ───
const SENTENCES_A1A2 = [
  { id: "a1-01", level: "A1-A2", chunks: ["I need", "a glass of water.", "Can you help me?"], q: "この人は何を求めている？", options: ["食べ物がほしい", "水を一杯ほしい", "手伝いを断っている"], answer: 1 },
  { id: "a1-02", level: "A1-A2", chunks: ["The bus", "stops here", "at eight o'clock."], q: "バスについて何がわかる？", options: ["8時にここでバスが止まる", "8時にバスが出発する", "ここにバスは止まらない"], answer: 0 },
  { id: "a1-03", level: "A1-A2", chunks: ["She lives", "near the station", "with her family."], q: "彼女はどこに住んでいる？", options: ["一人でどこか遠くに住んでいる", "家族と駅の近くに住んでいる", "駅の中で働いている"], answer: 1 },
  { id: "a1-04", level: "A1-A2", chunks: ["He works", "at a hospital", "every day."], q: "彼の仕事は？", options: ["毎日病院で働いている", "毎日病院に通院している", "週に一度病院に行く"], answer: 0 },
  { id: "a1-05", level: "A1-A2", chunks: ["We are going", "to the park", "this afternoon."], q: "今日の午後の予定は？", options: ["今日の午後は家にいる", "今日の午後は公園に行く", "今日の朝は公園に行く"], answer: 1 },
  { id: "a1-06", level: "A1-A2", chunks: ["My sister", "is studying", "for her exam."], q: "姉（妹）は今何をしている？", options: ["試験を受けている", "試験勉強をしている", "試験が終わった"], answer: 1 },
  { id: "a1-07", level: "A1-A2", chunks: ["The shop", "opens at nine", "and closes at six."], q: "その店の営業時間は？", options: ["9時から18時まで", "6時から9時まで", "終日営業"], answer: 0 },
  { id: "a1-08", level: "A1-A2", chunks: ["Can you", "call me back", "after five o'clock?"], q: "この人は何を求めている？", options: ["5時前に電話してほしい", "5時以降に折り返し電話してほしい", "電話に出てほしい"], answer: 1 },
  { id: "a1-09", level: "A1-A2", chunks: ["I usually", "have breakfast", "before going to work."], q: "この人の習慣は？", options: ["仕事後に朝食を食べる", "朝食は食べない", "仕事前に朝食を食べる"], answer: 2 },
  { id: "a1-10", level: "A1-A2", chunks: ["The weather", "is very cold", "today."], q: "今日の天気は？", options: ["今日はとても暑い", "今日はとても寒い", "今日は雨が降っている"], answer: 1 },
  { id: "a1-11", level: "A1-A2", chunks: ["They are waiting", "for the train", "on the platform."], q: "彼らはどこで何をしている？", options: ["電車の中で座っている", "ホームで電車を待っている", "駅の外で話している"], answer: 1 },
  { id: "a1-12", level: "A1-A2", chunks: ["Please", "leave a message", "after the tone."], q: "何をするよう言っている？", options: ["電話を切るよう言っている", "発信音の後にメッセージを残すよう言っている", "もう一度かけ直すよう言っている"], answer: 1 },
  { id: "a1-13", level: "A1-A2", chunks: ["There is", "a coffee shop", "on the second floor."], q: "コーヒーショップはどこにある？", options: ["1階にある", "2階にある", "地下にある"], answer: 1 },
  { id: "a1-14", level: "A1-A2", chunks: ["He is not here", "right now.", "Can I take a message?"], q: "この発言の要点は？", options: ["彼は今ここにいない。伝言を預かろうか？", "彼は今ここにいる", "後でかけ直してください"], answer: 0 },
  { id: "a1-15", level: "A1-A2", chunks: ["Turn left", "at the traffic light", "and go straight."], q: "どう進む？", options: ["信号を右折してまっすぐ行く", "信号を左折してまっすぐ行く", "信号でUターンする"], answer: 1 },
];

const SENTENCES_B1 = [
  { id: "b1-01", level: "B1", chunks: ["The manager", "asked the team", "to finish the report", "by Friday."], q: "マネージャーはチームに何を頼んだ？", options: ["金曜までにレポートを完成させること", "チームのメンバーを金曜に集めること", "レポートの内容を金曜に確認すること"], answer: 0 },
  { id: "b1-02", level: "B1", chunks: ["She decided", "to take a break", "after working", "for three hours."], q: "彼女はなぜ休憩を取った？", options: ["疲れていたから", "3時間働いた後だったから", "上司に言われたから"], answer: 1 },
  { id: "b1-03", level: "B1", chunks: ["The train", "to Tokyo", "departs", "at nine fifteen."], q: "この文の要点は？", options: ["東京行きの電車が9:15に出発する", "東京から9:15に電車が到着する", "9:15に東京で電車に乗り換える"], answer: 0 },
  { id: "b1-04", level: "B1", chunks: ["Please send", "the document", "to the client", "before the meeting."], q: "何をいつまでにする？", options: ["会議後にクライアントに連絡する", "会議前にクライアントに書類を送る", "書類を会議中に確認する"], answer: 1 },
  { id: "b1-05", level: "B1", chunks: ["He has been", "living in Osaka", "for about", "five years."], q: "この文が伝えていることは？", options: ["彼は5年前に大阪を離れた", "彼は約5年間大阪に住んでいる", "彼は5年後に大阪に引っ越す"], answer: 1 },
  { id: "b1-06", level: "B1", chunks: ["The new policy", "will be applied", "to all employees", "starting next month."], q: "新しいポリシーについて正しいのは？", options: ["先月から一部の社員に適用された", "来月から全社員に適用される", "来月から新入社員のみに適用される"], answer: 1 },
  { id: "b1-07", level: "B1", chunks: ["Could you", "explain the difference", "between these two", "proposals?"], q: "話し手は何を求めている？", options: ["2つの提案の違いの説明", "2つの提案のどちらがいいかの判断", "新しい提案の作成"], answer: 0 },
  { id: "b1-08", level: "B1", chunks: ["We should", "consider the budget", "before making", "a final decision."], q: "この文の主張は？", options: ["予算を増やすべきだ", "最終決定の前に予算を考慮すべきだ", "予算の決定を先送りすべきだ"], answer: 1 },
  { id: "b1-09", level: "B1", chunks: ["The conference", "was attended", "by more than", "two hundred people."], q: "会議について何がわかる？", options: ["200人以上が参加した", "200人が招待された", "200人未満の参加だった"], answer: 0 },
  { id: "b1-10", level: "B1", chunks: ["I need to", "pick up my daughter", "from school", "at three o'clock."], q: "話し手は何をしなければならない？", options: ["3時に学校に娘を送る", "3時に学校に娘を迎えに行く", "3時に娘と学校に行く"], answer: 1 },
  { id: "b1-11", level: "B1", chunks: ["The restaurant", "on the corner", "is known for", "its fresh seafood."], q: "角のレストランの特徴は？", options: ["新鮮なシーフードで知られている", "角に新しくオープンした", "シーフード以外のメニューが豊富"], answer: 0 },
  { id: "b1-12", level: "B1", chunks: ["If it rains", "tomorrow morning,", "we will postpone", "the outdoor event."], q: "この文が意味していることは？", options: ["明日雨なら屋外イベントを延期する", "明日の朝イベントが中止になった", "雨でも屋外イベントは実施する"], answer: 0 },
  { id: "b1-13", level: "B1", chunks: ["The company", "is planning to", "open a new office", "in Singapore."], q: "会社の計画は？", options: ["シンガポールのオフィスを閉鎖する", "シンガポールに新しいオフィスを開く", "シンガポールから本社を移転する"], answer: 1 },
  { id: "b1-14", level: "B1", chunks: ["Students who", "submitted their essays", "before the deadline", "received extra credit."], q: "追加単位をもらえたのは誰？", options: ["全ての学生", "締切前にエッセイを提出した学生", "エッセイを再提出した学生"], answer: 1 },
  { id: "b1-15", level: "B1", chunks: ["Despite the delay,", "the project", "was completed", "within the original budget."], q: "プロジェクトについて何がわかる？", options: ["遅延があったが当初の予算内で完了した", "遅延のため予算が超過した", "予算内だったが未完成だった"], answer: 0 },
  { id: "b1-16", level: "B1", chunks: ["The doctor", "recommended that", "he should exercise", "at least three times a week."], q: "医者の勧めは？", options: ["週に少なくとも3回運動すること", "3週間は運動を控えること", "毎日3時間運動すること"], answer: 0 },
  { id: "b1-17", level: "B1", chunks: ["I'm afraid", "the deadline has passed", "and we can no longer", "accept new applications."], q: "この発言の要点は？", options: ["まだ申し込みを受け付けている", "締切が過ぎたため新規申し込みは不可", "締切を延長することになった"], answer: 1 },
  { id: "b1-18", level: "B1", chunks: ["Would you mind", "lowering your voice?", "Some people", "are trying to concentrate."], q: "この発言の目的は？", options: ["声を大きくするよう頼んでいる", "静かにするよう頼んでいる", "部屋から出るよう求めている"], answer: 1 },
  { id: "b1-19", level: "B1", chunks: ["The survey results", "suggest that", "most customers", "prefer online shopping."], q: "調査結果が示していることは？", options: ["ほとんどの顧客は店舗を好む", "ほとんどの顧客はオンラインショッピングを好む", "顧客の意見は二分されている"], answer: 1 },
  { id: "b1-20", level: "B1", chunks: ["He was unable", "to attend the meeting", "due to", "a prior commitment."], q: "彼が会議に出席できなかった理由は？", options: ["他に先約があったから", "会議の時間を忘れたから", "体調不良だったから"], answer: 0 },
];

const ALL_SENTENCES = [...SENTENCES_A1A2, ...SENTENCES_B1];

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
const SRS_KEY = "chunk-flash-srs";

function loadLog() {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { return []; }
}
function saveLog(log) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(log)); } catch (e) {}
}
function loadSRS() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(SRS_KEY) || "{}"); } catch { return {}; }
}
function saveSRS(srs) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(SRS_KEY, JSON.stringify(srs)); } catch (e) {}
}

// ─── SRS (SM-2) helpers ───
// quality: 5=perfect, 4=correct, 3=correct after replay, 1=wrong
function srsUpdate(card, quality) {
  const ef = Math.max(1.3, (card.ef || 2.5) + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  let interval, reps;
  if (quality < 3) {
    interval = 1; reps = 0;
  } else {
    reps = (card.reps || 0) + 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round((card.interval || 1) * ef);
  }
  const next = new Date();
  next.setDate(next.getDate() + interval);
  return { ef, interval, reps, nextReview: next.toISOString().slice(0, 10) };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Build session pool: due cards first, then new cards
function buildPool(level, srs) {
  const all = ALL_SENTENCES.filter(s => s.level === level);
  const today = todayStr();
  const due = shuffle(all.filter(s => srs[s.id] && srs[s.id].nextReview <= today));
  const fresh = shuffle(all.filter(s => !srs[s.id]));

  // Take due + new (up to 3 new per session), cap at 8
  let pool = [...due, ...fresh.slice(0, Math.max(3, 8 - due.length))].slice(0, 8);

  // Fallback: fill to 8 with remaining sentences
  if (pool.length < 8) {
    const inPool = new Set(pool.map(s => s.id));
    const rest = shuffle(all.filter(s => !inPool.has(s.id)));
    pool = [...pool, ...rest].slice(0, 8);
  }
  return shuffle(pool);
}

// Stats for HOME screen
function getSRSStats(level, srs) {
  const all = ALL_SENTENCES.filter(s => s.level === level);
  const today = todayStr();
  return {
    due: all.filter(s => srs[s.id] && srs[s.id].nextReview <= today).length,
    fresh: all.filter(s => !srs[s.id]).length,
    learned: all.filter(s => srs[s.id] && (srs[s.id].reps || 0) >= 3).length,
    total: all.length,
  };
}

export default function ChunkFlash() {
  const [phase, setPhase] = useState(P.HOME);
  const [level, setLevel] = useState(null);   // "A1-A2" | "B1"
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
  const [srs, setSrs] = useState({});
  const [askedReplay, setAskedReplay] = useState(false);       // "don't know" used this question
  const [retestAskedReplay, setRetestAskedReplay] = useState(false); // same for retest
  const [aiResult, setAiResult] = useState("");
  const [ttsOn, setTtsOn] = useState(true);
  const [replayCount, setReplayCount] = useState(0);
  const [aiKey, setAiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const tmr = useRef(null);
  const itemLog = useRef([]);

  useEffect(() => {
    setLog(loadLog());
    setSrs(loadSRS());
    if (typeof window !== "undefined") {
      window.speechSynthesis?.getVoices();
      const saved = localStorage.getItem("chunk-flash-ai-key");
      if (saved) setAiKey(saved);
    }
  }, []);

  const s = pool[ci];
  const ms = missed[mi];

  const start = () => {
    if (!level) return;
    const currentSrs = loadSRS();
    const p = buildPool(level, currentSrs);
    setPool(p); setCi(0); setMissed([]); setMi(0); setReplayCount(0); setAskedReplay(false);
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

  const beginRetest = (idx) => { setMi(idx); setRChi(0); setRSel(null); setRetestAskedReplay(false); setPhase(P.RETEST_FLASH); };

  // "わからない / もう一回聞く" — 1回目: リプレイ
  const handleDontKnow = () => {
    const sentenceStr = s.chunks.join(" ");
    const idx = itemLog.current.findIndex(l => l.sentence === sentenceStr);
    if (idx >= 0) {
      itemLog.current[idx].dontKnows = (itemLog.current[idx].dontKnows || 0) + 1;
    } else {
      itemLog.current.push({ sentence: sentenceStr, id: s.id, level: s.level, correct: null, speed: SPEEDS[spd].ms, replays: 0, dontKnows: 1, drilled: false, retestCorrect: null, ts: Date.now() });
    }
    setAskedReplay(true);
    beginReplay();
  };

  // "わからない" — 2回目: スキップ（不正解として記録し次へ）
  const handleSkip = () => {
    const sentenceStr = s.chunks.join(" ");
    const existingIdx = itemLog.current.findIndex(l => l.sentence === sentenceStr);
    if (existingIdx >= 0) {
      itemLog.current[existingIdx].correct = false;
      itemLog.current[existingIdx].skipped = true;
    } else {
      itemLog.current.push({ sentence: sentenceStr, id: s.id, level: s.level, correct: false, speed: SPEEDS[spd].ms, replays: replayCount, dontKnows: 1, drilled: false, skipped: true, retestCorrect: null, ts: Date.now() });
    }
    setStats(p => ({ ...p, total: p.total + 1 }));
    const newMissed = [...missed, s];
    setMissed(newMissed);
    // goNextと同じだが、newMissedを直接使う（stale state回避）
    setSel(null); setChi(-1); setReplayCount(0); setAskedReplay(false);
    if (ci + 1 >= pool.length) {
      if (newMissed.length > 0) beginRetest(0);
      else finishSession();
    } else { setCi(p => p + 1); setPhase(P.READY); }
  };

  // 再テスト: 1回目はリプレイ
  const handleRetestDontKnow = () => {
    setRetestAskedReplay(true);
    setRChi(0);
    setPhase(P.RETEST_FLASH);
  };

  // 再テスト: 2回目はスキップ（不正解として次へ）
  const handleRetestSkip = () => {
    const idx = itemLog.current.findIndex(l => l.sentence === ms.chunks.join(" "));
    if (idx >= 0) itemLog.current[idx].retestCorrect = false;
    setStats(p => ({ ...p, rtotal: p.rtotal + 1 }));
    nextRetest();
  };

  const answer = (i) => {
    if (sel !== null) return;
    setSel(i);
    const ok = i === s.answer;
    setStats((p) => ({ ...p, ok: p.ok + (ok ? 1 : 0), total: p.total + 1 }));
    if (!ok) setMissed((p) => [...p, s]);
    const sentenceStr = s.chunks.join(" ");
    const existingIdx = itemLog.current.findIndex(l => l.sentence === sentenceStr);
    if (existingIdx >= 0) {
      itemLog.current[existingIdx].correct = ok;
      itemLog.current[existingIdx].replays = replayCount;
    } else {
      itemLog.current.push({ sentence: sentenceStr, id: s.id, level: s.level, correct: ok, speed: SPEEDS[spd].ms, replays: replayCount, dontKnows: 0, drilled: false, retestCorrect: null, ts: Date.now() });
    }
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
    setSel(null); setChi(-1); setReplayCount(0); setAskedReplay(false); setRetestAskedReplay(false);
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
    // Update SRS for each item in the session
    const newSrs = { ...loadSRS() };
    itemLog.current.forEach(item => {
      if (!item.id) return;
      const existing = newSrs[item.id] || { ef: 2.5, interval: 0, reps: 0 };
      // Use retest result if available (reflects learning after drill)
      const finalCorrect = item.retestCorrect !== null ? item.retestCorrect : item.correct;
      let quality;
      if (finalCorrect === true) {
        quality = (item.dontKnows > 0 || item.replays > 0) ? 3 : 4;
      } else {
        quality = 1;
      }
      newSrs[item.id] = srsUpdate(existing, quality);
    });
    setSrs(newSrs);
    saveSRS(newSrs);

    const entry = {
      date: new Date().toISOString(),
      level: level,
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
    const levelLabel = level || "不明";
    const prompt = `以下はある英語学習者のChunk Flashトレーニングのログです（学習レベル: ${levelLabel}）。学習者はVersantのリスニング処理が目標で、チャンク単位の意味処理速度が主なボトルネックです。

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
          model: "claude-sonnet-4-6",
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

  if (phase === P.HOME) {
    const stats = level ? getSRSStats(level, srs) : null;
    return (
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

        {/* Level selector */}
        <div style={S.section}>
          <SLabel>レベル</SLabel>
          <div style={S.levelRow}>
            <button onClick={() => setLevel("A1-A2")} style={{ ...S.levelBtn, ...(level === "A1-A2" ? S.levelBtnOn : {}) }}>
              <span style={S.levelBadge}>A1–A2</span>
              <span style={S.levelName}>Versant A1-A2</span>
              <span style={S.levelHint}>入門・基礎レベル</span>
            </button>
            <button onClick={() => setLevel("B1")} style={{ ...S.levelBtn, ...(level === "B1" ? S.levelBtnOn : {}) }}>
              <span style={S.levelBadge}>B1</span>
              <span style={S.levelName}>Versant B1</span>
              <span style={S.levelHint}>中級レベル</span>
            </button>
          </div>
        </div>

        {/* SRS progress */}
        {stats && (
          <div style={S.srsRow}>
            <SrsBadge n={stats.due} label="復習" color="#ff9e44" />
            <SrsBadge n={stats.fresh} label="新規" color="#ffd866" />
            <SrsBadge n={stats.learned} label={`習得済 /${stats.total}`} color="#5dcaa5" />
          </div>
        )}

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
        <button onClick={start} style={{ ...S.primary, opacity: level ? 1 : 0.4, cursor: level ? "pointer" : "not-allowed" }} disabled={!level}>
          スタート
        </button>
        {!level && <p style={{ fontSize: "0.7rem", color: "#504e47", marginTop: "0.5rem" }}>↑ レベルを選んでください</p>}
        {log.length > 0 && (
          <button onClick={() => { setAiResult(""); setPhase(P.LOG); }} style={S.ghost}>📊 学習ログ</button>
        )}
      </div>
    );
  }

  if (phase === P.READY) return (
    <div style={S.page}>
      <Bar v={ci / pool.length} />
      <div style={S.mid}>
        <p style={S.levelTag}>{level}</p>
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
            {/* わからない: 1回目→リプレイ、2回目→スキップ */}
            {!done && (
              <button onClick={askedReplay ? handleSkip : handleDontKnow} style={S.optDontKnow}>
                {askedReplay ? "⏭ わからない（スキップ）" : "🔁 わからない／もう一回聞く"}
              </button>
            )}
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
            {/* わからない in retest: 1回目→リプレイ、2回目→スキップ */}
            {!done && (
              <button onClick={retestAskedReplay ? handleRetestSkip : handleRetestDontKnow} style={S.optDontKnow}>
                {retestAskedReplay ? "⏭ わからない（スキップ）" : "🔁 わからない／もう一回聞く"}
              </button>
            )}
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
    const dontKnows = itemLog.current.filter((i) => (i.dontKnows || 0) > 0);
    const srsStats = level ? getSRSStats(level, srs) : null;
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
          {dontKnows.length > 0 && <p style={S.resMeta}>🔁 もう一回: {dontKnows.length}件</p>}
          {rpct !== null && rpct > pct && <p style={{ ...S.resMeta, color: "#5dcaa5" }}>ドリル後に正答率UP — 分解→再処理が効いてる</p>}
          {srsStats && (
            <p style={S.resMeta}>習得済 {srsStats.learned}/{srsStats.total}文 · 次回の復習 {srsStats.due}件</p>
          )}
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
                      <div style={S.logDate}>
                        {new Date(entry.date).toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {entry.level && <span style={S.logLevel}> {entry.level}</span>}
                      </div>
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

function SrsBadge({ n, label, color }) {
  return (
    <div style={S.srsBadge}>
      <span style={{ ...S.srsBadgeN, color }}>{n}</span>
      <span style={S.srsBadgeL}>{label}</span>
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
  // Level selector
  levelRow: { display: "flex", gap: 8 },
  levelBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "0.75rem 0.6rem", flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, cursor: "pointer", transition: "all 0.15s" },
  levelBtnOn: { background: "rgba(255,216,102,0.06)", border: "1px solid rgba(255,216,102,0.25)" },
  levelBadge: { fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em", color: "#ffd866", background: "rgba(255,216,102,0.08)", padding: "1px 7px", borderRadius: 4 },
  levelName: { fontSize: "0.82rem", fontWeight: 600, color: "#ccc8c0" },
  levelHint: { fontSize: "0.6rem", color: "#504e47" },
  // SRS badges
  srsRow: { display: "flex", gap: 8, maxWidth: 380, width: "100%", marginBottom: "0.8rem" },
  srsBadge: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1, padding: "0.5rem 0.3rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8 },
  srsBadgeN: { fontSize: "1.1rem", fontWeight: 700 },
  srsBadgeL: { fontSize: "0.55rem", color: "#504e47", letterSpacing: "0.03em" },
  // Speed
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
  levelTag: { fontSize: "0.6rem", color: "#504e47", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.2rem" },
  dim: { fontSize: "0.75rem", color: "#504e47", letterSpacing: "0.08em", marginBottom: "0.7rem" },
  flashBtn: { padding: "0.75rem 2rem", fontSize: "0.88rem", fontWeight: 600, background: "rgba(255,216,102,0.07)", color: "#ffd866", border: "1px solid rgba(255,216,102,0.18)", borderRadius: 10, cursor: "pointer" },
  chunk: { fontSize: "1.7rem", fontWeight: 600, color: "#fff", textShadow: "0 0 28px rgba(255,216,102,0.1)", lineHeight: 1.4 },
  qWrap: { maxWidth: 440, width: "100%", textAlign: "center" },
  qTxt: { fontSize: "1rem", fontWeight: 600, color: "#ccc8c0", marginBottom: "1.1rem", lineHeight: 1.6 },
  opts: { display: "flex", flexDirection: "column", gap: 7, marginBottom: "0.8rem" },
  opt: { padding: "0.75rem 1rem", fontSize: "0.85rem", lineHeight: 1.5, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#b5b2aa", cursor: "pointer", textAlign: "left", transition: "all 0.15s" },
  optOk: { background: "rgba(93,202,165,0.1)", border: "1px solid rgba(93,202,165,0.3)", color: "#5dcaa5" },
  optBad: { background: "rgba(240,80,80,0.07)", border: "1px solid rgba(240,80,80,0.2)", color: "#f09595" },
  // "わからない" button
  optDontKnow: { padding: "0.65rem 1rem", fontSize: "0.8rem", lineHeight: 1.5, background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 10, color: "#6b6860", cursor: "pointer", textAlign: "center", transition: "all 0.15s" },
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
  logLevel: { fontSize: "0.62rem", color: "#ffd866", background: "rgba(255,216,102,0.07)", padding: "0 5px", borderRadius: 3, marginLeft: 4 },
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
