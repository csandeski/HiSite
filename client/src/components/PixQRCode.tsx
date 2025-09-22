import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Shield, Clock } from 'lucide-react';

interface PixQRCodeProps {
  pixCode?: string;
  encodedImage?: string;
  size?: number;
  color?: string;
}

export default function PixQRCode({ 
  pixCode, 
  encodedImage,
  size = 200,
  color = "#7c3aed"
}: PixQRCodeProps) {
  // If we have an encoded image from backend, use it
  if (encodedImage) {
    return (
      <div className="relative inline-block">
        {/* Decorative frame */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
        <div className="relative bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
          <img 
            src={`data:image/png;base64,${encodedImage}`}
            alt="QR Code PIX"
            className="rounded-lg"
            style={{ width: size, height: size }}
          />
          {/* PIX Logo in center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-lg p-2 shadow-lg">
              <svg width="40" height="40" viewBox="0 0 512 512" fill="none">
                <path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116z" fill="#32BCAD"/>
                <path d="M22.758 200.753l58.024-58.024h31.787c13.84 0 27.384 5.605 37.172 15.394l76.694 76.693c7.178 7.179 16.596 10.768 26.033 10.768 9.417 0 18.854-3.59 26.014-10.75l76.989-76.99c9.787-9.787 23.331-15.393 37.171-15.393h37.654l58.3 58.302c30.343 30.344 30.343 79.523 0 109.867l-58.3 58.303H392.64c-13.84 0-27.384-5.605-37.171-15.394l-76.97-76.99c-13.914-13.894-38.172-13.894-52.066.02l-76.693 76.674c-9.788 9.788-23.332 15.413-37.172 15.413H80.782L22.758 310.62c-30.344-30.345-30.344-79.524 0-109.868z" fill="#32BCAD"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we have a PIX code, generate QR code
  if (pixCode) {
    return (
      <div className="relative inline-block">
        {/* Decorative frame */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
        <div className="relative bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
          <QRCodeSVG 
            value={pixCode}
            size={size}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={false}
            imageSettings={{
              src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTExMi41NyAzOTEuMTljMjAuMDU2IDAgMzguOTI4LTcuODA4IDUzLjEyLTIybDc2LjY5My03Ni42OTJjNS4zODUtNS40MDQgMTQuNzY1LTUuMzg0IDIwLjE1IDBsNzYuOTg5IDc2Ljk4OWMxNC4xOTEgMTQuMTcyIDMzLjA0NSAyMS45OCA1My4xMiAyMS45OGgxNS4wOThsLTk3LjEzOCA5Ny4xMzljLTMwLjMyNiAzMC4zNDQtNzkuNTA1IDMwLjM0NC0xMDkuODUgMGwtOTcuNDE1LTk3LjQxNmg5LjIzMnptMjgwLjA2OC0yNzEuMjk0Yy0yMC4wNTYgMC0zOC45MjkgNy44MDktNTMuMTIgMjJsLTc2Ljk3IDc2Ljk5Yy01LjU1MSA1LjUzLTE0LjYgNS41NjgtMjAuMTUtLjAybC03Ni43MTEtNzYuNjkzYy0xNC4xOTItMTQuMTkxLTMzLjA0Ni0yMS45OTktNTMuMTItMjEuOTk5aC05LjIzNGw5Ny40MTYtOTcuNDE2YzMwLjM0NC0zMC4zNDQgNzkuNTIzLTMwLjM0NCAxMDkuODY3IDBsOTcuMTM4IDk3LjEzOGgtMTUuMTE2eiIgZmlsbD0iIzMyQkNBRCIvPgo8cGF0aCBkPSJNMjIuNzU4IDIwMC43NTNsNTguMDI0LTU4LjAyNGgzMS43ODdjMTMuODQgMCAyNy4zODQgNS42MDUgMzcuMTcyIDE1LjM5NGw3Ni42OTQgNzYuNjkzYzcuMTc4IDcuMTc5IDE2LjU5NiAxMC43NjggMjYuMDMzIDEwLjc2OCA5LjQxNyAwIDE4Ljg1NC0zLjU5IDI2LjAxNC0xMC43NWw3Ni45ODktNzYuOTljOS43ODctOS43ODcgMjMuMzMxLTE1LjM5MyAzNy4xNzEtMTUuMzkzaDM3LjY1NGw1OC4zIDU4LjMwMmMzMC4zNDMgMzAuMzQ0IDMwLjM0MyA3OS41MjMgMCAxMDkuODY3bC01OC4zIDU4LjMwM0gzOTIuNjRjLTEzLjg0IDAtMjcuMzg0LTUuNjA1LTM3LjE3MS0xNS4zOTRsLTc2Ljk3LTc2Ljk5Yy0xMy45MTQtMTMuODk0LTM4LjE3Mi0xMy44OTQtNTIuMDY2LjAybC03Ni42OTMgNzYuNjc0Yy05Ljc4OCA5Ljc4OC0yMy4zMzIgMTUuNDEzLTM3LjE3MiAxNS40MTNIODAG4ujIuNzU4IDMxMC42MmMtMzAuMzQ0LTMwLjM0NS0zMC4zNDQtNzkuNTI0IDAtMTA5Ljg2OHoiIGZpbGw9IiMzMkJDQUQiLz4KPC9zdmc+",
              x: undefined,
              y: undefined,
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>
      </div>
    );
  }

  // Fallback beautiful placeholder with generated QR pattern
  const placeholderData = "00020126330014BR.GOV.BCB.PIX0111placeholder52040000530398654040.015802BR5913RADIOPLAY APP6009SAO PAULO62140510placeholder6304";
  
  return (
    <div className="relative inline-block">
      {/* Decorative frame */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
      <div className="relative bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
        <div className="relative">
          {/* Generate a placeholder QR code */}
          <QRCodeSVG 
            value={placeholderData}
            size={size}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={false}
            imageSettings={{
              src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTExMi41NyAzOTEuMTljMjAuMDU2IDAgMzguOTI4LTcuODA4IDUzLjEyLTIybDc2LjY5My03Ni42OTJjNS4zODUtNS40MDQgMTQuNzY1LTUuMzg0IDIwLjE1IDBsNzYuOTg5IDc2Ljk4OWMxNC4xOTEgMTQuMTcyIDMzLjA0NSAyMS45OCA1My4xMiAyMS45OGgxNS4wOThsLTk3LjEzOCA5Ny4xMzljLTMwLjMyNiAzMC4zNDQtNzkuNTA1IDMwLjM0NC0xMDkuODUgMGwtOTcuNDE1LTk3LjQxNmg5LjIzMnptMjgwLjA2OC0yNzEuMjk0Yy0yMC4wNTYgMC0zOC45MjkgNy44MDktNTMuMTIgMjJsLTc2Ljk3IDc2Ljk5Yy01LjU1MSA1LjUzLTE0LjYgNS41NjgtMjAuMTUtLjAybC03Ni43MTEtNzYuNjkzYy0xNC4xOTItMTQuMTkxLTMzLjA0Ni0yMS45OTktNTMuMTItMjEuOTk5aC05LjIzNGw5Ny40MTYtOTcuNDE2YzMwLjM0NC0zMC4zNDQgNzkuNTIzLTMwLjM0NCAxMDkuODY3IDBsOTcuMTM4IDk3LjEzOGgtMTUuMTE2eiIgZmlsbD0iIzMyQkNBRCIvPgo8cGF0aCBkPSJNMjIuNzU4IDIwMC43NTNsNTguMDI0LTU4LjAyNGgzMS43ODdjMTMuODQgMCAyNy4zODQgNS42MDUgMzcuMTcyIDE1LjM5NGw3Ni42OTQgNzYuNjkzYzcuMTc4IDcuMTc5IDE2LjU5NiAxMC43NjggMjYuMDMzIDEwLjc2OCA5LjQxNyAwIDE4Ljg1NC0zLjU5IDI2LjAxNC0xMC43NWw3Ni45ODktNzYuOTljOS43ODctOS43ODcgMjMuMzMxLTE1LjM5MyAzNy4xNzEtMTUuMzkzaDM3LjY1NGw1OC4zIDU4LjMwMmMzMC4zNDMgMzAuMzQ0IDMwLjM0MyA3OS41MjMgMCAxMDkuODY3bC01OC4zIDU4LjMwM0gzOTIuNjRjLTEzLjg0IDAtMjcuMzg0LTUuNjA1LTM3LjE3MS0xNS4zOTRsLTc2Ljk3LTc2Ljk5Yy0xMy45MTQtMTMuODk0LTM4LjE3Mi0xMy44OTQtNTIuMDY2LjAybC03Ni42OTMgNzYuNjc0Yy05Ljc4OCA5Ljc4OC0yMy4zMzIgMTUuNDEzLTM3LjE3MiAxNS40MTNIODAG4ujIuNzU4IDMxMC42MmMtMzAuMzQ0LTMwLjM0NS0zMC4zNDQtNzkuNTI0IDAtMTA5Ljg2OHoiIGZpbGw9IiMzMkJDQUQiLz4KPC9zdmc+",
              x: undefined,
              y: undefined,
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
          
          {/* Overlay text indicating this is a placeholder */}
          <div className="absolute inset-0 bg-white/95 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-purple-600">QR Code PIX</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>Aguardando geração...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}