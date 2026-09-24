import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {

  // ── Générer un PDF depuis du HTML ────────────────────────
  async generateFromHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    await browser.close();
    return Buffer.from(pdf);
  }

  // ── Template HTML bulletin ───────────────────────────────
  generateBulletinHtml(bulletin: any): string {
    const getMentionColor = (mention: string) => {
      if (mention === 'Félicitations du jury') return '#16a34a';
      if (mention === "Tableau d'honneur") return '#2563eb';
      if (mention === 'Encouragements') return '#7c3aed';
      if (mention === 'Admis') return '#d97706';
      return '#dc2626';
    };

    const getGradeColor = (avg: number) => {
      if (avg >= 16) return '#16a34a';
      if (avg >= 14) return '#2563eb';
      if (avg >= 10) return '#d97706';
      return '#dc2626';
    };

    const subjectsRows = bulletin.subjects
      ?.map((subject: any) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">
            ${subject.subjectName}
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ×${subject.coefficient}
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            <span style="font-weight: bold; color: ${getGradeColor(subject.average)};">
              ${subject.average}/20
            </span>
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            ${subject.appreciation}
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
            ${subject.teacher}
          </td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bulletin — ${bulletin.student?.firstName} ${bulletin.student?.lastName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; color: #1f2937; font-size: 14px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
          .school-name { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
          .school-subtitle { font-size: 13px; opacity: 0.85; }
          .bulletin-title { font-size: 18px; font-weight: bold; text-align: right; }
          .bulletin-subtitle { font-size: 12px; opacity: 0.85; text-align: right; }
          .student-section { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
          .student-name { font-size: 20px; font-weight: bold; color: #1e40af; }
          .student-info { font-size: 13px; color: #6b7280; margin-top: 4px; }
          .section-title { background: #1e40af; color: white; padding: 8px 24px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #eff6ff; }
          thead th { padding: 10px 12px; text-align: left; font-size: 12px; color: #1e40af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #bfdbfe; }
          tbody tr:hover { background: #f8fafc; }
          .footer { background: #1e40af; color: white; padding: 20px 24px; border-radius: 0 0 8px 8px; display: flex; justify-content: space-between; align-items: center; margin-top: 0; }
          .average-label { font-size: 13px; opacity: 0.85; }
          .average-value { font-size: 32px; font-weight: bold; }
          .mention-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; background: white; }
          .signature-section { padding: 24px; display: flex; justify-content: space-between; }
          .signature-box { text-align: center; width: 45%; }
          .signature-line { border-top: 1px solid #9ca3af; margin-top: 48px; padding-top: 8px; font-size: 12px; color: #6b7280; }
          .watermark { position: fixed; bottom: 10px; right: 10px; font-size: 10px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div style="max-width: 794px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">

          <!-- En-tête -->
          <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div class="school-name">🏫 ${bulletin.school}</div>
                <div class="school-subtitle">Plateforme de gestion scolaire</div>
              </div>
              <div>
                <div class="bulletin-title">BULLETIN DE NOTES</div>
                <div class="bulletin-subtitle">
                  Trimestre ${bulletin.period} — Année ${bulletin.academicYear}
                </div>
              </div>
            </div>
          </div>

          <!-- Infos élève -->
          <div class="student-section">
            <div>
              <div class="student-name">
                ${bulletin.student?.firstName} ${bulletin.student?.lastName}
              </div>
              <div class="student-info">
                Matricule : ${bulletin.student?.matricule} &nbsp;|&nbsp;
                Classe : ${bulletin.student?.class} &nbsp;|&nbsp;
                Niveau : ${bulletin.student?.level ?? '—'}
              </div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #6b7280;">
              <div>Généré le ${new Date().toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}</div>
            </div>
          </div>

          <!-- Titre section -->
          <div class="section-title">Résultats par matière</div>

          <!-- Tableau des notes -->
          <table>
            <thead>
              <tr>
                <th>Matière</th>
                <th style="text-align: center;">Coeff.</th>
                <th style="text-align: center;">Moyenne</th>
                <th>Appréciation</th>
                <th>Enseignant</th>
              </tr>
            </thead>
            <tbody>
              ${subjectsRows}
            </tbody>
          </table>

          <!-- Pied de page avec moyenne -->
          <div class="footer">
            <div>
              <div class="average-label">Moyenne générale</div>
              <div class="average-value">${bulletin.generalAverage}/20</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; opacity: 0.85; margin-bottom: 8px;">Mention</div>
              <div class="mention-badge" style="color: ${getMentionColor(bulletin.mention)};">
                ${bulletin.mention}
              </div>
            </div>
          </div>

          <!-- Signatures -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">Signature du Directeur</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Signature du Parent / Tuteur</div>
            </div>
          </div>

        </div>

        <div class="watermark">
          Sekoliko MG — Document officiel
        </div>
      </body>
      </html>
    `;
  }
}