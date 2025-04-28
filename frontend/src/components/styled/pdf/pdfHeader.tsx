import { Image, StyleSheet, Text, TextProps, View, ViewProps } from "@react-pdf/renderer";

interface PDFHeaderProps {
  reportTitle?: string;
}

export default function PDFHeader(props: PDFHeaderProps) {
  return (
    <>
      <View style={[pdfStyle.dajc, pdfStyle.bb]}>
        <Image style={{ height: 100, width: 100, objectFit: "contain" }} src={"https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"} />
        <View style={[pdfStyle.f1, pdfStyle.tCenter, { marginHorizontal: 10 }]}>
          <PDFHeading>Don bosco college co.ed</PDFHeading>
          <PDFPara>There's no need to call StyleSheet.create in order to style components.</PDFPara>
        </View>
        <View style={{ width: 100 }} />
      </View>
      {props?.reportTitle && <PDFSubHeading style={[pdfStyle.tCenter, { marginTop: 5 }]}>{props?.reportTitle}</PDFSubHeading>}
    </>
  );
}

export const PDFHeading = (props: TextProps) => {
  return <Text {...props} style={[pdfStyle.heading, props?.style]} />;
};
export const PDFSubHeading = (props: TextProps) => {
  return <Text {...props} style={[pdfStyle.subHeading, props?.style]} />;
};

export const PDFPara = (props: TextProps) => {
  return <Text {...props} style={[pdfStyle.para]} />;
};

export const PDFContainer = (props: ViewProps) => {
  return <View {...props} style={[{ padding: 10 }, props?.["style"]]} />;
};

export const pdfStyle = StyleSheet.create({
  df: {
    flexDirection: "row",
  },
  dajc: {
    flexDirection: "row",
    alignItems: "center",
  },
  daj: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  f1: {
    flex: 1,
  },
  heading: {
    fontSize: 17,
    color: "#17202A",
  },
  para: {
    fontSize: 12,
    color: "#515A5A",
  },
  subHeading: {
    fontSize: 15,
    color: "#212F3D",
  },
  tCenter: {
    textAlign: "center",
  },
  bb: {
    borderBottom: 0.5,
    borderBottomColor: "#ABB2B9",
  },
});
