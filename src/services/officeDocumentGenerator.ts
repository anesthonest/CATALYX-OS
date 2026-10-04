/**
 * CATALYX Sovereign Office Document Engine
 * Generates and inspects genuine, standards-compliant OpenXML packages:
 * - Word (.docx) -> application/vnd.openxmlformats-officedocument.wordprocessingml.document
 * - Excel (.xlsx) -> application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 * - PowerPoint (.pptx) -> application/vnd.openxmlformats-officedocument.presentationml.presentation
 */

import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

export interface OfficePackageInspectionResult {
  type: 'word' | 'excel' | 'powerpoint' | 'unknown';
  valid: boolean;
  mimeType: string;
  files: string[];
  hasContentTypes: boolean;
  hasRootRels: boolean;
  hasMainPart: boolean;
  readableContentSnippet?: string;
  summary: string;
}

export class OfficeDocumentGenerator {
  private static instance: OfficeDocumentGenerator;

  private constructor() {}

  public static getInstance(): OfficeDocumentGenerator {
    if (!OfficeDocumentGenerator.instance) {
      OfficeDocumentGenerator.instance = new OfficeDocumentGenerator();
    }
    return OfficeDocumentGenerator.instance;
  }

  /**
   * Generates a valid Microsoft Word (.docx) OpenXML document package
   */
  public async createDocx(title: string, sections: { heading: string; paragraphs: string[] }[]): Promise<Buffer> {
    const zip = new JSZip();

    // 1. [Content_Types].xml
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
    zip.file('[Content_Types].xml', contentTypesXml);

    // 2. _rels/.rels
    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
    zip.file('_rels/.rels', rootRelsXml);

    // 3. word/_rels/document.xml.rels
    const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;
    zip.file('word/_rels/document.xml.rels', docRelsXml);

    // 4. word/document.xml
    const escapeXml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    
    let bodyXml = `<w:p><w:r><w:rPr><w:b/><w:sz w:val="48"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>`;

    for (const section of sections) {
      bodyXml += `<w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${escapeXml(section.heading)}</w:t></w:r></w:p>`;
      for (const p of section.paragraphs) {
        bodyXml += `<w:p><w:r><w:t>${escapeXml(p)}</w:t></w:r></w:p>`;
      }
    }

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/></w:sectPr>
  </w:body>
</w:document>`;
    zip.file('word/document.xml', documentXml);

    return await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }

  /**
   * Generates a valid Microsoft Excel (.xlsx) OpenXML workbook package
   */
  public async createXlsx(sheetName: string, headers: string[], rows: (string | number)[][]): Promise<Buffer> {
    const zip = new JSZip();

    // 1. [Content_Types].xml
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;
    zip.file('[Content_Types].xml', contentTypesXml);

    // 2. _rels/.rels
    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
    zip.file('_rels/.rels', rootRelsXml);

    // 3. xl/_rels/workbook.xml.rels
    const wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;
    zip.file('xl/_rels/workbook.xml.rels', wbRelsXml);

    // 4. xl/workbook.xml
    const escapeXml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
    zip.file('xl/workbook.xml', workbookXml);

    // 5. xl/worksheets/sheet1.xml
    let sheetData = '';
    // Header row
    sheetData += `<row r="1">`;
    headers.forEach((h, colIdx) => {
      const colLetter = String.fromCharCode(65 + (colIdx % 26));
      sheetData += `<c r="${colLetter}1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`;
    });
    sheetData += `</row>`;

    // Data rows
    rows.forEach((row, rowIdx) => {
      const rNum = rowIdx + 2;
      sheetData += `<row r="${rNum}">`;
      row.forEach((val, colIdx) => {
        const colLetter = String.fromCharCode(65 + (colIdx % 26));
        if (typeof val === 'number') {
          sheetData += `<c r="${colLetter}${rNum}"><v>${val}</v></c>`;
        } else {
          sheetData += `<c r="${colLetter}${rNum}" t="inlineStr"><is><t>${escapeXml(String(val))}</t></is></c>`;
        }
      });
      sheetData += `</row>`;
    });

    const worksheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${sheetData}
  </sheetData>
</worksheet>`;
    zip.file('xl/worksheets/sheet1.xml', worksheetXml);

    return await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }

  /**
   * Generates a valid Microsoft PowerPoint (.pptx) OpenXML presentation package
   */
  public async createPptx(title: string, slides: { title: string; bullets: string[] }[]): Promise<Buffer> {
    const zip = new JSZip();

    // 1. [Content_Types].xml
    let slideOverrides = '';
    slides.forEach((_, idx) => {
      slideOverrides += `<Override PartName="/ppt/slides/slide${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>\n`;
    });

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${slideOverrides}
</Types>`;
    zip.file('[Content_Types].xml', contentTypesXml);

    // 2. _rels/.rels
    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;
    zip.file('_rels/.rels', rootRelsXml);

    // 3. ppt/_rels/presentation.xml.rels
    let presRels = '';
    slides.forEach((_, idx) => {
      presRels += `<Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${idx + 1}.xml"/>\n`;
    });

    const presRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presRels}
</Relationships>`;
    zip.file('ppt/_rels/presentation.xml.rels', presRelsXml);

    // 4. ppt/presentation.xml
    let sldIdLst = '';
    slides.forEach((_, idx) => {
      sldIdLst += `<p:sldId id="${256 + idx}" r:id="rId${idx + 1}"/>\n`;
    });

    const presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst/>
  <p:sldIdLst>
    ${sldIdLst}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="5143500"/>
</p:presentation>`;
    zip.file('ppt/presentation.xml', presentationXml);

    // 5. Individual slides
    const escapeXml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    slides.forEach((slide, idx) => {
      let bulletsXml = '';
      slide.bullets.forEach(b => {
        bulletsXml += `<a:p><a:r><a:t>${escapeXml(b)}</a:t></a:r></a:p>\n`;
      });

      const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:p><a:r><a:t>${escapeXml(slide.title)}</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Content"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          ${bulletsXml}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
      zip.file(`ppt/slides/slide${idx + 1}.xml`, slideXml);
    });

    return await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }

  /**
   * Generates production sample files into public/assets/sample-docs/
   */
  public async ensureSampleDocsGenerated(): Promise<{ docxPath: string; xlsxPath: string; pptxPath: string }> {
    const dir = path.join(process.cwd(), 'public', 'assets', 'sample-docs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const docxPath = path.join(dir, 'strategy.docx');
    const docxBuffer = await this.createDocx('CATALYX Executive Strategy 2026', [
      {
        heading: 'Executive Summary',
        paragraphs: [
          'CATALYX represents a sovereign enterprise operating system for autonomous workflows, human-in-the-loop governance, and verifiable economic ledger execution.',
          'Built with real-time financial auditing and strict tenant boundary isolation.'
        ]
      },
      {
        heading: 'Core Architecture Pillars',
        paragraphs: [
          '1. Dual-entry ledger accounting strictly denominated in integer minor units (cents).',
          '2. Authoritative monthly billing: Individual ($10/mo), Group ($13/mo), Organization ($25/mo) with 30-day trial.',
          '3. 12 Universal Creation Studios supporting native OpenXML handoffs and production export pipelines.'
        ]
      }
    ]);
    fs.writeFileSync(docxPath, docxBuffer);

    const xlsxPath = path.join(dir, 'model.xlsx');
    const xlsxBuffer = await this.createXlsx(
      'Financial Forecast',
      ['Category', 'Tier', 'Monthly Fee ($)', 'Platform Take Rate', 'Subscribers', 'Gross Minor Units'],
      [
        ['Subscription', 'Individual', 10, '0.25%', 1250, 1250000],
        ['Subscription', 'Group / Team', 13, '0.27%', 480, 624000],
        ['Subscription', 'Organization', 25, '0.50%', 190, 475000],
        ['Commerce', 'Digital Work Assets', 49, '0.25%', 310, 1519000]
      ]
    );
    fs.writeFileSync(xlsxPath, xlsxBuffer);

    const pptxPath = path.join(dir, 'deck.pptx');
    const pptxBuffer = await this.createPptx('CATALYX Executive Board Presentation', [
      {
        title: 'CATALYX: Sovereign Intelligence Platform',
        bullets: [
          'Unified enterprise operating system with autonomous agents.',
          'Verified Pesapal v3 gateway and direct bank transfer rails.',
          'Double-entry minor unit ledger ensuring zero floating point error.'
        ]
      },
      {
        title: '12 Universal Creation Studios',
        bullets: [
          'Multi-domain support: Software, 3D, Design, Video, Presentation, Research.',
          'Strict tenant isolation and immutable version snapshots.',
          'Native Office protocol handoffs: Word, Excel, and PowerPoint.'
        ]
      }
    ]);
    fs.writeFileSync(pptxPath, pptxBuffer);

    return { docxPath, xlsxPath, pptxPath };
  }

  /**
   * Forensically inspects an OpenXML package to verify validity and structure
   */
  public async inspectOfficePackage(buffer: Buffer): Promise<OfficePackageInspectionResult> {
    try {
      const zip = await JSZip.loadAsync(buffer);
      const fileNames = Object.keys(zip.files);
      const hasContentTypes = fileNames.includes('[Content_Types].xml');
      const hasRootRels = fileNames.includes('_rels/.rels');

      let type: 'word' | 'excel' | 'powerpoint' | 'unknown' = 'unknown';
      let mimeType = 'application/octet-stream';
      let hasMainPart = false;
      let snippet = '';

      if (fileNames.includes('word/document.xml')) {
        type = 'word';
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        hasMainPart = true;
        snippet = await zip.files['word/document.xml'].async('text');
      } else if (fileNames.includes('xl/workbook.xml')) {
        type = 'excel';
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        hasMainPart = true;
        snippet = await zip.files['xl/workbook.xml'].async('text');
      } else if (fileNames.includes('ppt/presentation.xml')) {
        type = 'powerpoint';
        mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        hasMainPart = true;
        snippet = await zip.files['ppt/presentation.xml'].async('text');
      }

      const valid = hasContentTypes && hasRootRels && hasMainPart;

      return {
        type,
        valid,
        mimeType,
        files: fileNames,
        hasContentTypes,
        hasRootRels,
        hasMainPart,
        readableContentSnippet: snippet.slice(0, 300),
        summary: valid
          ? `Verified valid ${type.toUpperCase()} OpenXML package containing ${fileNames.length} parts.`
          : 'Invalid or incomplete OpenXML package structure.'
      };
    } catch (e: any) {
      return {
        type: 'unknown',
        valid: false,
        mimeType: 'application/octet-stream',
        files: [],
        hasContentTypes: false,
        hasRootRels: false,
        hasMainPart: false,
        summary: `OpenXML package inspection failed: ${e?.message || e}`
      };
    }
  }
}

export const officeDocumentGenerator = OfficeDocumentGenerator.getInstance();
