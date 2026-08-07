import * as ecom from '@wix/ecom'

console.log('=== INSPECTING @wix/ecom MODULE EXPORTS ===')
console.log('Keys in @wix/ecom:', Object.keys(ecom))
if (ecom.checkout) {
    console.log('checkout methods:', Object.keys(ecom.checkout))
}
if (ecom.currentCart) {
    console.log('currentCart methods:', Object.keys(ecom.currentCart))
}
if (ecom.cart) {
    console.log('cart methods:', Object.keys(ecom.cart))
}
if (ecom.orders) {
    console.log('orders methods:', Object.keys(ecom.orders))
}
