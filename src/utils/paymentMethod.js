// src/utils/paymentMethod.js
//
// 'cod' is legacy — pre-cutover orders only (see Order::payment_method on
// the backend). Every order since has payment_method 'modempay'; anything
// else falls back to the raw value rather than rendering blank.
const LABELS = {
    cod: '💵 Cash on Delivery',
    modempay: '💳 ModemPay',
};

export const formatPaymentMethod = (paymentMethod) => LABELS[paymentMethod] || paymentMethod || LABELS.cod;
