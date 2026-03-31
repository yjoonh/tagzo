"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type Lang = "ko" | "en";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextValue>({ lang: "ko", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ko");

  useEffect(() => {
    const stored = localStorage.getItem("tagzo_lang");
    if (stored === "en" || stored === "ko") setLang(stored);
  }, []);

  const handleSetLang = (l: Lang) => {
    localStorage.setItem("tagzo_lang", l);
    setLang(l);
  };

  return <LangContext.Provider value={{ lang, setLang: handleSetLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

// ─── Translations ────────────────────────────────────────────────────────────

export const T = {
  ko: {
    badge: "Design to Code · Instant",
    heroSub1: "UI 이미지를 올리는 순간, 실제로 동작하는 컴포넌트 코드가 됩니다.",
    heroSub2: "HTML · React · Vue, 원하는 형태로 바로 가져가세요.",

    howLabel: "How it works",
    howTitle: "3단계로 끝나는 UI 코드 변환",
    howDesc1: "디자인 시안을 올리기만 하면, AI가 구조를 분석해",
    howDesc2: "바로 사용할 수 있는 컴포넌트 코드를 생성합니다.",
    steps: [
      {
        step: "01",
        title: "이미지 업로드",
        desc: "Figma 시안, 스크린샷, 스케치 사진 등 UI가 담긴 이미지를 드래그하거나 클릭해서 올리세요. 어떤 형태든 상관없습니다.",
        img: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/step01.png`,
      },
      {
        step: "02",
        title: "AI 코드 생성",
        desc: "AI가 UI 구조, 색상, 레이아웃을 분석해 HTML · React · Vue 코드를 자동으로 생성합니다.",
        img: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/step02.png`,
      },
      {
        step: "03",
        title: "편집 후 복사",
        desc: "속성 편집기로 색상·크기를 세밀하게 조정하고, 원하는 프레임워크 탭에서 코드를 바로 복사해 프로젝트에 붙여넣으세요.",
        img: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/step03.png`,
      },
    ],

    faqLabel: "FAQ",
    faqTitle: "자주 묻는 질문",
    faqs: [
      {
        q: "어떤 이미지를 올려야 하나요?",
        a: "Figma·Sketch 시안, 웹사이트 스크린샷, 손으로 그린 와이어프레임 등 UI가 담긴 이미지라면 무엇이든 괜찮습니다. JPG·PNG·WebP 형식을 지원하며, 선명할수록 더 정확한 코드가 생성됩니다.",
      },
      {
        q: "생성되는 코드 품질은 어느 정도인가요?",
        a: "Tailwind CSS 기반의 시맨틱 HTML을 출력합니다. 복잡한 레이아웃도 flex·grid를 활용해 구조적으로 생성되며, React·Vue 변환도 즉시 제공됩니다. 속성 편집기로 세부 조정도 가능합니다.",
      },
      {
        q: "HTML·React·Vue 중 어떤 걸 써야 하나요?",
        a: "세 가지 형태가 동시에 생성됩니다. 순수 웹 프로젝트라면 HTML, Next.js·Vite 기반이라면 React, Nuxt 등의 환경이라면 Vue 탭에서 바로 복사해 사용하면 됩니다.",
      },
      {
        q: "속성 편집기는 어떻게 사용하나요?",
        a: "미리보기 화면에서 수정할 요소를 클릭하면 오른쪽 패널에 편집 가능한 속성이 나타납니다. 색상·크기 등을 변경하면 코드가 실시간으로 업데이트됩니다.",
      },
      {
        q: "생성된 코드를 상업적으로 사용해도 되나요?",
        a: "네, 생성된 코드의 저작권은 사용자에게 있습니다. 개인 프로젝트는 물론 상업적 제품에도 제한 없이 활용하실 수 있습니다.",
      },
      {
        q: "모바일 UI도 변환할 수 있나요?",
        a: "가능합니다. 앱 스크린샷이나 모바일 디자인 시안을 올리면 반응형 레이아웃을 고려한 코드가 생성됩니다. 필요 시 속성 편집기로 추가 조정하세요.",
      },
    ],

    footer: "© 2026 Tagzo AI · All rights reserved",
  },

  en: {
    badge: "Design to Code · Instant",
    heroSub1: "Upload a UI image and get working component code instantly.",
    heroSub2: "HTML · React · Vue — grab whichever format you need.",

    howLabel: "How it works",
    howTitle: "UI to Code in 3 Simple Steps",
    howDesc1: "Just upload your design and AI analyzes the structure",
    howDesc2: "to generate ready-to-use component code.",
    steps: [
      {
        step: "01",
        title: "Upload Image",
        desc: "Drag and drop or click to upload any UI image — Figma mockups, screenshots, or rough sketches. Any format works.",
        img: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/step01.png`,
      },
      {
        step: "02",
        title: "AI Code Generation",
        desc: "AI analyzes the UI structure, colors, and layout to automatically generate HTML · React · Vue code — usually within 10 seconds.",
        img: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/step02.png`,
      },
      {
        step: "03",
        title: "Edit & Copy",
        desc: "Fine-tune colors and sizes with the property editor, then copy the code from your preferred framework tab and paste it into your project.",
        img: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/step03.png`,
      },
    ],

    faqLabel: "FAQ",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        q: "What kind of images should I upload?",
        a: "Any image with a UI — Figma or Sketch mockups, website screenshots, or hand-drawn wireframes. JPG, PNG, and WebP are supported. The clearer the image, the more accurate the generated code.",
      },
      {
        q: "How good is the generated code?",
        a: "It outputs semantic HTML with Tailwind CSS. Complex layouts are handled with flex and grid. React and Vue versions are generated simultaneously, and you can fine-tune styles with the property editor.",
      },
      {
        q: "Which should I use — HTML, React, or Vue?",
        a: "All three are generated at once. Use HTML for plain web projects, React for Next.js or Vite, and Vue for Nuxt or similar environments. Just pick the right tab and copy.",
      },
      {
        q: "How do I use the property editor?",
        a: "Click any element in the preview and its editable properties appear in the right panel. Changes to color, size, and more are reflected in the code in real time.",
      },
      {
        q: "Can I use the generated code commercially?",
        a: "Yes. You own the generated code and can use it in personal or commercial projects without any restrictions.",
      },
      {
        q: "Can I convert mobile UI designs too?",
        a: "Absolutely. Upload an app screenshot or mobile design mockup and the code will be generated with responsive layout in mind. Use the property editor for further adjustments.",
      },
    ],

    footer: "© 2026 Tagzo AI · All rights reserved",
  },
} as const;
