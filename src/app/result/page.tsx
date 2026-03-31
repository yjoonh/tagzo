"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import beautify from "js-beautify";
import hljs from "highlight.js/lib/core";
import xmlLang from "highlight.js/lib/languages/xml";
import tsLang from "highlight.js/lib/languages/typescript";
import {
  Copy, Check, Code2, Bookmark,
  MousePointerClick, Palette, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, Eye, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useLang } from "@/providers/LangProvider";
import { BP } from "@/lib/utils";

hljs.registerLanguage("xml", xmlLang);
hljs.registerLanguage("typescript", tsLang);

// ─── Types ──────────────────────────────────────────────────────────────────

interface CodeResult { html: string; react: string; vue: string; }

interface SelectedElement {
  id: string;
  tagName: string;
  styles: Record<string, string>;
}

type CodeTab = "html" | "react" | "vue";
type MobileTab = "editor" | "code";

const HLJS_LANG: Record<CodeTab, "xml" | "typescript"> = {
  html: "xml", react: "typescript", vue: "xml",
};

const CODE_PANEL_H = 340;
const SIDEBAR_W = 256;

// ─── Property editor helpers ─────────────────────────────────────────────────

function isColorProp(prop: string): boolean {
  return /color/i.test(prop) || prop === "background" || prop === "fill" || prop === "stroke";
}

const PROP_LABELS: Record<string, string> = {
  // 색상
  color:                    "글자 색상",
  backgroundColor:          "배경 색상",
  background:               "배경",
  borderColor:              "테두리 색상",
  outlineColor:             "외곽선 색상",
  fill:                     "채우기 색상",
  stroke:                   "선 색상",
  caretColor:               "커서 색상",
  textDecorationColor:      "밑줄 색상",
  // 글자
  fontSize:                 "글자 크기",
  fontWeight:               "글자 굵기",
  fontFamily:               "글꼴",
  fontStyle:                "글자 기울기",
  lineHeight:               "줄 간격",
  letterSpacing:            "자간",
  wordSpacing:              "단어 간격",
  textAlign:                "텍스트 정렬",
  textDecoration:           "텍스트 꾸밈",
  textTransform:            "대소문자 변환",
  verticalAlign:            "세로 기준선",
  whiteSpace:               "공백 처리",
  wordBreak:                "단어 줄바꿈",
  // 바깥 여백
  margin:                   "바깥 여백",
  marginTop:                "위 바깥 여백",
  marginRight:              "오른쪽 바깥 여백",
  marginBottom:             "아래 바깥 여백",
  marginLeft:               "왼쪽 바깥 여백",
  // 안쪽 여백
  padding:                  "안쪽 여백",
  paddingTop:               "위 안쪽 여백",
  paddingRight:             "오른쪽 안쪽 여백",
  paddingBottom:            "아래 안쪽 여백",
  paddingLeft:              "왼쪽 안쪽 여백",
  // 크기
  width:                    "너비",
  height:                   "높이",
  minWidth:                 "최소 너비",
  maxWidth:                 "최대 너비",
  minHeight:                "최소 높이",
  maxHeight:                "최대 높이",
  // 테두리
  border:                   "테두리",
  borderTop:                "위 테두리",
  borderRight:              "오른쪽 테두리",
  borderBottom:             "아래 테두리",
  borderLeft:               "왼쪽 테두리",
  borderWidth:              "테두리 두께",
  borderStyle:              "테두리 스타일",
  borderRadius:             "모서리 둥글기",
  borderTopLeftRadius:      "왼쪽 위 모서리",
  borderTopRightRadius:     "오른쪽 위 모서리",
  borderBottomLeftRadius:   "왼쪽 아래 모서리",
  borderBottomRightRadius:  "오른쪽 아래 모서리",
  outline:                  "외곽선",
  outlineWidth:             "외곽선 두께",
  // 레이아웃
  display:                  "표시 방식",
  position:                 "위치 방식",
  top:                      "위쪽 위치",
  right:                    "오른쪽 위치",
  bottom:                   "아래쪽 위치",
  left:                     "왼쪽 위치",
  zIndex:                   "레이어 순서",
  overflow:                 "넘침 처리",
  overflowX:                "가로 넘침",
  overflowY:                "세로 넘침",
  objectFit:                "이미지 맞춤",
  // 플렉스
  flexDirection:            "배치 방향",
  justifyContent:           "가로 정렬",
  alignItems:               "세로 정렬",
  alignSelf:                "자체 세로 정렬",
  flexWrap:                 "줄 바꿈",
  gap:                      "항목 간격",
  rowGap:                   "행 간격",
  columnGap:                "열 간격",
  flex:                     "플렉스 비율",
  flexGrow:                 "늘어남 비율",
  flexShrink:               "줄어듦 비율",
  flexBasis:                "기본 크기",
  // 시각 효과
  opacity:                  "투명도",
  boxShadow:                "그림자",
  textShadow:               "텍스트 그림자",
  transform:                "변형",
  transition:               "전환 효과",
  animation:                "애니메이션",
  visibility:               "표시 여부",
  cursor:                   "커서 모양",
};

function propLabel(prop: string, lang: "ko" | "en"): string {
  if (lang === "en") return prop.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
  return PROP_LABELS[prop] ?? prop.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

const UI_TEXT = {
  ko: {
    properties:     "속성 편집기",
    minimize:       "패널 최소화",
    openPanel:      "패널 열기",
    deselect:       "선택 해제",
    noProps:        "적용된 CSS 속성이 없습니다.",
    clickHint1:     "미리보기에서",
    clickHint2:     "엘리먼트를 클릭하세요",
    back:           "돌아가기",
    save:           "저장하기",
    saving:         "저장 중...",
    saved:          "저장됨",
    copy:           "복사",
    copied:         "복사됨",
    noResult:       "결과가 없습니다.",
    noResultLong:   "결과가 없습니다. 먼저 이미지를 업로드하세요.",
    preview:        "미리보기",
    code:           "코드",
    closePanelTip:  "코드 패널 닫기",
    openPanelTip:   "코드 패널 열기",
  },
  en: {
    properties:     "Properties",
    minimize:       "Minimize panel",
    openPanel:      "Open panel",
    deselect:       "Deselect",
    noProps:        "No CSS properties applied.",
    clickHint1:     "Click an element",
    clickHint2:     "in the preview",
    back:           "Back",
    save:           "Save",
    saving:         "Saving...",
    saved:          "Saved",
    copy:           "Copy",
    copied:         "Copied",
    noResult:       "No result.",
    noResultLong:   "No result. Please upload an image first.",
    preview:        "Preview",
    code:           "Code",
    closePanelTip:  "Close code panel",
    openPanelTip:   "Open code panel",
  },
} as const;

// ─── Client-side HTML → React / Vue converters ───────────────────────────────

function extractBodyHtml(html: string): string {
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1].trim() : html;
}

function styleStrToReactObj(style: string): string {
  return style.split(';')
    .map((s) => s.trim()).filter(Boolean)
    .map((s) => {
      const i = s.indexOf(':');
      if (i === -1) return '';
      const prop = s.slice(0, i).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      const val = s.slice(i + 1).trim();
      return `${prop}: "${val}"`;
    })
    .filter(Boolean)
    .join(', ');
}

function htmlToReactCode(html: string): string {
  const body = extractBodyHtml(html);
  const jsx = body
    .replace(/\bclass=/g, 'className=')
    .replace(/\bfor=/g, 'htmlFor=')
    .replace(/\btabindex=/g, 'tabIndex=')
    .replace(/\bstyle="([^"]*)"/g, (_, s: string) => `style={{ ${styleStrToReactObj(s)} }}`);
  return `import React from 'react';\n\nexport default function Component() {\n  return (\n    <>\n${jsx}\n    </>\n  );\n}`;
}

function htmlToVueCode(html: string): string {
  const body = extractBodyHtml(html);
  return `<template>\n${body}\n</template>\n\n<script setup lang="ts">\n</script>\n`;
}

// ─── Snapshot capture ────────────────────────────────────────────────────────

/** Snapshot용 HTML — body padding 제거, 컴포넌트 영역만 캡처 */
// ─── buildIframeDoc ──────────────────────────────────────────────────────────

function buildIframeDoc(html: string): string {
  const script = `<script data-tagzo-injected>
(function(){
  var sel=null,n=1;
  function init(){
    document.querySelectorAll('style:not([data-tagzo-injected])').forEach(function(el,i){el.dataset.tagzoStyleIdx=String(i);});
    document.querySelectorAll('body *:not(script):not(style)').forEach(function(el){if(!el.dataset.tagzoId)el.dataset.tagzoId=String(n++);});
  }
  function toHex(v){
    if(!v||v==='transparent'||v==='rgba(0, 0, 0, 0)') return 'transparent';
    var m=v.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
    if(!m) return v;
    return '#'+[m[1],m[2],m[3]].map(function(x){return (+x).toString(16).padStart(2,'0');}).join('');
  }
  function kebab(s){return s.replace(/([A-Z])/g,function(_,c){return '-'+c.toLowerCase();});}
  var TEXT_TAGS={SPAN:1,P:1,H1:1,H2:1,H3:1,H4:1,H5:1,H6:1,A:1,LABEL:1,STRONG:1,EM:1,CODE:1,SMALL:1,B:1,I:1,TD:1,TH:1,LI:1,DT:1,DD:1,BLOCKQUOTE:1,CAPTION:1};
  var BUTTON_TAGS={BUTTON:1};
  function hasDirectText(el){
    for(var i=0;i<el.childNodes.length;i++){
      var n=el.childNodes[i];
      if(n.nodeType===3&&n.textContent.trim()) return true;
    }
    return false;
  }
  function getRelevantStyles(el){
    var cs=window.getComputedStyle(el);
    if(BUTTON_TAGS[el.tagName]){
      return {fontSize:cs.fontSize, color:toHex(cs.color), backgroundColor:toHex(cs.backgroundColor)};
    } else if(TEXT_TAGS[el.tagName]&&hasDirectText(el)){
      return {fontSize:cs.fontSize, color:toHex(cs.color)};
    } else if(hasDirectText(el)){
      return {fontSize:cs.fontSize, color:toHex(cs.color), backgroundColor:toHex(cs.backgroundColor), borderRadius:cs.borderRadius};
    } else {
      return {borderRadius:cs.borderRadius, backgroundColor:toHex(cs.backgroundColor)};
    }
  }
  document.addEventListener('click',function(e){
    var el=e.target;
    if(!el||el===document.body||el===document.documentElement) return;
    e.preventDefault(); e.stopPropagation();
    if(sel){var p=document.querySelector('[data-tagzo-id="'+sel+'"]');if(p){p.style.outline='';p.style.outlineOffset='';}}
    sel=el.dataset.tagzoId||null;
    if(sel){
      el.style.outline='2px solid #f59e0b'; el.style.outlineOffset='1px';
      window.parent.postMessage({type:'TAGZO_SELECT',id:sel,tagName:el.tagName.toLowerCase(),styles:getRelevantStyles(el)},'*');
    }
  },true);
  window.addEventListener('message',function(e){
    if(!e.data) return;
    if(e.data.type==='TAGZO_UPDATE'){
      var el=document.querySelector('[data-tagzo-id="'+e.data.id+'"]');
      if(!el) return;
      Object.keys(e.data.styles).forEach(function(prop){
        var value=e.data.styles[prop];
        var keb=kebab(prop);
        var updated=false;
        try{
          Array.from(document.styleSheets).forEach(function(sheet){
            if(updated) return;
            try{
              Array.from(sheet.cssRules||[]).forEach(function(rule){
                if(updated) return;
                if(rule.type===1&&rule.selectorText){
                  try{
                    if(el.matches(rule.selectorText)&&rule.style.getPropertyValue(keb)){
                      rule.style.setProperty(keb,value);
                      updated=true;
                    }
                  }catch(e2){}
                }
              });
            }catch(e2){}
          });
        }catch(e2){}
        if(!updated) el.style[prop]=value;
      });
    }
    if(e.data.type==='TAGZO_DESELECT'){
      if(sel){var el2=document.querySelector('[data-tagzo-id="'+sel+'"]');if(el2){el2.style.outline='';el2.style.outlineOffset='';}}
      sel=null;
    }
    if(e.data.type==='TAGZO_SERIALIZE'){
      if(sel){var s=document.querySelector('[data-tagzo-id="'+sel+'"]');if(s){s.style.outline='';s.style.outlineOffset='';}}
      var clone=document.documentElement.cloneNode(true);
      var inj=clone.querySelector('[data-tagzo-injected]');if(inj)inj.parentNode.removeChild(inj);
      // Copy updated CSS from live stylesheets into the clone's <style> elements
      document.querySelectorAll('style[data-tagzo-style-idx]').forEach(function(live){
        var idx=live.dataset.tagzoStyleIdx;
        var ce=clone.querySelector('style[data-tagzo-style-idx="'+idx+'"]');
        if(!ce||!live.sheet) return;
        var css='';
        try{Array.from(live.sheet.cssRules||[]).forEach(function(r){css+=r.cssText+'\\n';});}catch(e2){}
        if(css) ce.textContent=css;
        ce.removeAttribute('data-tagzo-style-idx');
      });
      clone.querySelectorAll('[data-tagzo-id]').forEach(function(el){el.removeAttribute('data-tagzo-id');});
      window.parent.postMessage({type:'TAGZO_HTML',html:'<!DOCTYPE html>\\n'+clone.outerHTML},'*');
      if(sel){var s2=document.querySelector('[data-tagzo-id="'+sel+'"]');if(s2){s2.style.outline='2px solid #f59e0b';s2.style.outlineOffset='1px';}}
    }
  });
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
})();
<\/script>`;

  const isFullPage = /<html/i.test(html);

  const BASE_META = `<meta name="viewport" content="width=device-width,initial-scale=1"/>`;
  const BASE_STYLE = `<style data-tagzo-injected>*{box-sizing:border-box;}body{margin:0;padding:24px;}</style>`;

  if (isFullPage) {
    let out = html;
    // viewport 메타가 없으면 주입
    if (!/<meta[^>]+viewport/i.test(out)) {
      out = /<\/head>/i.test(out)
        ? out.replace(/<\/head>/i, BASE_META + BASE_STYLE + "</head>")
        : out.replace(/<head>/i, "<head>" + BASE_META + BASE_STYLE);
    }
    return /<\/body>/i.test(out)
      ? out.replace(/<\/body>/i, script + "</body>")
      : out + script;
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
${BASE_META}
${BASE_STYLE}
</head>
<body>
${html}
${script}
</body>
</html>`;
}

// ─── CodeBlock ───────────────────────────────────────────────────────────────

function CodeBlock({ code, tab }: { code: string; tab: CodeTab }) {
  const html = useMemo(() => {
    if (!code) return "";
    try {
      return hljs.highlight(code, { language: HLJS_LANG[tab] }).value;
    } catch {
      return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }, [code, tab]);

  return (
    <pre className="p-4 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words bg-background min-h-full">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}

// ─── PropField ───────────────────────────────────────────────────────────────

interface PropFieldProps {
  label: string; type: "color" | "text" | "select";
  value: string; options?: string[]; onChange: (v: string) => void;
}

function PropField({ label, type, value, options, onChange }: PropFieldProps) {
  const textRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const num = parseFloat(value);
      if (isNaN(num)) return;
      e.preventDefault();
      const unit = value.replace(/^-?[\d.]+/, "");
      const step = e.shiftKey ? 10 : 1;
      const next = Math.round((num + (e.deltaY < 0 ? step : -step)) * 100) / 100;
      onChange(next + unit);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [value, onChange]);

  const isNumeric = !isNaN(parseFloat(value));

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      {type === "color" ? (
        <div className="flex items-center gap-1.5">
          <input type="color" value={value === "transparent" ? "#ffffff" : value}
            onChange={(e) => onChange(e.target.value)}
            className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent p-0.5 flex-shrink-0" />
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            className="flex-1 h-7 px-2 text-xs bg-muted border border-border rounded font-mono focus:outline-none focus:ring-1 focus:ring-[var(--amber)] min-w-0" />
        </div>
      ) : type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="h-7 px-2 text-xs bg-muted border border-border rounded focus:outline-none focus:ring-1 focus:ring-[var(--amber)]">
          {options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input ref={textRef} type="text" value={value} onChange={(e) => onChange(e.target.value)}
          title={isNumeric ? "휠로 수치 조절 (Shift: ×10)" : undefined}
          className={[
            "h-7 px-2 text-xs bg-muted border border-border rounded font-mono focus:outline-none focus:ring-1 focus:ring-[var(--amber)]",
            isNumeric ? "cursor-ns-resize" : "",
          ].join(" ")} />
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TAB_LABEL: Record<CodeTab, string> = { html: "HTML / CSS", react: "React", vue: "Vue" };

export default function ResultPage() {
  const { lang } = useLang();
  const ui = UI_TEXT[lang];
  const [codes, setCodes] = useState<CodeResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [liveHtml, setLiveHtml] = useState<string | null>(null);
  const [codeTab, setCodeTab] = useState<CodeTab>("html");
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [codeOpen, setCodeOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>("editor");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("tagzo_result");
      if (raw) {
        const parsed = JSON.parse(raw) as CodeResult;
        setCodes({
          html: beautify.html(parsed.html, { indent_size: 2, wrap_line_length: 120, extra_liners: [] }),
          react: beautify.js(parsed.react, { indent_size: 2, wrap_line_length: 120 }),
          vue: beautify.html(parsed.vue, { indent_size: 2, wrap_line_length: 120, extra_liners: [] }),
        });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "TAGZO_SELECT")
        setSelected({ id: e.data.id, tagName: e.data.tagName, styles: e.data.styles });
      if (e.data?.type === "TAGZO_HTML") {
        const raw = e.data.html as string;
        const newHtml = beautify.html(raw, { indent_size: 2, wrap_line_length: 120, extra_liners: [] });
        setLiveHtml(newHtml);
        setCodes((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            react: beautify.js(htmlToReactCode(raw), { indent_size: 2, wrap_line_length: 120 }),
            vue: beautify.html(htmlToVueCode(raw), { indent_size: 2, wrap_line_length: 120, extra_liners: [] }),
          };
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const send = useCallback((msg: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  }, []);

  const handleStyleChange = useCallback((key: string, value: string) => {
    if (!selected) return;
    setSelected((p) => p ? { ...p, styles: { ...p.styles, [key]: value } } : p);
    send({ type: "TAGZO_UPDATE", id: selected.id, styles: { [key]: value } });
    send({ type: "TAGZO_SERIALIZE" });
  }, [selected, send]);

  const handleDeselect = () => { send({ type: "TAGZO_DESELECT" }); setSelected(null); };

  const handleSave = useCallback(async () => {
    if (!codes || saveStatus !== "idle") return;
    setSaveStatus("saving");
    try {
      const res = await fetch(`${BP}/api/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: liveHtml ?? codes.html,
          react: codes.react,
          vue: codes.vue,
        }),
      });
      setSaveStatus(res.ok ? "saved" : "idle");
    } catch {
      setSaveStatus("idle");
    }
  }, [codes, liveHtml, saveStatus]);


  const activeCode = codes
    ? (codeTab === "html" ? (liveHtml ?? codes.html) : codes[codeTab])
    : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iframeDoc = useMemo(() => codes ? buildIframeDoc(codes.html) : "", [codes]);

  // ── Shared sub-sections (JSX variables — rendered in both mobile & desktop) ──

  /** Property editor body (scrollable content + fixed footer buttons) */
  const propBody = (
    <>
    <div className="flex-1 overflow-auto p-3">
      {selected ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              &lt;{selected.tagName}&gt;
            </span>
            <button onClick={handleDeselect}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              {ui.deselect}
            </button>
          </div>
          {Object.keys(selected.styles).length === 0 ? (
            <p className="text-xs text-muted-foreground">{ui.noProps}</p>
          ) : (
            Object.entries(selected.styles).map(([prop, value]) => (
              <PropField
                key={prop}
                label={propLabel(prop, lang)}
                type={isColorProp(prop) ? "color" : "text"}
                value={value}
                onChange={(v) => handleStyleChange(prop, v)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2 text-center select-none py-10">
          <div className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground">
            <MousePointerClick size={16} />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {ui.clickHint1}<br />{ui.clickHint2}
          </p>
        </div>
      )}
    </div>
    {/* Footer buttons */}
    <div className="flex-shrink-0 p-3 border-t border-border/40 flex flex-col gap-2">
      <Link href="/"
        className="w-full flex items-center justify-center h-9 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
        {ui.back}
      </Link>
      <button
        onClick={handleSave}
        disabled={!codes || saveStatus !== "idle"}
        className={[
          "w-full flex items-center justify-center gap-1.5 h-9 rounded-md text-xs font-semibold transition-all",
          saveStatus === "saved"
            ? "bg-[var(--amber)]/15 text-[var(--amber)] cursor-default"
            : saveStatus === "saving"
              ? "bg-muted text-muted-foreground cursor-wait"
              : "bg-[var(--amber)] text-[oklch(0.09_0.005_60)] hover:bg-[oklch(0.65_0.16_75)] active:scale-95",
        ].join(" ")}
      >
        {saveStatus === "saving" ? (
          <><Loader2 size={12} className="animate-spin" />{ui.saving}</>
        ) : saveStatus === "saved" ? (
          <><Check size={12} />{ui.saved}</>
        ) : (
          <><Bookmark size={12} />{ui.save}</>
        )}
      </button>
    </div>
    </>
  );

  /** Code tab bar + copy button row */
  const codeTabBar = (showCopyOnly = false) => (
    <div className="flex items-center justify-between px-4 h-10 border-b border-border/40 bg-muted/30 flex-shrink-0">
      <div className="flex items-center gap-1">
        <Code2 size={12} className="text-muted-foreground mr-1" />
        {(["html", "react", "vue"] as CodeTab[]).map((t) => (
          <button key={t} onClick={() => setCodeTab(t)}
            className={[
              "px-2.5 py-1 rounded text-xs font-medium transition-colors",
              codeTab === t ? "bg-[var(--amber)]/15 text-[var(--amber)]" : "text-muted-foreground hover:text-foreground hover:bg-muted",
            ].join(" ")}>
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>
      <Button variant="ghost" size="sm"
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        onClick={handleCopy} disabled={!codes}>
        {copied
          ? <><Check size={12} className="text-green-500" /><span className="text-green-500">{ui.copied}</span></>
          : <><Copy size={12} />{ui.copy}</>}
      </Button>
    </div>
  );

  /** Code block content */
  const codeBlock = (
    <div className="flex-1 overflow-auto min-h-0">
      {codes
        ? <CodeBlock code={activeCode} tab={codeTab} />
        : <div className="flex items-center justify-center h-full text-sm text-muted-foreground">{ui.noResult}</div>
      }
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Header />


      {/* ════════════════ MOBILE ════════════════ */}
      <div className="flex sm:hidden flex-col flex-1 min-h-0">

        {/* Editor tab: preview (top) + props (bottom) */}
        <div className={`flex flex-col min-h-0 ${mobileTab === "editor" ? "flex-1" : "hidden"}`}>
          {/* Preview — calc(100dvh - header56 - bottomTab56 - props240) */}
          <div
            className="overflow-scroll bg-[oklch(0.94_0.004_80)] dark:bg-[oklch(0.10_0.005_60)] flex-shrink-0"
            style={{ height: "calc(100dvh - 352px)" }}
          >
            <iframe
              key={iframeDoc ? "loaded" : "empty"}
              srcDoc={iframeDoc}
              sandbox="allow-scripts"
              className="border-0 block"
              style={{ width: "1024px", height: "calc(100dvh - 352px)", minHeight: "600px" }}
              title="Component Preview"
            />
          </div>

          {/* Props */}
          <div className="flex flex-col flex-shrink-0 border-t border-border/60" style={{ height: 240 }}>
            <div className="flex items-center gap-2 px-4 h-10 border-b border-border/40 bg-muted/30 flex-shrink-0 text-xs text-muted-foreground">
              <Palette size={12} />
              <span className="font-medium">{ui.properties}</span>
              {selected && (
                <span className="px-1.5 py-0.5 bg-[var(--amber)]/15 text-[var(--amber)] rounded text-[10px] font-mono leading-none">
                  &lt;{selected.tagName}&gt;
                </span>
              )}
            </div>
            {propBody}
          </div>
        </div>

        {/* Code tab */}
        <div className={`flex flex-col min-h-0 ${mobileTab === "code" ? "flex-1" : "hidden"}`}>
          {codeTabBar()}
          {codeBlock}
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="flex sm:hidden border-t border-border/60 bg-background flex-shrink-0 h-14">
        {([
          { id: "editor" as MobileTab, icon: Eye, label: ui.preview },
          { id: "code" as MobileTab, icon: Code2, label: ui.code },
        ]).map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setMobileTab(id)}
            className={[
              "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] transition-colors",
              mobileTab === id ? "text-[var(--amber)]" : "text-muted-foreground",
            ].join(" ")}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════ DESKTOP ════════════════ */}
      <div className="hidden sm:flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar ── */}
        <div
          className="hidden sm:flex flex-col border-r border-border/60 flex-shrink-0 bg-background transition-[width] duration-200 overflow-hidden"
          style={{ width: sidebarOpen ? SIDEBAR_W : 44 }}>
          {sidebarOpen ? (
            <div className="flex flex-col h-full w-full">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40 bg-muted/30 flex-shrink-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Palette size={12} />
                  <span className="font-medium">{ui.properties}</span>
                  {selected && (
                    <span className="px-1.5 py-0.5 bg-[var(--amber)]/15 text-[var(--amber)] rounded text-[10px] font-mono leading-none">
                      &lt;{selected.tagName}&gt;
                    </span>
                  )}
                </div>
                <button onClick={() => setSidebarOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title={ui.minimize}>
                  <ChevronLeft size={13} />
                </button>
              </div>
              {propBody}
            </div>
          ) : (
            /* Collapsed icon strip */
            <div className="flex flex-col items-center py-2 gap-1 w-full">
              <button onClick={() => setSidebarOpen(true)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title={ui.openPanel}>
                <ChevronRight size={13} />
              </button>
              <div className="h-px w-5 bg-border/40 my-1" />
              <button onClick={() => setSidebarOpen(true)}
                className={[
                  "w-8 h-8 flex items-center justify-center rounded transition-colors relative",
                  selected ? "text-[var(--amber)] bg-[var(--amber)]/10" : "text-muted-foreground hover:text-foreground hover:bg-muted",
                ].join(" ")}
                title={ui.properties}>
                <Palette size={15} />
                {selected && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />}
              </button>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">

          {/* Canvas */}
          <div className="flex-1 min-h-0 relative overflow-hidden bg-[oklch(0.94_0.004_80)] dark:bg-[oklch(0.10_0.005_60)]">
            {codes ? (
              <iframe ref={iframeRef} key={iframeDoc ? "loaded" : "empty"} srcDoc={iframeDoc} sandbox="allow-scripts"
                className="w-full h-full border-0" title="Component Preview" />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                {ui.noResultLong}
              </div>
            )}
          </div>

          {/* Code panel */}
          <div
            className="flex-shrink-0 border-t border-border/60 bg-background flex flex-col transition-[height] duration-200 overflow-hidden"
            style={{ height: codeOpen ? CODE_PANEL_H : 40 }}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 h-10 border-b border-border/40 bg-muted/30 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Code2 size={12} className="text-muted-foreground mr-1" />
                {(["html", "react", "vue"] as CodeTab[]).map((t) => (
                  <button key={t}
                    onClick={() => { setCodeTab(t); if (!codeOpen) setCodeOpen(true); }}
                    className={[
                      "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                      codeTab === t && codeOpen ? "bg-[var(--amber)]/15 text-[var(--amber)]" : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    ].join(" ")}>
                    {TAB_LABEL[t]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {codeOpen && (
                  <Button variant="ghost" size="sm"
                    className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleCopy} disabled={!codes}>
                    {copied
                      ? <><Check size={12} className="text-green-500" /><span className="text-green-500">{ui.copied}</span></>
                      : <><Copy size={12} />{ui.copy}</>}
                  </Button>
                )}
                <button onClick={() => setCodeOpen((o) => !o)}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title={codeOpen ? ui.closePanelTip : ui.openPanelTip}>
                  {codeOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                </button>
              </div>
            </div>

            {codeOpen && codeBlock}
          </div>
        </div>
      </div>
    </div>
  );
}
