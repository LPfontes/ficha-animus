import React from 'react';
import { FileJson, FileText } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function ExportActions({ characterData }) {
  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(characterData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `animus_${characterData.name || 'ficha'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportPDF = async () => {
    try {
      const url = '/ficha_template.pdf';
      const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      const drawText = (text, x, y, size = 10, isBold = false) => {
        if (text === undefined || text === null || text === '') return;
        firstPage.drawText(String(text), {
          x,
          y,
          size,
          font: isBold ? fontBold : font,
          color: rgb(0, 0, 0),
        });
      };

      const drawCheck = (x, y, size = 10) => {
        drawText('X', x, y, size, true);
      };

      // --- PAGE 1 ---
      // Header Info
      drawText(characterData.name, 385, 765, 12, true);
      drawText(characterData.ascendancy, 385, 740, 10);
      drawText(characterData.element, 385, 715, 10);
      drawText(characterData.level, 385, 690, 10);

      // Status
      drawText(characterData.currentPv, 280, 560, 14, true);
      drawText(characterData.currentProt, 400, 560, 14, true);
      drawText(characterData.currentPe, 555, 560, 14, true);

      // Attributes
      // Attributes (Filling circles)
      const attrBaseCoords = {
        POT: { x: 174, y: 511 },
        COG: { x: 387, y: 511 },
        PRE: { x: 601, y: 511 },
        HAB: { x: 174, y: 344 },
        PER: { x: 387, y: 344 },
        ANI: { x: 601, y: 344 },
      };

      const drawDots = (x, y, count) => {
        for (let i = 0; i < count; i++) {
          // Drawing a small filled circle or 'X' in the circle
          drawText('●', x + (i * 12.5), y, 10, true);
        }
      };

      Object.entries(attrBaseCoords).forEach(([attr, pos]) => {
        const val = characterData.attributes[attr] || 0;
        drawDots(pos.x, pos.y, val);
      });

      // Actions per Turn (PA)
      const paBoxX = 60;
      if (characterData.level >= 1) {
        for (let i = 0; i < Math.min(characterData.pa, 4); i++) {
          drawCheck(paBoxX + (i * 22), 336, 8);
        }
      }
      if (characterData.level >= 4) {
        for (let i = 0; i < Math.min(characterData.pa, 5); i++) {
          drawCheck(paBoxX + (i * 22), 306, 8);
        }
      }
      if (characterData.level >= 8) {
        for (let i = 0; i < Math.min(characterData.pa, 6); i++) {
          drawCheck(paBoxX + (i * 22), 276, 8);
        }
      }

      const { width, height } = firstPage.getSize();
      const colWidth = width / 3;

      const skillsMap = {
        POT: { xCheck: colWidth * 0.72, xLevel: colWidth * 0.82, yStart: 493 },
        HAB: { xCheck: colWidth * 0.72, xLevel: colWidth * 0.82, yStart: 325 },
        COG: { xCheck: colWidth * 1.72, xLevel: colWidth * 1.82, yStart: 493 },
        PER: { xCheck: colWidth * 1.72, xLevel: colWidth * 1.82, yStart: 325 },
        PRE: { xCheck: colWidth * 2.72, xLevel: colWidth * 2.82, yStart: 493 },
        ANI: { xCheck: colWidth * 2.72, xLevel: colWidth * 2.82, yStart: 325 },
      };

      Object.entries(dados.pericias).forEach(([attrKey, attrSkills]) => {
        const config = skillsMap[attrKey];
        if (!config) return;
        attrSkills.forEach((skill, index) => {
          const level = characterData.skills[skill.nome] || 0;
          const y = config.yStart - (index * 17.5);
          const xC = Math.min(config.xCheck, width - 40);
          const xL = Math.min(config.xLevel, width - 20);
          if (level >= 1) drawCheck(xC, y, 7);
          if (level >= 2) drawText(level, xL, y, 8, true);
        });
      });

      // Innate Abilities (Page 1)
      const innate = dados.ascendencias.find(a => a.nome === characterData.ascendancy)?.habilidades_inatas || [];
      innate.forEach((hab, i) => {
        drawText(hab.nome, 420, 180 - (i * 45), 10, true);
        drawText(hab.descricao, 420, 170 - (i * 45), 8);
      });

      // --- PAGE 2 --- (Armas)
      // TODO: Implement Weapons if data exists

      // --- PAGE 3 --- (Armadura & Escudo)
      const thirdPage = pages[2];
      const drawTextP3 = (text, x, y, size = 10, isBold = false) => {
        if (text === undefined || text === null || text === '') return;
        thirdPage.drawText(String(text), {
          x, y, size, font: isBold ? fontBold : font, color: rgb(0, 0, 0)
        });
      };

      if (characterData.equipment.armor) {
        const armor = characterData.equipment.armor;
        drawTextP3(characterData.protection, 105, 830, 20, true); // Total Prot
        drawTextP3(armor.protecao_base, 320, 810, 12);
        drawTextP3(`${armor.multiplicador_pot}x${characterData.attributes.POT}`, 490, 810, 12);
        drawTextP3(`${armor.multiplicador_hab}x${characterData.attributes.HAB}`, 670, 810, 12);
      }

      // --- PAGE 6 --- (Elemento)
      const sixthPage = pages[5];
      const drawTextP6 = (text, x, y, size = 10, isBold = false) => {
        if (text === undefined || text === null || text === '') return;
        sixthPage.drawText(String(text), {
          x, y, size, font: isBold ? fontBold : font, color: rgb(0, 0, 0)
        });
      };

      drawTextP6(characterData.element, 100, 1080, 24, true); // Header

      const elementData = dados.elementos.find(e => e.nome === characterData.element);
      if (elementData && elementData.tabela_dano) {
        // Dano Table
        const yBaseDano = 935;
        [1, 2, 3].forEach(lv => {
          const row = elementData.tabela_dano[lv];
          const y = yBaseDano - ((lv - 1) * 45);
          const bonus = Math.max(...(elementData.bonus.split(' ou ').map(opt => characterData.attributes[opt] || 0)), 0);
          
          drawTextP6(row.ac1.base + (row.ac1.mult * bonus), 350, y, 12, true);
          drawTextP6(row.ac2.base + (row.ac2.mult * bonus), 500, y, 12, true);
          drawTextP6(row.ac3.base + (row.ac3.mult * bonus), 660, y, 12, true);
          drawTextP6(row.ac4.base + (row.ac4.mult * bonus), 810, y, 12, true);
        });
      }

      if (elementData && elementData.tabela_cura) {
        // Cura Table
        const yBaseCura = 715;
        [1, 2, 3].forEach(lv => {
          const row = elementData.tabela_cura[lv];
          const y = yBaseCura - ((lv - 1) * 45);
          const bonus = Math.max(...(elementData.bonus.split(' ou ').map(opt => characterData.attributes[opt] || 0)), 0);
          
          drawTextP6(row.ac1.base + (row.ac1.mult * bonus), 350, y, 12, true);
          drawTextP6(row.ac2.base + (row.ac2.mult * bonus), 500, y, 12, true);
          drawTextP6(row.ac3.base + (row.ac3.mult * bonus), 660, y, 12, true);
          drawTextP6(row.ac4.base + (row.ac4.mult * bonus), 810, y, 12, true);
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `animus_${characterData.name || 'ficha'}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
  };

  return (
    <div className="button-group" style={{ marginTop: '2rem', justifyContent: 'center' }}>
      <button onClick={exportJSON} className="secondary">
        <FileJson size={18} />
        Exportar JSON
      </button>
      <button onClick={exportPDF}>
        <FileText size={18} />
        Exportar PDF
      </button>
    </div>
  );
}
