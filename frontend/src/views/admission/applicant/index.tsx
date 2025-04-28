import { Layout } from "antd";
import HeaderCmp from "./layouts/header";
import ContentCmp from "./layouts/content";
import FooterCmp from "./layouts/footer";

export default function ApplicantAdmissionIndex() {
  return (
    <Layout>
      <HeaderCmp />
      <ContentCmp />
      <FooterCmp />
    </Layout>
  );
}
