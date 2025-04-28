import { FilePdfFilled, MoreOutlined, CloseCircleOutlined } from "@ant-design/icons";
import ReactPDF, { Document, Page, View } from "@react-pdf/renderer";
import { useMutation } from "@tanstack/react-query";
import { Dropdown, Tag } from "antd";
import { useMemo, useState } from "react";
import axiosInstance from "src/axiosInstance";
import { LoaderCmp } from "src/components/styled";
import { useConfirmationModal } from "src/components/styled/modal/confirmationModal";
import PDFHeader, { PDFContainer, PDFPara, pdfStyle } from "src/components/styled/pdf/pdfHeader";
import { openBlob } from "src/functions/handleData";

export const selectApplicant = async ({ applicant_ids }: { applicant_ids: any[] }) => {
  const response = await axiosInstance.post("api/admission/process-applicant/rejected", { applicant_ids });
  return response;
};

export default function ApplicantReport({ value, form_data, applicant_data, refetchApplicant }) {
  const [isLoading, setIsLoading] = useState(false);
  const { Modal: RejectModal, setIsOpen } = useConfirmationModal();
  const { mutate, isPending } = useMutation({ mutationKey: ["select/applicant"], mutationFn: selectApplicant });

  let data = useMemo(() => {
    try {
      let half_count = form_data?.filter((res) => res?.inputProps?.type !== "file")?.length / 2;
      return form_data?.reduce(
        (acc, cur) => {
          const load = (key) => {
            let obj = { label: cur?.label, value: value?.[cur?.name] };
            acc[key]?.push(obj);
          };
          if (cur?.inputProps?.type == "file") acc["file"].push({ label: cur?.label, value: value?.[cur?.name] });
          else {
            if (acc["left"]?.length < half_count) load("left");
            else load("right");
          }
          return acc;
        },
        { left: [], right: [], file: [] }
      );
    } catch (error) {
      console.error(error);
    }
  }, [value]);

  const Report = () => {
    return (
      <Document>
        <Page>
          <PDFContainer>
            <PDFHeader reportTitle="Applicant" />
            <View style={[pdfStyle.df, { marginTop: 10 }]}>
              <View style={[pdfStyle.f1]}>
                {data?.left?.map((res) => {
                  return (
                    <View key={res?.name} style={[pdfStyle.df, { marginBottom: 10 }]}>
                      <View style={[pdfStyle.f1]}>
                        <PDFPara>{res?.label}</PDFPara>
                      </View>
                      <View style={[pdfStyle.f1]}>
                        <PDFPara style={{ fontWeight: "bold" }}>{res?.value || "-"}</PDFPara>
                      </View>{" "}
                    </View>
                  );
                })}
              </View>
              <View style={[pdfStyle.f1]}>
                {data?.right?.map((res) => {
                  return (
                    <View key={res?.name} style={[pdfStyle.df, { marginBottom: 10 }]}>
                      <View style={[pdfStyle.f1]}>
                        <PDFPara>{res?.label}</PDFPara>
                      </View>
                      <View style={[pdfStyle.f1]}>
                        <PDFPara style={{ fontWeight: "bold" }}>{res?.value || "-"}</PDFPara>
                      </View>{" "}
                    </View>
                  );
                })}
              </View>
            </View>
          </PDFContainer>
        </Page>
      </Document>
    );
  };

  const handleDownload = async () => {
    setIsLoading(true);
    const blob = await ReactPDF.pdf(<Report />).toBlob();
    openBlob(blob);
    setIsLoading(false);
  };

  let items = useMemo(() => {
    let arr = [
      {
        key: 1,
        label: (
          <span onClick={handleDownload}>
            <FilePdfFilled className="me-3" />
            Report
          </span>
        ),
      },
    ];
    if (applicant_data?.status?.id !== "rejected")
      arr.push({
        key: 2,
        label: (
          <span className="text-danger" onClick={() => setIsOpen(true)}>
            <CloseCircleOutlined className="me-3" />
            Reject
          </span>
        ),
      });
    return arr;
  }, [applicant_data]);

  return (
    <div>
      <Dropdown menu={{ items }} placement="bottomLeft" arrow trigger={["click"]}>
        <Tag className="cp" icon={<MoreOutlined />}></Tag>
      </Dropdown>
      {(isLoading || isPending) && <LoaderCmp />}
      <RejectModal
        description="Reject application"
        okButtonProps={{
          onClick: () =>
            mutate(
              { applicant_ids: [applicant_data?.id] },
              {
                onSettled: () => {
                  refetchApplicant();
                  setIsOpen(false);
                },
              }
            ),
        }}
      />
    </div>
  );
}
