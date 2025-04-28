import { Controller, ControllerProps } from "react-hook-form";
import ReactQuill, { Quill, ReactQuillProps } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useColors } from "src/redux/hooks";
import { Para } from "../typography";
import ImageResize from "quill-image-resize-module-react";

export interface CKEEditorWithHKProps extends Omit<ControllerProps, "render"> {
  CKEEditorProps?: CKEEditorCmpProps;
  id?: string;
}

Quill.register("modules/imageResize", ImageResize);

var Link = Quill.import("formats/link");
Link.sanitize = function (url) {
  // modify url if desired
  return url;
};

export const CKEEditorWithHK = ({ CKEEditorProps, ...props }: CKEEditorWithHKProps) => {
  const { colorError } = useColors();

  if (props?.control && props?.name)
    return (
      <Controller
        {...props}
        render={({ field: { value, ...rest }, fieldState: { error } }) => {
          let err_msg = error?.message;
          return (
            <>
              <CKEEditorCmp {...CKEEditorProps} id={props?.id} value={value} {...rest} />
              {err_msg && <Para style={{ color: colorError }}>{err_msg}</Para>}
            </>
          );
        }}
      />
    );
  else return <CKEEditorCmp />;
};

interface CKEEditorCmpProps extends ReactQuillProps {}

export default function CKEEditorCmp(props: CKEEditorCmpProps) {
  let formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "header",
    "font",
    "size",
    "color",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "align",
  ];
  let modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"],
      [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }],
    ],
    imageResize: {
      parchment: Quill.import("parchment"),
      modules: ["Resize", "DisplaySize"],
    },
  };

  return <ReactQuill theme="snow" modules={modules} formats={formats} {...props} />;
}
