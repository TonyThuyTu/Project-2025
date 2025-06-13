import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

export default function TiptapToolbar({ editor }) {
  if (!editor) return null;

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
  };

  return (
    <ButtonGroup className="mb-2 flex-wrap gap-1">

      <Button
        variant={editor.isActive('bold') ? 'dark' : 'outline-dark'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </Button>

      {/* Italic */}
      <Button
        variant={editor.isActive('italic') ? 'dark' : 'outline-dark'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </Button>

      {/* Underline */}
      <Button
        variant={editor.isActive('underline') ? 'dark' : 'outline-dark'}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </Button>

      {/* Căn lề trái */}
      <Button
        variant={editor.isActive({ textAlign: 'left' }) ? 'dark' : 'outline-dark'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <i className="bi bi-text-left" /> {/* bạn có thể dùng icon bootstrap */}
      </Button>

      {/* Căn giữa */}
      <Button
        variant={editor.isActive({ textAlign: 'center' }) ? 'dark' : 'outline-dark'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <i className="bi bi-text-center" />
      </Button>

      {/* Căn phải */}
      <Button
        variant={editor.isActive({ textAlign: 'right' }) ? 'dark' : 'outline-dark'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <i className="bi bi-text-right" />
      </Button>

      {/* Căn đều */}
      <Button
        variant={editor.isActive({ textAlign: 'justify' }) ? 'dark' : 'outline-dark'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <i className="bi bi-justify" />
      </Button>

      <Button
        variant={editor.isActive('heading', { level: 1 }) ? 'dark' : 'outline-dark'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </Button>

      <Button
        variant={editor.isActive('bulletList') ? 'dark' : 'outline-dark'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </Button>

      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        Clear
      </Button>

      <Button variant="outline-dark" size="sm" onClick={() => document.getElementById('imageInput').click()}>
        Thêm ảnh
      </Button>
      
      {/* input ẩn để chọn file ảnh */}
      <input
        id="imageInput"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

    </ButtonGroup>
  );
}
