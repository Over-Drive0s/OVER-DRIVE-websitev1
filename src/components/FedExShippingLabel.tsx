import { Printer, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  CarrierLogo,
  carrierLabel,
  carrierLogoPath,
  carrierServiceName,
  type CarrierId,
} from './ShippingCarrierLogos'

export interface LabelData {
  orderId: string
  sku: string
  itemName: string
  qty: number
  tracking: string
  carrier: CarrierId
  createdAt: string
}

interface FedExShippingLabelModalProps {
  label: LabelData
  onClose: () => void
}

const PRINT_STYLE_ID = 'fedex-label-print-styles'
const LABEL_WIDTH = '4in'
const LABEL_HEIGHT = '6in'

const carrierBadge: Record<CarrierId, { bg: string; text: string; short: string }> = {
  fedex: { bg: '#4d148c', text: '#ffffff', short: 'Express' },
  ups: { bg: '#351c15', text: '#ffb500', short: 'Ground' },
  usps: { bg: '#004785', text: '#ffffff', short: 'Priority' },
  dhl: { bg: '#d40511', text: '#ffffff', short: 'Intl' },
}

function FakeBarcode() {
  const bars = Array.from({ length: 42 }, (_, i) => ({
    w: i % 3 === 0 ? 3 : i % 5 === 0 ? 2 : 1,
    h: 48 + (i % 4) * 2,
  }))

  let x = 0
  return (
    <svg viewBox="0 0 280 56" className="fedex-label-sheet__barcode" aria-hidden preserveAspectRatio="xMidYMid meet">
      {bars.map((bar, i) => {
        const el = <rect key={i} x={x} y={56 - bar.h} width={bar.w} height={bar.h} fill="#000" />
        x += bar.w + 1
        return el
      })}
    </svg>
  )
}

function LabelSheet({ label }: { label: LabelData }) {
  const badge = carrierBadge[label.carrier]
  const logoUrl = `${window.location.origin}${carrierLogoPath(label.carrier)}`
  const serviceName = carrierServiceName(label.carrier)

  return (
    <div className="fedex-label-sheet">
      <div className="fedex-label-sheet__header">
        <div className="fedex-label-sheet__header-copy">
          <span
            className="fedex-label-sheet__badge"
            style={{ background: badge.bg, color: badge.text }}
          >
            {badge.short}
          </span>
          <p className="fedex-label-sheet__muted">Ship date</p>
          <p className="fedex-label-sheet__date">{label.createdAt}</p>
        </div>
        <img src={logoUrl} alt={carrierLabel(label.carrier)} className="fedex-label-sheet__logo" />
      </div>

      <hr className="fedex-label-sheet__rule" />

      <div className="fedex-label-sheet__addresses">
        <div className="fedex-label-sheet__address-block">
          <p className="fedex-label-sheet__muted">From</p>
          <p className="fedex-label-sheet__addr">
            <strong>Overdrive IO Fulfillment</strong>
            <br />
            1200 Warehouse Blvd
            <br />
            Newark, NJ 07102
          </p>
        </div>
        <div className="fedex-label-sheet__address-block">
          <p className="fedex-label-sheet__muted">To</p>
          <p className="fedex-label-sheet__addr">
            <strong>Simulated Customer</strong>
            <br />
            88 Commerce St
            <br />
            Austin, TX 78701
          </p>
        </div>
      </div>

      <hr className="fedex-label-sheet__rule" />

      <p className="fedex-label-sheet__muted">Reference</p>
      <p className="fedex-label-sheet__ref">
        {label.orderId} · {label.qty}× {label.itemName}
      </p>
      <p className="fedex-label-sheet__sku">{label.sku}</p>

      <hr className="fedex-label-sheet__rule" />

      <p className="fedex-label-sheet__muted">Tracking ID</p>
      <p className="fedex-label-sheet__tracking">{label.tracking}</p>

      <FakeBarcode />

      <div className="fedex-label-sheet__meta">
        <span>Wt: {(label.qty * 1.4).toFixed(1)} LB</span>
        <span>INV-{label.orderId.replace('ORD-', '')}</span>
        <span>{serviceName}</span>
      </div>
    </div>
  )
}

function injectPrintStyles() {
  if (document.getElementById(PRINT_STYLE_ID)) return

  const style = document.createElement('style')
  style.id = PRINT_STYLE_ID
  style.textContent = `
    .fedex-label-sheet {
      box-sizing: border-box;
      width: ${LABEL_WIDTH};
      height: ${LABEL_HEIGHT};
      min-height: ${LABEL_HEIGHT};
      border: 2px solid #000;
      padding: 12px;
      margin: 0 auto;
      background: #fff;
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
      overflow: hidden;
    }
    .fedex-label-sheet * { box-sizing: border-box; }
    .fedex-label-sheet__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }
    .fedex-label-sheet__header-copy {
      min-width: 0;
      flex: 1 1 auto;
    }
    .fedex-label-sheet__badge {
      display: inline-block;
      font-weight: 700;
      font-size: 10px;
      padding: 3px 8px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .fedex-label-sheet__muted {
      margin: 8px 0 0;
      color: #444;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .fedex-label-sheet__date,
    .fedex-label-sheet__ref {
      margin: 2px 0 0;
      font-size: 11px;
      font-weight: 600;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .fedex-label-sheet__logo {
      height: 28px;
      width: auto;
      max-width: 110px;
      flex-shrink: 0;
      object-fit: contain;
    }
    .fedex-label-sheet__rule {
      border: none;
      border-top: 1px solid #000;
      margin: 10px 0;
      width: 100%;
    }
    .fedex-label-sheet__addresses {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 12px;
    }
    .fedex-label-sheet__address-block {
      min-width: 0;
    }
    .fedex-label-sheet__addr {
      margin: 4px 0 0;
      font-size: 11px;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }
    .fedex-label-sheet__sku {
      margin: 2px 0 0;
      font-size: 10px;
      color: #444;
      overflow-wrap: anywhere;
    }
    .fedex-label-sheet__tracking {
      margin: 4px 0 8px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.04em;
      font-family: ui-monospace, monospace;
      overflow-wrap: anywhere;
      word-break: break-word;
      line-height: 1.3;
    }
    .fedex-label-sheet__barcode {
      display: block;
      width: 100%;
      height: auto;
      max-width: 100%;
    }
    .fedex-label-sheet__meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 4px 8px;
      margin-top: 8px;
      font-size: 9px;
      color: #444;
      line-height: 1.4;
    }
    .shipping-label-preview {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      overflow: auto;
      padding: 1rem;
      background: #f4f4f5;
    }
    .shipping-label-preview__frame {
      width: ${LABEL_WIDTH};
      height: ${LABEL_HEIGHT};
      flex-shrink: 0;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    }
    .shipping-label-preview__frame .fedex-label-sheet {
      width: 100%;
      height: 100%;
    }
    #fedex-label-print-root {
      position: fixed;
      left: -10000px;
      top: 0;
      width: ${LABEL_WIDTH};
      pointer-events: none;
      opacity: 0;
    }
    #fedex-label-print-root .fedex-label-sheet {
      width: ${LABEL_WIDTH};
      height: ${LABEL_HEIGHT};
      min-height: ${LABEL_HEIGHT};
    }
    @media print {
      @page {
        size: ${LABEL_WIDTH} ${LABEL_HEIGHT};
        margin: 0;
      }
      html, body {
        width: ${LABEL_WIDTH} !important;
        height: ${LABEL_HEIGHT} !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        background: #fff !important;
      }
      body * {
        visibility: hidden !important;
      }
      #fedex-label-print-root,
      #fedex-label-print-root * {
        visibility: visible !important;
      }
      #fedex-label-print-root {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: ${LABEL_WIDTH} !important;
        height: ${LABEL_HEIGHT} !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      #fedex-label-print-root .fedex-label-sheet {
        border: 2px solid #000;
        page-break-inside: avoid;
      }
    }
  `
  document.head.appendChild(style)
}

function removePrintStyles() {
  document.getElementById(PRINT_STYLE_ID)?.remove()
}

export default function FedExShippingLabelModal({ label, onClose }: FedExShippingLabelModalProps) {
  useEffect(() => {
    injectPrintStyles()
    return () => removePrintStyles()
  }, [])

  const handlePrint = () => {
    const logo = document.querySelector<HTMLImageElement>('#fedex-label-print-root img')
    const runPrint = () => window.print()

    if (!logo || logo.complete) {
      runPrint()
      return
    }

    logo.addEventListener('load', runPrint, { once: true })
    logo.addEventListener('error', runPrint, { once: true })
  }

  const printPortal = createPortal(
    <div id="fedex-label-print-root" aria-hidden="true">
      <LabelSheet label={label} />
    </div>,
    document.body,
  )

  return (
    <>
      {printPortal}

      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center print:hidden">
        <div className="flex max-h-[92vh] w-full max-w-[calc(4in+2rem)] flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0c10] shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Shipping label ready</p>
              <p className="text-[10px] text-white/40">
                Simulator · {carrierServiceName(label.carrier)} · 4×6 in
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#ccff00] px-3 py-2 text-xs font-semibold text-black transition hover:bg-white"
              >
                <Printer size={14} />
                Print
              </button>
              <button type="button" onClick={onClose} className="rounded-lg p-2 text-white/40 hover:bg-white/[0.06] hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="shipping-label-preview min-h-0 flex-1">
            <div className="shipping-label-preview__frame">
              <LabelSheet label={label} />
            </div>
          </div>

          <div className="shrink-0 border-t border-white/[0.08] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="rounded bg-white px-2 py-1">
                <CarrierLogo carrier={label.carrier} className="h-6 w-24 shrink-0" />
              </div>
              <p className="text-[10px] text-white/40">Label generated · click Print to send to your printer</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
