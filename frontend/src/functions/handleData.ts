/**
 * "text" is which want to search
 * "searched" is actual search value.
 */
type cvaiType = {
  text: string;
  searched: string;
};

export const checkValueAreIncludes = ({ text, searched }: cvaiType) => {
  try {
    return text?.toLowerCase()?.replace(/\s+/g, "")?.includes(searched?.toLocaleLowerCase()?.replace(/\s+/g, ""));
  } catch (error) {
    console.error(error);
    return false;
  }
};

export function jsonToBase64(largeObject: any) {
  try {
    // Convert the large object to a JSON string
    const jsonString = JSON.stringify(largeObject);

    // Convert the JSON string to a Uint8Array
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(jsonString);

    // Encode the Uint8Array to Base64
    return btoa(String.fromCharCode.apply(null, uint8Array));
  } catch (error) {
    console.error(error);
  }
}

export const retrieveDataFromBase64 = (data: string) => {
  try {
    if (data) {
      let string = atob(data);
      if (typeof string === "string") return JSON.parse(string);
    }
  } catch (error) {
    alert(error);
    window.history.back();
  }
};

export const makeBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    try {
      if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
          const base64String = e.target.result;
          resolve(base64String);
          // You can now use the base64String for further processing
        };

        reader.onerror = function (error) {
          console.error("Error: ", error);
        };

        reader.readAsDataURL(file);
      } else {
        console.error("No file selected");
        reject("No file selected");
      }
    } catch (error) {
      console.error(error);
    }
  });

export const openBlob = (blob: Blob) => {
  try {
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, "_blank");
  } catch (error) {
    console.error(error);
  }
};
