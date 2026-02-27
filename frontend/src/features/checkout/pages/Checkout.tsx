import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CreditCard, Lock, MapPin, ClipboardList } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { shippingSchema, paymentSchema, type ShippingFormData, type PaymentFormData } from '@/lib/validators';
import { useCartStore } from '@/store/cartStore';

const steps = [
  { id: 1, label: 'Shipping', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: ClipboardList },
];

const Checkout = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  const shippingForm = useForm<ShippingFormData>({ resolver: zodResolver(shippingSchema) });
  const paymentForm = useForm<PaymentFormData>({ resolver: zodResolver(paymentSchema) });

  const onShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep(2);
  };

  const onPaymentSubmit = (data: PaymentFormData) => {
    setPaymentData(data);
    setCurrentStep(3);
  };

  const handlePlaceOrder = () => {
    setLoading(true);
    setTimeout(() => {
      clearCart();
      navigate('/checkout/success');
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <h1 className="text-2xl font-bold text-white mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: currentStep === step.id ? 1.05 : 1,
                }}
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  currentStep > step.id
                    ? 'bg-white border-white text-black'
                    : currentStep === step.id
                    ? 'border-white text-white bg-white/10'
                    : 'border-white/10 text-white/30'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </motion.div>
              <span
                className={cn(
                  'text-xs mt-2 font-medium',
                  currentStep >= step.id ? 'text-white' : 'text-white/30'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'w-20 sm:w-32 h-px mx-2 mb-5 transition-colors duration-300',
                  currentStep > step.id ? 'bg-white' : 'bg-white/10'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step 1: Shipping */}
              {currentStep === 1 && (
                <form onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-white mb-2">Shipping Address</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Full Name" placeholder="John Doe" error={shippingForm.formState.errors.fullName?.message} {...shippingForm.register('fullName')} />
                    <Input label="Email" type="email" placeholder="john@example.com" error={shippingForm.formState.errors.email?.message} {...shippingForm.register('email')} />
                    <Input label="Phone" placeholder="+1 (555) 000-0000" error={shippingForm.formState.errors.phone?.message} {...shippingForm.register('phone')} />
                    <Input label="Address Line 1" placeholder="123 Main St" error={shippingForm.formState.errors.line1?.message} {...shippingForm.register('line1')} />
                    <Input label="Address Line 2" placeholder="Apt 4B (optional)" {...shippingForm.register('line2')} />
                    <Input label="City" placeholder="New York" error={shippingForm.formState.errors.city?.message} {...shippingForm.register('city')} />
                    <Input label="State" placeholder="NY" error={shippingForm.formState.errors.state?.message} {...shippingForm.register('state')} />
                    <Input label="ZIP Code" placeholder="10001" error={shippingForm.formState.errors.zip?.message} {...shippingForm.register('zip')} />
                  </div>
                  <Input label="Country" placeholder="United States" error={shippingForm.formState.errors.country?.message} {...shippingForm.register('country')} />
                  <Button type="submit" fullWidth size="lg">Continue to Payment</Button>
                </form>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-white mb-2">Payment Details</h2>
                  <Input label="Card Number" placeholder="4242 4242 4242 4242" error={paymentForm.formState.errors.cardNumber?.message} {...paymentForm.register('cardNumber')} />
                  <Input label="Name on Card" placeholder="John Doe" error={paymentForm.formState.errors.nameOnCard?.message} {...paymentForm.register('nameOnCard')} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry Date" placeholder="MM/YY" error={paymentForm.formState.errors.expiryDate?.message} {...paymentForm.register('expiryDate')} />
                    <Input label="CVV" type="password" placeholder="•••" error={paymentForm.formState.errors.cvv?.message} {...paymentForm.register('cvv')} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setCurrentStep(1)} className="flex-1">Back</Button>
                    <Button type="submit" className="flex-1">Review Order</Button>
                  </div>
                </form>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-white">Review Your Order</h2>
                  {shippingData && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Shipping Address</h3>
                      <p className="text-sm text-white/40">
                        {shippingData.fullName}<br />
                        {shippingData.line1}{shippingData.line2 ? `, ${shippingData.line2}` : ''}<br />
                        {shippingData.city}, {shippingData.state} {shippingData.zip}
                      </p>
                    </div>
                  )}
                  {paymentData && (
                    <div>
                      <h3 className="text-sm font-medium text-white mb-2">Payment Method</h3>
                      <p className="text-sm text-white/40">
                        •••• •••• •••• {paymentData.cardNumber.slice(-4)}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-white mb-3">Items</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img src={item.images[0]} alt={item.title} className="h-12 w-12 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{item.title}</p>
                            <p className="text-xs text-white/30">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-medium text-white">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setCurrentStep(2)} className="flex-1">Back</Button>
                    <Button onClick={handlePlaceOrder} loading={loading} className="flex-1" leftIcon={<Lock className="h-4 w-4" />}>
                      Place Order
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-xl p-6 sticky top-24 space-y-3">
            <h2 className="text-lg font-semibold text-white">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/40">Subtotal</span><span className="text-white">{formatCurrency(total)}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Shipping</span><span className={cn(shipping === 0 && 'text-success')}>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Tax</span><span className="text-white">{formatCurrency(tax)}</span></div>
              <hr className="border-white/[0.06]" />
              <div className="flex justify-between"><span className="font-bold text-white">Total</span><span className="text-xl font-bold text-white">{formatCurrency(grandTotal)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
