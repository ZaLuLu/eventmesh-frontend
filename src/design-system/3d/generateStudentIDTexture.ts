/**
 * Utility to generate an authentic high-resolution Student / Member ID Card texture
 * for the 3D physics Lanyard card face.
 */

export interface StudentIDData {
  name: string
  registrationNumber: string
  degreeBranch: string
  semester?: number
  email: string
  role?: string
  avatarUrl?: string
  campus?: string
  bloodGroup?: string
  emergencyPhone?: string
}

export function generateStudentIDTexture(data: StudentIDData, side: 'front' | 'back' = 'front'): string {
  // Use 600x900 resolution (2:3 aspect ratio matching the portrait Lanyard card)
  const width = 600
  const height = 900
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) return ''

  if (side === 'back') {
    return generateStudentIDBackTexture(ctx, width, height, data, canvas)
  }


  // 1. Clean Deep Ink Background with Warm Paper Materiality
  ctx.fillStyle = '#151130'
  ctx.fillRect(0, 0, width, height)

  // 2. Tactile Subtle Grid Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 3. Top University Header Banner (Solid Electric Cobalt, No Gradient Slop)
  ctx.fillStyle = '#0047FF'
  ctx.fillRect(0, 0, width, 120)

  // Lanyard Slot Area Indicator (Top 40px)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.beginPath()
  ctx.roundRect((width - 120) / 2, 16, 120, 24, 12)
  ctx.fill()

  // Header Title
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '800 20px "Bricolage Grotesque", sans-serif'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '1px'
  ctx.fillText('EVENTMESH · CAMPUS IDENTITY', width / 2, 75)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.font = '500 13px "JetBrains Mono", monospace'
  ctx.fillText(data.campus || 'CENTRAL UNIVERSITY CAMPUS', width / 2, 98)

  // 4. Smart Chip Graphic (Brass / Gold)
  const chipX = 54
  const chipY = 150
  const chipW = 72
  const chipH = 56
  ctx.fillStyle = '#D4AF37'
  ctx.beginPath()
  ctx.roundRect(chipX, chipY, chipW, chipH, 8)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(chipX + 8, chipY + 8, chipW - 16, chipH - 16)
  ctx.beginPath()
  ctx.moveTo(chipX + chipW / 2, chipY + 8)
  ctx.lineTo(chipX + chipW / 2, chipY + chipH - 8)
  ctx.stroke()

  // Verified Status Pill (Top Right)
  ctx.fillStyle = '#7FD8B8'
  ctx.strokeStyle = '#151130'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(width - 180, 160, 126, 34, 17)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#151130'
  ctx.font = 'bold 12px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('VERIFIED ID ✓', width - 180 + 63, 182)

  // 5. Student Avatar Photo Frame
  const photoSize = 190
  const photoX = (width - photoSize) / 2
  const photoY = 240

  ctx.strokeStyle = '#0047FF'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2)
  ctx.stroke()

  // Inner Avatar Background
  ctx.fillStyle = '#221D47'
  ctx.beginPath()
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 - 2, 0, Math.PI * 2)
  ctx.fill()

  // Avatar Initials
  const initials = data.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  ctx.fillStyle = '#FFFDF8'
  ctx.font = '800 64px "Bricolage Grotesque", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, photoX + photoSize / 2, photoY + photoSize / 2)
  ctx.textBaseline = 'alphabetic'

  // 6. Student Information Section
  // Student Name
  ctx.fillStyle = '#FFFDF8'
  ctx.font = '800 32px "Bricolage Grotesque", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(data.name, width / 2, 485)

  // Registration Number (Tabular Mono with Badge)
  ctx.fillStyle = '#818CF8'
  ctx.font = '600 20px "JetBrains Mono", monospace'
  ctx.fillText(`REG: ${data.registrationNumber}`, width / 2, 525)

  // Program / Department
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.font = '500 17px "Geist", sans-serif'
  ctx.fillText(data.degreeBranch, width / 2, 565)

  // Academic Standing / Role
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
  ctx.font = '14px "JetBrains Mono", monospace'
  ctx.fillText(`SEMESTER ${data.semester || 6} · ${data.role || 'ATTENDEE'}`, width / 2, 595)

  // Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(60, 630)
  ctx.lineTo(width - 60, 630)
  ctx.stroke()

  // 7. Security Hash & Metadata Row
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '11px "JetBrains Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`ISSUED: OCT 2026`, 60, 665)
  ctx.fillText(`EXP: JUN 2028`, 60, 685)

  ctx.textAlign = 'right'
  ctx.fillText(`ID: EM-${data.registrationNumber.slice(-4)}`, width - 60, 665)
  ctx.fillText(`STATUS: ACTIVE PASSHOLDER`, width - 60, 685)

  // 8. Bottom Barcode Aesthetic Simulation
  const barcodeY = 720
  const barcodeH = 75
  const barcodeStartX = 60
  const barcodeW = width - 120

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
  ctx.fillRect(barcodeStartX - 10, barcodeY - 10, barcodeW + 20, barcodeH + 45)

  ctx.fillStyle = '#FFFFFF'
  // Deterministic bar widths
  let curX = barcodeStartX
  const seed = data.registrationNumber.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  for (let i = 0; curX < barcodeStartX + barcodeW; i++) {
    const barWidth = ((seed + i * 7) % 5) + 1
    const gap = ((seed + i * 3) % 4) + 2
    ctx.fillRect(curX, barcodeY, barWidth, barcodeH)
    curX += barWidth + gap
  }

  // Barcode Serial Text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '12px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`* EM-${data.registrationNumber}-2026-PASS *`, width / 2, barcodeY + barcodeH + 24)

  // 9. Watermark Seal (Bottom Center)
  ctx.strokeStyle = 'rgba(200, 190, 250, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(width / 2, height - 28, 16, 0, Math.PI * 2)
  ctx.stroke()

  return canvas.toDataURL('image/png')
}

function generateStudentIDBackTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: StudentIDData,
  canvas: HTMLCanvasElement
): string {
  // 1. Solid Ink Background
  ctx.fillStyle = '#151130'
  ctx.fillRect(0, 0, width, height)

  // 2. Subtle Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 3. Top Magnetic Stripe Simulation
  const stripeY = 24
  const stripeH = 80
  ctx.fillStyle = '#0F0D1F'
  ctx.fillRect(0, stripeY, width, stripeH)

  // Magnetic Stripe Optical Line
  ctx.fillStyle = '#0047FF'
  ctx.fillRect(0, stripeY + stripeH - 4, width, 4)

  // 4. Campus Gate Zone Access Matrix
  ctx.fillStyle = '#FFFDF8'
  ctx.font = '800 16px "Bricolage Grotesque", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('CAMPUS FACILITY ACCESS CLEARANCES', 50, 150)

  const zones = [
    { code: 'ZONE A', name: 'Tech Park Research & AI Labs', auth: true },
    { code: 'ZONE B', name: 'Central Auditorium & Mainstage', auth: true },
    { code: 'ZONE C', name: 'Robotics & Hardware Arena', auth: true },
    { code: 'ZONE D', name: 'Digital Library & Studio Space', auth: true },
  ]

  zones.forEach((z, idx) => {
    const yPos = 185 + idx * 46

    // Zone Container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(50, yPos, width - 100, 36, 6)
    ctx.fill()
    ctx.stroke()

    // Zone Code Badge
    ctx.fillStyle = '#C8BEFA'
    ctx.font = 'bold 12px "JetBrains Mono", monospace'
    ctx.fillText(z.code, 64, yPos + 22)

    // Zone Name
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.font = '500 13px "Geist", sans-serif'
    ctx.fillText(z.name, 135, yPos + 22)

    // Authorized Tag
    ctx.fillStyle = '#7FD8B8'
    ctx.font = 'bold 11px "JetBrains Mono", monospace'
    ctx.textAlign = 'right'
    ctx.fillText('GRANTED ✓', width - 64, yPos + 22)
    ctx.textAlign = 'left'
  })

  // 5. Emergency Contact & Medical
  const medY = 390
  ctx.fillStyle = 'rgba(255, 107, 53, 0.08)'
  ctx.strokeStyle = 'rgba(255, 107, 53, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(50, medY, width - 100, 84, 8)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#FF6B35'
  ctx.font = 'bold 13px "JetBrains Mono", monospace'
  ctx.fillText('EMERGENCY CONTACT & MEDICAL', 68, medY + 26)

  ctx.fillStyle = '#FFFDF8'
  ctx.font = '14px "Geist", sans-serif'
  ctx.fillText(`Blood Group: ${data.bloodGroup || 'O+'}`, 68, medY + 52)
  ctx.fillText(`Emergency Contact: ${data.emergencyPhone || '+91 98765 43210'}`, 240, medY + 52)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '12px "JetBrains Mono", monospace'
  ctx.fillText('Campus Health Center: ext. 4400 · Emergency Hotline: 108', 68, medY + 72)

  // 6. Dean of Student Affairs Seal
  const sealY = 510
  const sealR = 54
  const sealX = 120

  ctx.strokeStyle = '#F2B84B'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(242, 184, 75, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(sealX, sealY, sealR - 6, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = '#F2B84B'
  ctx.font = 'bold 10px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('EVENTMESH', sealX, sealY - 14)
  ctx.fillText('SEAL OF THE DEAN', sealX, sealY + 2)
  ctx.fillText('STUDENT AFFAIRS', sealX, sealY + 18)

  // Dean's Signature Line
  ctx.textAlign = 'left'
  ctx.fillStyle = '#FFFDF8'
  ctx.font = '800 15px "Bricolage Grotesque", sans-serif'
  ctx.fillText('Authorized by Dean of Student Affairs', 195, sealY - 10)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(195, sealY + 12)
  ctx.lineTo(width - 50, sealY + 12)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '12px "JetBrains Mono", monospace'
  ctx.fillText('Dr. K. R. Ramanathan, Ph.D · Verified Dean Signature', 195, sealY + 30)

  // 7. Guidelines & Terms
  const legalY = 620
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '11px "Geist", sans-serif'
  ctx.fillText('This pass remains the official property of Central University Campus.', 50, legalY)
  ctx.fillText('Non-transferable. Must be presented upon request at campus venue gates.', 50, legalY + 18)
  ctx.fillText('Questions or lost pass reports: registry@campus.eventmesh.org.', 50, legalY + 36)

  // 8. Bottom Verification Token
  const hashY = 700
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
  ctx.fillRect(40, hashY, width - 80, 80)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.strokeRect(40, hashY, width - 80, 80)

  ctx.fillStyle = '#C8BEFA'
  ctx.font = 'bold 12px "JetBrains Mono", monospace'
  ctx.fillText('OFFICIAL ATTENDANCE TOKEN', 60, hashY + 28)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.font = '11px "JetBrains Mono", monospace'
  const cryptoHash = `TOKEN: 0x${data.registrationNumber.split('').map(c => c.charCodeAt(0).toString(16)).join('')}9f2a7e4b01d`
  ctx.fillText(cryptoHash.slice(0, 48), 60, hashY + 50)
  ctx.fillText('GATE PASS · VERIFIED BY EVENTMESH', 60, hashY + 68)

  // 9. Bottom Footer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.font = '10px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('EVENTMESH CAMPUS IDENTITY · PASS CARD', width / 2, height - 30)

  return canvas.toDataURL('image/png')
}
