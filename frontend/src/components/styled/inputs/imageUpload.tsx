import { PlusOutlined } from "@ant-design/icons";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { Upload, theme } from "antd";
import ImgCrop from "antd-img-crop";
import { Controller, ControllerProps } from "react-hook-form";
import { Para } from "..";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

interface useImageUploadProps extends Omit<ControllerProps, "render"> {
  handleChange?: (str: string) => void;
  cropperUIProps?: cropperUIProps;
}

export default function ImageUploadCmp({ cropperUIProps, ...props }: useImageUploadProps) {
  const {
    token: { colorError },
  } = theme.useToken();

  if (props?.control)
    return (
      <Controller
        {...props}
        render={({ field, fieldState: { error } }) => {
          let err_msg = error?.message;
          return (
            <>
              <ImageCropperUI
                {...cropperUIProps}
                handleChange={(str) => {
                  field?.onChange?.(str);
                  props?.handleChange?.(str);
                }}
                imageUrl={field?.value}
              />
              {err_msg && <Para style={{ color: colorError, fontWeight: "bold" }}>{err_msg}</Para>}
            </>
          );
        }}
      />
    );
  else return <ImageCropperUI {...cropperUIProps} />;
}

interface cropperUIProps {
  handleChange?: (str: string) => void;
  imageUrl?: string;
  disabled?: boolean;
}

export const ImageCropperUI = ({ handleChange, imageUrl, disabled }: cropperUIProps) => {
  const showAlert = () => alert("Image size should be less than 100KB");
  const onChange: UploadProps["onChange"] = (info) => {
    console.log("info: ", info);
    // if (info.file.size > 100000) {
    //   console.log("File size exceeds limit. Showing notification.");
    //   showNotification({ type: "warning", message: "Image size should be less than 100KB" });
    //   return;
    // }
    if (info?.file?.size > 100000) {
      showAlert();
      return;
    } else
      getBase64(info.file.originFileObj as FileType, (url) => {
        handleChange?.(url);
      });
  }; // Adjust debounce delay as needed

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as FileType);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload Profile Photo</div>
    </button>
  );
  return (
    <ImgCrop rotationSlider>
      <Upload id="image_1920" disabled={disabled} onChange={onChange} className="text-center" showUploadList={false} maxCount={1} listType="picture-card" onPreview={onPreview}>
        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: "100%" }} /> : uploadButton}
      </Upload>
    </ImgCrop>
  );
};
