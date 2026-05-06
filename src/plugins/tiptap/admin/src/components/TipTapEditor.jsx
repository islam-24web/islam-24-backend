import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Typography } from '@strapi/design-system';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  ListNumbers,
  ListBullets,
  H1,
  H2,
  H3,
  H4,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  ColorFill,
  Palette,
  Highlight as HighlightIcon,
  JustifyLeft,
  JustifyCenter,
  JustifyRight,
  Justify,
  Superscript as SuperIcon,
  Subscript as SubIcon,
  CheckCircle,
  Line,
  ClearFormatting,
  CodeBlock,
  HorizontalRule,
  SourceCode,
  Expand,
  Eye,
} from '@strapi/icons';

// ─── Toolbar Components ────────────────────────────────────────────

const ToolbarDivider = () => (
  <div style={{ width: 1, height: 24, background: '#dcdce4', margin: '0 4px' }} />
);

const ToolbarGroup = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>{children}</div>
);

const ToolBtn = ({ icon: Icon, onClick, active, title, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: 4,
      background: active ? '#4945ff' : 'transparent',
      color: active ? '#fff' : '#32324d',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: active ? 'bold' : 'normal',
      transition: 'all 0.1s',
    }}
  >
    {children || (Icon && <Icon width={16} height={16} />)}
  </button>
);

const SelectBtn = ({ value, onChange, options, title }) => (
  <select
    title={title}
    value={value}
    onChange={onChange}
    style={{
      height: 28,
      border: '1px solid #dcdce4',
      borderRadius: 4,
      fontSize: 13,
      padding: '0 4px',
      cursor: 'pointer',
      background: '#fff',
      color: '#32324d',
    }}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const ColorPicker = ({ currentColor, onChange, title }) => {
  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
    '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
    '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
    '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130',
  ];

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <ToolBtn
        title={title || 'لون النص'}
        active={!!currentColor && currentColor !== '#000000'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Palette width={14} height={14} />
          <div style={{ width: 14, height: 14, borderRadius: 2, background: currentColor || '#000', border: '1px solid #ccc' }} />
        </div>
      </ToolBtn>
      <div
        style={{
          display: 'none',
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 1000,
          background: '#fff',
          border: '1px solid #dcdce4',
          borderRadius: 8,
          padding: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: 2,
          width: 280,
        }}
        className="tiptap-color-grid"
      >
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            onClick={() => onChange(c)}
            style={{
              width: 24,
              height: 24,
              border: c === currentColor ? '2px solid #4945ff' : '1px solid #ddd',
              borderRadius: 3,
              background: c,
              cursor: 'pointer',
            }}
          />
        ))}
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            gridColumn: 'span 10',
            border: 'none',
            background: 'transparent',
            color: '#666',
            fontSize: 11,
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          إزالة اللون
        </button>
      </div>
      <style>{`
        .tiptap-color-grid:hover { display: grid !important; }
        .tiptap-color-grid { display: none; }
        div:has(> .tiptap-color-grid):hover > .tiptap-color-grid { display: grid !important; }
      `}</style>
    </div>
  );
};

const FONT_FAMILIES = [
  { value: 'Inter', label: 'الافتراضي' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Impact', label: 'Impact' },
];

const FONT_SIZES = [
  { value: '8pt', label: '8' },
  { value: '10pt', label: '10' },
  { value: '12pt', label: '12' },
  { value: '14pt', label: '14' },
  { value: '16pt', label: '16' },
  { value: '18pt', label: '18' },
  { value: '20pt', label: '20' },
  { value: '24pt', label: '24' },
  { value: '30pt', label: '30' },
  { value: '36pt', label: '36' },
  { value: '48pt', label: '48' },
  { value: '60pt', label: '60' },
];

const HEADING_LEVELS = [
  { value: 'paragraph', label: 'فقرة' },
  { value: 'heading', level: 1, label: 'عنوان ١' },
  { value: 'heading', level: 2, label: 'عنوان ٢' },
  { value: 'heading', level: 3, label: 'عنوان ٣' },
  { value: 'heading', level: 4, label: 'عنوان ٤' },
];

// ─── Main Editor Component ─────────────────────────────────────────

const TipTapEditor = ({ name, value, onChange, required, disabled, error, attribute, labelAction, intlLabel }) => {
  const [showSource, setShowSource] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: false,
        horizontalRule: {},
      }),
      Underline,
      TextStyle,
      FontFamily.configure({ types: ['textStyle'] }),
      Color.configure({ types: ['textStyle'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'nofollow', target: '_blank' } }),
      Image.configure({ inline: true }),
      Table.configure({ resizable: true }),
      TableHeader,
      TableRow,
      TableCell,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
      Superscript,
      Subscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlock.configure({ HTMLAttributes: { dir: 'ltr' } }),
      Placeholder.configure({ placeholder: 'ابدأ الكتابة...' }),
      CharacterCount.configure({ limit: 50000 }),
    ],
    content: value || '<p></p>',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setSourceCode(html);
      onChange({ target: { name, value: html, type: 'richtext' } });
    },
    editorProps: {
      handleDOMEvents: {
        keydown: (view, event) => {
          // Prevent default Tab behavior for source mode
          if (showSource && event.key === 'Tab') {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },
  });

  // Update content when value prop changes externally
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value || '<p></p>');
    }
  }, [value, editor]);

  // Sync source code
  useEffect(() => {
    if (editor) {
      setSourceCode(editor.getHTML());
    }
  }, [editor, value]);

  // Update word/char count
  useEffect(() => {
    if (editor) {
      const interval = setInterval(() => {
        const text = editor.getText();
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        setWordCount(words);
        setCharCount(text.length);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [editor]);

  const applySourceCode = useCallback(() => {
    if (editor) {
      editor.commands.setContent(sourceCode);
      setShowSource(false);
      onChange({ target: { name, value: sourceCode, type: 'richtext' } });
    }
  }, [editor, sourceCode, name, onChange]);

  // Toolbar action handlers
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('الرابط:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('رابط الصورة:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  // ─── Toolbar ─────────────────────────────────────────────────────
  const renderToolbar = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        padding: '6px 8px',
        background: '#f6f6f9',
        borderBottom: '1px solid #dcdce4',
        borderRadius: '4px 4px 0 0',
        minHeight: 40,
      }}
    >
      {/* Undo / Redo */}
      <ToolbarGroup>
        <ToolBtn title="تراجع" onClick={() => editor.chain().focus().undo().run()}>↩</ToolBtn>
        <ToolBtn title="إعادة" onClick={() => editor.chain().focus().redo().run()}>↪</ToolBtn>
      </ToolbarGroup>
      <ToolbarDivider />

      {/* Headings */}
      <SelectBtn
        title="نوع النص"
        value={editor.isActive('heading', { level: 1 }) ? 'h1' : editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : editor.isActive('heading', { level: 4 }) ? 'h4' : 'paragraph'}
        onChange={(e) => {
          const val = e.target.value;
          if (val === 'paragraph') return editor.chain().focus().setParagraph().run();
          editor.chain().focus().toggleHeading({ level: parseInt(val.replace('h', '')) }).run();
        }}
        options={[
          { value: 'paragraph', label: 'فقرة' },
          { value: 'h1', label: 'عنوان ١' },
          { value: 'h2', label: 'عنوان ٢' },
          { value: 'h3', label: 'عنوان ٣' },
          { value: 'h4', label: 'عنوان ٤' },
        ]}
      />
      <ToolbarDivider />

      {/* Font Family */}
      <SelectBtn
        title="نوع الخط"
        value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
        onChange={(e) => {
          if (e.target.value === 'Inter') return editor.chain().focus().unsetFontFamily().run();
          editor.chain().focus().setFontFamily(e.target.value).run();
        }}
        options={FONT_FAMILIES}
      />
      <ToolbarDivider />

      {/* Font Size */}
      <SelectBtn
        title="حجم الخط"
        value={editor.getAttributes('textStyle').fontSize || '16pt'}
        onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
        options={FONT_SIZES}
      />

      {/* Color & Highlight */}
      <ColorPicker
        title="لون النص"
        currentColor={editor.getAttributes('textStyle').color || '#000000'}
        onChange={(color) => {
          if (!color) editor.chain().focus().unsetColor().run();
          else editor.chain().focus().setColor(color).run();
        }}
      />
      <ToolBtn
        title="تمييز"
        icon={HighlightIcon}
        active={editor.isActive('highlight')}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      />
      <ToolbarDivider />

      {/* Text formats */}
      <ToolbarGroup>
        <ToolBtn title="عريض (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></ToolBtn>
        <ToolBtn title="مائل (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></ToolBtn>
        <ToolBtn title="تحته خط (Ctrl+U)" icon={UnderlineIcon} active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolBtn title="يتوسطه خط" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></ToolBtn>
        <ToolBtn title="علوي" icon={SuperIcon} active={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()} />
        <ToolBtn title="سفلي" icon={SubIcon} active={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()} />
        <ToolBtn title="كود" icon={Code} active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
      </ToolbarGroup>
      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarGroup>
        <ToolBtn title="يمين" icon={JustifyRight} active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
        <ToolBtn title="وسط" icon={JustifyCenter} active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <ToolBtn title="يسار" icon={JustifyLeft} active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <ToolBtn title="ضبط" icon={Justify} active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} />
      </ToolbarGroup>
      <ToolbarDivider />

      {/* Lists */}
      <ToolbarGroup>
        <ToolBtn title="قائمة مرقمة" icon={ListNumbers} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolBtn title="قائمة نقطية" icon={ListBullets} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolBtn title="قائمة مهام" icon={CheckCircle} active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />
      </ToolbarGroup>
      <ToolbarDivider />

      {/* Inserts */}
      <ToolbarGroup>
        <ToolBtn title="اقتباس" icon={Quote} active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <ToolBtn title="كود برمجي" icon={CodeBlock} active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <ToolBtn title="خط أفقي" icon={HorizontalRule} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <ToolBtn title="رابط" icon={LinkIcon} active={editor.isActive('link')} onClick={setLink} />
        <ToolBtn title="صورة" icon={ImageIcon} onClick={addImage} />
        <ToolBtn title="جدول" icon={TableIcon} onClick={addTable} />
      </ToolbarGroup>

      {/* Table helpers (show only when in table) */}
      {editor.isActive('table') && (
        <>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolBtn title="إضافة عمود قبل" onClick={() => editor.chain().focus().addColumnBefore().run()}>⬅️</ToolBtn>
            <ToolBtn title="إضافة عمود بعد" onClick={() => editor.chain().focus().addColumnAfter().run()}>➡️</ToolBtn>
            <ToolBtn title="إضافة صف قبل" onClick={() => editor.chain().focus().addRowBefore().run()}>⬆️</ToolBtn>
            <ToolBtn title="إضافة صف بعد" onClick={() => editor.chain().focus().addRowAfter().run()}>⬇️</ToolBtn>
            <ToolBtn title="حذف الجدول" onClick={() => editor.chain().focus().deleteTable().run()}>🗑️</ToolBtn>
          </ToolbarGroup>
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* Clear Formatting */}
      <ToolBtn title="مسح التنسيق" icon={ClearFormatting} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} />
      <ToolbarDivider />

      {/* Toggle Modes */}
      <ToolBtn
        title="توسيع"
        active={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Expand width={16} height={16} />
      </ToolBtn>
      <ToolBtn
        title="معاينة"
        active={isPreview}
        onClick={() => setIsPreview(!isPreview)}
      >
        <Eye width={16} height={16} />
      </ToolBtn>
      <ToolBtn
        title={showSource ? 'عودة للمحرر' : 'HTML'}
        active={showSource}
        onClick={() => {
          if (showSource) {
            applySourceCode();
          } else {
            setSourceCode(editor.getHTML());
            setShowSource(true);
          }
        }}
      >
        <SourceCode width={16} height={16} />
      </ToolBtn>
    </div>
  );

  // ─── Status Bar ─────────────────────────────────────────────────
  const renderStatusBar = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 12px',
        fontSize: 12,
        color: '#666687',
        background: '#f6f6f9',
        borderTop: '1px solid #dcdce4',
        borderRadius: '0 0 4px 4px',
      }}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        <span>📝 {wordCount} كلمة</span>
        <span>🔤 {charCount} حرف</span>
        <span>⏱️ ~{Math.max(1, Math.ceil(wordCount / 200))} دقيقة قراءة</span>
      </div>
      <div>
        <strong>TipTap Editor</strong>
      </div>
    </div>
  );

  // ── Expand/Preview modes ───────────────────────────────────────
  const editorStyle = {
    border: error ? '1px solid #ee5e52' : '1px solid #dcdce4',
    borderRadius: 4,
    background: '#fff',
    position: isExpanded ? 'fixed' : 'relative',
    top: isExpanded ? 0 : 'auto',
    left: isExpanded ? 0 : 'auto',
    width: isExpanded ? '100vw' : '100%',
    height: isExpanded ? '100vh' : 'auto',
    zIndex: isExpanded ? 9999 : 'auto',
    display: 'flex',
    flexDirection: 'column',
  };

  const editorBodyStyle = {
    flex: 1,
    overflow: 'auto',
    maxHeight: isExpanded ? 'calc(100vh - 72px)' : '500px',
  };

  return (
    <div style={editorStyle}>
      {!isPreview && renderToolbar()}

      <div style={editorBodyStyle}>
        {showSource ? (
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              minHeight: 400,
              border: 'none',
              padding: 16,
              fontFamily: "'Courier New', monospace",
              fontSize: 13,
              lineHeight: 1.5,
              direction: 'ltr',
              resize: 'none',
              outline: 'none',
              background: '#1e1e1e',
              color: '#d4d4d4',
            }}
          />
        ) : isPreview ? (
          <div
            className="tiptap-preview"
            style={{ padding: 16, minHeight: 400, lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
          />
        ) : (
          <EditorContent
            editor={editor}
            style={{ padding: '12px 16px', minHeight: 300 }}
          />
        )}
      </div>

      {!isPreview && renderStatusBar()}

      {/* Required indicator */}
      {required && (
        <Typography variant="pi" textColor="danger600" style={{ marginTop: 4 }}>
          * هذا الحقل مطلوب
        </Typography>
      )}
    </div>
  );
};

export default TipTapEditor;
