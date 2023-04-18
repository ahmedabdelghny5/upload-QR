import QRCode from 'qrcode'

export const qrCodeFun = ({data=''}={})=>{
    // QRCode.toDataURL(data)
    const QRCODE=QRCode.toDataURL(data)
    return QRCODE
}