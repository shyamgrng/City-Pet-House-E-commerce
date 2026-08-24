"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { slugify, type BlogPost } from "@/lib/blog-types";

type Draft = Omit<BlogPost, "id">;

const KW_TOPICS: { match: string[]; primary: string[]; secondary: string[] }[] = [
  {
    match: ["vet", "consult", "doctor", "vaccin"],
    primary: ["vet consultation Nepal", "online vet Kathmandu", "dog vaccination schedule"],
    secondary: ["book vet appointment Nepal", "pet doctor Kathmandu", "vaccination price Nepal"],
  },
  {
    match: ["groom", "bath", "trim", "coat"],
    primary: ["dog grooming Kathmandu", "pet grooming price Nepal"],
    secondary: ["cat grooming service Kathmandu", "mobile pet grooming Nepal"],
  },
  {
    match: ["puppy", "puppies", "breed"],
    primary: ["puppies for sale Nepal", "buy puppy Kathmandu"],
    secondary: ["dog breeds available Nepal", "puppy price Kathmandu"],
  },
  {
    match: ["adopt"],
    primary: ["dog adoption Kathmandu", "pet adoption Nepal"],
    secondary: ["adopt a puppy Kathmandu", "rescue dog Nepal"],
  },
  {
    match: ["food", "diet", "feed", "nutrition"],
    primary: ["pet food Kathmandu", "dog food delivery Nepal"],
    secondary: ["cat food online Kathmandu", "best pet food Nepal"],
  },
  {
    match: ["skin", "allerg", "itch", "flea", "tick", "worm", "parasite"],
    primary: ["dog skin allergy treatment Nepal", "pet parasite prevention Kathmandu"],
    secondary: ["flea tick treatment Nepal", "dog itching remedy Kathmandu"],
  },
  {
    match: ["microchip"],
    primary: ["pet microchipping Nepal", "dog microchip Kathmandu"],
    secondary: ["cat microchipping price Nepal", "pet ID chip Kathmandu"],
  },
  {
    match: ["surgery", "spay", "neuter"],
    primary: ["pet surgery Kathmandu", "spay neuter Nepal"],
    secondary: ["dog surgery cost Nepal", "vet surgery clinic Kathmandu"],
  },
];

function dedupe(arr: string[]) {
  return [...new Set(arr)].slice(0, 6);
}

function keywordSuggestions(kwText: string, focusKeyword: string) {
  let primary: string[] = [];
  let secondary: string[] = [];
  KW_TOPICS.forEach((t) => {
    if (t.match.some((m) => kwText.includes(m))) {
      primary.push(...t.primary);
      secondary.push(...t.secondary);
    }
  });
  const kwFocus = focusKeyword.trim();
  if (kwFocus) primary.unshift(`${kwFocus} Nepal`, `${kwFocus} Kathmandu`);
  if (!primary.length) {
    primary = ["dog vet Kathmandu", "pet shop Kathmandu", "puppies for sale Nepal", "online pet food Nepal"];
    secondary = ["dog vaccination schedule", "pet grooming price Kathmandu", "cat food delivery Kathmandu", "pet microchipping Nepal"];
  }
  return { primary: dedupe(primary), secondary: dedupe(secondary) };
}

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

function seoTitleSuggestions(focusKeyword: string) {
  const kw = focusKeyword.trim();
  const base = kw ? cap(kw) : "Pet Care";
  const opts = [
    `${base}: Complete Guide for Pet Owners`,
    `${base} — Prices, Tips & What to Expect`,
    `Everything You Need to Know About ${base}`,
    `${base} in Kathmandu: A Simple Step-by-Step Guide`,
    `${base}: Common Mistakes Pet Owners Should Avoid`,
  ];
  return opts.map((t) => ({ text: t, count: `${t.length} chars` }));
}

function metaDescSuggestions(focusKeyword: string) {
  const kw = focusKeyword.trim();
  const base = kw || "pet care";
  const opts = [
    `Looking into ${base}? Get trusted, practical guidance from City Pet House's vet team in Kathmandu — book a consult or shop online today.`,
    `Everything Kathmandu pet owners need to know about ${base}: what to expect, common mistakes, and how City Pet House can help. Read more.`,
    `${cap(base)} made simple — clear steps, real prices, and expert advice from City Pet House. Have questions? Book a vet consult now.`,
  ];
  return opts.map((t) => ({ text: t, count: `${t.length} chars` }));
}

function excerptSuggestions(focusKeyword: string, title: string) {
  const kw = focusKeyword.trim();
  const topic = kw || (title.trim() ? title.trim().toLowerCase() : "this topic");
  const opts = [
    `A quick, practical rundown on ${topic} — what Kathmandu pet owners should watch for and when to bring your pet in for a vet check.`,
    `Not sure where to start with ${topic}? Here's what our vets recommend, plus the most common mistakes owners make.`,
    `${title.trim() || "This guide"} breaks down ${topic} into simple steps, so you can act with confidence — and know when it's time to book a consult.`,
  ];
  return opts.map((t) => ({ text: t, count: `${t.length} chars` }));
}

function countWords(html: string) {
  const text = html.replace(/<[^>]*>/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

function titleStatus(len: number) {
  if (len === 0) return { color: "#8A96A3", status: "—" };
  if (len >= 50 && len <= 60) return { color: "#1F7A4D", status: "Excellent" };
  return len < 50 ? { color: "#C9962B", status: "Too short" } : { color: "#D64545", status: "Too long" };
}

function metaStatus(len: number) {
  if (len === 0) return { color: "#8A96A3", status: "—" };
  if (len >= 150 && len <= 160) return { color: "#1F7A4D", status: "Good" };
  return len < 150 ? { color: "#C9962B", status: "Too short" } : { color: "#D64545", status: "Too long" };
}

function computeSeoScore(focusKeyword: string, title: string, meta: string, slug: string, wc: number, excerpt: string) {
  let score = 0;
  if (focusKeyword.trim()) score += 15;
  if (title.length >= 50 && title.length <= 60) score += 20;
  else if (title.trim()) score += 8;
  if (focusKeyword.trim() && title.toLowerCase().includes(focusKeyword.trim().toLowerCase())) score += 10;
  if (meta.length >= 150 && meta.length <= 160) score += 15;
  else if (meta.trim()) score += 6;
  if (slug.trim()) score += 10;
  if (wc >= 300) score += 20;
  else if (wc > 0) score += Math.round((wc / 300) * 20);
  if (excerpt.trim()) score += 10;
  return Math.min(100, score);
}

const todayLabel = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function BlogArticleEditor({
  backLabel,
  onBack,
  defaultAuthor,
  showDoctorToggle,
  onPublish,
}: {
  backLabel: string;
  onBack: () => void;
  defaultAuthor: string;
  /** Admin flow shows a togglable "Posted by a doctor" switch; doctor's own flow forces it true without a toggle. */
  showDoctorToggle: boolean;
  onPublish: (draft: Draft) => void;
}) {
  const [photo, setPhoto] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [meta, setMeta] = useState("");
  const [author, setAuthor] = useState(defaultAuthor);
  const [date, setDate] = useState(todayLabel());
  const [isDoctorPost, setIsDoctorPost] = useState(!showDoctorToggle);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [comments, setComments] = useState<{ author: string; text: string }[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showRevisionPanel, setShowRevisionPanel] = useState(false);
  const [revisions, setRevisions] = useState<{ label: string; content: string }[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastSnapshotRef = useRef("");

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) editorRef.current.innerHTML = content;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const html = editorRef.current?.innerHTML ?? "";
      if (html && html !== lastSnapshotRef.current) {
        lastSnapshotRef.current = html;
        const label = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        setRevisions((r) => [{ label: `Autosave · ${label}`, content: html }, ...r].slice(0, 10));
      }
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  const captureSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const handleContentInput = () => {
    if (editorRef.current) setContent(editorRef.current.innerHTML);
  };

  // Inserts HTML at the caret via direct Range/DOM ops rather than execCommand("insertHTML") --
  // the browser's own insertHTML tends to merge block content (a table, another list) into
  // whatever list item or cell the caret happens to be inside, nesting it deeper each time
  // instead of placing it as a clean sibling. Range.insertNode() inserts exactly what we give it,
  // and we explicitly move the caret to just after the inserted block so the next insertion
  // continues at the same level rather than diving inside what was just added.
  const insertHtmlAtCaret = (html: string) => {
    restoreSelection();
    const sel = window.getSelection();
    let range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    if (!range || !editorRef.current || !editorRef.current.contains(range.startContainer)) {
      if (!editorRef.current) return;
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }
    range.deleteContents();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    const frag = document.createDocumentFragment();
    let lastNode: ChildNode | null = null;
    while (wrapper.firstChild) {
      lastNode = wrapper.firstChild;
      frag.appendChild(lastNode);
    }
    range.insertNode(frag);
    if (lastNode && sel) {
      const after = document.createRange();
      after.setStartAfter(lastNode);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      savedRangeRef.current = after.cloneRange();
    }
    handleContentInput();
  };

  const wrapSelection = (tagName: string, styleCss?: string) => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const el = document.createElement(tagName);
    if (styleCss) el.setAttribute("style", styleCss);
    try {
      range.surroundContents(el);
    } catch {
      const frag = range.extractContents();
      el.appendChild(frag);
      range.insertNode(el);
    }
    handleContentInput();
    captureSelection();
  };

  const noPreventFocusLoss = (e: React.MouseEvent) => e.preventDefault();

  const toolbarHeading = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const n = e.target.value;
    e.target.value = "";
    if (!n) return;
    restoreSelection();
    document.execCommand("formatBlock", false, `h${n}`);
    handleContentInput();
    captureSelection();
  };
  const toolbarFont = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const f = e.target.value;
    e.target.value = "";
    if (!f) return;
    wrapSelection("span", `font-family:${f}`);
  };
  const FONT_SIZE_MAP: Record<string, string> = { "2": "12px", "3": "14px", "4": "16px", "5": "18px", "6": "24px" };
  const toolbarFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sz = FONT_SIZE_MAP[e.target.value];
    e.target.value = "";
    if (!sz) return;
    wrapSelection("span", `font-size:${sz}`);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    restoreSelection();
    const sel = window.getSelection();
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const frag = range.extractContents();
      a.appendChild(frag);
      range.insertNode(a);
    } else if (sel && sel.rangeCount > 0) {
      a.textContent = url;
      sel.getRangeAt(0).insertNode(a);
    } else if (editorRef.current) {
      a.textContent = url;
      editorRef.current.appendChild(a);
    }
    handleContentInput();
    captureSelection();
    setShowLinkPanel(false);
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments((c) => [...c, { author: "Admin", text: newComment.trim() }]);
    setNewComment("");
  };

  const restoreRevision = (snapshotContent: string) => {
    setContent(snapshotContent);
    if (editorRef.current) editorRef.current.innerHTML = snapshotContent;
  };

  const kwText = useMemo(
    () => [title, meta, excerpt, content.replace(/<[^>]*>/g, " ")].join(" ").toLowerCase(),
    [title, meta, excerpt, content],
  );
  const { primary: primaryKw, secondary: secondaryKw } = useMemo(() => keywordSuggestions(kwText, focusKeyword), [kwText, focusKeyword]);
  const titleSuggestions = useMemo(() => seoTitleSuggestions(focusKeyword), [focusKeyword]);
  const metaSuggestions = useMemo(() => metaDescSuggestions(focusKeyword), [focusKeyword]);
  const excerptOptions = useMemo(() => excerptSuggestions(focusKeyword, title), [focusKeyword, title]);

  const tStatus = titleStatus(title.length);
  const mStatus = metaStatus(meta.length);
  const wc = countWords(content);
  const readTime = Math.max(1, Math.round(wc / 200));
  const serpSlug = slug.trim() || slugify(title.trim()) || "article-slug";
  const serpMeta = meta.trim() || excerpt.trim() || "Meta description preview will appear here as you type.";

  const seoScore = computeSeoScore(focusKeyword, title, meta, slug, wc, excerpt);
  const seoScoreColor = seoScore >= 70 ? "#1F7A4D" : seoScore >= 40 ? "#C9962B" : "#D64545";
  const seoScoreDeg = (seoScore / 100) * 360;

  const checklist = [
    { label: "Focus keyword set", ok: !!focusKeyword.trim() },
    { label: "Keyword appears in title", ok: !!(focusKeyword.trim() && title.toLowerCase().includes(focusKeyword.trim().toLowerCase())) },
    { label: "SEO title is 50–60 characters", ok: title.length >= 50 && title.length <= 60 },
    { label: "Meta description is 150–160 characters", ok: meta.length >= 150 && meta.length <= 160 },
    { label: "Slug set", ok: !!slug.trim() },
    { label: "Content is 300+ words", ok: wc >= 300 },
    { label: "Excerpt written", ok: !!excerpt.trim() },
    { label: "Cover image uploaded", ok: !!photo },
  ];

  const publish = () => {
    if (!title.trim()) return;
    onPublish({
      title: title.trim(),
      photo,
      date: date.trim() || todayLabel(),
      author: author.trim() || defaultAuthor,
      isDoctorPost,
      excerpt: excerpt.trim(),
      content: content.trim(),
      slug: slug.trim(),
      metaDescription: meta.trim(),
    });
  };

  const toolbarBtn = "w-7 h-7 rounded-md border border-[#E4E9EC] flex items-center justify-center text-xs cursor-pointer bg-white";
  const select = "h-7 rounded-md border border-[#E4E9EC] text-[11px] px-1 bg-white";

  return (
    <div>
      <div onClick={onBack} className="text-xs font-semibold text-primary cursor-pointer mb-2.5">
        {backLabel}
      </div>
      <div className="font-heading font-bold text-[19px] text-[#1A2027] mb-[18px]">New Article</div>

      <div className="flex gap-5 items-start flex-wrap lg:flex-nowrap">
        <div className="flex-1 min-w-0 max-w-[680px] w-full">
          <div className="text-xs font-bold text-[#1A2027] mb-1.5">Blog Image</div>
          <div className="mb-4">
            <ImageUploadField value={photo} onChange={setPhoto} label="article photo" hint="Recommended size: 1000×560px (16:9)." height="h-[180px]" maxWidth={1000} maxHeight={560} />
          </div>

          <div className="text-xs font-bold text-[#1A2027] mb-1.5">Focus Keyword</div>
          <input
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
            placeholder="e.g. dog vaccination schedule Nepal"
            className="w-full box-border h-[38px] rounded-lg border border-[#E4E9EC] px-3 text-[13px] mb-2.5"
          />

          <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[9px] px-3.5 py-3 mb-4">
            <div className="text-[11px] font-bold text-[#5B6773] mb-2">🔍 FOCUS KEYWORD ANALYSIS — based on your title, meta &amp; description</div>
            <div className="text-[10px] font-bold text-[#8A96A3] mb-1.5">PRIMARY (use one as your Focus Keyword)</div>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {primaryKw.map((t) => (
                <div key={t} onClick={() => setFocusKeyword(t)} className="text-[11px] font-semibold text-primary bg-[#EAF4F9] px-2.5 py-1.5 rounded-full cursor-pointer">
                  {t}
                </div>
              ))}
            </div>
            <div className="text-[10px] font-bold text-[#8A96A3] mb-1.5">SECONDARY (weave into subheadings &amp; body)</div>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {secondaryKw.map((t) => (
                <div key={t} className="text-[11px] text-[#5B6773] bg-[#F0F2F4] px-2.5 py-1.5 rounded-full">
                  {t}
                </div>
              ))}
            </div>
            <div className="text-[11px] text-[#5B6773] leading-relaxed">
              Best-fit picks: long-tail, city-specific phrases (e.g. &quot;…in Kathmandu&quot;) rank easier than generic single words, match real search
              intent (a question or &quot;near me&quot;/&quot;price&quot; phrase), and appear naturally in your title, first paragraph, and one subheading
              — never stuffed.
            </div>
          </div>

          <div className="flex justify-between items-baseline mb-1.5">
            <div className="text-xs font-bold text-[#1A2027]">SEO Title</div>
            <div className="text-[11px] font-semibold" style={{ color: tStatus.color }}>
              {title.length}/60 · {tStatus.status}
            </div>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            className="w-full box-border h-10 rounded-lg border border-[#E4E9EC] px-3 text-sm mb-2.5"
          />

          <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[9px] px-3.5 py-3 mb-4">
            <div className="text-[11px] font-bold text-[#5B6773] mb-2">SUGGESTED SEO TITLES (50–60 characters, keyword near the front)</div>
            {titleSuggestions.map((t) => (
              <div
                key={t.text}
                onClick={() => setTitle(t.text)}
                className="text-xs text-[#1A2027] bg-white border border-[#E4E9EC] px-2.5 py-2 rounded-[7px] cursor-pointer mb-1.5 flex justify-between gap-2.5"
              >
                <span>{t.text}</span>
                <span className="text-[#8A96A3] text-[10px] shrink-0">{t.count}</span>
              </div>
            ))}
            <div className="text-[11px] text-[#5B6773] leading-relaxed mt-1">
              Best practice: lead with the focus keyword, add a benefit or location (&quot;in Kathmandu&quot;), keep it 50–60 characters so Google doesn&apos;t
              truncate it, and make it different from your H1 if you want extra reach.
            </div>
          </div>

          <div className="text-xs font-bold text-[#1A2027] mb-1.5">Slug (URL)</div>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="leave blank to auto-generate from title"
            className="w-full box-border h-[38px] rounded-lg border border-[#E4E9EC] px-3 text-[13px] mb-3.5"
          />

          <div className="flex justify-between items-baseline mb-1.5">
            <div className="text-xs font-bold text-[#1A2027]">Meta Description</div>
            <div className="text-[11px] font-semibold" style={{ color: mStatus.color }}>
              {meta.length}/160 · {mStatus.status}
            </div>
          </div>
          <textarea
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            placeholder="150-160 characters shown in Google results"
            className="w-full box-border h-16 rounded-lg border border-[#E4E9EC] px-3 py-2.5 text-[13px] mb-2.5 resize-y font-sans"
          />

          <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[9px] px-3.5 py-3 mb-4">
            <div className="text-[11px] font-bold text-[#5B6773] mb-2">SUGGESTED META DESCRIPTIONS (150–160 characters)</div>
            {metaSuggestions.map((m) => (
              <div key={m.text} onClick={() => setMeta(m.text)} className="text-xs text-[#1A2027] bg-white border border-[#E4E9EC] px-2.5 py-2 rounded-[7px] cursor-pointer mb-1.5">
                <div>{m.text}</div>
                <div className="text-[#8A96A3] text-[10px] mt-0.5">{m.count}</div>
              </div>
            ))}
            <div className="text-[11px] text-[#5B6773] leading-relaxed mt-1">
              Best practice: include the focus keyword, state the benefit to the reader, and end with a soft call-to-action (&quot;Book now,&quot;
              &quot;Learn more&quot;) — write for the pet owner, not just the algorithm.
            </div>
          </div>

          <div className="border border-[#E4E9EC] rounded-[10px] p-3.5 mb-5 bg-white">
            <div className="text-[10px] font-bold text-[#8A96A3] mb-2">GOOGLE SEARCH PREVIEW</div>
            <div className="text-[13px] mb-0.5" style={{ color: "#1A0DAB" }}>
              {title.trim() || "Your article title"}
            </div>
            <div className="text-[11px] mb-1" style={{ color: "#006621" }}>
              citypethouse.com.np › blog › {serpSlug}
            </div>
            <div className="text-xs" style={{ color: "#4D5156" }}>
              {serpMeta}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-xs font-bold text-[#1A2027] mb-1.5">Author</div>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full box-border h-[38px] rounded-lg border border-[#E4E9EC] px-3 text-[13px]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1A2027] mb-1.5">Date</div>
              <input value={date} onChange={(e) => setDate(e.target.value)} className="w-full box-border h-[38px] rounded-lg border border-[#E4E9EC] px-3 text-[13px]" />
            </div>
          </div>

          {showDoctorToggle && (
            <div onClick={() => setIsDoctorPost((v) => !v)} className="flex items-center gap-2.5 mb-4 cursor-pointer">
              <div className="w-[38px] h-[22px] rounded-full relative" style={{ background: isDoctorPost ? "#1996C8" : "#D0D6DA" }}>
                <div className="w-[18px] h-[18px] rounded-full bg-white absolute top-0.5 transition-all" style={{ left: isDoctorPost ? "18px" : "2px" }} />
              </div>
              <div className="text-xs font-semibold text-[#1A2027]">Posted by a doctor</div>
            </div>
          )}

          <div className="text-xs font-bold text-[#1A2027] mb-1.5">Excerpt (shown on Blog list)</div>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full box-border h-[60px] rounded-lg border border-[#E4E9EC] px-3 py-2.5 text-[13px] mb-2.5 resize-y font-sans"
          />

          <div className="bg-[#F7F9FA] border border-[#E4E9EC] rounded-[9px] px-3.5 py-3 mb-4">
            <div className="text-[11px] font-bold text-[#5B6773] mb-2">✨ AI SUMMARY SUGGESTIONS FOR EXCERPT</div>
            {excerptOptions.map((ex) => (
              <div key={ex.text} onClick={() => setExcerpt(ex.text)} className="text-xs text-[#1A2027] bg-white border border-[#E4E9EC] px-2.5 py-2 rounded-[7px] cursor-pointer mb-1.5">
                <div>{ex.text}</div>
                <div className="text-[#8A96A3] text-[10px] mt-0.5">{ex.count}</div>
              </div>
            ))}
            <div className="text-[11px] text-[#5B6773] leading-relaxed mt-1">
              Best practice: 1–2 sentences that tease the article&apos;s payoff (not just restate the title), keep it under ~160 characters so it reads
              cleanly on the Blog list card, and include the focus keyword naturally if it fits.
            </div>
          </div>

          <div className="flex justify-between items-baseline mb-1.5">
            <div className="text-xs font-bold text-[#1A2027]">Description</div>
            <div className="text-[11px] text-[#8A96A3]">
              {wc} words · {readTime} min read
            </div>
          </div>
          <div className="flex gap-1 flex-wrap border border-[#E4E9EC] border-b-0 rounded-t-lg p-1.5 bg-[#F7F9FA]">
            <select defaultValue="" onChange={toolbarHeading} className={select}>
              <option value="">Paragraph</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
              <option value="4">Heading 4</option>
              <option value="5">Heading 5</option>
              <option value="6">Heading 6</option>
            </select>
            <select defaultValue="" onChange={toolbarFont} className={select}>
              <option value="">Font</option>
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
            <select defaultValue="" onChange={toolbarFontSize} className={select}>
              <option value="">Size</option>
              <option value="2">12px</option>
              <option value="3">14px</option>
              <option value="4">16px</option>
              <option value="5">18px</option>
              <option value="6">24px</option>
            </select>
            <div onMouseDown={noPreventFocusLoss} onClick={() => wrapSelection("strong")} className={`${toolbarBtn} font-bold`}>B</div>
            <div onMouseDown={noPreventFocusLoss} onClick={() => wrapSelection("em")} className={`${toolbarBtn} italic`}>I</div>
            <div onMouseDown={noPreventFocusLoss} onClick={() => wrapSelection("u")} className={`${toolbarBtn} underline`}>U</div>
            <div onMouseDown={noPreventFocusLoss} onClick={() => insertHtmlAtCaret("<ul><li>List item</li></ul>")} className={toolbarBtn}>•≡</div>
            <div onMouseDown={noPreventFocusLoss} onClick={() => insertHtmlAtCaret("<ol><li>List item</li></ol>")} className={`${toolbarBtn} text-[11px]`}>1.≡</div>
            <div
              onMouseDown={noPreventFocusLoss}
              onClick={() =>
                insertHtmlAtCaret(
                  '<table style="width:100%;border-collapse:collapse;margin:10px 0"><tr><th style="border:1px solid #E4E9EC;padding:8px;background:#F7F9FA">Col 1</th><th style="border:1px solid #E4E9EC;padding:8px;background:#F7F9FA">Col 2</th></tr><tr><td style="border:1px solid #E4E9EC;padding:8px">Cell</td><td style="border:1px solid #E4E9EC;padding:8px">Cell</td></tr></table>',
                )
              }
              className={toolbarBtn}
            >
              ⊞
            </div>
            <div onMouseDown={noPreventFocusLoss} onClick={() => wrapSelection("blockquote", "border-left:3px solid #1996C8;padding-left:12px;color:#5B6773;margin:10px 0")} className={toolbarBtn}>
              &quot;
            </div>
            <div
              onMouseDown={noPreventFocusLoss}
              onClick={() => wrapSelection("code", "background:#F0F2F4;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px")}
              className={`${toolbarBtn} font-mono text-[11px]`}
            >
              &lt;/&gt;
            </div>
            <div onMouseDown={noPreventFocusLoss} onClick={() => insertHtmlAtCaret("<hr />")} className={toolbarBtn}>—</div>
            <div
              onMouseDown={(e) => {
                captureSelection();
                e.preventDefault();
              }}
              onClick={() => {
                setLinkUrl("https://");
                setShowLinkPanel(true);
              }}
              className={toolbarBtn}
            >
              🔗
            </div>
            <div
              onMouseDown={noPreventFocusLoss}
              onClick={() => insertHtmlAtCaret('<img src="https://placehold.co/700x360?text=Article+Image" style="max-width:100%;border-radius:10px;margin:10px 0" />')}
              className={toolbarBtn}
            >
              🖼
            </div>
            <div
              onMouseDown={noPreventFocusLoss}
              onClick={() =>
                insertHtmlAtCaret(
                  '<div style="padding:14px;background:#F0F2F4;border-radius:8px;font-size:12px;color:#5B6773;margin:10px 0">▶ Video embed placeholder — paste a YouTube/Vimeo URL here</div>',
                )
              }
              className={toolbarBtn}
            >
              ▶
            </div>
            <div
              onMouseDown={noPreventFocusLoss}
              onClick={() =>
                insertHtmlAtCaret(
                  "<p><em>AI suggestion: consider adding a short intro that states the problem, then 2–3 practical tips a pet owner in Kathmandu can act on today.</em></p>",
                )
              }
              className="h-7 px-2 rounded-md border border-primary flex items-center justify-center text-[11px] font-semibold text-primary cursor-pointer bg-white"
            >
              ✨ AI Assist
            </div>
            <div onClick={() => setShowCommentsPanel((v) => !v)} className="h-7 px-2 rounded-md border border-[#E4E9EC] flex items-center justify-center text-[11px] cursor-pointer bg-white">
              💬 Comments
            </div>
            <div onClick={() => setShowRevisionPanel((v) => !v)} className="h-7 px-2 rounded-md border border-[#E4E9EC] flex items-center justify-center text-[11px] cursor-pointer bg-white">
              🕘 History
            </div>
          </div>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentInput}
            onMouseUp={captureSelection}
            onKeyUp={captureSelection}
            className="w-full box-border min-h-[260px] rounded-b-lg border border-[#E4E9EC] px-3.5 py-3 text-sm leading-relaxed bg-white text-[#1A2027] outline-none"
          />

          {showLinkPanel && (
            <div className="border border-[#E4E9EC] rounded-lg p-3 mt-2.5 bg-[#F0F7FB] flex gap-2">
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 box-border h-8 rounded-md border border-[#E4E9EC] px-2.5 text-xs"
              />
              <button onClick={applyLink} className="bg-primary text-white px-3.5 rounded-md text-xs font-semibold cursor-pointer flex items-center">
                Insert Link
              </button>
              <button onClick={() => setShowLinkPanel(false)} className="text-[#8A96A3] text-xs cursor-pointer flex items-center">
                Cancel
              </button>
            </div>
          )}

          {showCommentsPanel && (
            <div className="border border-[#E4E9EC] rounded-lg p-3 mt-2.5 bg-[#FFFBEA]">
              <div className="text-[11px] font-bold text-[#8A96A3] mb-2">INLINE COMMENTS</div>
              {comments.map((cm, i) => (
                <div key={i} className="text-xs text-[#3A4652] py-1.5 border-b border-[#F0DFAE]">
                  <strong>{cm.author}:</strong> {cm.text}
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment…"
                  className="flex-1 box-border h-8 rounded-md border border-[#E4E9EC] px-2.5 text-xs"
                />
                <button onClick={addComment} className="bg-primary text-white px-3.5 rounded-md text-xs font-semibold cursor-pointer">
                  Add
                </button>
              </div>
            </div>
          )}

          {showRevisionPanel && (
            <div className="border border-[#E4E9EC] rounded-lg p-3 mt-2.5">
              <div className="text-[11px] font-bold text-[#8A96A3] mb-2">REVISION HISTORY</div>
              {revisions.length === 0 ? (
                <div className="text-xs text-[#8A96A3]">No earlier snapshots yet — one is saved automatically as you write.</div>
              ) : (
                revisions.map((rv, i) => (
                  <div key={i} onClick={() => restoreRevision(rv.content)} className="flex justify-between py-2 border-b border-[#F0F2F4] cursor-pointer last:border-0">
                    <div className="text-xs text-[#1A2027]">{rv.label}</div>
                    <div className="text-[11px] font-semibold text-primary">Restore</div>
                  </div>
                ))
              )}
            </div>
          )}

          <button onClick={publish} disabled={!title.trim()} className="w-full bg-primary text-white text-center py-3.5 rounded-[9px] text-sm font-semibold cursor-pointer mt-4 disabled:opacity-40 disabled:cursor-not-allowed">
            Publish Article
          </button>
        </div>

        <div className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-0">
          <div className="bg-white border border-[#E4E9EC] rounded-xl p-[18px] mb-3.5 text-center">
            <div className="text-[11px] font-bold text-[#8A96A3] mb-2.5">SEO SCORE</div>
            <div
              className="w-[88px] h-[88px] rounded-full mx-auto flex items-center justify-center"
              style={{ background: `conic-gradient(${seoScoreColor} ${seoScoreDeg}deg, #EEF1F3 0deg)` }}
            >
              <div className="w-[70px] h-[70px] rounded-full bg-white flex items-center justify-center font-heading font-bold text-[22px]" style={{ color: seoScoreColor }}>
                {seoScore}
              </div>
            </div>
            <div className="text-[11px] text-[#8A96A3] mt-2.5">out of 100</div>
          </div>

          <div className="bg-white border border-[#E4E9EC] rounded-xl p-4">
            <div className="text-[11px] font-bold text-[#8A96A3] mb-2.5">CHECKLIST</div>
            {checklist.map((c) => (
              <div key={c.label} className="flex items-start gap-2 mb-2.5">
                <div className="text-[13px] leading-tight" style={{ color: c.ok ? "#1F7A4D" : "#8A96A3" }}>
                  {c.ok ? "✓" : "○"}
                </div>
                <div className="text-xs text-[#3A4652] leading-tight">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
