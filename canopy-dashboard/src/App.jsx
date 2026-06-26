import React, { useState, useRef, useMemo, useEffect } from "react";
import "./dashboard.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Upload,
  X,
  Trash2,
  Sparkles,
  Users,
  Eye,
  Heart,
  Leaf,
  ImageOff,
  Play,
  Crown,
} from "lucide-react";

/* -------------------------------------------------------------------- */
/* Brand icons (lucide-react removed these in newer versions)           */
/* -------------------------------------------------------------------- */

function Facebook({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function Instagram({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function Linkedin({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function Youtube({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

function Pinterest({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.265.64 1.265 1.408 0 .858-.546 2.140-.828 3.330-.236.995.499 1.806 1.476 1.806 1.772 0 3.137-1.868 3.137-4.566 0-2.387-1.715-4.057-4.163-4.057-2.837 0-4.498 2.128-4.498 4.330 0 .857.33 1.776.741 2.279a.3.3 0 0 1 .069.284c-.076.312-.244.995-.277 1.134-.044.183-.146.222-.336.134-1.249-.581-2.030-2.407-2.030-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.220-5.190 6.220-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  );
}

/* -------------------------------------------------------------------- */
/* Config                                                                */
/* -------------------------------------------------------------------- */

const PLATFORMS = [
  { key: "facebook",  name: "Facebook",  icon: Facebook,  color: "#5f88a6" },
  { key: "instagram", name: "Instagram", icon: Instagram, color: "#c2899f" },
  { key: "linkedin",  name: "LinkedIn",  icon: Linkedin,  color: "#5c87a3" },
  { key: "youtube",   name: "YouTube",   icon: Youtube,   color: "#d3946e" },
  { key: "pinterest", name: "Pinterest", icon: Pinterest, color: "#b5363b" },
];

const API_BASE = "http://localhost:4000";

function mediaUrl(item) {
  return item.url.startsWith("http") ? item.url : `${API_BASE}${item.url}`;
}

/* -------------------------------------------------------------------- */
/* Helpers                                                               */
/* -------------------------------------------------------------------- */

function getGrowth(history) {
  if (!history || history.length < 2) return 0;
  const prev = history[history.length - 2].followers;
  const curr = history[history.length - 1].followers;
  if (prev === 0) return 0;
  return ((curr - prev) / prev) * 100;
}

function fmt(n) {
  return Number(n).toLocaleString();
}

/* -------------------------------------------------------------------- */
/* SummaryCard                                                           */
/* -------------------------------------------------------------------- */

function SummaryCard({ label, value, sub, icon: Icon, highlight, badge }) {
  return (
    <div className={`summary-card${highlight ? " highlight" : ""}`}>
      {badge}
      <div className="summary-icon">
        <Icon size={18} />
      </div>
      <div className="summary-text">
        <div className="summary-value">{value}</div>
        <div className="summary-label">{label}</div>
        {sub && <div className="summary-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Stat tile                                                             */
/* -------------------------------------------------------------------- */

function Stat({ label, value }) {
  return (
    <div className="stat-item">
      <span className="stat-value">{fmt(value)}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* GrowthPill                                                            */
/* -------------------------------------------------------------------- */

function GrowthPill({ growth }) {
  const positive = growth >= 0;
  return (
    <span className={`growth-pill ${positive ? "positive" : "negative"}`}>
      {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {positive ? "+" : ""}
      {growth.toFixed(1)}% this week
    </span>
  );
}

/* -------------------------------------------------------------------- */
/* Field (modal input)                                                   */
/* -------------------------------------------------------------------- */

function Field({ label, value, onChange, hint }) {
  return (
    <label className="field">
      <span>{label}{hint && <span style={{ fontWeight: 400, opacity: 0.7 }}> — {hint}</span>}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

/* -------------------------------------------------------------------- */
/* AudienceReach — horizontal bar chart showing follower vs non-follower */
/* views breakdown                                                       */
/* -------------------------------------------------------------------- */

function AudienceReach({ followerViews, nonFollowerViews }) {
  const total = (followerViews || 0) + (nonFollowerViews || 0);
  const followerPct  = total > 0 ? Math.round((followerViews / total) * 100) : 0;
  const nonFollowerPct = total > 0 ? 100 - followerPct : 0;

  return (
    <div className="reach-section">
      <div className="reach-section-title">Post views by audience</div>

      <div className="reach-bars">
        <div className="reach-row">
          <span className="reach-row-label">Followers</span>
          <div className="reach-bar-track">
            <div
              className="reach-bar-fill followers"
              style={{ width: `${followerPct}%` }}
            />
          </div>
          <span className="reach-row-pct">{followerPct}%</span>
          <span className="reach-row-count">{fmt(followerViews)}</span>
        </div>

        <div className="reach-row">
          <span className="reach-row-label">Non-followers</span>
          <div className="reach-bar-track">
            <div
              className="reach-bar-fill non-followers"
              style={{ width: `${nonFollowerPct}%` }}
            />
          </div>
          <span className="reach-row-pct">{nonFollowerPct}%</span>
          <span className="reach-row-count">{fmt(nonFollowerViews)}</span>
        </div>
      </div>

      <div className="reach-legend">
        <span className="reach-legend-item">
          <span className="reach-legend-dot" style={{ background: "var(--follower-color)" }} />
          Followers
        </span>
        <span className="reach-legend-item">
          <span className="reach-legend-dot" style={{ background: "var(--non-follower-color)" }} />
          Non-followers (organic reach)
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* UpdateModal — now includes followerViews / nonFollowerViews fields    */
/* -------------------------------------------------------------------- */

function UpdateModal({ platform, initial, onClose, onSave }) {
  const [form, setForm] = useState({
    followers:        initial.followers        || 0,
    reach:            initial.reach            || 0,
    likes:            initial.likes            || 0,
    views:            initial.views            || 0,
    followerViews:    initial.followerViews    || 0,
    nonFollowerViews: initial.nonFollowerViews || 0,
  });

  const Icon = platform.icon;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update {platform.name} stats</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="modal-hint">
          Enter this week&apos;s numbers. Saving appends a new point to the
          growth chart and recalculates audience reach percentages.
        </p>

        <div className="modal-section-title">Core metrics</div>
        <div className="modal-body">
          <Field label="Followers" value={form.followers}
            onChange={(v) => setForm((f) => ({ ...f, followers: v }))} />
          <Field label="Reach" value={form.reach}
            onChange={(v) => setForm((f) => ({ ...f, reach: v }))} />
          <Field label="Likes" value={form.likes}
            onChange={(v) => setForm((f) => ({ ...f, likes: v }))} />
          <Field label="Views (total)" value={form.views}
            onChange={(v) => setForm((f) => ({ ...f, views: v }))} />
        </div>

        <div className="modal-section-title">Post views breakdown</div>
        <div className="modal-body">
          <Field
            label="Follower views"
            hint="views from existing followers"
            value={form.followerViews}
            onChange={(v) => setForm((f) => ({ ...f, followerViews: v }))}
          />
          <Field
            label="Non-follower views"
            hint="organic / discovery views"
            value={form.nonFollowerViews}
            onChange={(v) => setForm((f) => ({ ...f, nonFollowerViews: v }))}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Lightbox                                                              */
/* -------------------------------------------------------------------- */

function Lightbox({ media, onClose }) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pinchDistance = useRef(null);
  const dragStart = useRef(null);
  const isDragging = useRef(false);

  function clamp(v) { return Math.min(Math.max(v, 1), 5); }

  function resetView() { setScale(1); setTranslate({ x: 0, y: 0 }); }

  function handleWheel(e) {
    e.preventDefault();
    const next = clamp(scale - e.deltaY * 0.0015);
    setScale(next);
    if (next === 1) setTranslate({ x: 0, y: 0 });
  }

  function dist(touches) {
    const [a, b] = touches;
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      pinchDistance.current = dist(e.touches);
    } else {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = dist(e.touches);
      if (pinchDistance.current) {
        const next = clamp(scale + (d - pinchDistance.current) * 0.01);
        setScale(next);
        if (next === 1) setTranslate({ x: 0, y: 0 });
      }
      pinchDistance.current = d;
    } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
      e.preventDefault();
      const t = e.touches[0];
      setTranslate((p) => ({ x: p.x + t.clientX - dragStart.current.x, y: p.y + t.clientY - dragStart.current.y }));
      dragStart.current = { x: t.clientX, y: t.clientY };
    }
  }

  function handleTouchEnd(e) {
    if (e.touches.length < 2) pinchDistance.current = null;
    if (e.touches.length === 0) isDragging.current = false;
  }

  function handleMouseDown(e) {
    if (scale <= 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e) {
    if (!isDragging.current) return;
    setTranslate((p) => ({ x: p.x + e.clientX - dragStart.current.x, y: p.y + e.clientY - dragStart.current.y }));
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseUp() { isDragging.current = false; }

  function handleDoubleClick() {
    scale > 1 ? resetView() : setScale(2);
  }

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close preview">
        <X size={20} />
      </button>
      <div
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {media.type === "image" ? (
          <img
            src={mediaUrl(media)}
            alt={media.name}
            draggable={false}
            style={{
              transform: `translate(${translate.x}px,${translate.y}px) scale(${scale})`,
              cursor: scale > 1 ? "grab" : "zoom-in",
            }}
          />
        ) : (
          <video
            src={mediaUrl(media)}
            controls
            autoPlay
            style={{ transform: `translate(${translate.x}px,${translate.y}px) scale(${scale})` }}
          />
        )}
      </div>
      <div className="lightbox-hint">Scroll · Pinch · Double-tap to zoom</div>
    </div>
  );
}
/* -------------------------------------------------------------------- */
/* ContentRepository — timestamped timeline of uploaded posts           */
/* -------------------------------------------------------------------- */

function formatDate(iso) {
  if (!iso) return "Unknown date";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function groupByWeek(media, history) {
  const groups = {};

  media.forEach((m) => {
    const week = m.week || "Untagged";
    if (!groups[week]) groups[week] = [];
    groups[week].push(m);
  });

  // Sort weeks: W1, W2, W3... then Untagged last
  const weekOrder = history.map((h) => h.week);
  const sorted = Object.keys(groups).sort((a, b) => {
    const ai = weekOrder.indexOf(a);
    const bi = weekOrder.indexOf(b);
    if (a === "Untagged") return 1;
    if (b === "Untagged") return -1;
    return bi - ai; // newest week first
  });

  return sorted.map((week) => ({ week, items: groups[week] }));
}

function WeekGroup({ group, history, onMediaClick, onDeleteMedia }) {
  const [open, setOpen] = useState(true);

  const historyEntry = history.find((h) => h.week === group.week);
  const dateLabel = group.items[0]?.uploadedAt
    ? formatDate(group.items[0].uploadedAt)
    : historyEntry ? `Week ${group.week.replace("W", "")}` : "";

  return (
    <div className="timeline-week">
      <div className="timeline-week-header" onClick={() => setOpen((o) => !o)}>
        <div className="timeline-week-left">
          <span className="timeline-week-label">
            {group.week === "Untagged" ? "Untagged posts" : `Week ${group.week.replace("W", "")}`}
          </span>
          {dateLabel && group.week !== "Untagged" && (
            <span className="timeline-week-date">{dateLabel}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="timeline-week-count">{group.items.length} post{group.items.length !== 1 ? "s" : ""}</span>
          <span className={`timeline-chevron${open ? " open" : ""}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </div>

      {open && (
        <div className="timeline-week-body">
          <div className="timeline-grid">
            {group.items.map((m) => (
              <div className="timeline-item" key={m.id}>
                <div
                  className="media-item"
                  role="button"
                  tabIndex={0}
                  onClick={() => onMediaClick(m)}
                >
                  {m.type === "image" ? (
                    <img src={mediaUrl(m)} alt={m.name} />
                  ) : (
                    <>
                      <video src={mediaUrl(m)} muted />
                      <span className="media-play"><Play size={16} /></span>
                    </>
                  )}
                  <span className={`media-type-badge ${m.type}`}>{m.type}</span>
                  <button
                    className="media-delete"
                    title="Delete"
                    aria-label="Delete"
                    onClick={(e) => { e.stopPropagation(); onDeleteMedia(m.id); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="timeline-item-meta">
                  <div className="timeline-item-name" title={m.name}>{m.name}</div>
                  {m.uploadedAt && (
                    <div className="timeline-item-time">
                      {formatDate(m.uploadedAt)} · {formatTime(m.uploadedAt)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContentRepository({ stats, platform, onUpload, onDeleteMedia, onMediaClick }) {
  const fileInputRef = useRef(null);
  const [selectedWeek, setSelectedWeek] = useState("");
  const groups = groupByWeek(stats.media, stats.history);
  const weekOptions = stats.history.map((h) => h.week);

  function handleFileChange(e) {
    if (e.target.files?.length) onUpload(e.target.files, selectedWeek);
    e.target.value = "";
  }

  return (
    <div className="repo-section">
      <div className="repo-header">
        <h3>Content repository</h3>
        <div className="repo-upload-row">
          <select
            className="field"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            style={{
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            <option value="">No week tag</option>
            {weekOptions.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={handleFileChange}
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="repo-empty">
          <ImageOff size={20} />
          <span>No content uploaded yet — upload your first post above</span>
        </div>
      ) : (
        <div className="timeline">
          {groups.map((g) => (
            <WeekGroup
              key={g.week}
              group={g}
              history={stats.history}
              onMediaClick={onMediaClick}
              onDeleteMedia={onDeleteMedia}
            />
          ))}
        </div>
      )}
    </div>
  );
}
/* -------------------------------------------------------------------- */
/* PlatformCard                                                          */
/* -------------------------------------------------------------------- */

function PlatformCard({ platform, stats, isBest, onUpdateClick, onUpload, onDeleteMedia, onMediaClick }) {
  const Icon = platform.icon;
  const growth = getGrowth(stats.history);
  const fileInputRef = useRef(null);

  return (
    <section className={`platform-card${isBest ? " best" : ""}`}>

      {/* Header */}
      <div className="platform-header">
        <div className="platform-title">
          <span className="platform-icon" style={{ background: `${platform.color}1a`, color: platform.color }}>
            <Icon size={20} />
          </span>
          <h2>{platform.name}</h2>
          {isBest && (
            <span className="best-badge">
              <Crown size={12} />
              Leading this week
            </span>
          )}
        </div>
        <button className="btn btn-primary" onClick={onUpdateClick}>
          Update Stats
        </button>
      </div>

      {/* Core stats */}
      <div className="stats-grid">
        <Stat label="Followers"  value={stats.followers} />
        <Stat label="Reach"      value={stats.reach} />
        <Stat label="Likes"      value={stats.likes} />
        <Stat label="Views"      value={stats.views} />
      </div>

      {/* Audience reach breakdown */}
      <AudienceReach
        followerViews={stats.followerViews || 0}
        nonFollowerViews={stats.nonFollowerViews || 0}
      />

      {/* Growth pill */}
      <div className="growth-row">
        <GrowthPill growth={growth} />
        <span className="growth-caption">
          vs.{" "}
          {stats.history[stats.history.length - 2]?.followers != null
            ? fmt(stats.history[stats.history.length - 2].followers)
            : "—"}{" "}
          followers last week
        </span>
      </div>

      {/* Follower growth chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={stats.history} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="#e6ede9" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#8a9a92" }} axisLine={false} tickLine={false} />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              formatter={(v) => [fmt(v), "Followers"]}
              labelFormatter={(l) => `Week ${l.replace("W", "")}`}
              contentStyle={{
                background: "#fff",
                border: "1px solid #e3ebe6",
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(45,70,60,0.08)",
                fontSize: 13,
              }}
            />
            <Line
              type="monotone"
              dataKey="followers"
              stroke={platform.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: platform.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      
      <ContentRepository
        stats={stats}
        platform={platform}
        onUpload={onUpload}
        onDeleteMedia={onDeleteMedia}
        onMediaClick={onMediaClick}
      />

    </section>
  );
}



/* -------------------------------------------------------------------- */
/* App                                                                   */
/* -------------------------------------------------------------------- */

export default function App() {
  const [data, setData] = useState(null);
  const [modalPlatform, setModalPlatform] = useState(null);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [status, setStatus] = useState("loading");

  function loadData() {
    setStatus("loading");
    fetch(`${API_BASE}/api/data`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((json) => { setData(json); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }

  useEffect(() => { loadData(); }, []);

  const totals = useMemo(() => {
    if (!data) return { followers: 0, reach: 0, engagement: 0 };
    return PLATFORMS.reduce((acc, p) => {
      const d = data[p.key];
      acc.followers  += d.followers;
      acc.reach      += d.reach;
      acc.engagement += d.likes + d.views;
      return acc;
    }, { followers: 0, reach: 0, engagement: 0 });
  }, [data]);

  const growths = useMemo(() => {
    if (!data) return PLATFORMS.map((p) => ({ key: p.key, name: p.name, growth: 0 }));
    return PLATFORMS.map((p) => ({ key: p.key, name: p.name, growth: getGrowth(data[p.key].history) }));
  }, [data]);

  const best = useMemo(() => growths.reduce((a, b) => (b.growth > a.growth ? b : a), growths[0]), [growths]);

  const avgGrowth = useMemo(() => growths.reduce((s, g) => s + g.growth, 0) / growths.length, [growths]);

  const insight = useMemo(() => {
    if (!data) return "";
    const parts = [
      `${best.name} is leading this week with ${best.growth >= 0 ? "+" : ""}${best.growth.toFixed(1)}% follower growth.`,
    ];
    const videoCounts = PLATFORMS
      .map((p) => ({ name: p.name, count: data[p.key].media.filter((m) => m.type === "video").length }))
      .sort((a, b) => b.count - a.count);
    parts.push(
      videoCounts[0]?.count > 0
        ? `Video content on ${videoCounts[0].name} could be helping drive engagement.`
        : "Try adding a video this week to compare its impact on engagement."
    );
    return parts.join(" ");
  }, [best, data]);

  /* Handlers */

  function handleSaveStats(form) {
    const key = modalPlatform;
    fetch(`${API_BASE}/api/platforms/${key}/stats`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((updated) => setData((prev) => ({ ...prev, [key]: updated })))
      .catch(() => alert("Couldn't save stats — make sure the Canopy server is running."));
    setModalPlatform(null);
  }

  function handleUpload(key, fileList, week) {
  Array.from(fileList).forEach((file) => {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
    const fd = new FormData();
    fd.append("file", file);
    if (week) fd.append("week", week);
      fetch(`${API_BASE}/api/platforms/${key}/media`, { method: "POST", body: fd })
        .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
        .then((item) => setData((prev) => ({
          ...prev, [key]: { ...prev[key], media: [...prev[key].media, item] },
        })))
        .catch(() => alert("Couldn't upload — make sure the Canopy server is running."));
    });
  }

  function handleDeleteMedia(key, id) {
    fetch(`${API_BASE}/api/platforms/${key}/media/${id}`, { method: "DELETE" })
      .then((res) => { if (!res.ok) throw new Error(); })
      .then(() => setData((prev) => ({
        ...prev, [key]: { ...prev[key], media: prev[key].media.filter((m) => m.id !== id) },
      })))
      .catch(() => alert("Couldn't delete — make sure the Canopy server is running."));
  }

  /* Status screens */

  if (status === "loading") {
    return (
      <div className="app">
        <div className="status-screen">
          <Leaf size={28} />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="app">
        <div className="status-screen">
          <Leaf size={28} />
          <h2>Can&apos;t reach the Canopy server</h2>
          <p>
            From the <code>canopy-server</code> folder, run <code>npm install</code> once,
            then <code>npm start</code>. It should be available at <code>{API_BASE}</code>.
          </p>
          <button className="btn btn-primary" onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  /* Main render */

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="brand">
            <span className="brand-icon"><Leaf size={20} /></span>
            <div>
              <h1>Socials Dashboard</h1>
              <p className="subtitle">Monthly performance of all the social medias
              </p>
            </div>
          </div>
        </div>

        <div className="summary-grid">
          <SummaryCard label="Total Followers"  value={fmt(totals.followers)}  icon={Users} />
          <SummaryCard label="Total Reach"       value={fmt(totals.reach)}      icon={Eye} />
          <SummaryCard label="Total Engagement"  value={fmt(totals.engagement)} icon={Heart} />
          <SummaryCard
            label="Best Performing Platform"
            value={best.name}
            sub={`${best.growth >= 0 ? "+" : ""}${best.growth.toFixed(1)}% followers this week`}
            icon={TrendingUp}
            highlight
            badge={<span className="crown-badge"><Crown size={16} /></span>}
          />
        </div>

        <div className="insight-bar">
          <Sparkles size={16} />
          <span>{insight}</span>
          <span className="insight-divider" />
          <span className="insight-avg">
            Avg. growth: {avgGrowth >= 0 ? "+" : ""}{avgGrowth.toFixed(1)}% across all platforms
          </span>
        </div>
      </header>

      <main className="platform-grid">
        {PLATFORMS.map((p) => (
          <PlatformCard
            key={p.key}
            platform={p}
            stats={data[p.key]}
            isBest={p.key === best.key}
            onUpdateClick={() => setModalPlatform(p.key)}
            onUpload={(files, week) => handleUpload(p.key, files, week)}
            onDeleteMedia={(id) => handleDeleteMedia(p.key, id)}
            onMediaClick={(m) => setLightboxMedia(m)}
          />
        ))}
      </main>

      {modalPlatform && (
        <UpdateModal
          platform={PLATFORMS.find((p) => p.key === modalPlatform)}
          initial={data[modalPlatform]}
          onClose={() => setModalPlatform(null)}
          onSave={handleSaveStats}
        />
      )}

      {lightboxMedia && (
        <Lightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />
      )}
    </div>
  );
}
