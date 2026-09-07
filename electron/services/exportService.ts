import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'
import PDFDocument from 'pdfkit'
import { parseAsync } from 'json2csv'
import { getAllTransactions } from './transactionService.js'
import { getCategoryById } from './categoryService.js'
import type { TransactionFilters, Transaction } from '../../src/types/models.js'

// Formatters
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp').trim()
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function sanitizeForCsv(value: string | null | undefined): string {
  if (!value) return ''
  const str = String(value)
  // Prevent CSV Formula Injection
  if (/^[=\-+\@]/.test(str)) {
    return `'${str}`
  }
  return str
}

export async function exportTransactionsToCSV(
  db: Database.Database,
  filePath: string,
  filters: Partial<TransactionFilters>
): Promise<void> {
  const transactions = getAllTransactions(db, filters)
  
  const csvData = transactions.map(tx => {
    const cat = getCategoryById(db, tx.category_id)
    return {
      'Tanggal': formatDate(tx.transaction_date),
      'Tipe': tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      'Kategori': cat ? sanitizeForCsv(cat.name) : '—',
      'Keterangan': sanitizeForCsv(tx.description),
      'Jumlah': tx.amount
    }
  })

  // Use utf-8 with BOM for Excel compatibility
  const csv = await parseAsync(csvData)
  const bom = '\uFEFF'
  
  await fs.promises.writeFile(filePath, bom + csv, 'utf8')
}

export async function exportTransactionsToPDF(
  db: Database.Database,
  filePath: string,
  filters: Partial<TransactionFilters>
): Promise<void> {
  const transactions = getAllTransactions(db, filters)
  
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' })
      const stream = fs.createWriteStream(filePath)
      
      doc.pipe(stream)
      
      let totalIncome = 0
      let totalExpense = 0
      
      // Title
      doc.fontSize(20).text('FINTRACK', { align: 'center' })
      doc.fontSize(14).text('Laporan Transaksi', { align: 'center' })
      doc.moveDown(2)
      
      const tableTop = doc.y
      let y = tableTop

      const drawRow = (
        yPos: number,
        tgl: string,
        kat: string,
        tipe: string,
        jumlah: string,
        isHeader = false
      ) => {
        doc.fontSize(10)
        if (isHeader) {
          doc.font('Helvetica-Bold')
        } else {
          doc.font('Helvetica')
        }
        
        doc.text(tgl, 50, yPos, { width: 90 })
        doc.text(kat, 150, yPos, { width: 120 })
        doc.text(tipe, 280, yPos, { width: 90 })
        doc.text(jumlah, 380, yPos, { width: 150, align: 'right' })
        
        // Draw line below row
        doc.moveTo(50, yPos + 15).lineTo(545, yPos + 15).strokeColor('#e5e7eb').stroke()
      }
      
      // Draw Header
      drawRow(y, 'Tanggal', 'Kategori', 'Tipe', 'Jumlah', true)
      y += 25
      
      for (const tx of transactions) {
        if (y > 750) {
          doc.addPage()
          y = 50
          drawRow(y, 'Tanggal', 'Kategori', 'Tipe', 'Jumlah', true)
          y += 25
        }
        
        const cat = getCategoryById(db, tx.category_id)
        const kat = cat ? cat.name : '—'
        const tipe = tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'
        const jumlah = (tx.type === 'income' ? '+ ' : '- ') + formatRupiah(tx.amount)
        
        if (tx.type === 'income') totalIncome += tx.amount
        else totalExpense += tx.amount
        
        drawRow(y, formatDate(tx.transaction_date), kat, tipe, jumlah, false)
        y += 25
      }
      
      // Summary
      if (y > 700) {
        doc.addPage()
        y = 50
      }
      
      doc.moveDown(2)
      y = doc.y
      doc.font('Helvetica-Bold')
      doc.text('Ringkasan:', 50, y)
      
      y += 20
      doc.font('Helvetica')
      doc.text('Total Pemasukan:', 50, y)
      doc.text(formatRupiah(totalIncome), 150, y)
      
      y += 20
      doc.text('Total Pengeluaran:', 50, y)
      doc.text(formatRupiah(totalExpense), 150, y)
      
      y += 20
      doc.font('Helvetica-Bold')
      doc.text('Saldo Bersih:', 50, y)
      doc.text(formatRupiah(totalIncome - totalExpense), 150, y)
      
      doc.end()
      
      stream.on('finish', () => resolve())
      stream.on('error', (err) => reject(err))
    } catch (err) {
      reject(err)
    }
  })
}
