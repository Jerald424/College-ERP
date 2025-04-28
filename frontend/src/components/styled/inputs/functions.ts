export const handlePreviewBase64 = ({ value }: { value: string }) => {
  try {
    if (!value) return;
    else {
      const contentType = value?.split(";")?.[0]?.split(":")?.[1];
      console.log("contentType: ", contentType);

      const byteCharacters = atob(value?.split(",")?.[1] + `data:${contentType};base64,`.substr(`data:${contentType};base64,`.length));
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, { type: contentType });
      const blobUrl = URL.createObjectURL(blob);

      window.open(blobUrl, "_blank");
    }
  } catch (error) {
    console.error(error);
  }
};
