import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Toolbar from '../../../helper/react-quill_fix'; // bạn sẽ tự thiết kế

export default function DescriptionEditor({ description, setDescription }) {
  const editor = useEditor({
    extensions: 
    [
        StarterKit, 
        Image,
        Underline,
        TextAlign.configure({
        types: ['heading', 'paragraph'], // những loại node được áp dụng căn lề
    }),
    ],
    content: description,
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <div className="mb-4">
      <label className="form-label fw-bold">Mô tả sản phẩm</label>
      <div className="border rounded p-2 bg-white">
        {editor && <Toolbar editor={editor} />}
        <EditorContent editor={editor} 
        style={{
            minHeight: '300px',
            maxHeight: '600px',
            overflowY: 'auto',
            resize: 'both',        // Cho phép kéo resize
            border: '1px solid #ccc',
            padding: '12px',
            borderRadius: '8px'
        }}/>
      </div>
    </div>
  );
}
