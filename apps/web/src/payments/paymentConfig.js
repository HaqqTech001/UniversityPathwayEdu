// Amounts in kobo. This is the current owner-confirmed registration fee;
// production invoices must use the active server-side fee schedule.
export const registrationFeeKobo=1_500_000;
export const formatNaira=(kobo)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(kobo/100);
export const paymentStages=[
 {id:'unpaid',label:'Awaiting payment'},
 {id:'pending',label:'Awaiting accounts verification'},
 {id:'verified',label:'Payment verified'},
 {id:'rejected',label:'Payment requires attention'}
];
