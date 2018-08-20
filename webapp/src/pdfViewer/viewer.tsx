import React from "react";
import { Page, PDF } from "./reactPDF";
import "../../../css/pdfViewer.css";

export class Viewer extends React.Component {
  static contextTypes = PDF.childContextTypes;

  render() {
    let { pdf } = this.context;
    let numPages = pdf ? pdf.pdfInfo.numPages : 0;
    let fingerprint = pdf ? pdf.pdfInfo.fingerprint : "none";
    let pages = Array.apply(null, {
      length: numPages
    }).map((v, i) => <Page index={i + 1} key={`${fingerprint}-${i}`} />);

    return <div className="pdf-viewer">{pages}</div>;
  }
}
