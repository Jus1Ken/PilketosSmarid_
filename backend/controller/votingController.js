
import { Candidate } from "../models/candidateModal.js";
import { Pemilih } from "../models/pemilih.model.js";
import csv from 'csv-parser';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';

export const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    const candidatesWithId = candidates.map(c => ({ ...c.toObject(), id: c._id }));
    res.json(candidatesWithId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const validateCode = async (req, res) => {
  try {
    const { uniqueCode } = req.body;
    const trimmedCode = uniqueCode.trim();
    const pemilih = await Pemilih.findOne({ uniqueCode: trimmedCode });

    if (!pemilih) {
      return res.status(400).json({ message: "Kode unik tidak valid" });
    }

    if (pemilih.isUsed) {
      return res.status(400).json({ message: "Kode unik sudah digunakan" });
    }

    res.json({ message: "Kode unik valid", pemilih });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUniqueCode = async (req, res) => {
  try {
    const { uniqueCode, studentName } = req.body;
    if (!uniqueCode || !studentName) {
      return res.status(400).json({ message: "Kode unik dan nama siswa harus diisi" });
    }

    const existing = await Pemilih.findOne({ uniqueCode });
    if (existing) {
      return res.status(400).json({ message: "Kode unik sudah ada" });
    }

    const newPemilih = new Pemilih({
      uniqueCode,
      studentName,
      isUsed: false,
    });

    await newPemilih.save();
    res.status(201).json({ message: "Kode unik berhasil dibuat", pemilih: newPemilih });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadUniqueCodesCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File CSV tidak ditemukan' });
    }

    const results = [];
    const errors = [];
    let processedCount = 0;


    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        
        const normalizedData = {};
        Object.keys(data).forEach(key => {
          normalizedData[key.toLowerCase()] = data[key];
        });


        const uniqueCode = normalizedData['unique_code'] || normalizedData['kode_unik'] || normalizedData['code'];
        const studentName = normalizedData['student_name'] || normalizedData['nama_siswa'] || normalizedData['name'];

        if (!uniqueCode || !studentName) {
          errors.push({
            row: processedCount + 1,
            error: 'Kolom unique_code dan student_name diperlukan'
          });
        } else {
          results.push({
            uniqueCode: uniqueCode.trim(),
            studentName: studentName.trim()
          });
        }
        processedCount++;
      })
      .on('end', async () => {
        try {

          fs.unlinkSync(req.file.path);

          if (results.length === 0) {
            return res.status(400).json({
              message: 'Tidak ada data valid dalam file CSV',
              errors
            });
          }

          const uniqueCodes = results.map(r => r.uniqueCode);
          const duplicatesInFile = uniqueCodes.filter((code, index) => uniqueCodes.indexOf(code) !== index);

          if (duplicatesInFile.length > 0) {
            return res.status(400).json({
              message: 'File CSV mengandung kode unik duplikat',
              duplicates: [...new Set(duplicatesInFile)]
            });
          }

          const existingCodes = await Pemilih.find({
            uniqueCode: { $in: uniqueCodes }
          }).select('uniqueCode');

          const existingCodeList = existingCodes.map(code => code.uniqueCode);

          if (existingCodeList.length > 0) {
            return res.status(400).json({
              message: 'Beberapa kode unik sudah ada di database',
              existingCodes: existingCodeList
            });
          }

          const pemilihToInsert = results.map(result => ({
            uniqueCode: result.uniqueCode,
            studentName: result.studentName,
            isUsed: false
          }));

          const insertedPemilih = await Pemilih.insertMany(pemilihToInsert);

          res.status(201).json({
            message: `${insertedPemilih.length} kode unik berhasil diupload`,
            totalProcessed: processedCount,
            totalInserted: insertedPemilih.length,
            errors: errors.length > 0 ? errors : undefined
          });

        } catch (error) {
          res.status(500).json({ message: 'Error processing CSV data', error: error.message });
        }
      })
      .on('error', (error) => {

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Error reading CSV file', error: error.message });
      });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const voteCandidate = async (req, res) => {
  try {
    const { candidateId, uniqueCode } = req.body;
    const trimmedCode = uniqueCode.trim();

    const pemilih = await Pemilih.findOne({ uniqueCode: trimmedCode });
    if (!pemilih || pemilih.isUsed) {
      return res.status(400).json({ message: "Kode unik tidak valid atau sudah digunakan" });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Kandidat tidak ditemukan" });
    }

    candidate.votes += 1;
    await candidate.save();

    pemilih.isUsed = true;
    pemilih.votedAt = new Date();
    await pemilih.save();

    res.json({ message: "Vote berhasil", candidate: { ...candidate.toObject(), id: candidate._id } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCandidate = async (req, res) => {
  try {
    const { ketua, wakilKetua, jointPhoto, visi, misi } = req.body;

    if (!ketua?.name || !ketua?.nis) {
      return res.status(400).json({ message: "Nama dan NIS Ketua harus diisi" });
    }

    if (!wakilKetua?.name || !wakilKetua?.nis) {
      return res.status(400).json({ message: "Nama dan NIS Wakil Ketua harus diisi" });
    }

    if (!visi) {
      return res.status(400).json({ message: "Visi harus diisi" });
    }

    if (!misi || !Array.isArray(misi) || misi.length === 0) {
      return res.status(400).json({ message: "Misi harus diisi" });
    }

    if (!jointPhoto) {
      return res.status(400).json({ message: "Foto bersama harus diisi" });
    }

    const newCandidate = new Candidate({
      ketua: {
        name: ketua.name,
        image: ketua.image || "",
        nis: ketua.nis,
        visi: "",
        misi: []
      },
      wakilKetua: {
        name: wakilKetua.name,
        image: wakilKetua.image || "",
        nis: wakilKetua.nis,
        visi: "",
        misi: []
      },
      jointPhoto,
      visi,
      misi: misi.filter(m => m && m.trim() !== ""),
      votes: 0,
    });

    const savedCandidate = await newCandidate.save();
    res.status(201).json({ message: "Paslon berhasil ditambahkan", candidate: savedCandidate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { ketua, wakilKetua, jointPhoto, visi, misi } = req.body;
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Paslon tidak ditemukan" });
    }

    if (ketua) {
      candidate.ketua.name = ketua.name || candidate.ketua.name;
      candidate.ketua.image = ketua.image || candidate.ketua.image;
      candidate.ketua.nis = ketua.nis || candidate.ketua.nis;
    }

    if (wakilKetua) {
      candidate.wakilKetua.name = wakilKetua.name || candidate.wakilKetua.name;
      candidate.wakilKetua.image = wakilKetua.image || candidate.wakilKetua.image;
      candidate.wakilKetua.nis = wakilKetua.nis || candidate.wakilKetua.nis;
    }

    if (jointPhoto) {
      candidate.jointPhoto = jointPhoto;
    }

    if (visi) {
      candidate.visi = visi;
    }

    if (misi && Array.isArray(misi)) {
      candidate.misi = misi.filter(m => m && m.trim() !== "");
    }

    await candidate.save();
    res.json({ message: "Paslon berhasil diperbarui", candidate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByIdAndDelete(id);
    if (!candidate) {
      return res.status(404).json({ message: "Kandidat tidak ditemukan" });
    }
    res.json({ message: "Kandidat berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const exportWinnerPDF = async (req, res) => {
  try {
    const winner = await Candidate.findOne().sort({ votes: -1 });
    if (!winner) {
      return res.status(400).json({ message: 'Tidak ada kandidat untuk membuat PDF' });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="surat-serah-terima-jabatan.pdf"');

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 100; 

    let currentY = 50;

    const logoLeftPath = path.join(process.cwd(), 'frontend', 'src', 'assets', 'logo.png');
    const logoRightPath = path.join(process.cwd(), 'frontend', 'src', 'assets', 'osiss.png');

    try {
      doc.image(logoLeftPath, 50, currentY, { width: 80, height: 80 });
    } catch (e) {
      
    }

    
    try {
      doc.image(logoRightPath, pageWidth - 110, currentY, { width:80, height: 80 });
    } catch (e) {
      
    }

    
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('ORGANISASI SISWA INTRA SEKOLAH (OSIS)', 120, currentY + 5, { width: pageWidth - 240, align: 'center' });
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('SMA NEGERI 10 SAMARINDA', 120, currentY + 22, { width: pageWidth - 240, align: 'center' });
    doc.fontSize(10).font('Helvetica');
    doc.text('Alamat: Jl. P.M. Noor No.1 RT. 38 Kel. Sempaja Selatan Kec. Samarinda Utara', 120, currentY + 38, { width: pageWidth - 240, align: 'center' });
    doc.text('Kode Pos 75242, Telepon/Fax (0541) 252 912, Blog: Osis-smaridasa.blogspot.com', 120, currentY + 52, { width: pageWidth - 240, align: 'center' });

    currentY += 85;

    
    doc.moveTo(50, currentY)
       .lineTo(pageWidth - 50, currentY)
       .lineWidth(1)
       .strokeColor('black')
       .stroke();

    currentY += 25;

   
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('BERITA ACARA', 50, currentY, { align: 'center', width: pageWidth - 100 });
    currentY += 18;
    doc.text('SERAH TERIMA JABATAN PENGURUS OSIS', 50, currentY, { align: 'center', width: pageWidth - 100 });
    currentY += 18;
    doc.text('SMA NEGERI 10 SAMARINDA', 50, currentY, { align: 'center', width: pageWidth - 100 });
    currentY += 18;
    doc.text('MASA BAKTI 2025/2026 KEPADA PENGURUS MASA BAKTI 2026/2027', 50, currentY, { align: 'center', width: pageWidth - 100 });

    currentY += 30;


    doc.fontSize(11).font('Helvetica');
    const bodyText = `Pada hari ini Senin tanggal Dua puluh Tujuh bulan Oktober tahun Dua Ribu Dua Puluh Lima pukul Tujuh Tiga Puluh di SMA Negeri 10 Samarinda, telah dilaksanakan serah terima jabatan pengurus OSIS SMA Negeri 10 Samarinda Masa Bakti 2025/2026 kepada pengurus OSIS Masa Bakti 2026/2027. Bertempat di lapangan upacara pada pukul 07.30 WITA, masing-masing yang bertanda tangan dibawah ini:`;
    doc.text(bodyText, 50, currentY, { width: contentWidth, align: 'justify', lineGap: 2 });

    currentY += 75;

    
    doc.fontSize(11).font('Helvetica');
    doc.text('1. Tiara Aisyah Putri Heryanto (NIS 275455) selaku Ketua OSIS Periode 2025/2026', 65, currentY);
    currentY += 15;
    doc.text('Muhammad Rafly Alifa Taqwa (NIS 275346) selaku Wakil Ketua OSIS Periode', 70, currentY);
    currentY += 13;
    doc.text('2025/2026', 70, currentY);

    currentY += 25;

    
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Menyerahkan jabatan kepada', 50, currentY, { align: 'center', width: contentWidth });

    currentY += 25;

    
    doc.fontSize(11).font('Helvetica');
    doc.text(`2. ${winner.ketua.name} (NIS ${winner.ketua.nis}) selaku Ketua OSIS Periode 2026/2027`, 65, currentY);
    currentY += 15;
    doc.text(`${winner.wakilKetua.name} (NIS ${winner.wakilKetua.nis}) selaku Wakil Ketua OSIS Periode`, 70, currentY);
    currentY += 13;
    doc.text('2026/2027', 70, currentY);

    currentY += 40;

    
    doc.fontSize(10).font('Helvetica');
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text('Dibuat di : Samarinda', 380, currentY);
    currentY += 10;
    doc.text(`Pada Tanggal : ${formattedDate}`, 380, currentY);

    currentY += 30;

    
    const leftX = 70;
    const rightX = 350;

    
    doc.fontSize(10).font('Helvetica');
    doc.text('Ketua OSIS Masa Bakti 2025/2026,', leftX, currentY);
    doc.text('Ketua OSIS Masa Bakti 2026/2027,', rightX, currentY);

    currentY += 50; 

    
    doc.fontSize(10).font('Helvetica');
    doc.text('Tiara Aisyah Putri Heryanto', leftX, currentY);
    doc.text(`${winner.ketua.name}`, rightX, currentY);
    currentY += 10;
    doc.text('NIS 275455', leftX, currentY);
    doc.text(`NIS ${winner.ketua.nis}`, rightX, currentY);

    currentY += 25;

    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Diketahui:', 50, currentY, { align: 'center', width: contentWidth });

    currentY += 20;

    
    doc.fontSize(10).font('Helvetica');
    doc.text('Waka Kesiswaan,', leftX, currentY);
    doc.text('Pembina OSIS dan MPK,', rightX, currentY);

    currentY += 50; 

    doc.text('Abdul Salman AlFarid, S.Pd.I.', leftX, currentY);
    doc.text('Chusnulita Adityarini, S.E., M.Pd', rightX, currentY);
    currentY += 10;
    doc.text('NIP 198509072024211006', leftX, currentY);
    doc.text('NIP 198304262022212025', rightX, currentY);

    currentY += 25;

   
    const centerX = pageWidth / 2;
    doc.text('Kepala SMAN 10 Samarinda,', centerX - 85, currentY);

    currentY += 50; 

    doc.text('Ni Made Adnyani, S.Ag, M.Pd.', centerX - 90, currentY);
    currentY += 10;
    doc.text('NIP 198508022009032008', centerX - 80, currentY);

    
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Gagal membuat PDF', error: error.message });
  }
};