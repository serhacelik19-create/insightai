import React, { useState } from 'react';
import { TrendingUp, Activity, BarChart2, FileText, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const monthNamesMap = {
  'ocak': 1, 'şubat': 2, 'mart': 3, 'nisan': 4, 'mayıs': 5, 'haziran': 6,
  'temmuz': 7, 'ağustos': 8, 'eylül': 9, 'ekim': 10, 'kasım': 11, 'aralık': 12,
  'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
  'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
};

const parseRecordDate = (dateStr) => {
  if (!dateStr) return { year: 2000, month: 1 };
  const str = dateStr.toString().toLowerCase().trim();
  
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})/);
  if (isoMatch) {
    return { year: parseInt(isoMatch[1], 10), month: parseInt(isoMatch[2], 10) };
  }
  
  const parts = str.split(/\s+/);
  let year = new Date().getFullYear();
  let month = 1;
  
  for (const part of parts) {
    if (monthNamesMap[part] !== undefined) {
      month = monthNamesMap[part];
    } else if (/^\d{4}$/.test(part)) {
      year = parseInt(part, 10);
    }
  }
  
  if (parts.length === 1 && monthNamesMap[parts[0]] !== undefined) {
    month = monthNamesMap[parts[0]];
  }
  
  return { year, month };
};

const cleanTurkishChars = (str) => {
  if (!str) return '';
  return str
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U');
};

function Reports({ financialRecords, loadDemoData, personnel = [], menu = [], businessType = 'general', businessName = 'İşletmem' }) {
  const [filterType, setFilterType] = useState('all');
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(new Date().getFullYear() - 1);
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());

  const hasData = financialRecords && financialRecords.length > 0;

  const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 5 + i);
  const months = [
    { value: 1, label: 'Ocak' },
    { value: 2, label: 'Şubat' },
    { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' },
    { value: 5, label: 'Mayıs' },
    { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' },
    { value: 8, label: 'Ağustos' },
    { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' },
    { value: 11, label: 'Kasım' },
    { value: 12, label: 'Aralık' }
  ];

  let filteredRecords = [];
  let bestMonth = null;
  let worstMonth = null;
  let avgMargin = '0';
  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalProfit = 0;
  let summaryText = "Verileriniz analiz ediliyor...";

  let totalRent = 0;
  let totalPersonnel = 0;
  let totalMarketing = 0;
  let totalMaterial = 0;
  let totalOther = 0;

  if (hasData) {
    const sortedRecords = [...financialRecords].sort((a, b) => {
      const dA = parseRecordDate(a.date);
      const dB = parseRecordDate(b.date);
      return (dA.year * 12 + dA.month) - (dB.year * 12 + dB.month);
    });

    if (filterType === 'all') {
      filteredRecords = sortedRecords;
    } else if (filterType === '3months') {
      filteredRecords = sortedRecords.slice(-3);
    } else if (filterType === '6months') {
      filteredRecords = sortedRecords.slice(-6);
    } else if (filterType === 'custom') {
      filteredRecords = sortedRecords.filter(r => {
        const d = parseRecordDate(r.date);
        const val = d.year * 12 + d.month;
        const startVal = startYear * 12 + startMonth;
        const endVal = endYear * 12 + endMonth;
        return val >= startVal && val <= endVal;
      });
    }

    if (filteredRecords.length > 0) {
      bestMonth = filteredRecords.reduce((max, r) => r.profit > max.profit ? r : max, filteredRecords[0]);
      worstMonth = filteredRecords.reduce((min, r) => r.profit < min.profit ? r : min, filteredRecords[0]);
      
      totalRevenue = filteredRecords.reduce((sum, r) => sum + r.revenue, 0);
      totalExpenses = filteredRecords.reduce((sum, r) => sum + r.expenses, 0);
      totalProfit = filteredRecords.reduce((sum, r) => sum + r.profit, 0);
      avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

      totalRent = filteredRecords.reduce((sum, r) => sum + (r.rent_expense !== undefined ? r.rent_expense : Math.round(r.expenses * 0.15)), 0);
      totalPersonnel = filteredRecords.reduce((sum, r) => sum + (r.personnel_expense !== undefined ? r.personnel_expense : Math.round(r.expenses * 0.3)), 0);
      totalMarketing = filteredRecords.reduce((sum, r) => sum + (r.marketing_expense !== undefined ? r.marketing_expense : Math.round(r.expenses * 0.1)), 0);
      totalMaterial = filteredRecords.reduce((sum, r) => sum + (r.material_expense !== undefined ? r.material_expense : Math.round(r.expenses * 0.35)), 0);
      totalOther = filteredRecords.reduce((sum, r) => sum + (r.other_expense !== undefined ? r.other_expense : Math.round(r.expenses * 0.1)), 0);

      if (filteredRecords.length >= 2) {
        const last = filteredRecords[filteredRecords.length - 1];
        const prev = filteredRecords[filteredRecords.length - 2];
        if (last.revenue > prev.revenue && last.expenses > prev.expenses) {
            summaryText = `Son donemde geliriniz artis gosterdi ancak giderleriniz de ayni oranda yukseldi. Buyumeyi surdururken maliyetleri kontrol altina almak karliligi artiracaktir.`;
        } else if (last.revenue > prev.revenue && last.expenses <= prev.expenses) {
            summaryText = `Harika bir donem! Gelirleriniz artarken giderlerinizi kontrol altinda tuttunuz. Bu durum karliliginiza son derece olumlu yansidi.`;
        } else if (last.revenue < prev.revenue && last.expenses > prev.expenses) {
            summaryText = `Uyari: Gelirleriniz duserken giderleriniz artis gosteriyor. Maliyet kalemlerinizi acilen gozden gecirmenizi ve tasarruf tedbirleri almanizi oneririz.`;
        } else {
            summaryText = `Genel bir daralma soz konusu. Hem gelirler hem de giderler dusus trendinde. Gelirleri yeniden artiracak pazarlama veya satis stratejilerine odaklanmalisiniz.`;
        }
      } else {
        summaryText = "Sadece tek bir donem verisi bulundugu icin trend analizi yapilamiyor, sonraki aylari yukleyerek gelisimi takip edebilirsiniz.";
      }
    } else {
      summaryText = "Secilen filtre araliginda finansal kayit bulunmamaktadir.";
    }
  }

  const exportToExcel = () => {
    if (filteredRecords.length === 0) return;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Financial Summary
    const summaryRows = [
      ["Donem", "Gelir (TL)", "Gider (TL)", "Net Kar (TL)", "Kar Marji (%)"]
    ];
    filteredRecords.forEach((record, index) => {
      const rowNum = index + 2;
      summaryRows.push([
        record.date,
        record.revenue,
        record.expenses,
        { t: 'n', f: `B${rowNum}-C${rowNum}` },
        record.revenue > 0 ? Number(((record.revenue - record.expenses) / record.revenue * 100).toFixed(1)) : 0
      ]);
    });
    // Totals row
    const totalRowNum = filteredRecords.length + 2;
    summaryRows.push([
      "Toplam / Ortalama",
      totalRevenue,
      totalExpenses,
      { t: 'n', f: `B${totalRowNum}-C${totalRowNum}` },
      totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0
    ]);
    const ws1 = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, ws1, "Finansal Ozet");

    // Sheet 2: Personnel Details
    const personnelRows = [
      ["Ad", "Soyad", "Rol", "Maas (TL)", "Mesai Saati (sa)", "Mesai Gideri (TL)", "Toplam Gider (TL)"]
    ];
    personnel.forEach((p, index) => {
      const rowNum = index + 2;
      const baseSalary = (p.hourly_rate || 0) * 160;
      const overtimeExpense = (p.hourly_rate || 0) * (p.overtime_hours || 0) * 1.5;
      personnelRows.push([
        p.name,
        p.surname,
        p.role,
        baseSalary,
        p.overtime_hours || 0,
        overtimeExpense,
        { t: 'n', f: `D${rowNum}+F${rowNum}` }
      ]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(personnelRows);
    XLSX.utils.book_append_sheet(wb, ws2, "Personel Detaylari");

    // Sheet 3: Menu Analysis
    const menuRows = [
      ["Yemek Adi", "Kategori", "Satis Fiyati (TL)", "Porsiyon Maliyeti (TL)", "Maliyet Orani (Food Cost %)"]
    ];
    if (businessType === 'restaurant') {
      menu.forEach((item, index) => {
        const rowNum = index + 2;
        menuRows.push([
          item.item_name,
          item.category,
          item.sale_price,
          item.portion_cost,
          { t: 'n', f: `D${rowNum}/C${rowNum}` }
        ]);
      });
    } else {
      menuRows.push(["Bu modul yalnizca Restoran ve Kafe isletmeleri icin gecerlidir.", "", "", "", ""]);
    }
    const ws3 = XLSX.utils.aoa_to_sheet(menuRows);
    XLSX.utils.book_append_sheet(wb, ws3, "Menu Analizi");

    XLSX.writeFile(wb, `InsightAI_Finansal_Rapor_${cleanTurkishChars(businessName || 'isletmem')}.xlsx`);
  };

  const exportToPDF = () => {
    if (filteredRecords.length === 0) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pWidth = 210;
    const pHeight = 297;

    const drawPageDecoration = (pageNum, totalPages) => {
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pWidth - 20, pHeight - 20);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Sayfa ${pageNum} / ${totalPages}`, pWidth / 2, pHeight - 14, { align: 'center' });
    };

    let periodText = "Tum Zamanlar";
    if (filterType === '3months') periodText = "Son 3 Ay";
    else if (filterType === '6months') periodText = "Son 6 Ay";
    else if (filterType === 'custom') {
      periodText = `${startMonth}/${startYear} - ${endMonth}/${endYear}`;
    }

    // --- SAYFA 1: KAPAK SAYFASI ---
    pdf.setFillColor(248, 250, 252);
    pdf.rect(11, 11, pWidth - 22, pHeight - 22, 'F');

    pdf.setFillColor(59, 130, 246);
    pdf.rect(11, 11, pWidth - 22, 15, 'F');
    pdf.rect(11, pHeight - 26, pWidth - 22, 15, 'F');

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(28);
    pdf.setTextColor(30, 41, 59);
    pdf.text("InsightAI", pWidth / 2, 75, { align: 'center' });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.setTextColor(100, 116, 139);
    pdf.text("YAPAY ZEKA DESTEKLI FINANSAL ANALIZ RAPORU", pWidth / 2, 85, { align: 'center' });

    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(1);
    pdf.line(40, 100, pWidth - 40, 100);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(15, 23, 42);
    pdf.text(cleanTurkishChars(businessName || 'Isletmem'), pWidth / 2, 130, { align: 'center' });

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.5);
    pdf.rect(30, 155, pWidth - 60, 55, 'FD');

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.text("Rapor Detaylari:", 40, 168);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Raporlama Donemi: ${cleanTurkishChars(periodText)}`, 40, 178);
    pdf.text(`Sektor Tipi: ${cleanTurkishChars(businessType === 'restaurant' ? 'Restoran ve Kafe' : businessType === 'ecommerce' ? 'E-Ticaret' : businessType === 'b2b' ? 'B2B Girisim' : 'Genel Perakende')}`, 40, 186);
    pdf.text(`Olusturma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 40, 194);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    pdf.text("Bu rapor InsightAI tarafindan otomatik olarak uretilmistir.", pWidth / 2, pHeight - 32, { align: 'center' });

    drawPageDecoration(1, 3);

    // --- PAGE 2: EXECUTIVE SUMMARY AND METRICS ---
    pdf.addPage();
    drawPageDecoration(2, 3);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(15, 23, 42);
    pdf.text("Yonetici Ozeti ve Finansal Durum", 20, 28);

    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.8);
    pdf.line(20, 31, 80, 31);

    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(20, 38, pWidth - 40, 48, 'FD');

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(59, 130, 246);
    pdf.text("Yapay Zeka Finansal Trend Analizi", 26, 46);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(51, 65, 85);
    const summaryLines = pdf.splitTextToSize(cleanTurkishChars(summaryText), pWidth - 52);
    pdf.text(summaryLines, 26, 54);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.text("Temel Finansal Performans Metrikleri", 20, 100);

    // KPI Gelir
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(20, 108, pWidth - 40, 24, 'FD');
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.text("Toplam Ciro (Gelir)", 26, 116);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(59, 130, 246);
    pdf.text(`${totalRevenue.toLocaleString('tr-TR')} TL`, 26, 126);

    // KPI Gider
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(20, 138, pWidth - 40, 24, 'FD');
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.text("Toplam Maliyet (Gider)", 26, 146);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(239, 68, 68);
    pdf.text(`${totalExpenses.toLocaleString('tr-TR')} TL`, 26, 156);

    // KPI Kar
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(20, 168, pWidth - 40, 24, 'FD');
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.text("Net Kar / Ortalama Marj", 26, 176);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(16, 185, 129);
    pdf.text(`${totalProfit.toLocaleString('tr-TR')} TL (%${avgMargin})`, 26, 186);

    // Distribution
    pdf.setFillColor(248, 250, 252);
    pdf.rect(20, 204, pWidth - 40, 68, 'FD');
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.text("Gider Kalemleri Kirilimi (Tahmini Dagilim)", 26, 214);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Kira Gideri (%15): ${totalRent.toLocaleString('tr-TR')} TL`, 30, 226);
    pdf.text(`Personel Gideri (%30): ${totalPersonnel.toLocaleString('tr-TR')} TL`, 30, 234);
    pdf.text(`Pazarlama Gideri (%10): ${totalMarketing.toLocaleString('tr-TR')} TL`, 30, 242);
    pdf.text(`Malzeme Gideri (%35): ${totalMaterial.toLocaleString('tr-TR')} TL`, 30, 250);
    pdf.text(`Diger Giderler (%10): ${totalOther.toLocaleString('tr-TR')} TL`, 30, 258);

    // --- SAYFA 3: DETAYLI TABLO ---
    pdf.addPage();
    drawPageDecoration(3, 3);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(15, 23, 42);
    pdf.text("Aylik Kirilim Tablosu", 20, 28);

    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0.8);
    pdf.line(20, 31, 80, 31);

    const startY = 40;
    pdf.setFillColor(59, 130, 246);
    pdf.rect(20, startY, pWidth - 40, 10, 'F');

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text("Donem", 24, startY + 6.5);
    pdf.text("Gelir (Ciro)", 60, startY + 6.5);
    pdf.text("Toplam Gider", 95, startY + 6.5);
    pdf.text("Net Kar", 135, startY + 6.5);
    pdf.text("Kar Marji", 175, startY + 6.5);

    let currentY = startY + 10;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);

    filteredRecords.forEach((record, index) => {
      if (currentY > 260) return;
      if (index % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(20, currentY, pWidth - 40, 8, 'F');
      }

      pdf.text(cleanTurkishChars(record.date), 24, currentY + 5.5);
      pdf.text(`${record.revenue.toLocaleString('tr-TR')} TL`, 60, currentY + 5.5);
      pdf.text(`${record.expenses.toLocaleString('tr-TR')} TL`, 95, currentY + 5.5);
      
      if (record.profit >= 0) {
        pdf.setTextColor(16, 185, 129);
      } else {
        pdf.setTextColor(239, 68, 68);
      }
      pdf.text(`${record.profit.toLocaleString('tr-TR')} TL`, 135, currentY + 5.5);
      
      pdf.setTextColor(51, 65, 85);
      const rowMargin = record.revenue > 0 ? (((record.revenue - record.expenses) / record.revenue) * 100).toFixed(1) : '0';
      pdf.text(`%${rowMargin}`, 175, currentY + 5.5);

      pdf.setDrawColor(241, 245, 249);
      pdf.setLineWidth(0.3);
      pdf.line(20, currentY + 8, pWidth - 20, currentY + 8);

      currentY += 8;
    });

    if (currentY <= 260) {
      pdf.setFillColor(241, 245, 249);
      pdf.rect(20, currentY, pWidth - 40, 10, 'F');

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text("Toplam", 24, currentY + 6.5);
      pdf.text(`${totalRevenue.toLocaleString('tr-TR')} TL`, 60, currentY + 6.5);
      pdf.text(`${totalExpenses.toLocaleString('tr-TR')} TL`, 95, currentY + 6.5);
      
      if (totalProfit >= 0) {
        pdf.setTextColor(16, 185, 129);
      } else {
        pdf.setTextColor(239, 68, 68);
      }
      pdf.text(`${totalProfit.toLocaleString('tr-TR')} TL`, 135, currentY + 6.5);
      
      pdf.setTextColor(15, 23, 42);
      pdf.text(`%${avgMargin}`, 175, currentY + 6.5);
    }

    pdf.save(`InsightAI_Finansal_Rapor_${cleanTurkishChars(businessName || 'isletmem')}.pdf`);
  };

  return (
    <div className="card" style={{ flexShrink: 0 }} id="report-to-export">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="widget-title" style={{ margin: 0 }}>Detaylı Raporlama</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: 0 }}>
            İşletmenizin kayıtlı finansal geçmişini süzgeçten geçirin, Excel veya PDF formatlarında kurumsal raporlar olarak indirin.
          </p>
        </div>
        {hasData && filteredRecords.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={exportToPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
              <FileText size={16} /> PDF İndir
            </button>
            <button className="btn" onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
              <FileSpreadsheet size={16} /> Excel İndir
            </button>
          </div>
        )}
      </div>

      {hasData ? (
        <>
          {/* Dropdown Filters */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            backgroundColor: 'var(--bg-main)', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filtreleme Dönemi</label>
              <select 
                value={filterType} 
                onChange={e => setFilterType(e.target.value)}
                className="form-input"
                style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)', minWidth: '150px' }}
              >
                <option value="all">Tüm Zamanlar</option>
                <option value="3months">Son 3 Ay</option>
                <option value="6months">Son 6 Ay</option>
                <option value="custom">Özel Dönem</option>
              </select>
            </div>

            {filterType === 'custom' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Başlangıç Ayı</label>
                    <select 
                      value={startMonth} 
                      onChange={e => setStartMonth(Number(e.target.value))}
                      className="form-input"
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                    >
                      {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Başlangıç Yılı</label>
                    <select 
                      value={startYear} 
                      onChange={e => setStartYear(Number(e.target.value))}
                      className="form-input"
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bitiş Ayı</label>
                    <select 
                      value={endMonth} 
                      onChange={e => setEndMonth(Number(e.target.value))}
                      className="form-input"
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                    >
                      {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bitiş Yılı</label>
                    <select 
                      value={endYear} 
                      onChange={e => setEndYear(Number(e.target.value))}
                      className="form-input"
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {filteredRecords.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
              Seçilen kriterlere uygun veri bulunamadı.
            </div>
          ) : (
            <>
              {/* Executive Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Toplam Ciro</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{totalRevenue.toLocaleString('tr-TR')} TL</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Filtrelenen Dönem</div>
                  </div>
                </div>
                
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
                    <Activity size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Toplam Net Kâr</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{totalProfit.toLocaleString('tr-TR')} TL</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Net Kazanç</div>
                  </div>
                </div>
                
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
                    <BarChart2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ortalama Kâr Marjı</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>%{avgMargin}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Genel Performans</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--color-primary-light)' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.75rem 0' }}>
                   Yönetici Özeti ve Trend Yorumu
                </h3>
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                  {summaryText}
                </p>
              </div>

              {/* Trend Chart */}
              <div style={{ marginBottom: '2rem', height: '350px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem 1rem 1rem 1rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>Finansal Gelişim Trendi (Gelir, Gider, Kâr)</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={filteredRecords} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(value) => `${(value / 1000)}k`} />
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString('tr-TR')} TL`]} 
                      contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dataKey="revenue" name="Gelir" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="expenses" name="Gider" stroke="#ef4444" strokeWidth={3} />
                    <Line type="monotone" dataKey="profit" name="Kâr" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="table-wrapper">
                <table className="custom-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Tarih / Dönem</th>
                      <th>Ciro (Gelir)</th>
                      <th>Giderler</th>
                      <th>Kira</th>
                      <th>Personel</th>
                      <th>Pazarlama</th>
                      <th>Malzeme</th>
                      <th>Diğer</th>
                      <th>Net Kar</th>
                      <th>Kar Marjı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => {
                      const margin = record.revenue > 0 ? (((record.revenue - record.expenses) / record.revenue) * 100).toFixed(1) : '0';
                      const rent = record.rent_expense !== undefined ? record.rent_expense : Math.round(record.expenses * 0.15);
                      const personnel = record.personnel_expense !== undefined ? record.personnel_expense : Math.round(record.expenses * 0.3);
                      const marketing = record.marketing_expense !== undefined ? record.marketing_expense : Math.round(record.expenses * 0.1);
                      const material = record.material_expense !== undefined ? record.material_expense : Math.round(record.expenses * 0.35);
                      const other = record.other_expense !== undefined ? record.other_expense : Math.round(record.expenses * 0.1);
                      
                      return (
                        <tr key={index}>
                          <td style={{ fontWeight: 600 }}>{record.date}</td>
                          <td>{record.revenue.toLocaleString('tr-TR')} TL</td>
                          <td>{record.expenses.toLocaleString('tr-TR')} TL</td>
                          <td>{rent.toLocaleString('tr-TR')} TL</td>
                          <td>{personnel.toLocaleString('tr-TR')} TL</td>
                          <td>{marketing.toLocaleString('tr-TR')} TL</td>
                          <td>{material.toLocaleString('tr-TR')} TL</td>
                          <td>{other.toLocaleString('tr-TR')} TL</td>
                          <td style={{ 
                            color: record.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)', 
                            fontWeight: 600 
                          }}>
                            {record.profit.toLocaleString('tr-TR')} TL
                          </td>
                          <td style={{ fontWeight: 500 }}>%{margin}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Raporları incelemek için herhangi bir veri bulunamadı.</p>
          <button className="btn btn-primary" onClick={loadDemoData}>Demo Verisi Yükle</button>
        </div>
      )}
    </div>
  );
}

export default Reports;
