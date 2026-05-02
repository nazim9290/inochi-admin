/**
 * EN: TipTap-based rich text editor with brand-styled toolbar. Outputs clean
 *     HTML (<p>, <h2>, <strong>, <ul>, <a>, <img>, etc.) so the existing public
 *     PostBody renderer can dangerouslySetInnerHTML it without changes. Image
 *     button opens the ImageCropModal — admin crops first, then the cropped
 *     Cloudinary URL is inserted as <img>.
 * BN: TipTap দিয়ে rich text editor — toolbar brand-color দিয়ে styled। Output
 *     হলো clean HTML (<p>, <h2>, <strong>, <ul>, <a>, <img> ইত্যাদি) — public
 *     site-এর PostBody dangerouslySetInnerHTML দিয়ে সরাসরি render করতে পারবে।
 *     Image button ImageCropModal খোলে — admin crop করে, তারপর cropped
 *     Cloudinary URL <img> হিসেবে editor-এ বসে।
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Undo2,
  Redo2,
  Eraser,
} from 'lucide-react';
import ImageCropModal from './ImageCropModal';

// EN: One toolbar button — active state lights up with brand teal so admin can
//     see at a glance which formatting is applied to the cursor position.
// BN: Toolbar-এর একটা button — active হলে brand teal রঙে জ্বলে, যাতে admin
//     এক নজরে বুঝে কোন formatting cursor-এ apply হচ্ছে।
const ToolButton = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${
      active
        ? 'bg-brand-teal text-white'
        : 'text-brand-navy hover:bg-brand-tealLight/30'
    } disabled:cursor-not-allowed disabled:opacity-40`}
  >
    {children}
  </button>
);

const Divider = () => (
  <span className="mx-1 h-5 w-px bg-brand-tealLight/60" aria-hidden />
);

const RichTextEditor = ({
  value,
  onChange,
  placeholder = '',
  dir = 'auto',
  minHeight = 200,
}) => {
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-brand-teal underline',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded my-3 max-w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        dir,
        class:
          'prose prose-sm max-w-none focus:outline-none px-4 py-3 text-brand-navy [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child]:before:text-brand-slate/50 [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:h-0',
        style: `min-height: ${minHeight}px`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      // EN: TipTap returns "<p></p>" for empty doc; normalise to '' so required
      //     validation in the parent form catches truly empty content.
      // BN: Empty doc-এ TipTap "<p></p>" দেয় — parent form-এর required check
      //     যাতে ঠিকঠাক কাজ করে, খালি হলে '' হিসেবে পাঠাই।
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  // EN: When parent form resets (e.g. after submit), push the new value into the
  //     editor. Skip if the value already matches to avoid cursor jumps while typing.
  // BN: Parent form reset হলে (যেমন submit-এর পর) নতুন value editor-এ পাঠাই।
  //     টাইপ করার সময় cursor যাতে jump না করে, value মিললে skip।
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || '';
    const normalisedCurrent = current === '<p></p>' ? '' : current;
    if (incoming !== normalisedCurrent) {
      editor.commands.setContent(incoming || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href;
    const url = window.prompt('Link URL:', previous || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  }, [editor]);

  const handlePickImage = () => fileInputRef.current?.click();

  const onFilePicked = (e) => {
    const f = e.target.files?.[0];
    if (f) setPendingFile(f);
    // EN: Reset input so picking the same file again still triggers onChange.
    // BN: Input reset — একই file আবার select করলেও onChange যেন trigger হয়।
    e.target.value = '';
  };

  const onCropUploaded = ({ url }) => {
    if (editor && url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setPendingFile(null);
  };

  if (!editor) return null;

  return (
    <div className="rounded-md border border-brand-tealLight/60 bg-white">
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border-b border-brand-tealLight/60 bg-brand-tealLight/10 px-2 py-1.5">
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </ToolButton>
        <Divider />
        <ToolButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </ToolButton>
        <ToolButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </ToolButton>
        <Divider />
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List size={16} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered size={16} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={16} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline code"
        >
          <Code size={16} />
        </ToolButton>
        <Divider />
        <ToolButton
          onClick={setLink}
          active={editor.isActive('link')}
          title="Insert link"
        >
          <LinkIcon size={16} />
        </ToolButton>
        <ToolButton onClick={handlePickImage} title="Insert image (with crop)">
          <ImageIcon size={16} />
        </ToolButton>
        <Divider />
        <ToolButton
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          title="Clear formatting"
        >
          <Eraser size={16} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </ToolButton>
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFilePicked}
      />

      {pendingFile && (
        <ImageCropModal
          file={pendingFile}
          onCancel={() => setPendingFile(null)}
          onUploaded={onCropUploaded}
        />
      )}
    </div>
  );
};

export default RichTextEditor;
