import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
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
  const shippingCharge = total > 50 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shippingCharge + tax;

  const pageRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  const shippingForm = useForm<ShippingFormData>({ resolver: zodResolver(shippingSchema) });
  const paymentForm = useForm<PaymentFormData>({ resolver: zodResolver(paymentSchema) });

  // Page entrance animation
  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }
  }, []);

  // Step change animation
  useEffect(() => {
    if (stepContentRef.current) {
      gsap.fromTo(stepContentRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [currentStep]);

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
    <div ref={pageRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 opacity-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8 tracking-tight">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center justify-center mb-12">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center border-2 transition-all duration-500',
                  currentStep > step.id
                    ? 'bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                    : currentStep === step.id
                    ? 'border-white text-white bg-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] scale-110 transform'
                    : 'border-white/[0.15] text-white/30 bg-[#050505]'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs sm:text-sm mt-3 font-medium transition-colors duration-300',
                  currentStep >= step.id ? 'text-white' : 'text-white/30'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'w-16 sm:w-32 h-px mx-2 sm:mx-4 mb-6 transition-colors duration-500',
                  currentStep > step.id ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'bg-white/[0.15]'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Form area */}
        <div className="lg:col-span-3">
          <div ref={stepContentRef}>
            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <form onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                <Button type="submit" fullWidth size="lg" className="mt-4">
                  Continue to Payment
                </Button>
              </form>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Payment Details</h2>
                <Input label="Card Number" placeholder="4242 4242 4242 4242" error={paymentForm.formState.errors.cardNumber?.message} {...paymentForm.register('cardNumber')} leftIcon={<CreditCard className="h-4 w-4" />} />
                <Input label="Name on Card" placeholder="John Doe" error={paymentForm.formState.errors.nameOnCard?.message} {...paymentForm.register('nameOnCard')} />
                <div className="grid grid-cols-2 gap-5">
                  <Input label="Expiry Date" placeholder="MM/YY" error={paymentForm.formState.errors.expiryDate?.message} {...paymentForm.register('expiryDate')} />
                  <Input label="CVV" type="password" placeholder="•••" error={paymentForm.formState.errors.cvv?.message} {...paymentForm.register('cvv')} />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setCurrentStep(1)} className="flex-1">Back</Button>
                  <Button type="submit" className="flex-1 shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)]">Review Order</Button>
                </div>
              </form>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
                <h2 className="text-xl font-bold text-white tracking-tight">Review Your Order</h2>
                
                {shippingData && (
                  <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white/40" /> Shipping Address
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed font-light pl-6">
                      {shippingData.fullName}<br />
                      {shippingData.line1}{shippingData.line2 ? `, ${shippingData.line2}` : ''}<br />
                      {shippingData.city}, {shippingData.state} {shippingData.zip}<br />
                      <span className="text-white/40 mt-1 inline-block">{shippingData.email} • {shippingData.phone}</span>
                    </p>
                  </div>
                )}
                
                {paymentData && (
                  <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-white/40" /> Payment Method
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed font-light pl-6">
                      •••• •••• •••• {paymentData.cardNumber.slice(-4)}<br />
                      <span className="text-white/40">Expires {paymentData.expiryDate}</span>
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-semibold text-white mb-4">Items ({items.length})</h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-black border border-white/[0.05] rounded-xl">
                        <img src={item.images[0]} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.title}</p>
                          <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-white">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4 border-t border-white/[0.08]">
                  <Button variant="secondary" onClick={() => setCurrentStep(2)} className="flex-1">Back</Button>
                  <Button 
                    onClick={handlePlaceOrder} 
                    loading={loading} 
                    className="flex-1 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]" 
                    leftIcon={<Lock className="h-4 w-4" />}
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-[#050505] border border-white/[0.08] rounded-2xl p-6 sm:p-8 sticky top-24 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6 tracking-tight">Order Summary</h2>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between items-center"><span className="text-white/50">Subtotal</span><span className="text-white">{formatCurrency(total)}</span></div>
              <div className="flex justify-between items-center"><span className="text-white/50">Shipping</span><span className={cn(shippingCharge === 0 ? 'text-success bg-success/10 px-2 py-0.5 rounded-md' : 'text-white')}>{shippingCharge === 0 ? 'Free' : formatCurrency(shippingCharge)}</span></div>
              <div className="flex justify-between items-center"><span className="text-white/50">Tax</span><span className="text-white">{formatCurrency(tax)}</span></div>
              <div className="h-px bg-white/[0.08] w-full my-4" />
              <div className="flex justify-between items-end"><span className="font-bold text-white">Total</span><span className="text-2xl font-black text-white tracking-tighter">{formatCurrency(grandTotal)}</span></div>
            </div>
            <p className="text-xs text-center text-white/30 mt-6 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3" /> Secure Encrypted Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
