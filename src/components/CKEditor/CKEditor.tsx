import { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Alignment,
  Autosave,
  BlockQuote,
  Bold,
  Essentials,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  ImageInline,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  ListProperties,
  Paragraph,
  PictureEditing,
  RemoveFormat,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TodoList,
  Underline,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import "./CKEditor.css";

// Using GPL license for open-source development
// For commercial use, obtain a license from https://ckeditor.com/pricing/
const LICENSE_KEY = "GPL";

interface CKEditorComponentProps {
  name: string;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

export const CKEditorComponent: React.FC<CKEditorComponentProps> = ({
  name,
  label,
  value = "",
  onChange,
  required = false,
}) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [, setIsEditorLoaded] = useState(false);

  useEffect(() => {
    setIsEditorLoaded(true);
  }, []);

  const headingOptions: {
    model:
    | "paragraph"
    | "heading1"
    | "heading2"
    | "heading3"
    | "heading4"
    | "heading5"
    | "heading6";
    view: string;
    title: string;
    class: string;
  }[] = [
      {
        model: "paragraph",
        view: "p",
        title: "Paragraph",
        class: "ck-heading_paragraph",
      },
      {
        model: "heading1",
        view: "h1",
        title: "Heading 1",
        class: "ck-heading_heading1",
      },
      {
        model: "heading2",
        view: "h2",
        title: "Heading 2",
        class: "ck-heading_heading2",
      },
      {
        model: "heading3",
        view: "h3",
        title: "Heading 3",
        class: "ck-heading_heading3",
      },
      {
        model: "heading4",
        view: "h4",
        title: "Heading 4",
        class: "ck-heading_heading4",
      },
      {
        model: "heading5",
        view: "h5",
        title: "Heading 5",
        class: "ck-heading_heading5",
      },
      {
        model: "heading6",
        view: "h6",
        title: "Heading 6",
        class: "ck-heading_heading6",
      },
    ];

  const editorConfig = {
    licenseKey: LICENSE_KEY,
    toolbar: {
      items: [
        "heading",
        "|",
        "bold",
        "italic",
        "underline",
        "removeFormat",
        "|",
        "horizontalLine",
        "link",
        "insertImage",
        "insertTable",
        "highlight",
        "blockQuote",
        "|",
        "alignment",
        "|",
        "bulletedList",
        "numberedList",
        "todoList",
        "outdent",
        "indent",
      ],
      shouldNotGroupWhenFull: false,
    },
    plugins: [
      Alignment,
      Autosave,
      BlockQuote,
      Bold,
      Essentials,
      GeneralHtmlSupport,
      Heading,
      Highlight,
      HorizontalLine,
      ImageInline,
      ImageInsert,
      ImageResize,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      List,
      ListProperties,
      Paragraph,
      PictureEditing,
      RemoveFormat,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TodoList,
      Underline,
    ],
    heading: {
      options: headingOptions,
    },
    htmlSupport: {
      allow: [
        {
          name: /.*/,
          styles: ["color", "font-size", "background-color"],
          attributes: ["href", "src", "alt"],
          classes: ["my-class", "another-class"],
        },
      ],
    },
    image: {
      toolbar: [
        "imageTextAlternative",
        "|",
        "imageStyle:inline",
        "imageStyle:alignLeft",
        "imageStyle:alignRight",
        "|",
        "resizeImage",
      ],
      styles: {
        options: ["inline", "alignLeft", "alignRight"],
      },
    },
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: "https://",
      decorators: {
        toggleDownloadable: {
          mode: "manual" as const,
          label: "Downloadable",
          attributes: { download: "file" },
        },
      },
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true,
      },
    },
    placeholder: "Type or paste your content here!",
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableProperties",
        "tableCellProperties",
      ],
    },
    initialData: value,
  };

  return (
    <div className="editor-container" ref={editorContainerRef}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="editor-container__editor">
        {editorConfig && (
          <CKEditor
            editor={ClassicEditor}
            config={editorConfig}
            data={value}
            onReady={() => console.log(`${name} CKEditor is ready`)}
            onChange={(_, editor) => {
              const data = editor.getData();
              onChange?.(data);
            }}
          />
        )}
      </div>
    </div>
  );
};
