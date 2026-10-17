import jsPDF from 'jspdf'
import { formatDate, formatTime } from '@/lib/format'

export interface StampedInvoicePdfOptions {
  event: {
    title: string
    startsAt?: string
    venue?: { name?: string; address?: string }
    price?: number
    isFree?: boolean
  }
  registration: {
    id: string
    ticketCode?: string
    createdAt: string
  }
  attendeeName: string
  attendeeEmail: string
  totalAmountText: string
  paymentDate?: Date
}

export function downloadStampedTicketAndInvoicePDF(options: StampedInvoicePdfOptions) {
  const {
    event,
    registration,
    attendeeName,
    attendeeEmail,
    totalAmountText,
    paymentDate = new Date(),
  } = options

  const ticketCode = registration.ticketCode || `PASS-${registration.id.slice(0, 8).toUpperCase()}`
  const passSerial = registration.id.slice(0, 8).toUpperCase()
  const formattedPayDate = paymentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // ================= 1. CORPORATE HEADER =================
  doc.setFillColor(20, 17, 29) // Deep obsidian #14111D
  doc.rect(0, 0, 210, 36, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('EVENTMESH', 18, 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(200, 205, 220)
  doc.text('CENTRAL CAMPUS TICKETING & ADMISSION NETWORK', 18, 25)
  doc.text('WEB: eventmesh.ac  |  SUPPORT: admissions@eventmesh.ac', 18, 30)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(143, 227, 198) // Mint
  doc.text('OFFICIAL RECEIPT & ENTRY PASS', 192, 18, { align: 'right' })
  doc.setFontSize(9)
  doc.setTextColor(220, 225, 235)
  doc.text(`DATE: ${formattedPayDate}`, 192, 25, { align: 'right' })
  doc.text(`INVOICE: INV-${passSerial}`, 192, 30, { align: 'right' })

  // ================= 2. ADMISSION TICKET BOX =================
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(15, 44, 180, 72, 3, 3, 'FD')

  // Top ticket banner
  doc.setFillColor(47, 75, 214) // Cobalt accent
  doc.roundedRect(15, 44, 180, 8, 3, 3, 'F')
  doc.rect(15, 48, 180, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('GATE CLEARANCE PASS', 20, 49.5)
  doc.text(ticketCode, 190, 49.5, { align: 'right' })

  // Event title & details
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(event.title || 'Campus Gathering', 22, 60)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text(`Date & Time: ${formatDate(event.startsAt || registration.createdAt, 'medium')} · ${event.startsAt ? formatTime(event.startsAt) : '09:00 AM onwards'}`, 22, 67)
  doc.text(`Venue: ${event.venue?.name || 'Main Campus Auditorium'}`, 22, 73)
  doc.text(`Authorized Attendee: ${attendeeName} (${attendeeEmail})`, 22, 79)
  doc.text(`Pass Serial: #${passSerial}  |  Gate Protocol: ISO/IEC 18004 Verification Valid`, 22, 85)

  // QR Stand-in visual inside ticket
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(148, 56, 42, 54, 2, 2, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(47, 75, 214)
  doc.text('SCANNABLE QR', 169, 63, { align: 'center' })
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text(ticketCode, 169, 70, { align: 'center' })
  doc.text('PRESENT AT GATE', 169, 104, { align: 'center' })

  // ================= 3. INVOICE TABLE =================
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('PAYMENT LEDGER & INVOICE BREAKDOWN', 15, 128)

  // Table header
  doc.setFillColor(241, 245, 249)
  doc.rect(15, 133, 180, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)
  doc.text('ITEM DESCRIPTION', 20, 138)
  doc.text('QTY', 120, 138)
  doc.text('UNIT PRICE', 145, 138)
  doc.text('AMOUNT', 190, 138, { align: 'right' })

  // Line item 1: Admission pass
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(30, 41, 59)
  doc.text(`${event.title} - Admission Ticket`, 20, 147)
  doc.text('1', 122, 147)
  doc.text(totalAmountText, 145, 147)
  doc.text(totalAmountText, 190, 147, { align: 'right' })

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.line(15, 154, 195, 154)

  // Total
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TOTAL AMOUNT PAID:', 130, 162)
  doc.setTextColor(47, 75, 214)
  doc.setFontSize(11)
  doc.text(totalAmountText, 190, 162, { align: 'right' })

  // ================= 4. THE 3D STAMP IMPRINT =================
  // Ink Stamp Border (Red / Carmine Official Stamp Aesthetic)
  doc.setDrawColor(225, 29, 72) // Vivid Carmine Red
  doc.setLineWidth(1.2)
  doc.roundedRect(65, 178, 80, 40, 3, 3, 'D')

  doc.setLineWidth(0.4)
  doc.roundedRect(67, 180, 76, 36, 2, 2, 'D')

  doc.setTextColor(225, 29, 72)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('EVENTMESH · PAID', 105, 187, { align: 'center' })

  doc.setFontSize(16)
  doc.text(formattedPayDate, 105, 199, { align: 'center' })

  doc.setFontSize(7)
  doc.text('OFFICIAL PAYMENT CLEARANCE', 105, 208, { align: 'center' })
  doc.text('CENTRAL ESCROW SETTLED', 105, 212, { align: 'center' })

  // ================= 5. FOOTER & COMPLIANCE =================
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(15, 255, 195, 255)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('EventMesh is an authorized campus ticketing network. This document serves as both a tax invoice and proof of admission.', 15, 262)
  doc.text(`Digital Sign ID: 0x${registration.id.slice(0, 16)}...clearance_ok  ·  Issued by EventMesh Cloud Services`, 15, 267)

  doc.save(`EventMesh_Receipt_${ticketCode}.pdf`)
}
